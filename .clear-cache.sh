#!/bin/bash

echo "Clearing Metro bundler cache..."

# Clear watchman watches
watchman watch-del-all 2>/dev/null || true

# Clear Metro bundler cache
rm -rf .expo
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Clear iOS/Android caches if they exist
rm -rf ios/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true

echo "Cache cleared successfully!"
echo ""
echo "Now restart your dev server with: bun run start"
