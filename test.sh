#!/bin/bash

set -e

for d in ./packages/*/ ; do 
    if [ -f "$d/package.json" ]; then
        # Check if package.json has a test script
        if grep -q '"test":' "$d/package.json"; then
            echo "🧪 Testing in $d"
            (cd "$d" && bun run test)
        else
            echo "⏭️  Skipping $d (no test script)"
        fi
    fi
done

echo "✅ All tests completed!"
