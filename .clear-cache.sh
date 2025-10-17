#!/bin/bash

echo "Clearing Metro bundler cache..."

# Clear Metro bundler cache
rm -rf node_modules/.cache

# Clear Expo cache
rm -rf .expo

# Clear watchman cache if available
if command -v watchman &> /dev/null; then
    watchman watch-del-all
fi

echo "Cache cleared successfully!"
echo "Now restart the development server with: bun start"
