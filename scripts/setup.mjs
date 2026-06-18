#!/usr/bin/env node
// Carbonclip Setup Script — Run this on your Windows machine
// Usage: node setup.mjs
// It will download the project from the Shogo cloud and extract it.

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createGunzip } from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const TARGET_DIR = process.argv[2] || '.';

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log('🚀 Carbonclip Setup');
  console.log('===================\n');

  // Try multiple URLs
  const urls = [
    'http://localhost:3001/api/download',
    'http://localhost:8080/api/download',
  ];

  let tarball = null;
  for (const url of urls) {
    try {
      console.log(`Trying ${url}...`);
      tarball = await download(url);
      console.log(`✅ Downloaded from ${url}`);
      break;
    } catch (e) {
      console.log(`❌ ${url} — ${e.message}`);
    }
  }

  if (!tarball) {
    console.log('\n❌ Could not download from any URL.');
    console.log('Make sure the Shogo server is running and try again.');
    process.exit(1);
  }

  // Save tarball
  const tarPath = join(TARGET_DIR, 'carbonclip.tar.gz');
  writeFileSync(tarPath, tarball);
  console.log(`\n📦 Saved ${tarball.length} bytes to ${tarPath}`);

  // Extract
  console.log('📂 Extracting...');
  execSync(`tar xzf "${tarPath}"`, { cwd: TARGET_DIR, stdio: 'inherit' });

  // Remove tarball
  const { unlinkSync } = await import('fs');
  unlinkSync(tarPath);

  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { cwd: TARGET_DIR, stdio: 'inherit' });

  console.log('\n🗄️  Setting up database...');
  execSync('npx prisma generate', { cwd: TARGET_DIR, stdio: 'inherit' });
  execSync('npx prisma db push', { cwd: TARGET_DIR, stdio: 'inherit' });

  console.log('\n✅ Setup complete!');
  console.log('\nTo start the app:');
  console.log('  cd ' + TARGET_DIR);
  console.log('  npm run dev:full');
  console.log('\nThen open http://localhost:3001');
}

main().catch(console.error);
