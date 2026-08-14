import { BadRequestException, ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';

export function createValidationPipe(): ValidationPipe {
  const options: ValidationPipeOptions = {
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

      return new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    },
  };

  return new ValidationPipe(options);
}
