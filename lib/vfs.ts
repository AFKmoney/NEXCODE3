/**
 * Nexus OPFS Manager
 * Industry-standard storage using Origin Private File System for high-performance,
 * large-scale file management (handling GBs of data).
 */

class OpfsManager {
  private root: FileSystemDirectoryHandle | null = null;

  async init() {
    if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.getDirectory) {
      console.warn("[Nexus] OPFS not supported in this environment.");
      return false;
    }
    try {
      this.root = await navigator.storage.getDirectory();
      console.log("[Nexus] OPFS initialized successfully.");
      return true;
    } catch (e) {
      console.error("[Nexus] Failed to initialize OPFS:", e);
      return false;
    }
  }

  /**
   * Writes a file to the persistent storage.
   */
  async writeFile(path: string, content: string) {
    if (!this.root) return;
    try {
      const parts = path.split('/');
      const fileName = parts.pop()!;
      let currentDir = this.root;

      for (const part of parts) {
        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
      }

      const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (e) {
      console.error(`[Nexus] Error writing to OPFS: ${path}`, e);
    }
  }

  /**
   * Reads a file from persistent storage.
   */
  async readFile(path: string): Promise<string | null> {
    if (!this.root) return null;
    try {
      const parts = path.split('/');
      const fileName = parts.pop()!;
      let currentDir = this.root;

      for (const part of parts) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }

      const fileHandle = await currentDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (e) {
      // console.warn(`[Nexus] File not found in OPFS: ${path}`);
      return null;
    }
  }

  /**
   * Deletes a file or directory.
   */
  async deleteEntry(path: string) {
    if (!this.root) return;
    try {
      const parts = path.split('/');
      const name = parts.pop()!;
      let currentDir = this.root;

      for (const part of parts) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }

      await currentDir.removeEntry(name, { recursive: true });
    } catch (e) {
      console.error(`[Nexus] Error deleting from OPFS: ${path}`, e);
    }
  }

  /**
   * List all files in the VFS (recursive).
   */
  async getAllFiles(): Promise<Record<string, string>> {
    if (!this.root) return {};
    const files: Record<string, string> = {};
    await this.scanDir(this.root, "", files);
    return files;
  }

  private async scanDir(dirHandle: FileSystemDirectoryHandle, path: string, result: Record<string, string>) {
    // @ts-ignore
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        result[entryPath] = await file.text();
      } else if (entry.kind === 'directory') {
        await this.scanDir(entry, entryPath, result);
      }
    }
  }
}

export const vfs = new OpfsManager();
