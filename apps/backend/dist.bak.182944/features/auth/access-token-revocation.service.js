"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenRevocationService = void 0;
const common_1 = require("@nestjs/common");
const DEFAULT_ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
let AccessTokenRevocationService = class AccessTokenRevocationService {
    invalidBeforeByUserId = new Map();
    accessMaxAgeMs;
    constructor() {
        this.accessMaxAgeMs = DEFAULT_ACCESS_MAX_AGE_MS;
    }
    revokeUserSessions(userId) {
        const invalidBeforeMs = Date.now();
        this.invalidBeforeByUserId.set(userId, invalidBeforeMs);
        this.pruneExpiredEntries();
    }
    isUserSessionRevoked(userId, issuedAtSeconds) {
        if (issuedAtSeconds === undefined) {
            return false;
        }
        const invalidBeforeMs = this.invalidBeforeByUserId.get(userId);
        if (!invalidBeforeMs) {
            return false;
        }
        if (Date.now() - invalidBeforeMs > this.accessMaxAgeMs) {
            this.invalidBeforeByUserId.delete(userId);
            return false;
        }
        return issuedAtSeconds * 1000 < invalidBeforeMs;
    }
    pruneExpiredEntries() {
        const now = Date.now();
        for (const [userId, invalidBeforeMs] of this.invalidBeforeByUserId) {
            if (now - invalidBeforeMs > this.accessMaxAgeMs) {
                this.invalidBeforeByUserId.delete(userId);
            }
        }
    }
};
exports.AccessTokenRevocationService = AccessTokenRevocationService;
exports.AccessTokenRevocationService = AccessTokenRevocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AccessTokenRevocationService);
//# sourceMappingURL=access-token-revocation.service.js.map