export type DetectedFileSignature = 'image/jpeg' | 'image/png' | 'image/webp' | 'audio/mpeg' | 'video/mp4' | 'video/webm' | 'video/quicktime' | null;
export declare function detectFileSignature(buffer: Buffer): DetectedFileSignature;
export declare function doesSignatureMatchMime(detected: DetectedFileSignature, declaredMime: string): boolean;
