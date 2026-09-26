#!/usr/bin/env node
/**
 * Critical-path payload analyzer for the built `dist/` output.
 *
 * Astro ships React islands that are not listed in the HTML as <script src> tags
 * (they are <astro-island component-url="..." renderer-url="..."> elements which
 * the inline astro-island runtime dynamically imports). That means the real
 * per-page JS payload has to be resolved by walking the emitted module graph.
 *
 * This script:
 *   1. finds every built HTML page
 *   2. extracts the entry modules (inline <script type=module src> + astro-island
 *      component-url / renderer-url)
 *   3. recursively follows *static* imports in the emitted chunks
 *   4. sums gzip-compressed bytes for the transitive critical path
 *
 * Usage:
 *   node scripts/perf-report.mjs [--json] [--baseline <file>]
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const A = (p) => join(DIST, p.replace(/^\//, ''));

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const baselineArg = argv.indexOf('--baseline');
const baselinePath = baselineArg !== -1 ? argv[baselineArg + 1] : null;

/* ------------------------------------------------------------------ helpers */

const gzCache = new Map();
function gzipSize(abs) {
  if (gzCache.has(abs)) return gzCache.get(abs);
  const n = gzipSync(readFileSync(abs), { level: 9 }).length;
  gzCache.set(abs, n);
  return n;
}
function rawSize(abs) {
  return statSync(abs).size;
}

/**
 * Matches static ESM imports emitted by the bundler.
 * Handles: import "x" / import a from "x" / import{a,b}from"x" / export*from"x"
 * Deliberately ignores `import(` (dynamic) so lazy chunks are excluded, which is
 * exactly what we want for a critical-path metric.
 */
const IMPORT_RE =
  /(?:^|[;\s}])(?:import|export)\s*(?:[\w${}*,\s*]*?\s*from\s*)?["']([^"']+)["']/g;

function staticImports(abs) {
  const src = readFileSync(abs, 'utf8');
  const out = new Set();
  for (const m of src.matchAll(IMPORT_RE)) {
    const spec = m[1];
    if (spec.startsWith('.')) {
      out.add(join(dirname(abs), spec));
    } else if (spec.startsWith('/')) {
      out.add(A(spec));
    } else {
      // bare specifier that survived into the bundle output
      out.add(A('/_astro/' + spec));
    }
  }
  return out;
}

function walk(entryAbs, seen) {
  if (seen.has(entryAbs) || !existsSync(entryAbs)) return;
  seen.add(entryAbs);
  for (const dep of staticImports(entryAbs)) walk(dep, seen);
}

/* ------------------------------------------------------------- html scanning */

function htmlPages() {
  const pages = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      const st = statSync(abs);
      if (st.isDirectory()) {
        if (name === '_astro' || name === 'sitemap') continue;
        visit(abs);
      } else if (name.endsWith('.html')) {
        pages.push(abs);
      }
    }
  };
  visit(DIST);
  return pages.sort();
}

/**
 * Split a page's entry modules into what actually blocks interactivity and what
 * is fetched afterwards.
 *
 * Astro ships React islands as <astro-island component-url=...> elements that
 * the inline runtime loads with a *dynamic* import. An island marked
 * `client="load"` is required before the page is interactive, but `client="idle"`
 * and `client="visible"` are explicitly deferred by the framework and must not
 * be counted against first paint. The renderer is always blocking: nothing can
 * hydrate without it.
 */
function entriesFor(html) {
  const src = readFileSync(html, 'utf8');
  const blocking = new Set();
  const deferred = new Set();

  // Inline module scripts (ClientRouter, page bootstrapping) run immediately.
  for (const m of src.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)) {
    blocking.add(m[1]);
  }

  for (const m of src.matchAll(/renderer-url="([^"]+)"/g)) blocking.add(m[1]);

  // Split the astro-island open tag so we can read both attributes together.
  for (const m of src.matchAll(/<astro-island\b[^>]*>/g)) {
    const tag = m[0];
    const component = /component-url="([^"]+)"/.exec(tag)?.[1];
    if (!component) continue;
    const directive = /client="([a-z]+)"/.exec(tag)?.[1] ?? 'load';
    if (directive === 'load') blocking.add(component);
    else deferred.add(component);
  }

  const toPaths = (set) => [...set].filter((u) => u.startsWith('/')).map(A);
  return { blocking: toPaths(blocking), deferred: toPaths(deferred) };
}

function stylesheetsFor(html) {
  const src = readFileSync(html, 'utf8');
  const out = new Set();
  for (const m of src.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) out.add(m[1]);
  // <style> blocks that Astro inlined
  const inlined = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].reduce(
    (n, m) => n + Buffer.byteLength(m[1]),
    0,
  );
  return { files: [...out].map(A), inlined };
}

/* -------------------------------------------------------------------- report */

const pages = htmlPages();
const results = [];

