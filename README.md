# Voice-Controlled Coding Assistant

This is my take on reimagining how we write code: ditching the keyboard (if you let it) and letting your voice do the heavy lifting. Inspired by a teacher who recommended building something for physically impaired coders.

### Smart vs Strict Mode

**Strict** generates code exactly as stated. Say "write a print statement that will print the final score":
```python
print(finalScore)
```

**Smart** interprets your intent and adds helpful context:
```python
print(f"The final score is {finalScore}")
```

### Voice Commands

Navigation:
- "Go to line 17" / "Navigate to line 17" / "Jump to line 17"
- "Open main.py" / "Open style.css"

Code generation:
- "Write a function called calculateTotal that takes price and quantity"
- "Create a function to validate email addresses"
- "Write a print statement for the final score"

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. Clone this repo:
```bash
git clone https://github.com/aryanvx/voice-coder-studio.git
cd voice-coder-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start both servers:
```bash
# Terminal 1: Start the backend
node server/index.js

# Terminal 2: Start the frontend
npm run dev
```

4. Open the URL shown in the terminal (typically `http://localhost:8080`)

### Enable AI Code Generation

Create a `.env.local` file in the project root with at least one API key:

```bash
# Groq (FREE - recommended) - https://console.groq.com/keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx

# OpenAI (paid) - https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

Restart the backend server after adding keys. The editor will show "LLM: Ready" when configured.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express
- **AI Providers:** Groq (Llama 3.3 70B), OpenAI (GPT-4o-mini)
- **Speech Recognition:** Web Speech API

## What's Next

The plan is to turn this into a full AI-powered development environment that can understand your coding style, explain your bugs, and maybe even argue with you about why your variable names are terrible (seriously considering this feature lol).
