import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly configService;
    private client;
    private readonly redisUrl;
    private readonly logger;
    private connectLock;
    constructor(configService: ConfigService);
    getClient(): Redis;
    ensureReady(): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
    private createClient;
    private connectOrRecreate;
}
