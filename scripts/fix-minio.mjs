import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const PASSWORD = process.env.HELALI_SSH_PASSWORD;
const REMOTE_DIR = '/opt/helali-infra';

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on('ready', () => resolve(conn))
      .on('error', reject)
      .connect({ host: '5.159.49.36', username: 'root', password: PASSWORD });
  });
}

function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream.on('data', (d) => process.stdout.write(d));
      stream.stderr.on('data', (d) => process.stderr.write(d));
      stream.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
    });
  });
}

function upload(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      sftp.fastPut(local, remote, (e) => {
        sftp.end();
        e ? reject(e) : resolve();
      });
    });
  });
}

const conn = await connect();
try {
  await upload(conn, join(rootDir, 'docker-compose.infra.yml'), `${REMOTE_DIR}/docker-compose.infra.yml`);
  await exec(
    conn,
    `cd ${REMOTE_DIR} && docker compose -f docker-compose.infra.yml pull minio && docker compose -f docker-compose.infra.yml up -d --force-recreate minio`,
  );
  await exec(conn, "docker ps --filter name=helali- --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'");
} finally {
  conn.end();
}
