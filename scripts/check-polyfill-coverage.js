#!/usr/bin/env node
/* eslint-env node */
/* eslint curly: 0, complexity: [2, 20], max-statements: [2, 40], max-len: [2, 200] */
/*
 * Polyfill-coverage check for IE11 (Layer 1.5).
 *
 * Reads polyfill/index.js to derive the *actually-polyfilled* API set, then
 * walks v1/v2 source with @babel/parser and warns whenever an IE11-unsafe
 * instance/static method is called on a value that isn't polyfilled.
 *
 * Closes the ESLint-plugin-compat gap identified in the 2022 findIndex RCA
 * (OKTA-549514): the plugin doesn't check Array/String/Object instance
 * methods, so `arr.findIndex(...)` in src/ shipped to preview without a
 * corresponding polyfill.
 *
 * WARN-ONLY. Exits 0 with warnings printed. Non-zero only on internal errors.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverseModule = require('@babel/traverse');
const traverse = traverseModule.default || traverseModule;

const REPO_ROOT = path.resolve(__dirname, '..');
const POLYFILL_INDEX = path.join(REPO_ROOT, 'polyfill', 'index.js');
const MANIFEST_PATH = path.join(REPO_ROOT, 'scripts', 'ie11-unsafe-apis.json');
const SOURCE_GLOBS = [
  'src/v1/**/*.{js,ts}',
  'src/v2/**/*.{js,ts}',
];
const IGNORE_GLOBS = [
  '**/*.test.{js,ts}',
  '**/*.spec.{js,ts}',
  '**/__tests__/**',
];

function readPolyfillCoverage() {
  const src = fs.readFileSync(POLYFILL_INDEX, 'utf8');
  const covered = new Set();
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  let m;
  while ((m = requireRegex.exec(src)) !== null) {
    const spec = m[1];
    if (spec.startsWith('core-js/features/')) {
      covered.add(spec.slice('core-js/features/'.length));
    } else if (spec.startsWith('core-js/es/')) {
      covered.add(spec.slice('core-js/es/'.length));
    } else if (spec.startsWith('core-js/stable/')) {
      covered.add(spec.slice('core-js/stable/'.length));
    } else if (spec.startsWith('core-js/web/')) {
      covered.add('web/' + spec.slice('core-js/web/'.length));
    } else {
      covered.add('pkg:' + spec);
    }
  }
  return covered;
}

function coversInstanceMethod(covered, entry) {
  if (covered.has(entry.corePolyfill)) return true;
  if (entry.alt && covered.has(entry.alt)) return true;
  return false;
}

function coversStaticMethod(covered, entry) {
  return covered.has(entry.corePolyfill);
}

function coversGlobal(covered, entry) {
  if (!entry.polyfillPackage) return false;
  if (entry.polyfillPackage.startsWith('web/')) {
    return covered.has(entry.polyfillPackage);
  }
  return covered.has('pkg:' + entry.polyfillPackage);
}

function parseFile(filePath, source) {
  const isTs = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  return parser.parse(source, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowImportExportEverywhere: true,
    errorRecovery: true,
    plugins: [
      'jsx',
      'classProperties',
      'optionalChaining',
      'nullishCoalescingOperator',
      'objectRestSpread',
      isTs ? 'typescript' : null,
    ].filter(Boolean),
  });
}

function calleePrefix(node) {
  // Serialize the callee's left side to a dotted string for safeContexts matching.
  // Only handles simple MemberExpression chains; more exotic callees fall back to ''.
  function serialize(n) {
    if (!n) return '';
    if (n.type === 'Identifier') return n.name;
    if (n.type === 'ThisExpression') return 'this';
    if (n.type === 'MemberExpression') {
      const obj = serialize(n.object);
      const prop = n.computed ? `[${n.property.value || '?'}]` : (n.property && n.property.name) || '';
      return obj && prop ? `${obj}.${prop}` : obj || prop;
    }
    return '';
  }
  return serialize(node);
}

function matchesSafeContext(entry, calleeStr) {
  if (!entry.safeContexts || !entry.safeContexts.length) return false;
  return entry.safeContexts.some(pattern => new RegExp(pattern).test(calleeStr));
}

