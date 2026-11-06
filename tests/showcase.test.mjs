import test from 'node:test';
import assert from 'node:assert/strict';
import { validEntries } from '../src/js/site/showcaseData.js';
import entries from '../src/showcase.json' with { type: 'json' };

const ok = { title: 'T', url: 'https://a.dev', by: 'me', description: 'd' };

test('showcase.json in the repo is fully valid', () => {
  assert.equal(validEntries(entries).length, entries.length);
});

test('drops non-https links, missing fields and non-arrays', () => {
  const bad = [
    { ...ok, url: 'javascript:alert(1)' },
    { ...ok, url: 'http://a.dev' },
    { ...ok, url: 'nope' },
    { ...ok, title: '' },
    { ...ok, by: undefined },
    null,
  ];
  assert.deepEqual(validEntries([...bad, ok]), [ok]);
  assert.deepEqual(validEntries({}), []);
});
