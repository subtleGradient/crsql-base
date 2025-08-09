#!/bin/bash
set -e

SQLITE_VERSION="3470200"
SQLITE_YEAR="2024"

# Get the script directory first (before cd)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🔨 Building SQLite for darwin-arm64..."

# Create temp directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download SQLite amalgamation
echo "📥 Downloading SQLite amalgamation..."
curl -L -o sqlite.zip "https://www.sqlite.org/${SQLITE_YEAR}/sqlite-amalgamation-${SQLITE_VERSION}.zip"
unzip -q sqlite.zip
cd "sqlite-amalgamation-${SQLITE_VERSION}"

# Build the library
echo "🏗️  Compiling SQLite with extension support..."
cc -dynamiclib sqlite3.c -o libsqlite3.0.dylib \
  -DSQLITE_ENABLE_JSON1 \
  -DSQLITE_ENABLE_FTS5 \
  -DSQLITE_ENABLE_RTREE \
  -DSQLITE_ENABLE_COLUMN_METADATA \
  -DSQLITE_ENABLE_MATH_FUNCTIONS \
  -DSQLITE_ENABLE_LOAD_EXTENSION=1 \
  -DSQLITE_THREADSAFE=2 \
  -DSQLITE_DEFAULT_MEMSTATUS=0 \
  -DSQLITE_DEFAULT_WAL_SYNCHRONOUS=1 \
  -DSQLITE_LIKE_DOESNT_MATCH_BLOBS \
  -DSQLITE_MAX_EXPR_DEPTH=0 \
  -DSQLITE_USE_ALLOCA \
  -DSQLITE_ENABLE_EXPLAIN_COMMENTS \
  -DHAVE_USLEEP \
  -lpthread -lm

install_name_tool -id @rpath/libsqlite3.0.dylib libsqlite3.0.dylib

# Script dir was already set at the top

# Copy to vendor directory
echo "📦 Installing to vendor/..."
mkdir -p "$SCRIPT_DIR/vendor"
cp libsqlite3.0.dylib "$SCRIPT_DIR/vendor/"

# Create license file
cat > "$SCRIPT_DIR/LICENSE.sqlite" << 'EOF'
SQLite is in the public domain.

All of the code and documentation in SQLite has been dedicated to the public domain
by the authors. All code authors, and representatives of the companies they work for,
have signed affidavits dedicating their contributions to the public domain and
originals of those signed affidavits are stored in a firesafe at the main offices
of Hwaci. Anyone is free to copy, modify, publish, use, compile, sell, or distribute
the original SQLite code, either in source code form or as a compiled binary, for
any purpose, commercial or non-commercial, and by any means.

See https://www.sqlite.org/copyright.html for more information.
EOF

# Clean up
cd /
rm -rf "$TEMP_DIR"

echo "✅ SQLite library built successfully!"
echo "   Path: $SCRIPT_DIR/vendor/libsqlite3.0.dylib"