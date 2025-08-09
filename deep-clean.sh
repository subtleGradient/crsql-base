#!/bin/bash

# Navigate to the packages directory
cd ./packages

# Iterate over each subdirectory
for dir in */ ; do
  # Navigate to the current subdirectory
  cd "$dir"
  # Run bun deep-clean
  bun run deep-clean
  # Navigate back to the packages directory
  cd ..
done
