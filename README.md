# **Voice-Controlled Coding Assistant**

This is my take on reimagining how we write code: ditching the keyboard (mostly) and letting your voice do the heavy lifting. Think VS Code meets GitHub Codespaces meets AI that actually listens to you.

For this first version, I kept it relatively simple:

- A landing page that explains what’s going on
- A main coding interface with an editor that feels familiar if you’ve ever touched VS Code
- LLM status showing either enabled or disabled
- File rename options
- Toggle text wrap
- Artifical Intelligence, what I call, smartness. This uses an API from OpenAI's Chat-GPT 5 model and you can either set it to "strict" or "smart", the difference being in how accurately it will execute your **actual** prompt. Strict will generate code based exactly on what you said. For instance, if you said "write a print statement that will print the final score", the output would look something like this:

```
print(finalScore)
```

If you set the smartness to "Smart", then the output would look like this given the same case:

```
print(f"The final score is {finalScore}")
```

The idea is to get the vibe right first with smooth animations, pulsing indicators when it’s listening, a layout that feels like an actual dev tool and not a clunky prototype. From here, it’s not a huge leap to plug in real AI models, adaptive syntax learning, and proper debugging commands.


## Getting Started

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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   - http://localhost:5173 (or the URL shown in your terminal)
   
Now you can start talking to your editor!

### Optional: Enable LLM-based code generation

If you want the editor to generate full function implementations using an LLM (OpenAI), create a `.env` file in the project root with:

```bash
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

Then restart the dev server. When enabled, the editor will show an "LLM: Enabled" indicator and preview any generated suggestion before you accept or reject it.

**This is just the start.**

The plan is to turn this into a full AI-powered development environment that can understand your coding style, explain your bugs, and maybe even argue with you about why your variable names are terrible (seriously considering this feature lol).
