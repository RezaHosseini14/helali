"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const promises_2 = require("node:stream/promises");
const node_stream_1 = require("node:stream");
const http = __importStar(require("node:http"));
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const minio_1 = require("minio");
const MAX_PUT_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 700;
function isTransientStorageError(error) {
    if (!error || typeof error !== 'object') {
        return false;
    }
    const code = 'code' in error && typeof error.code === 'string'
        ? error.code
        : '';
    const message = error instanceof Error ? error.message : String(error);
    const normalized = `${code} ${message}`.toLowerCase();
    return (normalized.includes('econnreset') ||
        normalized.includes('etimedout') ||
        normalized.includes('econnrefused') ||
        normalized.includes('epipe') ||
        normalized.includes('socket hang up') ||
        normalized.includes('network') ||
        normalized.includes('timeout') ||
        normalized.includes('aborted'));
}
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
let StorageService = StorageService_1 = class StorageService {
    configService;
    logger = new common_1.Logger(StorageService_1.name);
    driver;
    localRoot;
    publicBaseUrl;
    minioClient;
    constructor(configService) {
        this.configService = configService;
        this.driver = this.configService.get('storage.driver', 'local');
        this.localRoot = this.configService.get('storage.localPath', 'storage');
        this.publicBaseUrl = (this.configService.get('app.publicUrl') ||
            `http://localhost:${this.configService.get('app.port') ?? 4000}`).replace(/\/$/, '');
        if (this.driver === 'minio') {
            const endPoint = this.configService.get('minio.endpoint', 'localhost');
            const port = this.configService.get('minio.port', 9000);
            const useSSL = this.configService.get('minio.useSsl', false);
            const agent = new http.Agent({
                keepAlive: true,
                keepAliveMsecs: 30_000,
                maxSockets: 8,
                timeout: 300_000,
            });
            this.minioClient = new minio_1.Client({
                endPoint,
                port,
                useSSL,
                accessKey: this.configService.get('minio.accessKey', ''),
                secretKey: this.configService.get('minio.secretKey', ''),
                region: 'us-east-1',
                pathStyle: true,
                transportAgent: agent,
                retryOptions: {
                    maximumRetryCount: 5,
                    baseDelayMs: 500,
                    maximumDelayMs: 8_000,
                },
            });
        }
        else {
            this.minioClient = null;
            this.logger.log(`Storage driver: local (${this.localRoot})`);
        }
    }
    getLocalRootAbsolute() {
        return (0, node_path_1.join)(process.cwd(), this.localRoot);
    }
    async uploadFile(bucketName, file) {
        return this.putObject(bucketName, {
            objectName: file.originalname,
            buffer: file.buffer,
            size: file.size,
            mimetype: file.mimetype,
        });
    }
    async putObject(bucketName, input) {
        if (this.driver === 'local') {
            return this.putObjectLocal(bucketName, input);
        }
        return this.putObjectMinio(bucketName, input);
    }
    async putObjects(uploads) {
        for (const item of uploads) {
            await this.putObject(item.bucketName, item.input);
        }
    }
    async createBucket(bucketName) {
        if (this.driver === 'local') {
            await (0, promises_1.mkdir)((0, node_path_1.join)(this.getLocalRootAbsolute(), bucketName), { recursive: true });
            return;
        }
        const client = this.requireMinio();
        const exists = await client.bucketExists(bucketName);
        if (!exists) {
            await client.makeBucket(bucketName, 'us-east-1');
        }
    }
    async listFiles(bucketName) {
        if (this.driver === 'local') {
            return [];
        }
        const client = this.requireMinio();
        const items = [];
        const stream = client.listObjects(bucketName, '', true);
        return new Promise((resolve, reject) => {
            stream.on('data', (obj) => items.push(obj));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(items));
        });
    }
    async getPresignedUrl(bucketName, fileName, expiresIn) {
        if (this.driver === 'local') {
            return `${this.publicBaseUrl}/files/${bucketName}/${encodeURIComponent(fileName)}`;
        }
        try {
            return await this.requireMinio().presignedGetObject(bucketName, fileName, expiresIn);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown presign error';
            throw new Error(`Error generating presigned URL: ${message}`);
        }
    }
    async deleteFile(bucketName, fileName) {
        if (this.driver === 'local') {
            await this.deleteLocalQuiet(bucketName, fileName);
            return { message: 'File deleted successfully' };
        }
        try {
            await this.requireMinio().removeObject(bucketName, fileName);
            return { message: 'File deleted successfully' };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown delete error';
            this.logger.error(`Delete failed: ${message}`);
            throw new common_1.HttpException(`File delete failed: ${message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteFiles(deletions) {
        await Promise.all(deletions.map(async (item) => {
            try {
                if (this.driver === 'local') {
                    await this.deleteLocalQuiet(item.bucketName, item.fileName);
                    return;
                }
                await this.requireMinio().removeObject(item.bucketName, item.fileName);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown delete error';
                this.logger.warn(`Rollback delete failed for ${item.fileName}: ${message}`);
            }
        }));
    }
    async putObjectLocal(bucketName, input) {
        try {
            const dir = (0, node_path_1.join)(this.getLocalRootAbsolute(), bucketName);
            await (0, promises_1.mkdir)(dir, { recursive: true });
            const filePath = (0, node_path_1.join)(dir, input.objectName);
            await (0, promises_2.pipeline)(node_stream_1.Readable.from(input.buffer), (0, node_fs_1.createWriteStream)(filePath));
            return { message: 'File uploaded successfully', objectName: input.objectName };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown upload error';
            this.logger.error(`Local upload failed: ${message}`);
            throw new common_1.HttpException(`File upload failed: ${message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async putObjectMinio(bucketName, input) {
        let lastError;
        for (let attempt = 1; attempt <= MAX_PUT_ATTEMPTS; attempt += 1) {
            try {
                await this.createBucket(bucketName);
                await this.requireMinio().putObject(bucketName, input.objectName, input.buffer, input.size, {
                    'Content-Type': input.mimetype,
                });
                return { message: 'File uploaded successfully', objectName: input.objectName };
            }
            catch (error) {
                lastError = error;
                const message = error instanceof Error ? error.message : 'Unknown upload error';
                if (attempt < MAX_PUT_ATTEMPTS && isTransientStorageError(error)) {
                    const waitMs = RETRY_BASE_DELAY_MS * attempt;
                    this.logger.warn(`Upload attempt ${attempt}/${MAX_PUT_ATTEMPTS} failed for ${input.objectName}: ${message}. Retry in ${waitMs}ms`);
                    await delay(waitMs);
                    continue;
                }
                this.logger.error(`Upload failed: ${message}`);
                throw new common_1.HttpException(`File upload failed: ${message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        const message = lastError instanceof Error ? lastError.message : 'Unknown upload error';
        throw new common_1.HttpException(`File upload failed: ${message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async deleteLocalQuiet(bucketName, fileName) {
        const filePath = (0, node_path_1.join)(this.getLocalRootAbsolute(), bucketName, fileName);
        try {
            await (0, promises_1.access)(filePath);
            await (0, promises_1.unlink)(filePath);
        }
        catch {
        }
    }
    requireMinio() {
        if (!this.minioClient) {
            throw new common_1.HttpException('MinIO client is not configured', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return this.minioClient;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map