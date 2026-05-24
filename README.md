# 🌌 NEXUS-IDE: The Neural Operating System (Enterprise Edition)

[![CI/CD Pipeline](https://github.com/AFKmoney/NEXCODE3/actions/workflows/ci.yml/badge.svg)](https://github.com/AFKmoney/NEXCODE3/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/AFKmoney/NEXCODE3)

NexusCode is an industrial-grade, AI-first mobile IDE designed for high-performance software engineering. Built on a hybrid Rust-Wasm core with a PhD-level causal analysis engine, it provides a desktop-class experience on mobile devices.

---

## 📸 Screenshots

| 🎨 Modern UI | 🧠 Causal AI | 📂 Persistent VFS |
| :---: | :---: | :---: |
| ![UI](https://raw.githubusercontent.com/AFKmoney/NEXCODE3/main/docs/screenshots/ui_main.png) | ![Causal](https://raw.githubusercontent.com/AFKmoney/NEXCODE3/main/docs/screenshots/causal_graph.png) | ![VFS](https://raw.githubusercontent.com/AFKmoney/NEXCODE3/main/docs/screenshots/vfs_manager.png) |
| *Fluid 60FPS Experience* | *Autonomous impact analysis* | *Local Storage (OPFS)* |

---

## 🚀 Industrial Core (The 4 Pillars)

### 1. Cloud-Native Infrastructure (IaC)
Nexus is ready for distributed deployment.
- **Terraform:** Automated AWS EKS cluster and VPC provisioning.
- **Helm:** Production-ready Kubernetes manifests with HPA (Horizontal Pod Autoscaling).
- **Edge Computing:** Optimized routing for Wasm binaries via Vercel Edge.

### 2. High-Performance Runtime
- **Rust-Wasm Bridge:** Critical algorithms (Diffing, Crypto) are implemented in Rust for native speed.
- **Web Workers:** Heavy processing is offloaded to background threads to ensure zero lag in the UI.
- **OPFS (Origin Private File System):** A high-performance VFS capable of handling multi-GB repositories locally.

### 3. Intelligence at Scale
- **RAG Engine:** Semantic indexing of the entire project context for the AI.
- **Autonomous Agents:** Background workers for security scanning and auto-documentation.
- **Causal Graph:** PhD-level dependency tracking to visualize the impact of code changes.

### 4. Enterprise Security & Observability
- **OAuth2 Auth:** Secure GitHub integration via NextAuth.
- **Sentry Telemetry:** Real-time error tracking and performance monitoring.
- **AES-256-GCM:** Industrial-grade encryption for local workspace data.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- Rust Toolchain & `wasm-pack`
- Android Studio (for APK builds)

### Quick Build
```bash
npm install
make wasm
npm run build
```

### Mobile Deployment (Android)
The latest functional APK is available here: [AI_Studio_v0.1.0_Debug.apk](./AI_Studio_v0.1.0_Debug.apk)

---

## 📜 Roadmap & PhD Concepts
For detailed mathematical conjectures and the 70-step optimization roadmap, see:
- [NEXUS_ROADMAP.md](./NEXUS_ROADMAP.md)
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md)

---

Developed with ❤️ by **AFKmoney** & **ZMSFA Triadic Engine**.