for (const page of pages) {
  const { blocking, deferred } = entriesFor(page);

  // Blocking = what must arrive before the page is interactive.
  const blockingSeen = new Set();
  for (const e of blocking) walk(e, blockingSeen);

  // Everything = blocking plus the framework-deferred island chunks, so we can
  // also report the full cost of a fully-interacted-with page.
  const allSeen = new Set(blockingSeen);
  for (const e of deferred) walk(e, allSeen);

  const { files: sheets, inlined } = stylesheetsFor(page);
  for (const s of sheets) walk(s, allSeen);
  for (const s of sheets) blockingSeen.add(s);

  const pick = (set) => [...set].filter((p) => p.endsWith('.js') && existsSync(p));
  const js = pick(allSeen);
  const blockingJs = pick(blockingSeen);
  const htmlGz = gzipSize(page);
  const cssGz = sheets.reduce((n, p) => n + (existsSync(p) ? gzipSize(p) : 0), 0);

  const jsGz = js.reduce((n, p) => n + gzipSize(p), 0);
  const blockingJsGz = blockingJs.reduce((n, p) => n + gzipSize(p), 0);

  results.push({
    page: '/' + relative(DIST, page).replace(/index\.html$/, '').replace(/\.html$/, ''),
    htmlGz,
    cssGz,
    cssInlinedRaw: inlined,
    jsGz,
    blockingJsGz,
    deferredJsGz: jsGz - blockingJsGz,
    jsRequests: js.length,
    blockingRequests: blockingJs.length,
    totalGz: htmlGz + cssGz + jsGz,
    blockingTotalGz: htmlGz + cssGz + blockingJsGz,
    jsFiles: js.map((p) => ({
      f: relative(DIST, p),
      raw: rawSize(p),
      gz: gzipSize(p),
    })),
  });
}

results.sort((a, b) => b.totalGz - a.totalGz);

const totals = results.reduce(
  (acc, r) => {
    acc.html += r.htmlGz;
    acc.css += r.cssGz;
    acc.js += r.jsGz;
    acc.blockingJs += r.blockingJsGz;
    acc.total += r.totalGz;
    acc.blockingTotal += r.blockingTotalGz;
    acc.requests += r.jsRequests;
    acc.blockingRequests += r.blockingRequests;
    return acc;
  },
  { html: 0, css: 0, js: 0, blockingJs: 0, total: 0, blockingTotal: 0, requests: 0, blockingRequests: 0 },
);

const worst = results[0];

/* -------------------------------------------------------------------- output */

if (asJson) {
  const payload = { results, totals, worstPage: worst?.page };
  if (baselinePath && existsSync(baselinePath)) {
    const base = JSON.parse(readFileSync(baselinePath, 'utf8'));
    const byPage = new Map(base.results.map((r) => [r.page, r]));
    payload.comparison = results.map((r) => {
      const b = byPage.get(r.page);
      return b
        ? {
            page: r.page,
            before: b.totalGz,
            after: r.totalGz,
            deltaPct: Number((((r.totalGz - b.totalGz) / b.totalGz) * 100).toFixed(1)),
          }
        : { page: r.page, before: null, after: r.totalGz, deltaPct: null };
    });
    payload.totalsBefore = base.totals;
    payload.totalsDeltaPct = Number(
      (((totals.total - base.totals.total) / base.totals.total) * 100).toFixed(1),
    );
  }
  console.log(JSON.stringify(payload, null, 2));
} else {
  const kb = (n) => (n / 1024).toFixed(1) + ' KB';
  console.log('\n  Payload per page (gzip)');
  console.log('  blocking = must arrive before the page is interactive');
  console.log('  all      = + islands deferred by client:idle / client:visible\n');
  console.log(
    '  ' + 'page'.padEnd(30) + 'html'.padStart(8) + 'css'.padStart(8) + 'js-block'.padStart(10) + 'BLOCKING'.padStart(10) + 'js-all'.padStart(9) + 'all'.padStart(9) + 'reqs'.padStart(6),
  );
  console.log('  ' + '-'.repeat(90));
  for (const r of results) {
    console.log(
      '  ' +
        r.page.padEnd(30) +
        kb(r.htmlGz).padStart(8) +
        kb(r.cssGz).padStart(8) +
        kb(r.blockingJsGz).padStart(10) +
        kb(r.blockingTotalGz).padStart(10) +
        kb(r.jsGz).padStart(9) +
        kb(r.totalGz).padStart(9) +
        String(r.jsRequests).padStart(6),
    );
  }
  console.log('  ' + '-'.repeat(90));
  console.log(
    '  ' + 'SUM (all 21 pages)'.padEnd(30) +
      kb(totals.html).padStart(8) +
      kb(totals.css).padStart(8) +
      kb(totals.blockingJs).padStart(10) +
      kb(totals.blockingTotal).padStart(10) +
      kb(totals.js).padStart(9) +
      kb(totals.total).padStart(9) +
      String(totals.requests).padStart(6),
  );
  console.log(
    '\n  Worst page: ' + worst.page + ' @ ' + kb(worst.totalGz) + ' gzip (' +
      kb(worst.blockingTotalGz) + ' blocking) across ' + worst.jsRequests + ' JS requests\n',
  );
}

if (baselinePath) {
  const out = join(ROOT, baselinePath);
  writeFileSync(out, JSON.stringify({ results, totals }, null, 2));
  console.log('  baseline written -> ' + baselinePath + '\n');
}
