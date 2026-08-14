import { cpSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, '..');
const target = join(frontendRoot, 'node_modules', 'picocolors');

if (existsSync(target)) {
  process.exit(0);
}

const requireFromRoot = createRequire(join(frontendRoot, '..', '..', 'package.json'));
const source = dirname(requireFromRoot.resolve('picocolors/package.json'));

cpSync(source, target, { recursive: true });
