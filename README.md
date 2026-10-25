# AgentHarbor

AgentHarbor is an open-source, local-first workspace for personal AI agents on desktop and Android. Its shared interface recreates the Skydive workspace and template experience using the project owner’s authorized reference assets. The Skydive portraits, mark, and profile cover are not covered by this repository’s MIT license; see [the asset rights note](apps/app/assets/ASSET-RIGHTS.md).

## What is included

- `apps/app` — shared Expo application for Android and web, with a template-first workspace, Skydive template portraits, per-agent work phases, local chats, saved routine prompts, and selectable model providers.
- `apps/desktop` — a Windows desktop shell that packages the shared app as a portable executable and stores provider API keys using Electron OS-backed encryption.
- `docs/PRODUCT_SPEC.md` — implementation scope and behavior for this clean-room app.
- `LICENSE` — MIT license.

There are no pricing, subscription, or payment features in this project.

## Requirements

- Node.js 20.19 or newer and npm.
- For Android on a physical phone: Expo Go and a phone and computer on the same network.
- For AI responses: an API key from a supported provider, or a local OpenAI-compatible model server such as Ollama. AgentHarbor remains usable for managing agents and saved chats without a provider.
- To rebuild the Windows executable: Windows, Node.js/npm, and network access to download Electron build components.

## Run on Android

1. Install Expo Go on the Android phone.
2. From this folder, run `npm install` and then `npm run android`.
3. Scan the displayed QR code with Expo Go. Keep the phone and computer on the same Wi-Fi network.
4. Open **Provider settings**, choose the API provider for the key you have, and paste that key into its secure field. New workspaces start with the OpenAI preset; Ollama is used only after you select it. A phone must use the computer’s LAN address rather than `localhost` to reach a model server on that computer.

Expo Go is a development runner; it is not a signed standalone Android installer. To build an APK/AAB, install Android Studio with its Android SDK and a compatible JDK, then follow Expo’s EAS Build setup in the official Expo documentation. This repository does not include a signed release APK.

## Run in a browser

Run `npm install`, then `npm run web`. The web app is useful for development and can also be used as the desktop renderer. Web previews keep API keys in session storage only; use the packaged desktop app or Android app for OS-backed secure storage.

## Run AgentHarbor Desktop

Run `npm install`, then `npm run web:build`, then `npm run desktop`. The desktop shell opens the generated web app and uses Electron IPC for model requests, keeping Node access out of the renderer.

## Build the portable Windows app

Run `npm run desktop:build`. The output is written to `releases/desktop/AgentHarbor-1.3.0-Windows.exe`. First build downloads Electron binaries and may take several minutes. This build produces a portable Windows executable; it is not code-signed.

## Local model setup

Choose OpenAI, Anthropic, Google Gemini, OpenRouter, Groq, DeepSeek, Ollama, or a custom OpenAI-compatible endpoint in **Provider settings**. Replies go directly to the selected provider using that provider’s saved key; there is no automatic Ollama fallback. Ollama is an explicit choice and does not use an API key. Provider URL and model are stored in the workspace. API keys are stored separately: Windows desktop uses Electron `safeStorage`, Android uses Expo SecureStore backed by Android Keystore, and browser previews use session storage. The desktop renderer never receives API keys; requests run through the Electron main process. HTTPS is required for keyed remote endpoints, and provider redirects are rejected to keep keys at the configured destination. Android sends requests directly to the selected provider. Do not use a phone's `localhost` to reach a model server on a computer.

Agents can use any of the 24 portraits in the reference catalog or define up to six work phases. The catalog includes twelve built-in templates and twelve marketplace templates, with the Templates page showing four cards per section and a working “See all” view. Work phases guide chat responses. Each agent conversation sends up to the latest 20 saved messages for context.

## Current scope

Agent and routine records and chat history persist on the current device. Templates are editable starting points that create local agents. Routines are saved schedule labels and prompt templates; they do not start background jobs or send notifications in this version. Integrations, cloud sync, remote accounts, team collaboration and store-distributed builds are not included.

## License

MIT. See `LICENSE`.
