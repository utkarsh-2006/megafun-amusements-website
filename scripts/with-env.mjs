// Cross-platform `KEY=value command` for npm scripts (Windows cmd has no inline env syntax).
// Usage: node scripts/with-env.mjs SITE_MODE=preview -- astro build
import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
const split = args.indexOf('--');
for (const pair of args.slice(0, split)) {
  const [k, ...v] = pair.split('=');
  process.env[k] = v.join('=');
}
const [cmd, ...rest] = args.slice(split + 1);
const r = spawnSync(cmd, rest, { stdio: 'inherit', shell: true });
process.exit(r.status ?? 1);
