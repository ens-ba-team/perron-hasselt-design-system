/**
 * drift-check.mjs — detect docs/token drift across the design system.
 *
 * Run:  node "Machine Readable/drift-check.mjs"
 *
 * Checks (drift = a doc restates a fact owned authoritatively elsewhere):
 *   1. llms.txt — every referenced file path resolves
 *   2. Component count — doc claims ("N components") match actual meta.json count
 *   3. agentic-theme.md — every hex value exists in primitives.tokens.json
 *   4. Figma Dark mode ↔ tokens.css .dark block  (only if figma-cli is connected)
 *   5. Storybook stories — every story file has a matching meta.json (catches undocumented components)
 *   6. project-state.json ↔ prose — mutable facts (component count, doc versions, pagination,
 *      open-question status) are stored once in project-state.json; prose must agree
 *   7. Shell-block paths — every path in a ```sh/```bash block resolves
 *   8. Forbidden phrases — superseded claims listed in project-state.json appear nowhere
 *   9. Icons — nothing imports lucide-react (shadcn's CLI will keep adding it; see the check)
 *
 * Exit code 1 if any drift is found (so CI can gate on it).
 * A skipped check is reported as skipped, never counted as a pass.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');               // repo root (parent of "Machine Readable")
let problems = 0;
let skipped = 0;
const ok = (m) => console.log('  ✓ ' + m);
const bad = (m) => { console.log('  ✗ ' + m); problems++; };
const skip = (m) => { console.log('  — SKIPPED: ' + m); skipped++; };
const section = (t) => console.log('\n' + t);

// Shared: every .md / .txt the checks below police, minus the exempt list.
const state = JSON.parse(fs.readFileSync(path.join(here, 'project-state.json'), 'utf8'));
const exempt = state._exemptPaths ?? [];
function docFiles() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', '.next', 'dist', 'storybook-static'].includes(e.name)) continue;
      const full = path.join(dir, e.name);
      const rel = path.relative(root, full).split(path.sep).join('/');
      if (e.isDirectory()) { walk(full); continue; }
      if (!/\.(md|txt)$/.test(e.name)) continue;
      if (exempt.some((x) => rel === x || rel.startsWith(x))) continue;
      out.push(rel);
    }
  })(root);
  return out;
}
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

// A phrase wrapped in `code`, "quotes" or ~~strikethrough~~ is being *mentioned*
// (a warning list, a quoted past mistake, a superseded line) — not claimed. Checks
// 6 and 8 ignore those spans, otherwise they fire on the docs doing the warning.
function protectedSpans(line) {
  const spans = [];
  for (const re of [/`[^`]*`/g, /"[^"]*"/g, /~~[\s\S]*?~~/g]) {
    for (const m of line.matchAll(re)) spans.push([m.index, m.index + m[0].length]);
  }
  return spans;
}
const isMention = (line, idx) => protectedSpans(line).some(([a, b]) => idx >= a && idx < b);

// ── 1. llms.txt referenced paths resolve ─────────────────────────────────────
section('1. llms.txt — referenced paths exist');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const ticks = [...llms.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
// Only check directory paths (contain "/") with a file extension or trailing slash —
// these are the drift-prone references (folder renames/deletions). Bare filenames and
// story titles are skipped.
const looksLikePath = (s) => s.includes('/') && (/\.(md|json|tsx?|css|mjs|txt|html)$/.test(s) || /\/$/.test(s));
const skipIt = (s) =>
  /[\[\]*<>]/.test(s) || s.includes('...') || /^https?:/.test(s) ||
  /^(Screens|UI Template)\//.test(s);   // story titles + the external (out-of-repo) UI Template catalog
const paths = [...new Set(ticks.filter((s) => looksLikePath(s) && !skipIt(s)))];
let miss = 0;
for (const p of paths) if (!fs.existsSync(path.join(root, p))) { bad(`dead path: ${p}`); miss++; }
if (miss === 0) ok(`${paths.length} referenced paths all resolve`);

// ── 2. Component count: doc claims vs meta.json files ────────────────────────
section('2. Component count — docs vs meta.json files');
const metaDir = path.join(root, 'Machine Readable/artifacts/components');
const metaCount = fs.readdirSync(metaDir).filter((f) => f.endsWith('.meta.json')).length;
// Require plural "components" so "44 component tokens" doesn't match as a component count.
const claims = [...new Set([...llms.matchAll(/(\d+)\s+(?:documented\s+)?components\b/gi)].map((m) => +m[1]))];
const wrong = claims.filter((c) => c !== metaCount);
if (wrong.length === 0) ok(`meta.json count ${metaCount} matches doc claim(s): ${claims.join(', ') || 'none'}`);
else bad(`meta.json count is ${metaCount} but docs claim: ${wrong.join(', ')}`);

// ── 3. agentic-theme.md hexes exist in primitives ────────────────────────────
section('3. agentic-theme.md — hex values exist in primitives.tokens.json');
const theme = fs.readFileSync(path.join(root, 'agentic-theme.md'), 'utf8');
const prim = fs.readFileSync(path.join(root, 'Tokens/primitives.tokens.json'), 'utf8').toLowerCase();
const hexes = [...new Set([...theme.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0].toLowerCase()))];
const orphans = hexes.filter((h) => !prim.includes(h));
if (orphans.length === 0) ok(`all ${hexes.length} theme hexes found in primitives`);
else orphans.forEach((h) => bad(`theme hex ${h} not in primitives.tokens.json`));

// ── 4. Figma Dark mode ↔ tokens.css .dark  (optional — needs figma-cli) ──────
section('4. Figma Dark mode ↔ tokens.css .dark block (needs figma-cli)');
const figmaCli = path.join(os.homedir(), 'figma-cli', 'src', 'index.js');
const evalCode = `
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const sem = cols.find(c=>c.name==="Semantics"), comp = cols.find(c=>c.name==="Components");
if(!sem) return "NO_SEMANTICS";
const lm = sem.modes.find(m=>m.name==="Light").modeId, dm = sem.modes.find(m=>m.name==="Dark").modeId;
const all = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(all.map(v=>[v.id,v]));
const hx=x=>Math.round(x*255).toString(16).padStart(2,"0"); const toHex=c=>"#"+hx(c.r)+hx(c.g)+hx(c.b);
function res(val,mode){let v=val,g=0;while(v&&v.type==="VARIABLE_ALIAS"&&g++<12){const t=byId[v.id];if(!t)return "?";const mid=(t.valuesByMode[mode]!==undefined)?mode:Object.keys(t.valuesByMode)[0];v=t.valuesByMode[mid];}return (v&&v.r!==undefined)?toHex(v):"?";}
const out=[];
for(const id of sem.variableIds){const v=byId[id];if(v.resolvedType!=="COLOR")continue;out.push(v.name+"|"+res(v.valuesByMode[lm],lm)+"|"+res(v.valuesByMode[dm],dm));}
for(const id of comp.variableIds){const v=byId[id];if(v.resolvedType!=="COLOR")continue;const own=v.valuesByMode[Object.keys(v.valuesByMode)[0]];out.push(v.name+"|"+res(own,lm)+"|"+res(own,dm));}
return out.join("\\n");
`;
try {
  const raw = execFileSync('node', [figmaCli, 'eval', evalCode], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  if (/Not connected|fetch failed|NO_SEMANTICS/.test(raw)) throw new Error('not connected');
  const rows = raw.split('\n').filter((l) => l.includes('|')).map((l) => l.split('|'));
  // Parse tokens.css :root + .dark
  const css = fs.readFileSync(path.join(root, 'agentic-ui/src/app/tokens.css'), 'utf8');
  const di = css.indexOf('.dark');
  const parse = (t) => { const m = {}; const re = /--([\w-]+):\s*([^;]+);/g; let x; while ((x = re.exec(t))) m['--' + x[1]] = x[2].trim().toLowerCase(); return m; };
  const rootMap = parse(css.slice(0, di)), darkMap = parse(css.slice(di));
  let mismatch = 0;
  for (const [name, , fdark] of rows) {
    const v = '--' + name.replace(/\//g, '-');
    const cssLight = rootMap[v];
    if (cssLight === undefined) continue;
    const effDark = darkMap[v] !== undefined ? darkMap[v] : cssLight;
    if (fdark.toLowerCase() !== effDark) { bad(`${name}: figma=${fdark} css=${effDark}`); mismatch++; }
  }
  if (mismatch === 0) ok(`all ${rows.length} dark color tokens match Figma`);
} catch {
  skip('figma-cli not connected. Connect (cd ~/figma-cli && node src/index.js connect --safe) and re-run.');
}

// ── 5. Storybook stories ↔ meta.json (catch undocumented components) ──────────
section('5. Storybook stories — every story is owned by a meta.json');
const storiesDir = path.join(root, 'agentic-ui/src/stories');
// Authoritative link: each meta.json declares the story file it owns via storybook.file.
// Match on that (by basename) rather than guessing from filenames — a meta named
// a meta named e.g. radio-group.meta.json legitimately owns RadioGroup.stories.tsx.
const ownedStories = new Set();
for (const f of fs.readdirSync(metaDir).filter((f) => f.endsWith('.meta.json'))) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(metaDir, f), 'utf8'));
    const file = meta?.storybook?.file;
    if (file) ownedStories.add(path.basename(file));
  } catch { bad(`meta.json unreadable: ${f}`); }
}
// Top-level only — screens/ live in a subfolder and are prototypes, not components.
const storyFiles = fs.existsSync(storiesDir)
  ? fs.readdirSync(storiesDir).filter((f) => f.endsWith('.stories.tsx'))
  : [];
let undoc = 0;
for (const f of storyFiles) {
  if (!ownedStories.has(f)) { bad(`story "${f}" is not owned by any meta.json — undocumented component`); undoc++; }
}
if (undoc === 0) ok(`all ${storyFiles.length} story files are owned by a meta.json`);

// ── 6. project-state.json ↔ prose ────────────────────────────────────────────
section('6. project-state.json ↔ prose — mutable facts match');
{
  const files = docFiles();
  let n = 0;

  // 6a. Components remaining is derived, never typed: total − synced
  const remaining = state.components.total - state.components.syncedToPerronFigma.length;
  for (const f of files) {
    const txt = read(f);
    // Only counts phrased as "not audited" — "N components exist in the Figma file"
    // is a different fact and must not be read as a remaining-to-audit count.
    for (const m of txt.matchAll(/(?:other|remaining|rà)\s+\*{0,2}(\d+)\*{0,2}[^.\n]{0,60}?(?:not (?:yet )?audited|chưa (?:được )?audit|chưa rà)/gi)) {
      if (+m[1] !== remaining) { bad(`${f}: claims ${m[1]} components left to audit, derived value is ${remaining}`); n++; }
    }
    for (const m of txt.matchAll(/(\d+)\s+of\s+(\d+)\s+components?[^.\n]{0,40}?not (?:yet )?audited/gi)) {
      if (+m[2] !== state.components.total || +m[1] !== remaining)
        { bad(`${f}: claims "${m[1]} of ${m[2]} components not audited", expected "${remaining} of ${state.components.total}"`); n++; }
    }
  }

  // 6b. Product doc versions, and no stale cross-reference to an older version
  for (const f of state.docVersions.files) {
    const txt = read(f);
    const v = txt.match(/\|\s*\*\*Version\*\*\s*\|\s*([0-9.]+)/);
    if (!v) { bad(`${f}: no Version row found`); n++; }
    else if (v[1] !== state.docVersions.expected)
      { bad(`${f}: Version is ${v[1]}, expected ${state.docVersions.expected}`); n++; }
  }
  const older = new RegExp(`v0\\.(?!${state.docVersions.expected.split('.')[1]}\\b)\\d`, 'g');
  for (const f of files) {
    for (const m of read(f).matchAll(older)) { bad(`${f}: stale version reference "${m[0]}" (expected v${state.docVersions.expected})`); n++; }
  }

  // 6c. Pagination default — prose AND code must match the stored value
  const want = state.prototype.defaultPageSize;
  const codeRel = 'agentic-ui/src/app/prototype/perron/_shared/components/list-pagination.tsx';
  if (fs.existsSync(path.join(root, codeRel))) {
    const c = read(codeRel).match(/DEFAULT_PAGE_SIZE\s*=\s*(\d+)/);
    if (c && +c[1] !== want) { bad(`${codeRel}: DEFAULT_PAGE_SIZE is ${c[1]}, project-state says ${want}`); n++; }
  }
  for (const f of files) {
    for (const m of read(f).matchAll(/default\s+(\d+)/gi)) {
      if (+m[1] !== want && state.prototype.pageSizes.includes(+m[1]))
        { bad(`${f}: says pagination "default ${m[1]}", project-state says ${want}`); n++; }
    }
  }

  // 6d. A question that is no longer open must not be presented as open.
  //     Heuristic: a line naming it must also carry a resolution marker. It cannot read
  //     prose, so it catches list entries, not every sentence.
  const resolved = /confirm|in scope|closed|chốt|~~|does not exist|no Q3/i;
  for (const [q, status] of Object.entries(state.openQuestions)) {
    if (status === 'open') continue;
    for (const f of files) {
      read(f).split('\n').forEach((line, i) => {
        // Only a row whose KEY is the question ("| Q27 | …") presents it as open.
        // Mentioning it elsewhere (⚙️ custom-code markers, risk rows, indexes) is fine.
        const row = line.match(/^\|\s*\*{0,2}~{0,2}(Q\d+)~{0,2}\*{0,2}\s*\|/);
        if (!row || row[1] !== q) return;
        if (!resolved.test(line)) { bad(`${f}:${i + 1}: ${q} is "${status}" but is still a row in an open-questions table`); n++; }
      });
    }
  }

  // 6e. Dates typed into prose must match the stored ones. These are the facts that
  //      drift most quietly: nothing else in the repo contradicts a stale date.
  {
    const readme = read('README.md');
    for (const [label, re] of [['Updated:', /Updated:\s*(\d{4}-\d{2}-\d{2})/],
                               ['Last checked:', /\*\*Last checked:\s*(\d{4}-\d{2}-\d{2})/]]) {
      const m = readme.match(re);
      if (!m) { bad(`README.md: no "${label}" date found`); n++; }
      else if (m[1] !== state.dates.docsUpdated)
        { bad(`README.md: "${label} ${m[1]}" but project-state says dates.docsUpdated = ${state.dates.docsUpdated}`); n++; }
    }
    const sync = read('Machine Readable/perron-figma-sync.md');
    const sm = sync.match(/\*\*Last checked\*\*\s*\|\s*(\d{4}-\d{2}-\d{2})/);
    if (!sm) { bad('perron-figma-sync.md: no "Last checked" row in the status block'); n++; }
    else if (sm[1] !== state.dates.figmaLastChecked)
      { bad(`perron-figma-sync.md: Last checked ${sm[1]} but project-state says dates.figmaLastChecked = ${state.dates.figmaLastChecked}`); n++; }
  }

  if (n === 0) ok(`prose agrees with project-state.json (${remaining} remaining, v${state.docVersions.expected}, default ${want})`);
}

// ── 7. Shell-block paths resolve ─────────────────────────────────────────────
section('7. Shell blocks — referenced paths exist');
{
  let n = 0, checked = 0;
  for (const f of docFiles()) {
    for (const blk of read(f).matchAll(/```(?:sh|bash|shell|console)\n([\s\S]*?)```/g)) {
      for (const m of blk[1].matchAll(/["']([^"'\n]+\.(?:mjs|js|ts|tsx|json|md|css))["']|(\S+\/\S+\.(?:mjs|js|ts|tsx|json|md|css))/g)) {
        const t = (m[1] ?? m[2]).replace(/^\.\//, '');
        if (/^[-$]|^https?:|\*/.test(t)) continue;
        if (t.startsWith('node_modules/')) continue;   // not checked in
        checked++;
        if (!fs.existsSync(path.join(root, t))) { bad(`${f}: shell block references missing path "${t}"`); n++; }
      }
    }
  }
  if (n === 0) ok(`${checked} path(s) in shell blocks all resolve`);
}

