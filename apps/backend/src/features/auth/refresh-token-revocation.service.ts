import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenRevocationService {
  private readonly revokedJtis = new Map<string, number>();

  revoke(jti: string, expiresAtMs: number): void {
    this.revokedJtis.set(jti, expiresAtMs);
    this.pruneExpiredEntries();
  }

  isRevoked(jti: string): boolean {
    const expiresAtMs = this.revokedJtis.get(jti);

    if (!expiresAtMs) {
      return false;
    }

    if (Date.now() > expiresAtMs) {
      this.revokedJtis.delete(jti);
      return false;
    }

    return true;
  }

  private pruneExpiredEntries(): void {
    const now = Date.now();

    for (const [jti, expiresAtMs] of this.revokedJtis) {
      if (now > expiresAtMs) {
        this.revokedJtis.delete(jti);
      }
    }
  }
}
