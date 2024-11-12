import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { AuditLog } from 'src/schemas/AuditLog.schema';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    const startAt = process.hrtime();
    const ipAddress = req.connection.remoteAddress;
    const method = req.method;
    const url = req.originalUrl;
    const baseUrl = req.baseUrl;
    const userAgent = req.get('user-agent') || '';
    const browserInfo =
      userAgent.match(
        /(opera|chrome|safari|firefox|msie|trident|insomnia(?=\/))\/?\s*(\d+)/i,
      ) || [];

    res.on('finish', async () => {
      const { statusCode } = res;
      const dif = process.hrtime(startAt);
      const responseTime = dif[0] * 1e3 + dif[1] * 1e-6;

      const auditLog = await this.auditLogModel.create({
        // username: req.user.username,
        // userid: req.userId,
        ip: ipAddress,
        baseUrl,
        statusCode,
        method,
        browser: browserInfo[1] || 'Unknown',
        browserType: browserInfo[2] || 'Unknown',
        responseTime: responseTime.toFixed(2),
      });
    });

    next();
  }
}
