# --- Nexus Engine Build Orchestrator ---

.PHONY: all wasm web android clean help

all: wasm web android

help:
	@echo "Nexus Orchestrator Commands:"
	@echo "  wasm     - Build Rust core modules to Wasm"
	@echo "  web      - Build Next.js production bundle"
	@echo "  android  - Synchronize and build Android APK"
	@echo "  docker   - Build unified Docker image"
	@echo "  clean    - Remove build artifacts"

wasm:
	@echo "[Nexus] Building Rust Core -> Wasm..."
	bash tools/build-wasm.sh

web:
	@echo "[Nexus] Building Next.js Web Bundle..."
	npm run build

android:
	@echo "[Nexus] Synchronizing Capacitor & Building APK..."
	npx cap sync android
	cd android && gradlew.bat assembleDebug
	cp android/app/build/outputs/apk/debug/app-debug.apk AI_Studio_v0.1.0_Debug.apk

docker:
	@echo "[Nexus] Building Unified Docker Environment..."
	docker build -t nexus-ide:latest .

clean:
	@echo "[Nexus] Cleaning artifacts..."
	rm -rf out .next wasm android/app/build
