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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const check_ability_decorator_1 = require("../../shared/decorators/check-ability.decorator");
const auth_decorators_1 = require("../../shared/decorators/auth.decorators");
const list_users_dto_1 = require("./dto/list-users.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(query) {
        const data = await this.usersService.findAll(query.page, query.limit);
        return {
            message: 'لیست کاربران دریافت شد',
            data,
        };
    }
    getProfile(user) {
        return {
            message: 'پروفایل دریافت شد',
            data: this.usersService.getProfile(user),
        };
    }
    async getAllDataCount() {
        const data = await this.usersService.getAllDataCount();
        return {
            message: 'آمار کلی دریافت شد',
            data,
        };
    }
    async findById(id) {
        const data = await this.usersService.findById(id);
        return {
            message: 'کاربر دریافت شد',
            data,
        };
    }
    async update(id, dto, user, request) {
        const ipAddress = request.ip ?? 'unknown';
        const data = await this.usersService.update(id, dto, user, ipAddress);
        return {
            message: 'به روزرسانی با موفقیت انجام شد',
            data,
        };
    }
    async remove(id, user, request) {
        const ipAddress = request.ip ?? 'unknown';
        const data = await this.usersService.remove(id, user, ipAddress);
        return {
            message: data.message,
            data: null,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'read', subject: 'User' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_users_dto_1.ListUsersDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('all-data-count'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'read', subject: 'Dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllDataCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'read', subject: 'User' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'update', subject: 'User', field: 'id', param: 'id' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'manage', subject: 'User' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map