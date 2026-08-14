export interface IAuditLogUser {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface IAuditLog {
  readonly id: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly userId: number | null;
  readonly changes: Record<string, unknown> | null;
  readonly ipAddress: string | null;
  readonly createdAt: string;
  readonly user: IAuditLogUser | null;
}
