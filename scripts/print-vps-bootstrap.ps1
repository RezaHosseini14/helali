# One-shot: print the exact commands to paste on the VPS (after password/console login).
# Same pattern as zarva — helali uses the same CI key as zarva on 109.70.78.80.
# Run:  powershell -File scripts/print-vps-bootstrap.ps1

$pub = Join-Path $env:USERPROFILE '.ssh\id_ed25519_zarva_ci.pub'
if (-not (Test-Path $pub)) {
  Write-Error "Missing $pub — create the zarva CI key first (shared for helali SSH fallback)."
  exit 1
}
$line = (Get-Content $pub -Raw).Trim()

Write-Host @"

=== Paste on VPS (as root) after password/console login ===

mkdir -p ~/.ssh && chmod 700 ~/.ssh
grep -q 'zarva-github-actions' ~/.ssh/authorized_keys 2>/dev/null || \
  echo '$line' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Optional: open app gateway ports (host nginx uses 443; docker gateway 3032)
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp
  ufw allow 3032/tcp
  ufw status
fi

=== Self-hosted runner (like zarva-vps) ===

1. GitHub → RezaHosseini14/helali → Actions → "(setup) Emit helali runner registration token"
2. On VPS:
   REGISTRATION_TOKEN='<token>' bash /opt/helali/scripts/register-self-hosted-runner-helali.sh
3. Repo variable DEPLOY_RUNS_ON = [\"self-hosted\",\"helali\"]

=== Verify from this PC (SSH fallback only; zarva uses runner, not GitHub→SSH) ===

ssh -i `$env:USERPROFILE\.ssh\id_ed25519_zarva_ci root@109.70.78.80

"@
