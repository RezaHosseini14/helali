"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeImageToWebp = optimizeImageToWebp;
const sharp_1 = __importDefault(require("sharp"));
const MAX_IMAGE_EDGE_PX = 1920;
const WEBP_QUALITY = 82;
async function optimizeImageToWebp(input) {
    const buffer = await (0, sharp_1.default)(input, { failOn: 'none' })
        .rotate()
        .resize({
        width: MAX_IMAGE_EDGE_PX,
        height: MAX_IMAGE_EDGE_PX,
        fit: 'inside',
        withoutEnlargement: true,
    })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    return {
        buffer,
        size: buffer.length,
        mimetype: 'image/webp',
    };
}
//# sourceMappingURL=image-optimize.js.map