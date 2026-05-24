# --- Stage 1: Build Rust Core (Wasm) ---
FROM rust:1.80-slim as rust-builder
RUN apt-get update && apt-get install -y binaryen pkg-config libssl-dev
RUN cargo install wasm-pack

WORKDIR /app/core
COPY core .
# Build each member or a unified bridge
RUN wasm-pack build nexus-crypto --target web --out-dir ../wasm/nexus-crypto
RUN wasm-pack build nexus-diff --target web --out-dir ../wasm/nexus-diff

# --- Stage 2: Build Next.js App ---
FROM node:20-slim as node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY --from=rust-builder /app/wasm ./wasm

RUN npm run build

# --- Stage 3: Production Image ---
FROM node:20-slim
WORKDIR /app
COPY --from=node-builder /app/out ./out
COPY --from=node-builder /app/package*.json ./
COPY --from=node-builder /app/next.config.ts ./
RUN npm install --production

EXPOSE 3000
CMD ["npm", "start"]
