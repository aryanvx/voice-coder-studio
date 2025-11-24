# **Voice-Controlled Coding Assistant**

This is my take on reimagining how we write code: ditching the keyboard (if you let it) and letting your voice do the heavy lifting. Inspo from teacher who recommended something for physically impaired coders.

For v1.0, I kept it relatively simple:

- A landing page that shows you requirements + instructions
- A main coding interface with an editor that feels familiar if you’ve ever touched VS Code
- LLM status showing either enabled or disabled (make sure to put it in API key on the top-right)
- File rename options
- Toggle text wrap
- Artifical Intelligence, what I call, smartness. This uses an API from OpenAI's OR Groq's model and you can either set it to "strict" or "smart", the difference being in how accurately it will execute your ***actual*** prompt. Strict will generate code based exactly on what you said. For instance, if you said "write a print statement that will print the final score", the output would look something like this:

```
print(finalScore)
```

If you set the smartness to "Smart", then the output would look like this given the same case:

```
print(f"The final score is {finalScore}")
```

The idea is to get the vibe right first with smooth animations, pulsing indicators when it’s listening, a layout that feels like an actual dev tool and not a clunky prototype. From here, it’s not a huge leap to plug in real AI models, adaptive syntax learning, and proper debugging commands.


## Getting Started

### AI Setup

VoiceCode uses your own API key for AI features. This keeps your key private and lets you control costs.

**Quick setup:** Click the Key icon (⚿) in the right side of the top bar and follow the instructions. We recommend Groq (free, fast). See [USER_GUIDE.md](USER_GUIDE.md) for detailed setup.

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation and Setup

1. Clone this repo:
   ```bash
   git clone https://github.com/aryanvx/voice-coder-studio.git
   cd voice-coder-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Check port allocated in the terminal and open it in your browser

### Optional: Enable LLM-based code generation

If you want the editor to generate full function implementations using an LLM (OpenAI), create a `.env` file in the project root with:

```bash
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

or

```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

Then restart the dev server. When enabled, the editor will show an "LLM: Enabled" indicator and preview any generated suggestion before you accept or reject it.

**This is just the start.**

The plan is to turn this into a full AI-powered development environment that can understand your coding style, explain your bugs, and maybe even argue with you about why your variable names are terrible (seriously considering this feature lol).
