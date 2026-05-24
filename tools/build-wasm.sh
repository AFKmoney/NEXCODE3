#!/usr/bin/env bash
set -e

echo "Building Nexus Wasm Modules..."

mkdir -p wasm

# 1. Nexus Crypto
echo "Building nexus-crypto..."
cd core/nexus-crypto
wasm-pack build --target web --out-dir ../../wasm/nexus-crypto
cd ../..

# 2. Nexus Diff
echo "Building nexus-diff..."
cd core/nexus-diff
wasm-pack build --target web --out-dir ../../wasm/nexus-diff
cd ../..

echo "Wasm modules ready in /wasm"
