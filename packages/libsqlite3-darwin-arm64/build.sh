#!/bin/bash
set -e

# SQLite version
SQLITE_VERSION="3.47.2"
SQLITE_YEAR="2024"

# Download SQLite amalgamation if not present
if [ ! -f sqlite3.c ]; then
  echo "Downloading SQLite $SQLITE_VERSION amalgamation..."
  curl -L "https://www.sqlite.org/$SQLITE_YEAR/sqlite-amalgamation-3470200.zip" -o sqlite.zip
  unzip -o sqlite.zip
  mv sqlite-amalgamation-3470200/* .
  rm -rf sqlite-amalgamation-3470200 sqlite.zip
fi

echo "Building SQLite $SQLITE_VERSION for darwin-arm64..."

# Create vendor directory
mkdir -p vendor

# Compile SQLite with extension loading enabled
cc -dynamiclib \
  -arch arm64 \
  -O3 \
  -DSQLITE_ENABLE_JSON1 \
  -DSQLITE_ENABLE_FTS5 \
  -DSQLITE_ENABLE_RTREE \
  -DSQLITE_ENABLE_COLUMN_METADATA \
  -DSQLITE_ENABLE_MATH_FUNCTIONS \
  -DSQLITE_ENABLE_DBSTAT_VTAB \
  -DSQLITE_ENABLE_BYTECODE_VTAB \
  -DSQLITE_ENABLE_STMTVTAB \
  -DSQLITE_ENABLE_EXPLAIN_COMMENTS \
  -DSQLITE_ENABLE_UNKNOWN_SQL_FUNCTION \
  -DSQLITE_ENABLE_MEMSYS5 \
  -DSQLITE_ENABLE_DESERIALIZE \
  -DSQLITE_ENABLE_NORMALIZE \
  -DSQLITE_USE_URI=1 \
  -DSQLITE_ENABLE_LOAD_EXTENSION=1 \
  -DSQLITE_MAX_VARIABLE_NUMBER=250000 \
  -DSQLITE_MAX_EXPR_DEPTH=10000 \
  sqlite3.c \
  -o vendor/libsqlite3.0.dylib \
  -lpthread \
  -lm

# Set the install name
install_name_tool -id @rpath/libsqlite3.0.dylib vendor/libsqlite3.0.dylib

# Create symlinks for compatibility
cd vendor
ln -sf libsqlite3.0.dylib libsqlite3.dylib
cd ..

# Create LICENSE file
cat > LICENSE.sqlite << 'EOF'
SQLite is in the Public Domain

All of the code and documentation in SQLite has been dedicated to the public domain
by the authors. All code authors, and representatives of the companies they work for,
have signed affidavits dedicating their contributions to the public domain and
originals of those signed affidavits are stored in a firesafe at the main offices
of Hwaci. Anyone is free to copy, modify, publish, use, compile, sell, or distribute
the original SQLite code, either in source code form or as a compiled binary, for
any purpose, commercial or non-commercial, and by any means.
EOF

echo "✅ SQLite $SQLITE_VERSION built successfully for darwin-arm64"
echo "   Library: vendor/libsqlite3.0.dylib"

# Verify the build
echo ""
echo "Verifying build..."
file vendor/libsqlite3.0.dylib
otool -L vendor/libsqlite3.0.dylib | head -5
echo ""
echo "SQLite version check:"
echo 'SELECT sqlite_version();' | sqlite3 -cmd ".load vendor/libsqlite3.0.dylib" :memory: 2>/dev/null || echo "Note: Version check requires sqlite3 CLI"