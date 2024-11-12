import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: 'Welcome to the API!',
      version: '1.0.0',
      status: 'Running',
      documentation: 'Visit /api-docs for API documentation',
    };
  }
}