function scanFile(filePath, manifest, covered, findings) {
  const source = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = parseFile(filePath, source);
  } catch (err) {
    // Skip unparseable files (e.g. exotic TS). Not our job to enforce syntax.
    return;
  }

  const rel = path.relative(REPO_ROOT, filePath);

  traverse(ast, {
    CallExpression(nodePath) {
      const callee = nodePath.node.callee;
      if (!callee || callee.type !== 'MemberExpression' || callee.computed) return;
      const propName = callee.property && callee.property.name;
      if (!propName) return;

      // Static: Object.entries / Array.from / Number.isFinite / etc.
      if (callee.object && callee.object.type === 'Identifier') {
        const staticKey = `${callee.object.name}.${propName}`;
        const staticEntry = manifest.staticMethods[staticKey];
        if (staticEntry && !coversStaticMethod(covered, staticEntry)) {
          findings.push({
            file: rel,
            line: nodePath.node.loc && nodePath.node.loc.start.line,
            kind: 'static',
            api: staticKey,
            polyfill: staticEntry.corePolyfill,
          });
          return;
        }
      }

      // Instance: <expr>.findIndex / <expr>.includes / etc.
      const instanceEntry = manifest.instanceMethods[propName];
      if (instanceEntry && !coversInstanceMethod(covered, instanceEntry)) {
        const calleeStr = calleePrefix(callee);
        if (matchesSafeContext(instanceEntry, calleeStr)) return;
        findings.push({
          file: rel,
          line: nodePath.node.loc && nodePath.node.loc.start.line,
          kind: 'instance',
          api: `${propName}()`,
          receiverHint: calleeStr,
          polyfill: instanceEntry.corePolyfill,
        });
      }
    },

    ReferencedIdentifier(nodePath) {
      // Global identifiers used bare, e.g. `structuredClone(...)` or `customElements.define(...)`.
      const name = nodePath.node.name;
      const entry = manifest.globals[name];
      if (!entry) return;
      // Skip if it's a property access (already handled by CallExpression above) or a local binding.
      if (nodePath.scope.hasBinding(name)) return;
      if (nodePath.parentPath.isMemberExpression() && nodePath.parentPath.node.property === nodePath.node) return;
      if (coversGlobal(covered, entry)) return;
      findings.push({
        file: rel,
        line: nodePath.node.loc && nodePath.node.loc.start.line,
        kind: 'global',
        api: name,
        polyfill: entry.polyfillPackage,
        note: entry.note,
      });
    },
  });
}

function main() {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    console.error(`[polyfill-coverage] failed to read manifest at ${MANIFEST_PATH}: ${err.message}`);
    process.exit(2);
  }

  let covered;
  try {
    covered = readPolyfillCoverage();
  } catch (err) {
    console.error(`[polyfill-coverage] failed to parse ${POLYFILL_INDEX}: ${err.message}`);
    process.exit(2);
  }

  const files = SOURCE_GLOBS.flatMap(pattern =>
    glob.sync(pattern, {
      cwd: REPO_ROOT,
      absolute: true,
      ignore: IGNORE_GLOBS,
    })
  );

  const findings = [];
  for (const file of files) {
    try {
      scanFile(file, manifest, covered, findings);
    } catch (err) {
      console.warn(`[polyfill-coverage] internal error on ${file}: ${err.message}`);
    }
  }

  if (findings.length === 0) {
    console.log(`[polyfill-coverage] OK — scanned ${files.length} v1/v2 file(s), no unpolyfilled IE11-unsafe APIs found.`);
    process.exit(0);
  }

  console.log('');
  console.log(`[polyfill-coverage] Found ${findings.length} IE11-unsafe API usage(s) with no matching polyfill in polyfill/index.js:`);
  console.log('');
  for (const f of findings) {
    const loc = `${f.file}:${f.line || '?'}`;
    if (f.kind === 'instance') {
      const receiver = f.receiverHint ? ` (called as \`${f.receiverHint}\`)` : '';
      console.log(`  WARN  ${loc}  ${f.api}${receiver} — not IE11-native. Add \`require('core-js/features/${f.polyfill}')\` to polyfill/index.js, or wrap in a feature-detect.`);
    } else if (f.kind === 'static') {
      console.log(`  WARN  ${loc}  ${f.api} — not IE11-native. Add \`require('core-js/features/${f.polyfill}')\` to polyfill/index.js.`);
    } else if (f.kind === 'global') {
      const pf = f.polyfill ? `polyfill via \`${f.polyfill}\`` : 'no standard polyfill — feature-detect or avoid';
      console.log(`  WARN  ${loc}  ${f.api} — not IE11-native. ${pf}. ${f.note || ''}`.trim());
    }
  }
  console.log('');
  console.log('[polyfill-coverage] Warnings printed. This check is warn-only; not failing the build.');
  console.log('[polyfill-coverage] Manifest: scripts/ie11-unsafe-apis.json. Polyfill inventory: polyfill/index.js.');
  process.exit(0);
}

main();
