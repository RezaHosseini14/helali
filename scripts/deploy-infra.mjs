import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const SERVER = process.env.HELALI_SERVER ?? '5.159.49.36';
const USER = process.env.HELALI_SSH_USER ?? 'root';
const PASSWORD = process.env.HELALI_SSH_PASSWORD;
const REMOTE_DIR = '/opt/helali-infra';

if (!PASSWORD) {
  console.error('Set HELALI_SSH_PASSWORD env var.');
  process.exit(1);
}

function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let stdout = '';
      let stderr = '';

      stream
        .on('close', (code) => {
          if (code === 0) {
            resolve(stdout.trim());
            return;
          }

          reject(new Error(stderr.trim() || stdout.trim() || `Command failed (${code})`));
        })
        .on('data', (data) => {
          stdout += data.toString();
          process.stdout.write(data);
        });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
    });
  });
}

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on('ready', () => resolve(conn))
      .on('error', reject)
      .connect({
        host: SERVER,
        port: 22,
        username: USER,
        password: PASSWORD,
        readyTimeout: 30000,
      });
  });
}

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) {
        reject(err);
        return;
      }

      sftp.fastPut(localPath, remotePath, (putErr) => {
        sftp.end();
        if (putErr) {
          reject(putErr);
          return;
        }

        resolve();
      });
    });
  });
}

async function main() {
  const composeContent = readFileSync(join(rootDir, 'docker-compose.infra.yml'), 'utf8');
  const conn = await connect();

  try {
    console.log(`\n=== Checking server ${SERVER} ===\n`);
    await exec(
      conn,
      "docker --version && docker compose version && ss -tlnp | grep -E ':(5432|6379|9000|9001)\\s' || true",
    );

    console.log('\n=== Existing Helali containers ===\n');
    await exec(
      conn,
      "docker ps -a --filter name=helali- --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}' || true",
    );

    console.log(`\n=== Deploying to ${REMOTE_DIR} (infra only) ===\n`);
    await exec(conn, `mkdir -p ${REMOTE_DIR}`);
    await uploadFile(conn, join(rootDir, 'docker-compose.infra.yml'), `${REMOTE_DIR}/docker-compose.infra.yml`);

    const requiredPorts = [
      { host: '5433', label: 'PostgreSQL' },
      { host: '6380', label: 'Redis' },
      { host: '9010', label: 'MinIO API' },
      { host: '9011', label: 'MinIO Console' },
    ];

    const portCheck = await exec(
      conn,
      "ss -tlnp | grep -E ':(5433|6380|9010|9011)\\s' || true",
    );

    for (const { host, label } of requiredPorts) {
      if (!portCheck.includes(`:${host}`)) {
        continue;
      }

      const dockerOwner = await exec(
        conn,
        `docker ps --format '{{.Names}} {{.Ports}}' | grep ':${host}->' || true`,
      );

      if (dockerOwner.includes('helali-')) {
        continue;
      }

      const owner = await exec(conn, `ss -tlnp | grep ':${host} ' || true`);
      throw new Error(
        `Port ${host} (${label}) is already in use. Aborting to avoid breaking existing apps.\n${owner}\n${dockerOwner}`,
      );
    }

    console.log('\n=== Starting Helali infra containers ===\n');
    await exec(
      conn,
      `cd ${REMOTE_DIR} && docker compose -f docker-compose.infra.yml up -d`,
    );

    console.log('\n=== Status ===\n');
    await exec(
      conn,
      "docker ps --filter name=helali- --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'",
    );

    console.log('\n=== Done ===');
    console.log(`PostgreSQL: ${SERVER}:5433 (db: helali_database, user/pass: root/root)`);
    console.log(`Redis:      ${SERVER}:6380`);
    console.log(`MinIO API:  ${SERVER}:9010 (minio99 / minio123)`);
    console.log(`MinIO UI:   http://${SERVER}:9011`);
    console.log(`\nLocal .env: copy .env.server.example to .env and run db:migrate:dev + db:seed`);
  } finally {
    conn.end();
  }
}

main().catch((error) => {
  console.error('\nDeploy failed:', error.message);
  process.exit(1);
});
