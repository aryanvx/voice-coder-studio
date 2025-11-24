# VoiceCode User Guide

## Getting Started with AI Features

VoiceCode uses AI to generate code from your voice commands. To use AI features, you'll need your own API key.

### Why Bring Your Own Key?

- **Your key, your control**: Your API key stays in your browser only
- **Free options available**: Groq offers a very generous free tier
- **Privacy**: We never see or store your API key on our servers
- **Me**: Cause I ain't letting you use mine

### Setup (2 minutes)

#### Option 1: Groq (Recommended + FREE)

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (takes 1 minute)
3. Go to "API Keys" → Create new key
4. Copy the key (starts with `gsk_`)
5. In VoiceCode, click the **Key icon** (⚿) in the top bar
6. Select "Groq (Free)" and paste your key
7. Click "Save Key"

**Free tier**: 30 requests per minute - good enough imo.

#### Option 2: OpenAI

1. Visit [platform.openai.com](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Go to "API keys" → Create new secret key
4. Copy the key (starts with `sk-`)
5. In VoiceCode, click the **Key icon** (⚿) in the top bar
6. Select "OpenAI" and paste your key
7. Click "Save Key"

**Note**: OpenAI requires payment but you do get more advanced models.

### Using VoiceCode

Once your API key is configured:

1. Click the **microphone button**
2. Speak your command with a crystal clear voice. If you can limit background noise, that'll also enhance your experience.
3. Wait for the AI to generate code
4. Review the suggestion and click **Accept** or **Reject**

### Example Commands

**Code Generation:**
- "Write a function called calculateTotal that takes price and quantity"
- "Create a function to validate email addresses"
- "Write a print statement for the final score"

**Navigation:**
- "Go to line 17"
- "Navigate to line 25"
- "Open main.py"

### Smart vs Strict Mode

Toggle in the top bar:

- **Smart**: AI interprets your intent and adds what it thinks are helpful features
- **Strict**: AI follows your command exactly as stated
- I put a pretty neat example in the **README.md** if you wanna check it out

### Troubleshooting

**"LLM: Offline" showing?**
- Click the Key icon (⚿) and add your API key

**"Error generating code"?**
- Check your API key is correct
- For Groq: Make sure you're within rate limits (30 req/min)
- For OpenAI: Ensure you have credits available

**API key not saving?**
- Make sure cookies/localStorage is enabled in your browser
- Try a different browser

### Security & Privacy

- Your API key is stored in browser localStorage only
- Keys are never sent to VoiceCode servers
- API calls go directly from your browser to Groq/OpenAI
- You can clear your key anytime by clicking the Key icon

### Need Help?

Open an issue on [GitHub](https://github.com/aryanvx/voice-coder-studio/issues)
