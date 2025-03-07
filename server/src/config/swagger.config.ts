import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function SwaggerConfigInit(app: INestApplication): void {
  const configServices = app.get(ConfigService);
  const title = configServices.get('Swagger.swaggerTitle');
  const desc = configServices.get('Swagger.swaggerDesc');

  const document = new DocumentBuilder().setTitle(title).setDescription(desc).setVersion('1.0').build();

  const swaggerDocument = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup('docs', app, swaggerDocument);
}
