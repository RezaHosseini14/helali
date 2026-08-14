export declare class ListAuditLogsDto {
    page: number;
    limit: number;
    action?: string;
    entityType?: string;
    userId?: number;
    search?: string;
    from?: string;
    to?: string;
}
