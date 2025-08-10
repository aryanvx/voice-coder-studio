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

  const [files] = useState<CodeFile[]>([
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

  const toggleVoiceListening = () => {
    if (voiceState.isListening) {
      setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: true }));
      // Simulate processing
      setTimeout(() => {
        setVoiceState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          transcript: "Create a new function called 'process_data' that takes a list parameter"
        }));
        setCommandHistory(prev => [...prev, "Create function process_data with list parameter"]);
      }, 2000);
    } else {
      setVoiceState(prev => ({ ...prev, isListening: true, transcript: "" }));
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
                onClick={() => setCurrentFile(file)}
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
            <Badge variant="secondary" className="text-xs">
              {currentFile.name}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Line {cursorPosition.line}, Column {cursorPosition.column}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 bg-code-bg p-4 font-mono text-sm overflow-auto">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {currentFile.content.split('\n').map((line, index) => (
              <div key={index} className="flex items-start">
                <span className="text-muted-foreground w-12 text-right pr-4 select-none">
                  {index + 1}
                </span>
                <span className="flex-1">
                  {line || '\u00A0'}
                  {index === cursorPosition.line - 1 && (
                    <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-blink" />
                  )}
                </span>
              </div>
            ))}
          </pre>
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