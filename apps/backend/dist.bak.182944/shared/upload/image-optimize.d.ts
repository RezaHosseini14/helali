export interface IOptimizedImage {
    readonly buffer: Buffer;
    readonly size: number;
    readonly mimetype: 'image/webp';
}
export declare function optimizeImageToWebp(input: Buffer): Promise<IOptimizedImage>;
