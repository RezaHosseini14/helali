#!/usr/bin/env bash
# Run ON the VPS as root (same host as zarva-vps). Registers repo RezaHosseini14/helali.
set -euo pipefail

RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner-helali}"
REPO="RezaHosseini14/helali"
LABELS="self-hosted,helali"
RUNNER_USER="${RUNNER_USER:-github-runner}"

REGISTRATION_TOKEN="${REGISTRATION_TOKEN:-${GITHUB_RUNNER_TOKEN:-}}"
if [[ -z "$REGISTRATION_TOKEN" ]]; then
  echo "Usage: REGISTRATION_TOKEN='<token>' bash $0"
  echo "Or run GitHub Actions workflow \"(setup) Emit helali runner registration token\" and copy from job summary."
  exit 1
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

if [[ ! -x ./config.sh ]]; then
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) RUNNER_PKG="actions-runner-linux-x64-2.322.0.tar.gz" ;;
    aarch64|arm64) RUNNER_PKG="actions-runner-linux-arm64-2.322.0.tar.gz" ;;
    *) echo "unsupported arch $ARCH"; exit 1 ;;
  esac
  curl -fsSL -o runner.tgz "https://github.com/actions/runner/releases/download/v2.322.0/${RUNNER_PKG}"
  tar xzf runner.tgz && rm runner.tgz
fi

chown -R "${RUNNER_USER}:${RUNNER_USER}" "$RUNNER_DIR"

run_as_runner() {
  su - "${RUNNER_USER}" -s /bin/bash -c "cd '$RUNNER_DIR' && $*"
}

run_as_runner './config.sh remove --unattended 2>/dev/null || true'
run_as_runner "./config.sh --url 'https://github.com/${REPO}' --token '${REGISTRATION_TOKEN}' --unattended --labels '${LABELS}' --name helali-vps"

chown -R "${RUNNER_USER}:${RUNNER_USER}" /opt/helali 2>/dev/null || true

(cd "$RUNNER_DIR" && ./svc.sh install "${RUNNER_USER}")
(cd "$RUNNER_DIR" && ./svc.sh start)
(cd "$RUNNER_DIR" && ./svc.sh status) || true
echo "Done. In GitHub set DEPLOY_RUNS_ON=[\"self-hosted\",\"helali\"] and restore deploy runs-on in ci-cd.yml to vars.DEPLOY_RUNS_ON."
