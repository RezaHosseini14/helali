"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("./shared/pipes/validation.pipe");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        rawBody: false,
    });
    const corsOrigin = process.env.CORS_ORIGIN ?? process.env.CORS_URL ?? 'http://localhost:3000';
    const storageRoot = (0, node_path_1.join)(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? 'storage');
    app.enableCors({
        origin: corsOrigin.split(',').map((item) => item.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Helali-Encrypted'],
        exposedHeaders: [
            'X-Helali-Encrypted',
            'Content-Range',
            'Accept-Ranges',
            'Content-Length',
            'Content-Type',
        ],
    });
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }));
    app.use((0, cookie_parser_1.default)());
    app.useStaticAssets(storageRoot, {
        prefix: '/files/',
        setHeaders: (res) => {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        },
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes((0, validation_pipe_1.createValidationPipe)());
    const port = parseInt(process.env.BACKEND_PORT ?? process.env.PORT ?? '4000', 10);
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}/api/v1`);
    console.log(`Local media files: http://localhost:${port}/files/ (root=${storageRoot})`);
}
bootstrap();
//# sourceMappingURL=main.js.map