import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const MAX_CONNECT_ATTEMPTS = 5;
const MAX_QUERY_ATTEMPTS = 3;
const CONNECT_RETRY_DELAY_MS = 1500;
const QUERY_RETRY_DELAY_MS = 400;
const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);
const TRANSIENT_NODE_CODES = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE']);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTransientError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_PRISMA_CODES.has(error.code);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && TRANSIENT_NODE_CODES.has(code)) {
      return true;
    }

    if (/server has closed the connection/i.test(error.message)) {
      return true;
    }
  }

  return false;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    const logger = this.logger;
    let reconnectClient: PrismaClient = this;

    const extended = this.$extends({
      query: {
        async $allOperations({ args, query }) {
          let lastError: unknown;

          for (let attempt = 1; attempt <= MAX_QUERY_ATTEMPTS; attempt += 1) {
            try {
              return await query(args);
            } catch (error: unknown) {
              lastError = error;

              if (!isTransientError(error) || attempt >= MAX_QUERY_ATTEMPTS) {
                throw error;
              }

              const message = error instanceof Error ? error.message : String(error);
              logger.warn(
                `Transient DB error (attempt ${attempt}/${MAX_QUERY_ATTEMPTS}): ${message}`,
              );

              await delay(QUERY_RETRY_DELAY_MS * attempt);

              try {
                await reconnectClient.$disconnect();
                await reconnectClient.$connect();
              } catch {
                // Next attempt will surface reconnect failures.
              }
            }
          }

          throw lastError;
        },
      },
    });

    reconnectClient = extended as unknown as PrismaClient;
    return extended as unknown as this;
  }

  async onModuleInit(): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (error: unknown) {
        lastError = error;
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(
          `Prisma connect attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed: ${message}`,
        );

        if (attempt < MAX_CONNECT_ATTEMPTS) {
          await delay(CONNECT_RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw lastError;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
