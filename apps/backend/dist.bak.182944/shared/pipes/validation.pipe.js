"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationPipe = createValidationPipe;
const common_1 = require("@nestjs/common");
function createValidationPipe() {
    const options = {
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
            const formattedErrors = errors.flatMap((error) => {
                const constraints = error.constraints ?? {};
                return Object.values(constraints).map((message) => ({
                    field: error.property,
                    message,
                }));
            });
            return new common_1.BadRequestException({
                message: 'Validation failed',
                errors: formattedErrors,
            });
        },
    };
    return new common_1.ValidationPipe(options);
}
//# sourceMappingURL=validation.pipe.js.map