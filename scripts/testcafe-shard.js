#!/usr/bin/env node

/**
 * Outputs the TestCafe spec files assigned to a specific shard.
 *
 * Usage:
 *   SHARD_INDEX=0 SHARD_TOTAL=3 node scripts/testcafe-shard.js
 *
 * Reads a static shard map from scripts/testcafe-shard-map.json.
 * Falls back to round-robin assignment if the map is missing or a file is unmapped.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const shardIndex = parseInt(process.env.SHARD_INDEX, 10);
const shardTotal = parseInt(process.env.SHARD_TOTAL, 10);

if (Number.isNaN(shardIndex) || Number.isNaN(shardTotal) || shardIndex < 0 || shardIndex >= shardTotal) {
  console.error(`Invalid shard config: SHARD_INDEX=${process.env.SHARD_INDEX} SHARD_TOTAL=${process.env.SHARD_TOTAL}`);
  process.exit(1);
}

const specDir = path.resolve(__dirname, '..', 'test', 'testcafe', 'spec');
const allFiles = glob.sync('*_spec.js', { cwd: specDir }).sort();

let shardMapPath = path.resolve(__dirname, 'testcafe-shard-map.json');
let shardMap = {};
try {
  shardMap = JSON.parse(fs.readFileSync(shardMapPath, 'utf8'));
} catch {
  // No map found — will use round-robin fallback
}

const shardFiles = allFiles.filter((file) => {
  if (shardMap[file] !== undefined) {
    return shardMap[file] === shardIndex;
  }
  // Round-robin fallback for unmapped files
  return allFiles.indexOf(file) % shardTotal === shardIndex;
});

if (shardFiles.length === 0) {
  console.error(`Shard ${shardIndex}/${shardTotal} has no files assigned`);
  process.exit(1);
}

// Output full paths space-separated (for use in shell command substitution)
const fullPaths = shardFiles.map((f) => path.join('test', 'testcafe', 'spec', f));

// Include v1/ tests in the last shard (they're filtered out by .testcaferc.js for gen3/parity runs)
if (shardIndex === shardTotal - 1) {
  const v1Dir = path.resolve(specDir, 'v1');
  const v1Files = glob.sync('*_spec.js', { cwd: v1Dir }).sort();
  v1Files.forEach((f) => fullPaths.push(path.join('test', 'testcafe', 'spec', 'v1', f)));
}

console.log(fullPaths.join(' '));
