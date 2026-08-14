import { AccessTokenRevocationService } from './access-token-revocation.service';

describe('AccessTokenRevocationService', () => {
  let service: AccessTokenRevocationService;

  beforeEach(() => {
    service = new AccessTokenRevocationService();
  });

  it('should_mark_user_session_as_revoked_before_issue_time', () => {
    service.revokeUserSessions(7);

    expect(service.isUserSessionRevoked(7, Math.floor(Date.now() / 1000) - 60)).toBe(true);
  });

  it('should_accept_token_issued_after_revocation', () => {
    service.revokeUserSessions(7);

    expect(service.isUserSessionRevoked(7, Math.floor(Date.now() / 1000) + 1)).toBe(false);
  });

  it('should_not_revoke_other_users', () => {
    service.revokeUserSessions(7);

    expect(service.isUserSessionRevoked(8, Math.floor(Date.now() / 1000) - 60)).toBe(false);
  });
});
