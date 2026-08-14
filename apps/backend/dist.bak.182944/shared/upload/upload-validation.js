"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUploadFile = validateUploadFile;
const common_1 = require("@nestjs/common");
const shared_1 = require("@helali/shared");
const messages_1 = require("../constants/messages");
const file_signature_1 = require("./file-signature");
function assertNonEmptyFile(file) {
    if (!file || !file.buffer || file.size === 0) {
        throw new common_1.BadRequestException('فایل آپلود نشده است');
    }
}
function resolveKindOrThrow(mimeType, kind) {
    const isAllowed = kind === 'image'
        ? (0, shared_1.isAllowedImageMimeType)(mimeType)
        : kind === 'audio'
            ? (0, shared_1.isAllowedAudioMimeType)(mimeType)
            : (0, shared_1.isAllowedVideoMimeType)(mimeType);
    if (!isAllowed) {
        if (kind === 'audio') {
            throw new common_1.BadRequestException(messages_1.TypeErrorMessage.AudioTypeError);
        }
        if (kind === 'video') {
            throw new common_1.BadRequestException(messages_1.TypeErrorMessage.VideoTypeError);
        }
        throw new common_1.BadRequestException(messages_1.TypeErrorMessage.PosterTypeError);
    }
    return kind;
}
function validateUploadFile(file, expectedKind) {
    assertNonEmptyFile(file);
    const originalName = (0, shared_1.normalizeMediaFilename)(file.originalname || 'upload');
    const mimetype = (0, shared_1.resolveMimeTypeFromUpload)(file.mimetype || '', originalName);
    const kind = resolveKindOrThrow(mimetype, expectedKind);
    const maxSize = (0, shared_1.getMaxUploadSizeBytesForMimeType)(mimetype);
    if (file.size > maxSize) {
        throw new common_1.BadRequestException('حجم فایل از حد مجاز بیشتر است');
    }
    const detected = (0, file_signature_1.detectFileSignature)(file.buffer);
    if (!(0, file_signature_1.doesSignatureMatchMime)(detected, mimetype)) {
        throw new common_1.BadRequestException('نوع فایل با محتوای آن هم‌خوانی ندارد');
    }
    return {
        buffer: file.buffer,
        size: file.size,
        mimetype,
        originalName,
        kind,
    };
}
//# sourceMappingURL=upload-validation.js.map