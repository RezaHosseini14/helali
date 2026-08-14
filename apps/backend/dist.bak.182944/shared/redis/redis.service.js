"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    configService;
    client;
    redisUrl;
    logger = new common_1.Logger(RedisService_1.name);
    connectLock = null;
    constructor(configService) {
        this.configService = configService;
        this.redisUrl =
            this.configService.get('redis.url') ??
                process.env.REDIS_URL ??
                'redis://localhost:6379';
        this.client = this.createClient();
    }
    getClient() {
        return this.client;
    }
    async ensureReady() {
        if (this.client.status === 'ready') {
            return true;
        }
        if (this.connectLock) {
            return this.connectLock;
        }
        this.connectLock = this.connectOrRecreate();
        try {
            return await this.connectLock;
        }
        finally {
            this.connectLock = null;
        }
    }
    async onModuleDestroy() {
        if (this.client.status === 'wait') {
            this.client.disconnect();
            return;
        }
        try {
            await this.client.quit();
        }
        catch {
            this.client.disconnect();
        }
    }
    createClient() {
        const client = new ioredis_1.default(this.redisUrl, {
            lazyConnect: true,
            connectTimeout: 2_000,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            retryStrategy: (attempt) => (attempt > 5 ? null : Math.min(attempt * 200, 2_000)),
        });
        client.on('error', (error) => {
            this.logger.warn(`Redis connection error: ${error.message}`);
        });
        return client;
    }
    async connectOrRecreate() {
        if (this.client.status === 'end' || this.client.status === 'close') {
            try {
                this.client.disconnect(false);
            }
            catch {
            }
            this.client = this.createClient();
        }
        if (this.client.status === 'ready') {
            return true;
        }
        try {
            if (this.client.status === 'wait') {
                await this.client.connect();
            }
            else if (this.client.status === 'connecting' || this.client.status === 'reconnecting') {
                await new Promise((resolve, reject) => {
                    const onReady = () => {
                        cleanup();
                        resolve();
                    };
                    const onError = (error) => {
                        cleanup();
                        reject(error);
                    };
                    const cleanup = () => {
                        this.client.off('ready', onReady);
                        this.client.off('error', onError);
                    };
                    this.client.once('ready', onReady);
                    this.client.once('error', onError);
                });
            }
            return this.client.status === 'ready';
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'unknown redis error';
            this.logger.warn(`Redis connect failed: ${message}`);
            return false;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map