# helali CI — رفع سریع (بدون حدس)

## وضعیت فعلی (۷ آبان)

- **zarva** دیپلوی سبز می‌زند چون رانر **`zarva-vps`** (self-hosted) روی VPS آنلاین است — نه SSH از `ubuntu-latest`.
- **helali** در repo متغیر `DEPLOY_RUNS_ON = ["self-hosted","helali"]` دارد ولی **رانر helali ثبت نشده** → یا صف «Waiting for runner» یا دیپلوی SSH روی `ubuntu-latest` که **بدون secret** fail می‌شود.

توکن Cursor روی این ماشین **اجازهٔ Secrets/Variables گیت‌هاب ندارد**؛ فقط push کد می‌شود.

---

## مسیر A — مثل zarva (توصیه): رانر helali روی VPS

1. GitHub → **RezaHosseini14/helali** → **Actions** → workflow **(setup) Emit helali runner registration token** → **Run workflow** → در Job Summary توکن را کپی کن (یا از Settings → Runners → New).
2. SSH به VPS: `ssh root@109.70.78.80`
3. روی VPS (پوشهٔ رانر از zarva همگام شده در `/opt/actions-runner-helali`):

```bash
REGISTRATION_TOKEN='…' bash /opt/helali/scripts/register-self-hosted-runner-helali.sh
```

4. تأیید: `systemctl status 'actions.runner.*helali*'`
5. متغیر repo: `DEPLOY_RUNS_ON` = `["self-hosted","helali"]` (همان zarva)
6. **Re-run** آخرین CI/CD روی `main` — deploy باید **LOCAL** روی helali-vps باشد (نه SSH از ubuntu).

اگر رانر نباشد، job جدید **Check helali runner online** با پیام واضح fail می‌کند؛ دیگر timeout SSH از GitHub یا صف بی‌نهایت runner.

---

## مسیر B — موقت: SSH از GitHub (مثل اسکرین‌شات قدیمی)

1. **helali** → Settings → Secrets → Actions → همان secrets زروا را اضافه کن:
   - `SSH_PRIVATE_KEY` (محتوای `~/.ssh/id_ed25519_zarva_ci`)
   - `SSH_HOST` = `109.70.78.80`
   - `SSH_USER` = `root`
   - `TLS_HOST` = `helali.rmhosseini.ir`
2. در repo helali متغیر **`DEPLOY_RUNS_ON` را حذف** کن (یا workflow الان `runs-on: ubuntu-latest` دارد).
3. اگر باز هم **TCP timeout** از GitHub → فقط مسیر A جواب می‌دهد.

---

## PAT برای agent (اختیاری)

اگر می‌خواهی Cursor خودش secret بزند: Classic PAT با scope **repo** + **workflow** + دسترسی Actions secrets/variables.
