#!/bin/bash
set -e

echo "=== Installing root dependencies ==="
npm install

echo "=== Installing frontend dependencies ==="
cd frontend && npm install && cd ..

echo "=== Building frontend ==="
cd frontend && npm run build && cd ..

echo "=== Copying build to public/ ==="
mkdir -p public
cp -r frontend/dist/. public/

echo "=== Build complete ==="
ls -la public/
