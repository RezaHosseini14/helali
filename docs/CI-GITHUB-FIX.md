# helali CI — رفع سریع (بدون حدس)

## وضعیت فعلی (۷ آبان)

- **zarva** دیپلوی سبز می‌زند چون رانر **`zarva-vps`** (self-hosted) روی VPS آنلاین است — نه SSH از `ubuntu-latest`.
- **helali** در repo متغیر `DEPLOY_RUNS_ON = ["self-hosted","helali"]` دارد ولی **رانر helali ثبت نشده** → یا صف «Waiting for runner» یا دیپلوی SSH روی `ubuntu-latest` که **بدون secret** fail می‌شود.

توکن Cursor روی این ماشین **اجازهٔ Secrets/Variables گیت‌هاب ندارد**؛ فقط push کد می‌شود.

---

## مسیر A — مثل zarva (توصیه): رانر helali روی VPS

1. از سیستم خودت SSH به `root@109.70.78.80`.
2. GitHub → **RezaHosseini14/helali** → **Settings → Actions → Runners → New self-hosted runner** → توکن را کپی کن.
3. روی VPS:

```bash
export GITHUB_RUNNER_TOKEN='…'
curl -fsSL -o /tmp/register.sh "https://raw.githubusercontent.com/RezaHosseini14/helali/main/scripts/register-helali-runner-on-vps.sh"
bash /tmp/register.sh
```

یا بعد از `git pull` در کلون محلی: `bash /opt/helali/scripts/register-helali-runner-on-vps.sh`

4. در `ci-cd.yml` خط deploy را برگردان به (مثل zarva):

`runs-on: ${{ fromJSON(vars.DEPLOY_RUNS_ON || '["ubuntu-latest"]') }}`

5. push → deploy باید روی **helali-vps** با همان استپ‌های LOCAL برود.

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
