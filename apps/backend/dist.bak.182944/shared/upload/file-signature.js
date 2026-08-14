"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFileSignature = detectFileSignature;
exports.doesSignatureMatchMime = doesSignatureMatchMime;
function bufferStartsWith(buffer, bytes, offset = 0) {
    if (buffer.length < offset + bytes.length) {
        return false;
    }
    return bytes.every((byte, index) => buffer[offset + index] === byte);
}
function isWebp(buffer) {
    return (bufferStartsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
        buffer.length >= 12 &&
        buffer.toString('ascii', 8, 12) === 'WEBP');
}
function isMp4OrQuicktime(buffer) {
    if (buffer.length < 12) {
        return null;
    }
    const boxType = buffer.toString('ascii', 4, 8);
    if (boxType !== 'ftyp') {
        return null;
    }
    const brand = buffer.toString('ascii', 8, 12);
    if (brand.startsWith('qt')) {
        return 'video/quicktime';
    }
    return 'video/mp4';
}
function detectFileSignature(buffer) {
    if (!buffer || buffer.length < 3) {
        return null;
    }
    if (bufferStartsWith(buffer, [0xff, 0xd8, 0xff])) {
        return 'image/jpeg';
    }
    if (bufferStartsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return 'image/png';
    }
    if (isWebp(buffer)) {
        return 'image/webp';
    }
    if (bufferStartsWith(buffer, [0x49, 0x44, 0x33]) ||
        bufferStartsWith(buffer, [0xff, 0xfb]) ||
        bufferStartsWith(buffer, [0xff, 0xf3]) ||
        bufferStartsWith(buffer, [0xff, 0xf2])) {
        return 'audio/mpeg';
    }
    if (bufferStartsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])) {
        return 'video/webm';
    }
    return isMp4OrQuicktime(buffer);
}
const COMPATIBLE_SIGNATURES = {
    'image/jpeg': ['image/jpeg'],
    'image/png': ['image/png'],
    'image/webp': ['image/webp'],
    'audio/mpeg': ['audio/mpeg'],
    'audio/mp3': ['audio/mpeg'],
    'video/mp4': ['video/mp4', 'video/quicktime'],
    'video/webm': ['video/webm'],
    'video/quicktime': ['video/quicktime', 'video/mp4'],
};
function doesSignatureMatchMime(detected, declaredMime) {
    if (!detected) {
        return true;
    }
    const allowed = COMPATIBLE_SIGNATURES[declaredMime.trim().toLowerCase()];
    if (!allowed) {
        return false;
    }
    return allowed.includes(detected);
}
//# sourceMappingURL=file-signature.js.map