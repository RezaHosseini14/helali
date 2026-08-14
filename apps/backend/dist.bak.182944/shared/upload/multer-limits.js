"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoUploadMulterOptions = exports.audioUploadMulterOptions = exports.galleryUploadMulterOptions = void 0;
const multer_1 = require("multer");
const shared_1 = require("@helali/shared");
const AUDIO_WITH_POSTER_MAX = Math.max(shared_1.MAX_AUDIO_UPLOAD_SIZE_BYTES, shared_1.MAX_IMAGE_UPLOAD_SIZE_BYTES);
const VIDEO_WITH_POSTER_MAX = Math.max(shared_1.MAX_VIDEO_UPLOAD_SIZE_BYTES, shared_1.MAX_IMAGE_UPLOAD_SIZE_BYTES);
const memoryUploadStorage = (0, multer_1.memoryStorage)();
exports.galleryUploadMulterOptions = {
    storage: memoryUploadStorage,
    limits: {
        fileSize: shared_1.MAX_IMAGE_UPLOAD_SIZE_BYTES,
        files: 1,
    },
};
exports.audioUploadMulterOptions = {
    storage: memoryUploadStorage,
    limits: {
        fileSize: AUDIO_WITH_POSTER_MAX,
        files: 2,
    },
};
exports.videoUploadMulterOptions = {
    storage: memoryUploadStorage,
    limits: {
        fileSize: VIDEO_WITH_POSTER_MAX,
        files: 2,
    },
};
//# sourceMappingURL=multer-limits.js.map