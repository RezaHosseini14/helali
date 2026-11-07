# helali CI — align with zarva

## Difference today

| | zarva | helali (target) |
|---|--------|------------------|
| Workflow | `ci-cd.yml` + `setup-domain.yml` + `release.yml` | same layout (aligned) |
| `DEPLOY_RUNS_ON` | `["self-hosted","zarva"]` | `["self-hosted","helali"]` |
| VPS runner | `zarva-vps` online | register **helali-vps** (one-time) |
| Deploy log | LOCAL, SSH steps skipped | same after runner exists |

## One-time: register helali runner (required)

1. **helali** → Actions → **(setup) Emit helali runner registration token** → Run → copy token.  
2. Console/SSH to `109.70.78.80` (from home if GitHub cannot SSH).  
3. Run:

```bash
REGISTRATION_TOKEN='<token>' bash /opt/helali/scripts/register-self-hosted-runner-helali.sh
```

4. GitHub → Settings → Variables → `DEPLOY_RUNS_ON` = `["self-hosted","helali"]`.  
5. Re-run CI on `main`.

See also `DEPLOYMENT.md` and `scripts/print-vps-bootstrap.ps1`.
