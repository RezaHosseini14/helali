import { type HelaliMediaKind } from '@helali/shared';
export interface IValidatedUploadFile {
    readonly buffer: Buffer;
    readonly size: number;
    readonly mimetype: string;
    readonly originalName: string;
    readonly kind: HelaliMediaKind;
}
export declare function validateUploadFile(file: Express.Multer.File | undefined, expectedKind: HelaliMediaKind): IValidatedUploadFile;
