/**
 * Nexus Code Analyzer Worker
 * Runs heavy Rust-Wasm diffing and analysis in a background thread to keep UI at 60fps.
 */

import { nexus } from "../engine";

self.onmessage = async (e) => {
  const { type, data, id } = e.data;

  if (type === 'INIT') {
    await nexus.init();
    self.postMessage({ type: 'INIT_DONE', id });
  }

  if (type === 'DIFF') {
    const { oldText, newText } = data;
    const diff = nexus.computeDiff(oldText, newText);
    self.postMessage({ type: 'DIFF_RESULT', data: diff, id });
  }

  if (type === 'ANALYZE_AST') {
    // Simulated background AST parsing
    const result = { tokens: data.length / 10, complex: data.includes('fn') };
    self.postMessage({ type: 'ANALYZE_RESULT', data: result, id });
  }
};
