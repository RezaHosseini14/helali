#!/usr/bin/env bash
# Wrapper — same entrypoint as docs / emit-runner workflow (see register-helali-runner-on-vps.sh).
exec bash "$(dirname "$0")/register-helali-runner-on-vps.sh" "$@"
