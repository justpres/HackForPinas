import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);

function loadFooter() {
  const filename = join(process.cwd(), 'src', 'components', 'Footer.tsx');
  const source = readFileSync(filename, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });

  const module = { exports: {} };
  vm.runInNewContext(transpiled.outputText, {
    console,
    exports: module.exports,
    module,
    require,
  });

  return module.exports.Footer;
}

test('footer quick links include Documentation directly after Submit Event', () => {
  const Footer = loadFooter();
  const html = renderToStaticMarkup(React.createElement(Footer));

  const submitEventIndex = html.indexOf('Submit Event');
  const documentationIndex = html.indexOf('Documentation');

  assert.ok(submitEventIndex > -1, 'expected the footer to render the Submit Event quick link');
  assert.ok(documentationIndex > submitEventIndex, 'expected Documentation to render after Submit Event');
  assert.match(html, /href="\/docs"/);
});
