# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for cr-sqlite JavaScript/TypeScript packages - JavaScript implementations to use cr-sqlite (Conflict-free Replicated SQLite) in browser, Node.js, React and other JS environments. The project uses bun workspaces with TypeScript project references for efficient builds.

## Build Commands

```bash
# Initial setup - builds WASM and all TypeScript packages
make

# Build only TypeScript packages (after WASM is built)
cd tsbuild-all && bun run build

# Build WASM separately
./build-wasm.sh

# Run all tests across all packages
./test.sh

# Run tests for a specific package
cd packages/<package-name> && bun run test

# Clean everything
make clean
```

## Architecture

### Package Organization

The monorepo consists of several key package categories:

**Core Storage:**
- `crsqlite-wasm`: WASM build for browser usage with SQLite/cr-sqlite bindings
- `node-allinone`: Node.js convenience package for loading cr-sqlite extension

**Sync Infrastructure:**
- `ws-client`: WebSocket client for browser-to-server sync
- `ws-server`: WebSocket server implementation
- `ws-common`: Shared WebSocket protocol code
- `direct-connect-*`: Direct connection packages for browser/Node.js sync

**UI Integration:**
- `react`: React hooks for reactive queries and database state management
- `rx-tbl`: Reactive table subscriptions
- `rx-query`: Query AST and reactive query infrastructure

**Testing:**
- `node-tests`: Node.js specific tests
- `browser-tests`: Browser tests using Cypress
- `xplat-tests`: Cross-platform test suite

### Key Technical Details

- Uses TypeScript composite projects with project references for incremental builds
- WASM build requires emsdk and wa-sqlite git submodules
- All packages use ESM modules (`"type": "module"`)
- Testing uses Vitest for unit tests, Cypress for browser integration tests
- Sync protocol uses binary and JSON serialization formats

### Development Patterns

- Database operations go through the xplat-api interface for cross-platform compatibility
- React hooks follow `useQuery` pattern for reactive data fetching
- WebSocket sync uses bidirectional streaming with changes/versions protocol
- All database instances support the cr-sqlite extension for CRDTs

## Testing Strategy

Tests are distributed across packages:
- Unit tests: `vitest run` in each package
- Integration tests: Located in `*-tests` packages
- Browser tests: Cypress component tests in `browser-tests`
- Run all: `./test.sh` from root

## Dependencies

External requirements:
- Node.js >= 19
- Bun (latest version)
- Rust nightly toolchain (for building from source)
- Git submodules must be initialized for WASM builds