export declare class AccessTokenRevocationService {
    private readonly invalidBeforeByUserId;
    private readonly accessMaxAgeMs;
    constructor();
    revokeUserSessions(userId: number): void;
    isUserSessionRevoked(userId: number, issuedAtSeconds: number | undefined): boolean;
    private pruneExpiredEntries;
}
