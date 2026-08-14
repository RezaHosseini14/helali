"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCategoryIdsTransform = parseCategoryIdsTransform;
function parseCategoryIdsTransform({ value }) {
    if (value === null || value === undefined || value === '') {
        return [];
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return [Math.trunc(value)];
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => Number.parseInt(item, 10))
            .filter((item) => Number.isFinite(item));
    }
    if (Array.isArray(value)) {
        return value
            .flatMap((item) => {
            if (typeof item === 'number' && Number.isFinite(item)) {
                return [Math.trunc(item)];
            }
            if (typeof item === 'string') {
                return item
                    .split(',')
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .map((part) => Number.parseInt(part, 10));
            }
            return [];
        })
            .filter((item) => Number.isFinite(item));
    }
    return [];
}
//# sourceMappingURL=parse-category-ids.js.map