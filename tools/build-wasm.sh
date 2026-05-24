#!/usr/bin/env bash
set -e

echo "Building Nexus Wasm Modules..."

mkdir -p public/wasm

# 1. Nexus Crypto
echo "Building nexus-crypto..."
cd core/nexus-crypto
wasm-pack build --target web --out-dir ../../public/wasm/nexus-crypto
cd ../..

# 2. Nexus Diff
echo "Building nexus-diff..."
cd core/nexus-diff
wasm-pack build --target web --out-dir ../../public/wasm/nexus-diff
cd ../..

echo "Wasm modules ready in /wasm"
