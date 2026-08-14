const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const candidatePaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../../.env'),
];

const envFilePath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

if (!envFilePath) {
  console.error('No .env file found. Expected apps/backend/.env or repository root .env');
  process.exit(1);
}

const env = { ...process.env };

for (const line of fs.readFileSync(envFilePath, 'utf8').split(/\r?\n/)) {
  const trimmedLine = line.trim();

  if (!trimmedLine || trimmedLine.startsWith('#')) {
    continue;
  }

  const separatorIndex = trimmedLine.indexOf('=');

  if (separatorIndex === -1) {
    continue;
  }

  const key = trimmedLine.slice(0, separatorIndex).trim();
  const value = trimmedLine.slice(separatorIndex + 1).trim();
  env[key] = value;
}

const [command, ...commandArguments] = process.argv.slice(2);

if (!command) {
  console.error('Usage: node scripts/run-with-env.js <command> [args...]');
  process.exit(1);
}

const childProcess = spawn(command, commandArguments, {
  stdio: 'inherit',
  shell: true,
  env,
});

childProcess.on('exit', (exitCode) => {
  process.exit(exitCode ?? 1);
});
