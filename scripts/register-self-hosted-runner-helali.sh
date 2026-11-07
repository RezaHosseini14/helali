#!/usr/bin/env bash
# Register the helali self-hosted runner on the VPS (run once as root).
# Get a registration token: GitHub → RezaHosseini14/helali → Settings → Actions → Runners → New self-hosted runner.
set -euo pipefail

RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner-helali}"
RUNNER_NAME="${RUNNER_NAME:-helali-vps}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,helali}"
RUNNER_USER="${RUNNER_USER:-github-runner}"

if [ -z "${REGISTRATION_TOKEN:-}" ]; then
  echo "Usage: REGISTRATION_TOKEN='<token>' bash $0"
  echo "Token expires in ~1 hour; generate a fresh one from GitHub UI."
  exit 1
fi

if [ ! -x "$RUNNER_DIR/config.sh" ]; then
  echo "::error::Missing $RUNNER_DIR/config.sh — extract actions-runner-linux-x64 there first."
  exit 1
fi

cd "$RUNNER_DIR"

if [ -f .runner ]; then
  echo "Runner already configured ($(cat .runner | head -c 120))..."
  echo "To re-register: ./config.sh remove --token <REMOVE_TOKEN> first."
  exit 0
fi

chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_DIR"

sudo -u "$RUNNER_USER" ./config.sh \
  --url "https://github.com/RezaHosseini14/helali" \
  --token "$REGISTRATION_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "$RUNNER_LABELS" \
  --unattended \
  --replace

sudo -u "$RUNNER_USER" ./svc.sh install "github-runner"
sudo ./svc.sh start
sudo ./svc.sh status

echo ""
echo "Next: set repo variable DEPLOY_RUNS_ON to [\"self-hosted\",\"helali\"] in GitHub → Settings → Variables → Actions."
echo "Optional: remove SSH_PRIVATE_KEY from secrets if you only use local deploy."
