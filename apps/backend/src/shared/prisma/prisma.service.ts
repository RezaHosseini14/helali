import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const MAX_CONNECT_ATTEMPTS = 5;
const CONNECT_RETRY_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

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
