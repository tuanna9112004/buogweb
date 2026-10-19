// Run: node --test scripts/analytics.test.cjs
// TypeScript is already a dev dependency; no test/runtime package is added.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  mod.filename = filename; mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = name => name.startsWith('.') ? load(path.relative(root, path.resolve(path.dirname(filename), name + '.ts'))) : original(name);
  cache.set(filename, mod);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
  return mod.exports;
}
const core = load('lib/analytics/core.ts');
const { accumulateListen } = load('lib/analytics/playback.ts');
const event = overrides => ({ id: 'event-1', at: Date.parse('2026-10-19T02:00:00Z'), visitor: 'visitor-1', session: 'session-1', kind: 'pageview', path: '/', source: 'facebook.com', device: 'Mobile', ...overrides });
test('Vietnam midnight and strict calendar validation', () => {
  assert.equal(core.vietnamDay(Date.parse('2026-10-18T17:00:00Z')), '2026-10-19');
  assert.equal(core.vietnamDay(Date.parse('2026-10-18T16:59:59Z')), '2026-10-18');
  assert.equal(core.validDay('2026-02-30'), false); assert.equal(core.validDay('2028-02-29'), true);
  assert.equal(core.validDay('../../etc'), false);
});
test('Visitors unique across dates; sessions distinct; previous period excluded', () => {
  const result = core.summarize([event({}), event({ id: '2', session: 'session-2', at: Date.parse('2026-10-20T01:00:00Z') }), event({ id: '3', kind: 'listen', item: 'music', title: 'A' }), event({ id: '4', kind: 'download', item: 'music', title: 'A' }), event({ id: 'old', visitor: 'other', at: Date.parse('2026-10-17T00:00:00Z') })], '2026-10-19', '2026-10-20');
  assert.equal(result.totals.visitors, 1); assert.equal(result.totals.sessions, 2);
  assert.equal(result.totals.pageview, 2); assert.equal(result.totals.listen, 1); assert.equal(result.totals.download, 1);
  assert.equal(result.daily.length, 2); assert.equal(result.sources[0].count, 2); assert.equal(result.tracks[0].title, 'A');
});
test('Seek, pause, buffering and fast playback cannot manufacture ten seconds', () => {
  const sample = { id: 'music', seconds: 0, sent: false, time: 0, wall: 1000 };
  accumulateListen(sample, 100, 1250, 1, true); // seek 100 sec
  assert.equal(sample.seconds, 0);
  accumulateListen(sample, 100, 30000, 1, false); // paused
  assert.equal(sample.seconds, 0);
  for (let i = 1; i <= 9; i++) assert.equal(accumulateListen(sample, 100 + i * 2, 30000 + i * 1000, 2, true), false);
  assert.equal(accumulateListen(sample, 120, 40000, 2, true), true);
  sample.sent = true; assert.equal(accumulateListen(sample, 122, 41000, 2, true), false);
});
test('Append store serializes concurrent writes, deduplicates retries and survives restart', async () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'buogs-analytics-test-'));
  process.env.ANALYTICS_DIR = temporary;
  try {
    const store = load('lib/analytics/store.ts');
    await Promise.all(Array.from({ length: 20 }, (_, i) => store.recordEvent(event({ id: `listen-${i}`, kind: 'listen', item: 'music' }))));
    await Promise.all(Array.from({ length: 20 }, () => store.recordEvent(event({ id: 'same-page-event' }))));
    await store.recordEvent(event({ id: 'new-page-event' }));
    await store.recordEvent(event({ id: 'download-1', kind: 'download', item: 'music' }));
    await store.recordEvent(event({ id: 'download-range-retry', kind: 'download', item: 'music' }));
    let result = await store.report('2026-10-19', '2026-10-19');
    assert.equal(result.totals.listen, 1); assert.equal(result.totals.download, 1); assert.equal(result.totals.pageview, 2);
    delete globalThis.buogsAnalytics; cache.delete(path.join(root, 'lib/analytics/store.ts'));
    const restarted = load('lib/analytics/store.ts');
    await restarted.recordEvent(event({ id: 'listen-restart', kind: 'listen', item: 'music' }));
    result = await restarted.report('2026-10-19', '2026-10-19'); assert.equal(result.totals.listen, 1);
    assert.equal(result.previous.pageview, 0);
    restarted.touchVisitor('visitor-1'); restarted.touchVisitor('visitor-1');
    assert.equal((await restarted.report('2026-10-19', '2026-10-19')).online, 1);
    fs.appendFileSync(path.join(temporary, '2026-10-19.jsonl'), '{broken');
    assert.equal((await restarted.report('2026-10-19', '2026-10-19')).totals.pageview, 2);
    delete globalThis.buogsAnalytics; cache.delete(path.join(root, 'lib/analytics/store.ts'));
    const recovered = load('lib/analytics/store.ts');
    await recovered.recordEvent(event({ id: 'after-power-loss' }));
    assert.equal((await recovered.report('2026-10-19', '2026-10-19')).totals.pageview, 3);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); delete process.env.ANALYTICS_DIR; }
});
