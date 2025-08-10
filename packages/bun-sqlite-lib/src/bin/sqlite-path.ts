#!/usr/bin/env node

import { getSQLitePath, isSQLiteAvailable, getSQLiteVersion } from '../index.js';

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--version':
  case '-v':
    console.log(`SQLite version: ${getSQLiteVersion()}`);
    break;
  
  case '--check':
  case '-c':
    if (isSQLiteAvailable()) {
      console.log('✅ SQLite library is available');
      console.log(`Path: ${getSQLitePath()}`);
    } else {
      console.error('❌ SQLite library not found');
      console.error('Install the platform-specific package:');
      console.error(`  npm install @vlcn.io-community/libsqlite3-darwin-${process.arch === 'arm64' ? 'arm64' : 'x64'}`);
      process.exit(1);
    }
    break;
  
  case '--help':
  case '-h':
    console.log('Usage: sqlite-path [options]');
    console.log('');
    console.log('Options:');
    console.log('  (default)     Print the path to the SQLite library');
    console.log('  --version     Print the SQLite version');
    console.log('  --check       Check if the library is available');
    console.log('  --help        Show this help message');
    break;
  
  default:
    // Default: print the path
    try {
      console.log(getSQLitePath());
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
}