import { describe, it, expect, vi, beforeEach } from 'vitest';

// These functions are integrated inside the React component in app/page.tsx.
// For the sake of unit testing, we isolate their core logical behaviors here.
// In a full refactoring, these would be extracted to a separate logic module.

describe('Nexus Core Engine - handleTerminalSubmit logic', () => {
  let terminalHistory: string[] = [];
  let terminalInput: string = '';
  
  const setTerminalHistory = vi.fn((update) => {
    if (typeof update === 'function') {
      terminalHistory = update(terminalHistory);
    } else {
      terminalHistory = update;
    }
  });

  const setTerminalInput = vi.fn((val) => { terminalInput = val; });
  
  const executeTerminalSubmit = (input: string, currentHistory: string[], files: Record<string, string>) => {
    if (!input.trim()) return;
    const cmd = input.trim();
    const newHist = [...currentHistory, `> ${cmd}`];
    
    if (cmd === 'clear') {
      setTerminalHistory([]);
    } else if (cmd.startsWith('echo ')) {
      newHist.push(cmd.substring(5));
      setTerminalHistory(newHist);
    } else if (cmd === 'ls') {
      newHist.push(Object.keys(files).slice(0, 10).join('  ') + (Object.keys(files).length > 10 ? ' ...' : ''));
      setTerminalHistory(newHist);
    } else if (cmd === 'date') {
      newHist.push(new Date().toString());
      setTerminalHistory(newHist);
    } else {
      newHist.push(`bash: ${cmd}: command not found.`);
      setTerminalHistory(newHist);
    }
    setTerminalInput("");
  };

  beforeEach(() => {
    terminalHistory = [];
    terminalInput = '';
    vi.clearAllMocks();
  });

  it('should handle clear command', () => {
    executeTerminalSubmit('clear', ['previous log'], {});
    expect(setTerminalHistory).toHaveBeenCalledWith([]);
    expect(setTerminalInput).toHaveBeenCalledWith('');
  });

  it('should handle echo command', () => {
    executeTerminalSubmit('echo Hello World', [], {});
    expect(setTerminalHistory).toHaveBeenCalledWith(['> echo Hello World', 'Hello World']);
  });

  it('should handle ls command with files', () => {
    executeTerminalSubmit('ls', [], { 'index.ts': '', 'app.tsx': '' });
    expect(setTerminalHistory).toHaveBeenCalledWith(['> ls', 'index.ts  app.tsx']);
  });

  it('should gracefully handle unknown commands', () => {
    executeTerminalSubmit('fakecmd', [], {});
    expect(setTerminalHistory).toHaveBeenCalledWith(['> fakecmd', 'bash: fakecmd: command not found.']);
  });
});

describe('Nexus Core Engine - handleRefactorAnalysis logic', () => {
  const setRefactorPreview = vi.fn();
  const setIsAnalyzing = vi.fn();
  const setTerminalHistory = vi.fn();

  const mockActiveCode = "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;";
  
  const executeRefactorAnalysisMock = async (
    activeCode: string,
    selectedLines: number[],
    isAnalyzing: boolean
  ) => {
    if (!activeCode || isAnalyzing) return;
    setIsAnalyzing(true);
    setRefactorPreview(null);
    setTerminalHistory((prev: string[]) => [...(prev || []), "[AI] Analyzing code snippet..."]);
    
    try {
      const codeLinesArray = activeCode.split('\n');
      const linesCount = codeLinesArray.length;
      let startIdx = 0;
      let endIdx = Math.min(3, Math.max(0, linesCount - 1));
      
      if (selectedLines.length > 0) {
        startIdx = Math.min(...selectedLines);
        endIdx = Math.max(...selectedLines);
      } else if (linesCount > 4) {
        startIdx = 1; endIdx = 4;
      }

      // Simulate AI response
      const suggested = "// Refactored lines\\n" + codeLinesArray.slice(startIdx, endIdx + 1).join('\\n');
      
      setRefactorPreview({
        suggested,
        explanation: "Refactoring completed",
        startLine: startIdx,
        endLine: endIdx
      });
      
      setTerminalHistory((prev: string[]) => [...(prev || []), "[AI] Proposed refactoring generated."]);
    } catch {
      setTerminalHistory((prev: string[]) => [...(prev || []), "[ERROR] AI Refactoring Engine unavailable."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not proceed if currently analyzing', async () => {
    await executeRefactorAnalysisMock("code", [], true);
    expect(setIsAnalyzing).not.toHaveBeenCalled();
  });

  it('should set indices based on selectedLines', async () => {
    await executeRefactorAnalysisMock(mockActiveCode, [1, 2], false);
    
    expect(setRefactorPreview).toHaveBeenCalledWith(expect.objectContaining({
      startLine: 1,
      endLine: 2
    }));
  });

  it('should fallback to default indices if no lines selected', async () => {
    await executeRefactorAnalysisMock(mockActiveCode, [], false);
    
    expect(setRefactorPreview).toHaveBeenCalledWith(expect.objectContaining({
      startLine: 1,
      endLine: 4
    }));
  });
});
