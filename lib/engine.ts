/**
 * Nexus Engine Bridge
 * Orchestrates the Rust Wasm modules with fallback to JS logic.
 */

export type DiffOp = {
  kind: "equal" | "insert" | "delete";
  content: string;
};

class NexusEngine {
  private crypto: any = null;
  private diff: any = null;
  private isWasmLoaded = false;

  async init() {
    if (this.isWasmLoaded) return;
    try {
      // @ts-ignore
      const [cryptoMod, diffMod] = await Promise.all([
        // @ts-ignore
        import("../../wasm/nexus-crypto/nexus_crypto").catch(() => null),
        // @ts-ignore
        import("../../wasm/nexus-diff/nexus_diff").catch(() => null)
      ]);

      if (cryptoMod) {
        await cryptoMod.default();
        this.crypto = cryptoMod;
      }
      if (diffMod) {
        await diffMod.default();
        this.diff = diffMod;
      }
      
      this.isWasmLoaded = !!(this.crypto || this.diff);
      console.log(`[Nexus] Wasm Engine initialized: ${this.isWasmLoaded}`);
    } catch (e) {
      console.warn("[Nexus] Failed to load Wasm engine, falling back to JS.", e);
    }
  }

  /**
   * High-performance textual diff using Rust (Myers + Histogram)
   */
  computeDiff(oldText: string, newText: string): DiffOp[] {
    if (this.diff) {
      try {
        return this.diff.text_diff(oldText, newText);
      } catch (e) {
        console.error("[Nexus] Wasm diff failed:", e);
      }
    }
    
    // JS Fallback using 'diff' package (simulated for type safety)
    const diff = require("diff");
    const parts = diff.diffLines(oldText, newText);
    return parts.map((p: any) => ({
      kind: p.added ? "insert" : p.removed ? "delete" : "equal",
      content: p.value
    }));
  }

  /**
   * Secure Audit Log using Rust Merkle Trees
   */
  createAuditLog() {
    if (this.crypto) {
      return new this.crypto.AuditLog();
    }
    return {
      append_event: (p: any) => console.log("[Nexus] Mock event logged:", p),
      root: () => "0x0000...mock_root"
    };
  }

  /**
   * Encrypt workspace at rest
   */
  async encryptBuffer(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    if (this.crypto) {
      const engine = this.crypto.SymmetricEngine.new_from_js(key);
      return engine.encrypt(data);
    }
    throw new Error("Crypto engine unavailable.");
  }
}

export const nexus = new NexusEngine();
