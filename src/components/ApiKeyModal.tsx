import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Key, ExternalLink, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: 'groq' | 'openai', key: string) => void;
  currentProvider: 'groq' | 'openai' | null;
  currentKey: string;
}

export default function ApiKeyModal({ isOpen, onClose, onSave, currentProvider, currentKey }: ApiKeyModalProps) {
  const [provider, setProvider] = useState<'groq' | 'openai'>(currentProvider || 'groq');
  const [apiKey, setApiKey] = useState(currentKey);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const validateKey = (key: string, prov: 'groq' | 'openai'): boolean => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setError('API key cannot be empty');
      return false;
    }
    
    if (prov === 'groq' && !trimmedKey.startsWith('gsk_')) {
      setError('Groq API keys must start with "gsk_"');
      return false;
    }
    
    if (prov === 'openai' && !trimmedKey.startsWith('sk-')) {
      setError('OpenAI API keys must start with "sk-"');
      return false;
    }
    
    if (trimmedKey.length < 20) {
      setError('API key seems too short. Please check and try again.');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSave = () => {
    if (validateKey(apiKey, provider)) {
      onSave(provider, apiKey.trim());
      onClose();
    }
  };

  const handleClear = () => {
    setApiKey('');
    onSave(provider, '');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card border border-border p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">API Key Settings</h2>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 mb-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200">
            <p className="font-medium mb-1">Your key stays private</p>
            <p className="text-xs text-amber-300">Stored locally in your browser only. Never sent to our servers.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Choose Provider</label>
            <div className="flex gap-2">
              <Button
                variant={provider === 'groq' ? 'default' : 'outline'}
                onClick={() => setProvider('groq')}
                className="flex-1"
              >
                Groq (Free)
              </Button>
              <Button
                variant={provider === 'openai' ? 'default' : 'outline'}
                onClick={() => setProvider('openai')}
                className="flex-1"
              >
                OpenAI
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="api-key" className="text-sm font-medium mb-2 block">
              API Key
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder={provider === 'groq' ? 'gsk_...' : 'sk-...'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              className="font-mono text-sm"
            />
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="bg-muted rounded-md p-3 text-sm">
            <p className="font-medium mb-2">How to get a {provider === 'groq' ? 'Groq' : 'OpenAI'} API key:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              {provider === 'groq' ? (
                <>
                  <li>Visit <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">console.groq.com <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Sign up for free (takes 1 minute)</li>
                  <li>Go to "API Keys" section</li>
                  <li>Create new key and copy it here</li>
                </>
              ) : (
                <>
                  <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">platform.openai.com <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Sign in or create account</li>
                  <li>Go to "API keys"</li>
                  <li>Create new secret key and copy it here</li>
                </>
              )}
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={!apiKey.trim()}>
              Save Key
            </Button>
            {currentKey && (
              <Button onClick={handleClear} variant="outline">
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}