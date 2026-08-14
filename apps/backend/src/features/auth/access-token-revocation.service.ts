import { Injectable } from '@nestjs/common';

const DEFAULT_ACCESS_MAX_AGE_MS = 12 * 60 * 60 * 1000;

@Injectable()
export class AccessTokenRevocationService {
  private readonly invalidBeforeByUserId = new Map<number, number>();
  private readonly accessMaxAgeMs: number;

  constructor() {
    this.accessMaxAgeMs = DEFAULT_ACCESS_MAX_AGE_MS;
  }

  revokeUserSessions(userId: number): void {
    const invalidBeforeMs = Date.now();
    this.invalidBeforeByUserId.set(userId, invalidBeforeMs);
    this.pruneExpiredEntries();
  }

  isUserSessionRevoked(userId: number, issuedAtSeconds: number | undefined): boolean {
    if (issuedAtSeconds === undefined) {
      return false;
    }

    const invalidBeforeMs = this.invalidBeforeByUserId.get(userId);

    if (!invalidBeforeMs) {
      return false;
    }

    if (Date.now() - invalidBeforeMs > this.accessMaxAgeMs) {
      this.invalidBeforeByUserId.delete(userId);
      return false;
    }

    return issuedAtSeconds * 1000 < invalidBeforeMs;
  }

  private pruneExpiredEntries(): void {
    const now = Date.now();

    for (const [userId, invalidBeforeMs] of this.invalidBeforeByUserId) {
      if (now - invalidBeforeMs > this.accessMaxAgeMs) {
        this.invalidBeforeByUserId.delete(userId);
      }
    }
  }
}
