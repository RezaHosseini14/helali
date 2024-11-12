import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from 'src/schemas/AuditLog.schema';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
  ) {}

  async findAll(page, limit) {
    try {
      const pageDefault: number = page || 1;
      const limitDefault: number = limit || 10;

      const totalAuditLogs: number = await this.auditLogModel.countDocuments();
      const skip: number = (pageDefault - 1) * limitDefault;

      const auditLogs: any[] = await this.auditLogModel
        .find()
        .skip(skip)
        .limit(limit);

      if (!auditLogs) {
        throw new HttpException('لاگی یافت نشد', HttpStatus.NOT_FOUND);
      }
      return {
        auditLogs,
        currentPage: page,
        totalPages: Math.ceil(totalAuditLogs / limit),
        total: totalAuditLogs,
      };
    } catch (error) {
      throw error;
    }
  }
}
