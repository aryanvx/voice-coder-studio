import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import VoiceCodeEditor from "@/components/VoiceCodeEditor";

const Index = () => {
  const [showEditor, setShowEditor] = useState(false);

  if (showEditor) {
    return <VoiceCodeEditor />;
  }

  return <WelcomeScreen onStart={() => setShowEditor(true)} />;
};

export default Index;
