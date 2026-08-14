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
exports.AudioController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const check_ability_decorator_1 = require("../../shared/decorators/check-ability.decorator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const messages_1 = require("../../shared/constants/messages");
const pagination_dto_1 = require("../../shared/dto/pagination.dto");
const multer_limits_1 = require("../../shared/upload/multer-limits");
const audio_service_1 = require("./audio.service");
const create_audio_dto_1 = require("./dto/create-audio.dto");
const update_audio_dto_1 = require("./dto/update-audio.dto");
let AudioController = class AudioController {
    audioService;
    constructor(audioService) {
        this.audioService = audioService;
    }
    async upload(dto, files) {
        const audioFile = files.file?.[0];
        const posterFile = files.poster?.[0];
        if (!audioFile || !posterFile) {
            throw new common_1.BadRequestException(messages_1.BadRequestMessage.BothFilesRequired);
        }
        const result = await this.audioService.upload(dto, audioFile, posterFile);
        return {
            message: result.message,
            data: null,
        };
    }
    async findAll(query) {
        const data = await this.audioService.findAll(query.page, query.limit);
        return {
            message: 'لیست فایل‌های صوتی دریافت شد',
            data,
        };
    }
    async findById(id) {
        const data = await this.audioService.findById(id);
        return {
            message: 'فایل صوتی دریافت شد',
            data,
        };
    }
    async like(id) {
        const data = await this.audioService.like(id);
        return {
            message: data.message,
            data: { likes: data.likes },
        };
    }
    async update(id, dto, files) {
        const result = await this.audioService.update(id, dto, files.file?.[0], files.poster?.[0]);
        return {
            message: result.message,
            data: null,
        };
    }
    async remove(id) {
        const result = await this.audioService.remove(id);
        return {
            message: result.message,
            data: null,
        };
    }
};
exports.AudioController = AudioController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'create', subject: 'Audio' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
    ], multer_limits_1.audioUploadMulterOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_audio_dto_1.CreateAudioDto, Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "upload", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "findById", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(':id/like'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "like", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'update', subject: 'Audio' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
    ], multer_limits_1.audioUploadMulterOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_audio_dto_1.UpdateAudioDto, Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, check_ability_decorator_1.CheckAbility)({ action: 'delete', subject: 'Audio' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "remove", null);
exports.AudioController = AudioController = __decorate([
    (0, common_1.Controller)('audio'),
    __metadata("design:paramtypes", [audio_service_1.AudioService])
], AudioController);
//# sourceMappingURL=audio.controller.js.map