import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Code, Zap, Brain, ArrowRight, Play } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isDemo, setIsDemo] = useState(false);

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Commands",
      description: "Write code naturally using voice commands like 'create a function called calculateScore'"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Smart Code Generation", 
      description: "AI-powered code generation that understands context and follows your coding style"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Adaptive Learning",
      description: "Learns your preferences, naming conventions, and frequently used libraries"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Voice Navigation",
      description: "Navigate your code with commands like 'go to line 15' or 'open main.py'"
    }
  ];

  const startDemo = () => {
    setIsDemo(true);
    setTimeout(() => {
      onStart();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-4 h-4 bg-gradient-voice rounded-full animate-pulse-glow"></div>
            <h1 className="text-5xl font-bold bg-gradient-voice bg-clip-text text-transparent">
              VoiceCode
            </h1>
            <div className="w-4 h-4 bg-gradient-voice rounded-full animate-pulse-glow"></div>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The future of coding is here. Write, debug, and navigate code entirely through voice commands. 
            No keyboard, no mouse—just your voice and the power of AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={startDemo}
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-3"
              disabled={isDemo}
            >
              {isDemo ? (
                <>
                  <div className="animate-spin mr-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  Initializing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Coding with Voice
                </>
              )}
            </Button>
            <Badge variant="secondary" className="px-4 py-2">
              🎤 Microphone access required
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Demo Commands */}
        <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Try these voice commands:
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              '"Create a function called calculateTotal"',
              '"Go to line 15"',
              '"Add error handling to this function"',
              '"Import numpy as np"',
              '"Fix the indentation on line 8"',
              '"Open the utils.py file"'
            ].map((command, index) => (
              <div key={index} className="bg-muted/50 p-3 rounded-md text-sm font-mono">
                {command}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}