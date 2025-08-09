#! /bin/bash

# set a failure variable
export FAIL=0
for d in ./packages/*/ ; do (cd "$d" && bun run test) || exit 1; done
