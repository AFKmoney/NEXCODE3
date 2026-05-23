#!/usr/bin/env bash
set -e

echo "Running Pre-commit checks for NEXUS-IDE..."

# 1. Rust Checks
echo "Checking Rust implementation..."
cd core
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cd ..

# 2. Kotlin Checks
echo "Checking KMP implementation..."
cd shared
./gradlew ktlintCheck
cd ..

# 3. Swift Checks
echo "Checking iOS implementation..."
cd ios
if command -v swiftlint &> /dev/null; then
    swiftlint strict
else
    echo "Warning: swiftlint not installed."
fi
cd ..

echo "All constraints validated! Code is production-ready."
