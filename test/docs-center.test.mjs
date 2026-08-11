import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');

const requiredPaths = [
  'src/app/docs/[slug]/page.tsx',
  'src/components/docs/DocsHeader.tsx',
  'src/components/docs/DocsSearch.tsx',
  'src/components/docs/DocsSidebar.tsx',
  'src/components/docs/DocsToc.tsx',
  'src/lib/docs.ts',
  'content/docs/introduction.md',
  'content/docs/chat-guide.md',
  'content/docs/api-reference.md',
];

test('documentation center includes its routes, UI components, and Markdown articles', () => {
  for (const relativePath of requiredPaths) {
    assert.ok(existsSync(resolve(root, relativePath)), `Missing ${relativePath}`);
  }
});

test('documentation articles declare the navigation metadata the loader requires', () => {
  for (const relativePath of requiredPaths.filter((path) => path.startsWith('content/'))) {
    const content = readFileSync(resolve(root, relativePath), 'utf8');

    assert.match(content, /^---\n[\s\S]*^title: .+$/m, `${relativePath} is missing a title`);
    assert.match(content, /^---\n[\s\S]*^description: .+$/m, `${relativePath} is missing a description`);
    assert.match(content, /^---\n[\s\S]*^category: .+$/m, `${relativePath} is missing a category`);
    assert.match(content, /^---\n[\s\S]*^order: \d+$/m, `${relativePath} is missing a numeric order`);
  }
});
