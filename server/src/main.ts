import { NestFactory } from '@nestjs/core';
import * as passport from 'passport';
import { BadRequestException, Session, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3001',
    credentials: true,
  };

  app.useStaticAssets('public');
  app.enableCors(corsOptions);
  app.use(passport.initialize());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = error.constraints;
          const constraintKeys = Object.keys(constraints);

          const errorMessage = {
            isString: 'این فیلد باید یک رشته باشد',
            isEmail: 'ایمیل وارد شده معتبر نیست',
            isNotEmpty: 'این فیلد نباید خالی باشد',
            minLength: 'طول فیلد کوتاه است',
            maxLength: 'طول فیلد بیش از حد است',
          };

          const errorKey = constraintKeys[0];
          const fieldName = error.property; // نام فیلد مشکل‌دار

          return {
            field: fieldName,
            message: errorMessage[errorKey] || 'مقدار وارد شده صحیح نیست',
          };
        });

        throw new BadRequestException({
          message: messages,
          error: 'درخواست نامعتبر',
          statusCode: 400,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Helali')
    .setDescription('Helali App')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
