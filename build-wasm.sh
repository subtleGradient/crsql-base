#! /bin/bash

# cargo clean in core/rs/bundle

mkdir -p packages/crsqlite-wasm/dist
cd deps/emsdk
./emsdk install 3.1.45
./emsdk activate 3.1.45
source ./emsdk_env.sh
cd ../wa-sqlite
# Ensure the generated sqlite3-extra.c file is present before building
# the final distribution artifacts. The wa-sqlite build does not create
# this file automatically when invoking the default target, which causes
# "No rule to make target 'tmp/obj/dist/sqlite3-extra.o'" failures.
make crsqlite-extra
make dist
cp dist/crsqlite.wasm ../../packages/crsqlite-wasm/dist/crsqlite.wasm
cp dist/crsqlite.mjs ../../packages/crsqlite-wasm/src/crsqlite.mjs
