import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Square, FileText, Folder, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
}

interface CodeFile {
  name: string;
  content: string;
  language: string;
}

export default function VoiceCodeEditor() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    transcript: ""
  });

  const [currentFile, setCurrentFile] = useState<CodeFile>({
    name: "main.py",
    content: `# Welcome to Voice Code Editor
# Speak naturally to code!

def calculate_score(points, multiplier=1):
    """Calculate the total score with optional multiplier."""
    return points * multiplier

def main():
    player_points = 100
    bonus_multiplier = 1.5
    
    final_score = calculate_score(player_points, bonus_multiplier)
    print(f"Final score: {final_score}")

if __name__ == "__main__":
    main()`,
    language: "python"
  });

  const [files, setFiles] = useState<CodeFile[]>([
    { name: "main.py", content: currentFile.content, language: "python" },
    { name: "utils.js", content: "// Utility functions", language: "javascript" },
    { name: "style.css", content: "/* Styles */", language: "css" }
  ]);

  const [commandHistory, setCommandHistory] = useState<string[]>([
    "Create function calculateScore",
    "Add error handling to main function",
    "Import numpy as np"
  ]);

  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const [llmEnabled, setLlmEnabled] = useState<boolean>(false);
  const [llmStatus, setLlmStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [llmSuggestion, setLlmSuggestion] = useState<string | null>(null);
  const [showSuggestionPreview, setShowSuggestionPreview] = useState(false);
  // Rename file UI state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(currentFile.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  // Auto-wrap toggle for long lines
  const [autoWrap, setAutoWrap] = useState(false);
  // AI interpretation mode: 'strict' = follow command exactly, 'smart' = AI interprets intent
  const [aiMode, setAiMode] = useState<'strict' | 'smart'>('smart');

  const handleContentChange = (value: string) => {
    setCurrentFile(prev => ({ ...prev, content: value }));
    // persist into files array so switching files retains edits
    setFiles(prev => prev.map(f => f.name === currentFile.name ? { ...f, content: value } : f));
  };

  // keep rename input in sync when switching files
  useEffect(() => {
    setRenameValue(currentFile.name);
    setRenameError(null);
    setIsRenaming(false);
  }, [currentFile.name]);

  // Check server-side LLM proxy availability
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[Health] Checking LLM proxy availability...');
        const res = await fetch('/api/llm/health');
        if (!mounted) return;
        if (!res.ok) {
          console.warn('[Health] Health check failed with status:', res.status);
          setLlmEnabled(false);
          return;
        }
        const data = await res.json();
        console.log('[Health] Health check response:', data);
        setLlmEnabled(Boolean(data?.enabled));
        console.log('[Health] LLM enabled set to:', Boolean(data?.enabled));
      } catch (err) {
        console.error('[Health] Health check error:', err);
        setLlmEnabled(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const startRename = () => {
    setRenameValue(currentFile.name);
    setRenameError(null);
    setIsRenaming(true);
    // focus shortly after render
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setRenameValue(currentFile.name);
    setRenameError(null);
  };

  const applyRename = () => {
    const newName = (renameValue || "").trim();
    if (!newName) {
      setRenameError('Name cannot be empty');
      return;
    }
    // Prevent duplicate file names (case-insensitive), except when it's the same file
    const conflict = files.find(f => f.name.toLowerCase() === newName.toLowerCase() && f.name !== currentFile.name);
    if (conflict) {
      setRenameError('A file with that name already exists');
      return;
    }

    // Update files array and currentFile
    setFiles(prev => prev.map(f => f.name === currentFile.name ? { ...f, name: newName } : f));
    setCurrentFile(prev => ({ ...prev, name: newName }));
    setIsRenaming(false);
    setRenameError(null);
  };

  const updateCursorPositionFromSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? 0;
    const before = el.value.slice(0, pos);
    const lines = before.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    setCursorPosition({ line, column });
  };

  // Helper: convert line/column to string index
  function getIndexFromLineColumn(content: string, line: number, column: number) {
    const lines = content.split('\n');
    const clampedLine = Math.max(1, Math.min(line, lines.length));
    const clampedColumn = Math.max(1, column);
    let idx = 0;
    for (let i = 0; i < clampedLine - 1; i++) {
      idx += lines[i].length + 1; // include newline
    }
    idx += Math.min(clampedColumn - 1, lines[clampedLine - 1].length);
    return idx;
  }

  // Execute parsed voice commands
  // Convert common spoken number words to digits (basic)
  function normalizeSpokenNumbers(input: string) {
    const smallNums: Record<string, number> = {
      zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10,
      eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20,
      thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90
    };
    return input.replace(/\b(line)\s+([a-z-]+)\b/gi, (m, p1, p2) => {
      const parts = p2.split(/[-\s]/);
      let num = 0;
      parts.forEach(part => {
        const val = smallNums[part.toLowerCase()];
        if (val !== undefined) num += val;
        else if (!isNaN(Number(part))) num += Number(part);
      });
      if (num > 0) return `${p1} ${num}`;
      return m;
    });
  }

  async function processVoiceCommand(text: string) {
    console.log('[Voice] Processing command:', text);
    text = normalizeSpokenNumbers(text);
    const lower = text.toLowerCase();
    console.log('[Voice] Normalized text:', text);

    // go to line N
    const gotoMatch = lower.match(/(?:go to|goto|go)\s+line\s+(\d+)/);
    if (gotoMatch) {
      const line = parseInt(gotoMatch[1], 10);
      const column = 1;
      setCursorPosition({ line, column });
      // set textarea caret to start of that line
      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        const idx = getIndexFromLineColumn(currentFile.content, line, column);
        el.focus();
        el.selectionStart = el.selectionEnd = idx;
        handleEditorScroll();
      }, 50);
      setVoiceState(prev => ({ ...prev, isProcessing: false, transcript: text }));
      return;
    }

    // open <filename>
    const openMatch = lower.match(/(?:open|show|open file)\s+(.+\.[a-zA-Z0-9_\-]+)/);
    if (openMatch) {
      const filename = openMatch[1].trim();
      const file = files.find(f => f.name.toLowerCase() === filename.toLowerCase());
      if (file) {
        setCurrentFile(file);
        setVoiceState(prev => ({ ...prev, isProcessing: false, transcript: text }));
        // place cursor at start
        setTimeout(() => {
          const el = textareaRef.current;
          if (!el) return;
          el.focus();
          el.selectionStart = el.selectionEnd = 0;
          updateCursorPositionFromSelection();
        }, 50);
      } else {
        // not found
        setVoiceState(prev => ({ ...prev, isProcessing: false, transcript: `File ${filename} not found` }));
      }
      return;
    }

    // create function <name>
    // write/create/implement function with optional params
    // Try exact-name form first: "write a function called foo with parameters x and y"
    const writeMatch = text.match(/(?:write|create|implement|add)\s+(?:the\s+)?(?:function|fn|method)\s+(?:called\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\b(?:[\s,]+(?:with parameters|with parameter|that takes|that takes a|taking)\s+(.+))?/i);
    // Try description form: "write a function that calculate score" or "write a function to calculate score"
    const descMatch = text.match(/(?:write|create|implement|add)\s+(?:a\s+)?(?:function|fn|method)(?:\s+(?:to|that|which)\s+(.+))/i);
    console.log('[Voice] writeMatch:', writeMatch ? writeMatch[0] : null, 'descMatch:', descMatch ? descMatch[0] : null);
    if (writeMatch || descMatch) {
      const fnName = writeMatch ? writeMatch[1] : undefined;
      const paramsPhrase = writeMatch ? (writeMatch[2] || "") : "";
      const descriptionPhrase = descMatch ? descMatch[1].trim() : undefined;
      // parse params by splitting on 'and', ',' or 'or'
      let params: string[] = [];
      if (paramsPhrase) {
        params = paramsPhrase.split(/\band\b|,|\bor\b/gi).map(s => s.trim()).filter(Boolean)
          .map(p => p.replace(/[^a-zA-Z0-9_]/g, ''))
          .filter(Boolean);
      }

      const lang = currentFile.language || 'javascript';

      // Try LLM generation if proxy indicates enabled
      let snippet: string | null = null;
      console.log('[Voice] llmEnabled:', llmEnabled, 'descriptionPhrase:', descriptionPhrase);
      try {
        if (llmEnabled) {
          // ask LLM but show preview before inserting
          console.log('[Voice] Calling LLM...');
          setLlmStatus('loading');
          const generated = await callLLMGenerateFunction(lang, fnName || '', params, currentFile.content, descriptionPhrase);
          console.log('[Voice] LLM returned:', generated ? 'code snippet' : 'null');
          if (generated) {
            setLlmSuggestion(generated);
            setShowSuggestionPreview(true);
            setLlmStatus('idle');
            // leave currentFile unchanged until user accepts
            setVoiceState(prev => ({ ...prev, isProcessing: false, transcript: text }));
            return;
          }
        }
      } catch (err) {
        console.error('[Voice] LLM generation failed', err);
      }

      // fallback: generate locally and insert at caret
      // If no explicit name was provided, derive one from description (best-effort)
      const deriveName = (name?: string, desc?: string) => {
        if (name) return name;
        if (!desc) return 'unnamed_function';
        // make a simple snake_case or camelCase name depending on language
        const cleaned = desc.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
        const stopwords = new Set(['a','the','to','for','of','that','which','with','using','by','is','are','and','or','an','in','on','into']);
        const parts = cleaned.split(' ').filter(w => w && !stopwords.has(w));
        if (parts.length === 0) return 'unnamed_function';
        if (lang === 'python') return parts.join('_');
        // camelCase for JS-like
        return parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
      };

      const finalName = deriveName(fnName, descriptionPhrase);
      const finalSnippet = generateFunctionSnippet(lang, finalName, params);
      setCurrentFile(prev => {
        const idx = textareaRef.current ? textareaRef.current.selectionStart ?? prev.content.length : prev.content.length;
        const newContent = prev.content.slice(0, idx) + finalSnippet + prev.content.slice(idx);
        setFiles(fprev => fprev.map(f => f.name === prev.name ? { ...f, content: newContent } : f));
        setTimeout(() => {
          if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = idx + Math.max(0, finalSnippet.length -1);
          }
          updateCursorPositionFromSelection();
        }, 50);
        setVoiceState(prevState => ({ ...prevState, isProcessing: false, transcript: text }));
        return { ...prev, content: newContent };
      });
      return;
    }

    // default: echo transcript
    setVoiceState(prev => ({ ...prev, isProcessing: false, transcript: text }));
  }

  // Generate a function snippet for a given language
  function generateFunctionSnippet(lang: string, name: string, params: string[]) {
    const p = params.join(', ');
    if (lang === 'python') {
      return `def ${name}(${p}):\n    """Auto-generated function ${name}"""\n    # TODO: implement\n    pass\n`;
    }
    // default to JavaScript
    return `function ${name}(${p}) {\n  // TODO: implement ${name}\n}\n`;
  }

  // Call LLM (OpenAI) to generate a function implementation.
  // Requires VITE_OPENAI_API_KEY to be set in environment.
  async function callLLMGenerateFunction(lang: string, name: string, params: string[], fileContext: string, description?: string) {
    // Call local server proxy which hides the API key
    try {
      console.log('LLM call starting:', { lang, name, params, description, aiMode });
      const res = await fetch('/api/llm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, name, params, fileContext, aiMode, description })
      });
      console.log('LLM response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('LLM proxy error', res.status, errorText);
        setLlmStatus('error');
        setTimeout(() => setLlmStatus('idle'), 3000);
        return null;
      }
      const data = await res.json();
      console.log('LLM response data:', data);
      if (!data?.success) {
        console.warn('LLM returned success=false:', data);
        return data?.content ?? null;
      }
      return data.content;
    } catch (err) {
      console.error('LLM proxy call failed', err);
      setLlmStatus('error');
      setTimeout(() => setLlmStatus('idle'), 3000);
      return null;
    }
  }

  // Keep gutter scroll in sync with textarea scroll
  const handleEditorScroll = () => {
    const el = textareaRef.current;
    const gutter = gutterRef.current;
    if (!el || !gutter) return;
    gutter.scrollTop = el.scrollTop;
  };

  // When content or file changes, ensure cursor stays valid and gutter updates
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // clamp cursor to available content
    const totalLines = currentFile.content.split('\n').length;
    setCursorPosition(prev => ({
      line: Math.min(prev.line, totalLines),
      column: prev.column
    }));
    // ensure gutter scroll matches
    handleEditorScroll();
  }, [currentFile.content]);

  // Accept or reject LLM suggestion
  const acceptLlmSuggestion = () => {
    if (!llmSuggestion) return;
    const snippet = llmSuggestion;
    setCurrentFile(prev => {
      const idx = textareaRef.current ? textareaRef.current.selectionStart ?? prev.content.length : prev.content.length;
      const newContent = prev.content.slice(0, idx) + snippet + prev.content.slice(idx);
      setFiles(fprev => fprev.map(f => f.name === prev.name ? { ...f, content: newContent } : f));
      setTimeout(() => {
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = idx + Math.max(0, snippet.length - 1);
        }
        updateCursorPositionFromSelection();
      }, 50);
      return { ...prev, content: newContent };
    });
    setLlmSuggestion(null);
    setShowSuggestionPreview(false);
    setLlmStatus('idle');
  };

  const rejectLlmSuggestion = () => {
    setLlmSuggestion(null);
    setShowSuggestionPreview(false);
    setLlmStatus('idle');
  };

  // Web Speech API integration
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Process spoken command
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: true }));
      setCommandHistory(prev => [...prev, transcript]);
      processVoiceCommand(transcript.trim());
    };
    recognitionRef.current.onerror = (event: any) => {
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: false, transcript: "" }));
    };
    recognitionRef.current.onend = () => {
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: false }));
    };
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (voiceState.isListening) {
      recognitionRef.current.stop();
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: true }));
    } else {
      setVoiceState(prev => ({ ...prev, isListening: true, isProcessing: false, transcript: "" }));
      recognitionRef.current.start();
    }
  };

  const getVoiceButtonVariant = () => {
    if (voiceState.isProcessing) return "processing";
    if (voiceState.isListening) return "listening";
    return "default";
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 bg-secondary border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-voice rounded-full animate-pulse-glow"></div>
            <h1 className="font-bold text-lg bg-gradient-voice bg-clip-text text-transparent">
              VoiceCode
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Voice-powered coding</p>
        </div>

        {/* File Explorer */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Folder className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Files</span>
          </div>
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.name}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                  currentFile.name === file.name 
                    ? "bg-primary/20 text-primary" 
                    : "hover:bg-muted text-muted-foreground"
                )}
                onClick={() => {
                  // save current edits, then open selected file
                  setFiles(prev => prev.map(f => f.name === currentFile.name ? { ...f, content: currentFile.content } : f));
                  const found = files.find(f => f.name === file.name);
                  if (found) setCurrentFile(found);
                  // reset cursor position
                  setTimeout(() => updateCursorPositionFromSelection(), 20);
                }}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Commands History */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Recent Commands</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {commandHistory.slice(-5).map((command, index) => (
              <div key={index} className="text-xs text-muted-foreground p-2 bg-muted rounded-md">
                {command}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* File name + rename UI */}
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyRename();
                    if (e.key === 'Escape') cancelRename();
                  }}
                  name="file-rename"
                  id="file-rename-input"
                  className="text-xs px-2 py-1 rounded border border-border bg-card"
                  aria-label="Rename file"
                />
                <Button size="sm" onClick={applyRename}>Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelRename}>Cancel</Button>
                {renameError && <div className="text-xs text-red-400 ml-2">{renameError}</div>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentFile.name}
                </Badge>
                <Button size="sm" variant="ghost" onClick={startRename}>Rename</Button>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Line {cursorPosition.line}, Column {cursorPosition.column}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={llmEnabled ? "default" : "destructive"} className="text-xs">
              {llmEnabled ? '● LLM: Ready' : '● LLM: Offline'}
            </Badge>
            <Button size="sm" variant={autoWrap ? "default" : "ghost"} onClick={() => setAutoWrap(a => !a)}>
              {autoWrap ? 'Wrap: On' : 'Wrap: Off'}
            </Button>
            <Button size="sm" variant={aiMode === 'smart' ? "default" : "ghost"} onClick={() => setAiMode(m => m === 'smart' ? 'strict' : 'smart')}>
              {aiMode === 'smart' ? 'AI: Smart' : 'AI: Strict'}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Code Editor (editable) */}
        <div className="flex-1 bg-code-bg p-4 font-mono text-sm overflow-auto">
          <div className="flex h-full min-w-0">
            {/* Line numbers gutter */}
            <div
              ref={gutterRef}
              className="w-12 pr-3 select-none text-muted-foreground text-right tabular-nums overflow-auto"
              style={{
                // Ensure the gutter uses same font and metrics as editor
                fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace'
              }}
            >
              {currentFile.content.split('\n').map((_, i) => (
                <div
                  key={i}
                  className={cn('min-h-[1.5rem] leading-6 flex items-center', i === cursorPosition.line - 1 && 'text-primary')}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable textarea (fallback editor) */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={currentFile.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyUp={updateCursorPositionFromSelection}
                onClick={updateCursorPositionFromSelection}
                onScroll={handleEditorScroll}
                wrap={autoWrap ? "soft" : "off"}
                style={{ width: '100%', fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace' }}
                className={`w-full flex-1 resize-none bg-transparent outline-none focus:outline-none text-sm font-mono leading-6 h-full p-0 m-0 ${autoWrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* LLM status & preview (if any) */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">LLM:</div>
            <div className="text-xs">
              {llmEnabled ? (
                <span className="text-green-400">Enabled</span>
              ) : (
                <span className="text-muted-foreground">Disabled</span>
              )}
              {llmStatus === 'loading' && <span className="ml-2 text-xs text-amber-400">Generating...</span>}
              {llmStatus === 'error' && <span className="ml-2 text-xs text-red-400">Error generating code</span>}
            </div>
          </div>

          {llmStatus === 'error' && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-2 mb-2">
              <div className="text-xs text-red-300">LLM generation failed. Check browser console and server logs for details.</div>
            </div>
          )}

          {showSuggestionPreview && llmSuggestion && (
            <div className="bg-card border border-border rounded-md p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">LLM Suggestion Preview</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={rejectLlmSuggestion}>Reject</Button>
                  <Button size="sm" onClick={acceptLlmSuggestion}>Accept</Button>
                </div>
              </div>
              <pre className="text-sm overflow-auto max-h-48 bg-muted p-2 rounded text-xs"><code>{llmSuggestion}</code></pre>
            </div>
          )}
        </div>

        {/* Voice Control Panel */}
        <div className="h-24 bg-card border-t border-border p-4 flex items-center gap-4">
          <Button
            onClick={toggleVoiceListening}
            size="lg"
            variant={getVoiceButtonVariant()}
            className={cn(
              "w-16 h-16 rounded-full transition-all duration-300",
              voiceState.isListening && "animate-pulse-glow",
              voiceState.isProcessing && "animate-pulse"
            )}
          >
            {voiceState.isListening ? (
              <div className="flex items-center gap-1">
                <div className="w-1 h-4 bg-current animate-voice-wave"></div>
                <div className="w-1 h-4 bg-current animate-voice-wave" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-4 bg-current animate-voice-wave" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : voiceState.isProcessing ? (
              <div className="animate-spin">
                <Zap className="w-6 h-6" />
              </div>
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>

          <div className="flex-1">
            {voiceState.isListening && (
              <div className="text-voice-listening text-sm font-medium">
                🎤 Listening... Speak your command
              </div>
            )}
            {voiceState.isProcessing && (
              <div className="text-voice-processing text-sm font-medium">
                🧠 Processing your command...
              </div>
            )}
            {voiceState.transcript && !voiceState.isListening && !voiceState.isProcessing && (
              <div className="text-foreground text-sm">
                <span className="text-muted-foreground">You said:</span> "{voiceState.transcript}"
              </div>
            )}
            {!voiceState.isListening && !voiceState.isProcessing && !voiceState.transcript && (
              <div className="text-muted-foreground text-sm">
                Click the microphone to start voice coding
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Badge 
              variant={voiceState.isListening ? "default" : "secondary"}
              className={cn(
                "transition-all",
                voiceState.isListening && "bg-voice-listening/20 text-voice-listening"
              )}
            >
              {voiceState.isListening ? "Recording" : "Ready"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}