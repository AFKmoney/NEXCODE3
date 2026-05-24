<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# NexusCode Mobile IDE - DevOps Edition

This is a neural operating system applet built with Next.js, Rust (Wasm), and Capacitor.

## Features
- **Rust Wasm Core Engine:** High-performance diffing, encryption, and local data logic powered by Rust.
- **PhD Mode Causal Graph:** Dependency tracking and causality resolution.
- **DevOps Dashboard:** Advanced orchestration controls and logs via the "Orchestration Control" UI.
- **Fully Modular Architecture:** Split across cleanly segregated `/components/` for maintainability.

## Mobile Version (Android)

An APK has been generated and is available in the root directory: [AI_Studio_v0.1.0_Debug.apk](./AI_Studio_v0.1.0_Debug.apk)

### How to build the APK yourself:

We have introduced a unified orchestration Makefile for all compilation tasks.

1. Ensure dependencies are installed: `npm install`
2. Build the Rust WebAssembly modules: `make wasm`
3. Build the Next.js App: `make web`
4. Build the Android APK: `make android`
5. (Optional) Build the full suite automatically: `npm run build:full`

## Run Locally (Web)

**Prerequisites:** Node.js, Rust Toolchain (`cargo`), `wasm-pack`

1. Install dependencies:
   `npm install`
2. Compile Wasm Modules:
   `make wasm`
3. Run the app:
   `npm run dev`
