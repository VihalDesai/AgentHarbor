# AgentHarbor

AgentHarbor is an open-source, local-first workspace for personal AI agents. This clean-room project was informed by public product research, but it uses its own name, interface, copy and implementation. It is not affiliated with Skydive.

## What is included

- `apps/app` — shared Expo application for Android and web, with a template-first workspace, local agents and chats, saved routine prompts, and selectable model providers.
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
4. Open **Provider settings**, choose Ollama or another compatible provider, then set its endpoint and model. A phone must use the computer’s LAN address rather than `localhost` to reach a model server on that computer.

Expo Go is a development runner; it is not a signed standalone Android installer. To build an APK/AAB, install Android Studio with its Android SDK and a compatible JDK, then follow Expo’s EAS Build setup in the official Expo documentation. This repository does not include a signed release APK.

## Run in a browser

Run `npm install`, then `npm run web`. The web app is useful for development and can also be used as the desktop renderer. Web previews keep API keys in session storage only; use the packaged desktop app or Android app for OS-backed secure storage.

## Run AgentHarbor Desktop

Run `npm install`, then `npm run web:build`, then `npm run desktop`. The desktop shell opens the generated web app and uses Electron IPC for model requests, keeping Node access out of the renderer.

## Build the portable Windows app

Run `npm run desktop:build`. The output is written to `releases/desktop/AgentHarbor-1.2.1-Windows.exe`. First build downloads Electron binaries and may take several minutes. This build produces a portable Windows executable; it is not code-signed.

## Local model setup

Choose OpenAI, Anthropic, Google Gemini, OpenRouter, Groq, DeepSeek, Ollama, or a custom OpenAI-compatible endpoint in **Provider settings**. Provider URL and model are stored in the workspace. API keys are stored separately: Windows desktop uses Electron `safeStorage`, Android uses Expo SecureStore backed by Android Keystore, and browser previews use session storage. The desktop renderer never receives API keys; requests run through the Electron main process. Android sends requests directly to the selected provider. Do not use a phone's `localhost` to reach a model server on a computer.

## Current scope

Agent and routine records and chat history persist on the current device. Templates are editable starting points that create local agents. Routines are saved schedule labels and prompt templates; they do not start background jobs or send notifications in this version. Integrations, cloud sync, remote accounts, team collaboration and store-distributed builds are not included.

## License

MIT. See `LICENSE`.
