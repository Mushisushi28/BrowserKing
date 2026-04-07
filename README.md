<p align="center">
  <img src="icon-128.png" alt="BrowserKing" width="96" />
</p>

<h1 align="center">BrowserKing</h1>

<p align="center">
  <strong>Open-source browser agent Chrome extension powered by any LLM provider</strong>
</p>

<p align="center">
  Use GPT-4o, Claude, Gemini, Grok, DeepSeek, Mistral, Llama, and 15+ other models as your browser agent — all from one extension.
</p>

---

## What is BrowserKing?

BrowserKing is a Chrome extension that gives any LLM the ability to see and control your browser. It works like a human assistant that can:

- **Take screenshots** and understand what's on screen
- **Click, type, scroll** and navigate web pages
- **Read page content** and extract information
- **Open tabs** and work across multiple pages
- **Record and replay workflows** for repetitive tasks

Unlike other browser agents locked to a single provider, BrowserKing lets you **bring your own API key** from any OpenAI-compatible provider — or use the Anthropic API directly, including through Google Vertex AI.

## Supported Providers

| Provider | Models | Vision |
|----------|--------|--------|
| **OpenAI** | GPT-4o, GPT-4.1, o3, o4-mini | Yes |
| **Anthropic** | Claude 4 Sonnet, Claude 4 Opus | Yes |
| **Google Vertex AI (Claude)** | Claude Opus/Sonnet/Haiku (4.5, 4.6, 3.5) | Yes |
| **Google** | Gemini 2.5 Pro/Flash | Yes |
| **xAI** | Grok 3, Grok 3 Mini | Yes |
| **DeepSeek** | DeepSeek-V3, DeepSeek-R1 | No |
| **Mistral** | Mistral Large, Pixtral Large | Pixtral only |
| **Groq** | Llama 4 Scout/Maverick, Llama 3.3 | Scout/Maverick |
| **Cerebras** | Llama 3.3 70B | No |
| **Perplexity** | Sonar Pro, Sonar Huge | No |
| **Z.AI** | GLM-4.6V, GLM-4.5V | Yes |
| **Custom** | Any OpenAI-compatible endpoint | Configurable |

Each provider gets its own **theme color** throughout the UI — the sidebar, send button, glow effects, and page border all match your active provider.

## Run Local Models