// ── 8. Forbidden phrases ─────────────────────────────────────────────────────
section('8. Forbidden phrases — superseded claims are gone');
{
  let n = 0;
  for (const f of docFiles()) {
    const lines = read(f).split('\n');
    for (const { phrase, why } of state.forbiddenPhrases) {
      lines.forEach((line, i) => {
        const at = line.indexOf(phrase);
        if (at === -1 || isMention(line, at)) return;
        bad(`${f}:${i + 1}: "${phrase}" — ${why}`); n++;
      });
    }
  }
  if (n === 0) ok(`none of the ${state.forbiddenPhrases.length} superseded phrases appear`);
}

// ── 9. Icon library — nothing imports lucide-react ───────────────────────────
section('9. Icons — no lucide-react imports');
{
  // components.json still says "iconLibrary": "lucide" because shadcn only accepts
  // lucide or radix — it has no option for @untitledui/icons. So `shadcn add` will
  // keep generating lucide imports and this check is the thing that catches it.
  const src = path.join(root, 'agentic-ui/src');
  const hits = [];
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!/\.(tsx?|jsx?)$/.test(e.name)) continue;
      const txt = fs.readFileSync(full, 'utf8');
      if (/from\s+['"]lucide-react['"]/.test(txt))
        hits.push(path.relative(root, full).split(path.sep).join('/'));
    }
  })(src);
  for (const h of hits) bad(`${h} imports lucide-react — use @untitledui/icons (check the export name exists, e.g. SearchLg not Search)`);
  // and the dependency must stay out of package.json
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'agentic-ui/package.json'), 'utf8'));
  if (pkg.dependencies?.['lucide-react'] || pkg.devDependencies?.['lucide-react'])
    bad('agentic-ui/package.json lists lucide-react — removed 2026-10-13, nothing imports it');
  if (hits.length === 0) ok('no source file imports lucide-react, and it is not a dependency');
}

// ── Summary ──────────────────────────────────────────────────────────────────
const skipNote = skipped ? ` (${skipped} check${skipped > 1 ? 's' : ''} skipped — not verified)` : '';
console.log('\n' + (problems === 0
  ? `✅ No drift detected${skipNote}.`
  : `❌ ${problems} drift issue(s) found${skipNote}.`));
process.exit(problems === 0 ? 0 : 1);
