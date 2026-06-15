#!/bin/bash
set -e

echo "=== Installing root dependencies ==="
npm install

echo "=== Installing frontend dependencies ==="
cd frontend && npm install && cd ..

echo "=== Building frontend ==="
cd frontend && npm run build && cd ..

echo "=== Copying frontend build to public/ ==="
mkdir -p public
cp -r frontend/dist/. public/

echo "=== Copying backend source into api/src/ for Vercel bundling ==="
rm -rf api/src
cp -r backend/src api/src

echo "=== Build complete ==="
ls -la public/
ls -la api/
