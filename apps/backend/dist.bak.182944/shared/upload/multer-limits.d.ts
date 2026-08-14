import { memoryStorage } from 'multer';
interface IHelaliMulterOptions {
    readonly storage: ReturnType<typeof memoryStorage>;
    readonly limits: {
        readonly fileSize: number;
        readonly files: number;
    };
}
export declare const galleryUploadMulterOptions: IHelaliMulterOptions;
export declare const audioUploadMulterOptions: IHelaliMulterOptions;
export declare const videoUploadMulterOptions: IHelaliMulterOptions;
export {};
