<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# NexusCode Mobile IDE - Enterprise Edition

This is an industrial-grade neural operating system built with Next.js (SSR), Rust (Wasm), and Kubernetes.

## Core Pillars (Industrial Level)
1. **Infrastructure as Code (IaC):** AWS EKS, VPC, and Helm charts for distributed deployment.
2. **Persistence & Performance:** OPFS VFS for Go-level storage and Web Workers for 60FPS background Wasm processing.
3. **Intelligence at Scale:** RAG Engine (Semantic Indexing) and Autonomous Agents for background scans.
4. **Security & Observability:** OAuth2 (GitHub Auth) and Sentry Telemetry for project monitoring.

## Features
- **Rust Wasm Core Engine:** High-performance diffing, encryption, and local data logic.
- **PhD Mode Causal Graph:** Dependency tracking and causality resolution.
- **DevOps Dashboard:** Advanced orchestration controls.
- **Sentry Integration:** Real-time error and performance tracking.

## Deployment

### Full Suite Build
We use a unified orchestration pipeline.

1. `npm install`
2. `make wasm`
3. `npm run build`

### Cloud Native (K8s)
`helm upgrade --install nexus-ide ./helm/nexus-ide`

## Mobile Version (Android)
The debug APK is in the root directory: [AI_Studio_v0.1.0_Debug.apk](./AI_Studio_v0.1.0_Debug.apk)

*Note: The mobile version uses a mocked auth layer to support offline-first static environments.*
