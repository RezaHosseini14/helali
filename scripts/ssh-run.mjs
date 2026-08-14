import { Client } from 'ssh2';

const PASSWORD = process.env.HELALI_SSH_PASSWORD;
const cmd = process.argv[2] ?? "docker logs helali-minio --tail 40 2>&1";

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('data', (d) => process.stdout.write(d));
      stream.stderr.on('data', (d) => process.stderr.write(d));
      stream.on('close', () => conn.end());
    });
  })
  .connect({ host: '5.159.49.36', username: 'root', password: PASSWORD });
