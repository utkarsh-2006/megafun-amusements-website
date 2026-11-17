/**
 * Post-build check of dist/_redirects (run: npm run check:redirects after a build).
 * Simulates Cloudflare Pages matching — exact paths (trailing slash optional) and a trailing
 * `*` captured as :splat — for the legacy URLs below, and asserts each lands on a page that
 * exists in dist/. This checks our rules file, not Cloudflare itself.
 */
import { readFileSync, existsSync } from 'node:fs';

const dir = process.argv[2] ?? 'dist';
const rules = readFileSync(`${dir}/_redirects`, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split(/\s+/));

const strip = (p) => p.replace(/\/$/, '');
function match(path) {
  for (const [from, to, code] of rules) {
    if (from.endsWith('*')) {
      const prefix = from.slice(0, -1);
      if (path.startsWith(prefix)) return { to: to.replace(':splat', path.slice(prefix.length)), code };
    } else if (strip(from) === strip(path)) return { to, code };
  }
  return null;
}
const pageExists = (url) => {
  const p = url.split('#')[0];
  return existsSync(`${dir}${p}${p.endsWith('/') ? 'index.html' : '/index.html'}`);
};

const cases = [
  ['/company/', '/#company'],
  ['/company', '/#company'],
  ['/company/news/', '/updates/'],
  ['/company/news/some-article/', '/updates/some-article/'],
  ['/company/credentials/', '/turnkey-engineering/#credentials'],
  ['/about-us', '/#company'],
  ['/latest-updates/2', '/updates/'],
  ['/mapview/13-086445395696511/80-16735468059778', '/contact/#office'],
  ['/all-products/1', '/attractions/'],
  ['/image-gallery/1', '/updates/#gallery'],
];
let fail = 0;
for (const [from, expected] of cases) {
  const m = match(from);
  const ok = m && m.to === expected && m.code === '301';
  // An article splat target only exists when that article does; check the section instead.
  const lands = m && (pageExists(m.to) || pageExists(m.to.replace(/[^/]+\/$/, '')));
  console.log(`${ok && lands ? 'ok  ' : 'FAIL'} ${from} -> ${m ? `${m.to} (${m.code})` : 'no rule'}`);
  if (!(ok && lands)) fail++;
}
const statics = rules.findIndex((r) => /[*:]/.test(r[0]));
if (statics !== -1 && rules.slice(statics).some((r) => !/[*:]/.test(r[0]))) {
  console.log('FAIL static rule after dynamic rule');
  fail++;
}
process.exit(fail ? 1 : 0);
