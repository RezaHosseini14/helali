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
exports.CaslGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const shared_1 = require("@helali/shared");
const metadata_keys_1 = require("../constants/metadata-keys");
let CaslGuard = class CaslGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requirements = this.reflector.getAllAndOverride(metadata_keys_1.ABILITY_KEY, [context.getHandler(), context.getClass()]);
        if (!requirements || requirements.length === 0) {
            return true;
        }
        const request = context
            .switchToHttp()
            .getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const ability = (0, shared_1.createAppAbility)({
            id: user.id,
            role: user.role,
            permissions: user.permissions,
        });
        const isAllowed = requirements.every((requirement) => this.checkRequirement(ability, requirement, request.params));
        if (!isAllowed) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return true;
    }
    checkRequirement(ability, requirement, params) {
        if (requirement.field && requirement.param) {
            const fieldValue = params[requirement.param];
            if (!fieldValue) {
                return false;
            }
            const parsedId = Number(fieldValue);
            if (Number.isNaN(parsedId)) {
                return false;
            }
            return ability.can(requirement.action, (0, shared_1.subject)('User', { id: parsedId }));
        }
        return ability.can(requirement.action, requirement.subject);
    }
};
exports.CaslGuard = CaslGuard;
exports.CaslGuard = CaslGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], CaslGuard);
//# sourceMappingURL=casl.guard.js.map