BrowserKing works with **any OpenAI-compatible API**, which means you can run it with local models too. Point it at [Ollama](https://ollama.com), [LM Studio](https://lmstudio.ai), [LocalAI](https://localai.io), or any other local inference server that exposes an OpenAI-compatible endpoint.

**Setup:**
1. Start your local server (e.g., `ollama serve` or launch LM Studio)
2. In BrowserKing settings, select the **Custom** provider
3. Set the base URL to your local endpoint (e.g., `http://localhost:11434/v1` for Ollama)
4. Enter any string as the API key (local servers usually don't require one, but the field can't be empty)
5. Select or type your model name

**Best models for local browser agents:**
- `llama-4-scout` or `llama-4-maverick` (vision + tool use)
- `qwen2.5-vl` (strong vision)
- Any model with vision and function calling support

> **Note:** Local model support is experimental. Performance depends heavily on your hardware and the model's ability to handle tool calls and vision inputs. Cloud providers with dedicated function calling support will generally give the most reliable results. If you run into issues, please [open an issue](https://github.com/Mushisushi28/BrowserKing/issues) — we'd love to hear what works and what doesn't.

## Google Vertex AI (Claude)

BrowserKing supports Claude models hosted on **Google Cloud Vertex AI** using Application Default Credentials (ADC). This lets you use your GCP identity instead of an Anthropic API key.

**Prerequisites:**
- A Google Cloud project with the [Vertex AI API enabled](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)
- The [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`) installed and authenticated

**Setup:**
1. Authenticate with Google Cloud:
   ```
   gcloud auth login
   ```
2. In BrowserKing settings, select the **Google Vertex AI (Claude)** provider
3. Enter your **Project ID** (find it with `gcloud config get-value project` or `gcloud projects list`)
4. Set the **Location** (default: `global`; see available regions with `gcloud ai locations list`)
5. Generate a short-lived access token and paste it into the **Access Token** field:
   ```
   gcloud auth print-access-token
   ```
6. Select a Claude model and enable the provider

> **Note:** Access tokens expire after ~1 hour. Re-run `gcloud auth print-access-token` and update the field when your token expires.

## Features

- **Multi-provider support** — Switch between providers and models mid-conversation from the dropdown
- **Automatic vision detection** — Knows which models support images and which don't, with safe fallback
- **Provider-themed UI** — Every color in the extension adapts to your active provider
- **Page glow border** — Pulsing colored border around the page while the agent is working
- **No account required** — No sign-up, no subscription. Just add your API key and go
- **Workflow recording** — Record browser actions and replay them later
- **GIF export** — Export recordings as GIFs
- **Tool use** — Models that support function calling get collapsible tool-use blocks in the chat

## Installation

1. Download or clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select this folder
5. Click the BrowserKing icon in your toolbar to open the side panel
6. Go to **Settings** and add your API key for at least one provider

## Quick Start

1. Open any web page
2. Open BrowserKing from the side panel
3. Select your provider and model from the dropdown at the top
4. Type a task like _"Find the cheapest flight from Calgary to Tokyo next month"_
5. Watch the agent work — it takes screenshots, clicks, scrolls, and reports back

## Configuration

Open the **Provider Settings** page from the extension options to:

- Enable/disable providers
- Enter API keys
- Set custom base URLs (for self-hosted or proxy endpoints)
- Choose default models
- Fetch available models from provider APIs

## Architecture

BrowserKing works by intercepting the stock extension's Anthropic API calls and translating them to OpenAI-compatible `chat/completions` requests. This means:

- The full browser automation toolkit (screenshots, clicks, navigation) works with any provider
- Tool calls are translated between Anthropic and OpenAI formats in real-time
- SSE streaming is translated on the fly
- Vision payloads are automatically downgraded for text-only models

Key files:

| File | Purpose |
|------|---------|
| `provider-registry.js` | Provider definitions, model lists, vision detection |
| `api-adapter.js` | API translation layer (Anthropic ↔ OpenAI) |
| `ui-branding.js` | Dynamic theme colors in the side panel |
| `brand-overlay.js` | Page glow border and stop button theming |
| `sidepanel-provider-menu.js` | Provider/model dropdown UI |
| `provider-settings.js` | Settings page for API keys and configuration |

## Roadmap

- [ ] **Persistent page glow** — Fix the colored glow border so it reliably pulses for all providers during agent activity
- [ ] **Conversation history** — Save and resume past agent sessions
- [ ] **Multi-tab workflows** — Coordinate actions across multiple tabs in a single task
- [ ] **Prompt templates** — Pre-built task templates for common workflows (form filling, data extraction, price comparison)
- [ ] **Better local model support** — Improve tool call translation for models with non-standard function calling formats
- [ ] **Export to Playwright/Puppeteer** — Convert recorded workflows to automation scripts
- [ ] **Provider cost tracking** — Track token usage and estimated cost per conversation
- [ ] **Firefox & Edge support** — Port the extension to other Chromium and non-Chromium browsers
- [ ] **Mobile support** — Bring browser agent capabilities to mobile browsers via Kiwi Browser or Firefox Android extensions

Have a feature idea? [Open an issue](https://github.com/Mushisushi28/BrowserKing/issues) or submit a PR.

## Acknowledgments

BrowserKing is built on top of Anthropic's [Claude for Chrome](https://chrome.google.com/webstore/detail/claude/danfohhfmbeahkgpceibgibfpkhokbfp) extension. We extended it with multi-provider support, local model compatibility, and a provider-themed UI.

## License

MIT

## Contributing

PRs welcome. If you add a new provider, add it to the `PROVIDERS` object in `provider-registry.js` with:
- `id`, `label`, `color`
- `baseUrl` and model list
- Vision support flags per model

Then add vision detection rules in `inferVisionSupport()` in the same file.
