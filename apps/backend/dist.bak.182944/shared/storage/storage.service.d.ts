import { ConfigService } from '@nestjs/config';
export interface IStorageUploadInput {
    readonly buffer: Buffer;
    readonly size: number;
    readonly mimetype: string;
    readonly objectName: string;
}
export declare class StorageService {
    private readonly configService;
    private readonly logger;
    private readonly driver;
    private readonly localRoot;
    private readonly publicBaseUrl;
    private readonly minioClient;
    constructor(configService: ConfigService);
    getLocalRootAbsolute(): string;
    uploadFile(bucketName: string, file: Express.Multer.File): Promise<{
        message: string;
        objectName: string;
    }>;
    putObject(bucketName: string, input: IStorageUploadInput): Promise<{
        message: string;
        objectName: string;
    }>;
    putObjects(uploads: ReadonlyArray<{
        readonly bucketName: string;
        readonly input: IStorageUploadInput;
    }>): Promise<void>;
    createBucket(bucketName: string): Promise<void>;
    listFiles(bucketName: string): Promise<Array<{
        name?: string;
        size?: number;
    }>>;
    getPresignedUrl(bucketName: string, fileName: string, expiresIn: number): Promise<string>;
    deleteFile(bucketName: string, fileName: string): Promise<{
        message: string;
    }>;
    deleteFiles(deletions: ReadonlyArray<{
        readonly bucketName: string;
        readonly fileName: string;
    }>): Promise<void>;
    private putObjectLocal;
    private putObjectMinio;
    private deleteLocalQuiet;
    private requireMinio;
}
