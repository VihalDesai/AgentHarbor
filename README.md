# AgentHarbor

AgentHarbor is an open-source, local-first workspace for personal AI agents. This clean-room project was informed by public product research, but it uses its own name, interface, copy and implementation. It is not affiliated with Skydive.

## What is included

- `apps/app` — shared Expo application for Android and web, with local workspace storage, agent profiles and chats, saved routine prompts, and a configurable OpenAI-compatible model connection.
- `apps/desktop` — a Windows desktop shell that packages the shared web app as a portable executable and securely connects the UI to a local model endpoint.
- `docs/PRODUCT_SPEC.md` — implementation scope and behavior for this clean-room app.
- `LICENSE` — MIT license.

There are no pricing, subscription, or payment features in this project.

## Requirements

- Node.js 20.19 or newer and npm.
- For Android on a physical phone: Expo Go and a phone and computer on the same network.
- For local AI responses: an OpenAI-compatible model server, such as Ollama, running on the computer. The app remains usable for managing agents and saved chats without it.
- To rebuild the Windows executable: Windows, Node.js/npm, and network access to download Electron build components.

## Run on Android

1. Install Expo Go on the Android phone.
2. From this folder, run `npm install` and then `npm run android`.
3. Scan the displayed QR code with Expo Go. Keep the phone and computer on the same Wi-Fi network.
4. If using a model on the computer, open **Settings** in AgentHarbor and set Base URL to the computer’s LAN address, for example `http://192.168.1.20:11434/v1` for Ollama. `localhost` on a phone means the phone itself. Make the model server reachable on the LAN and configure its access policy accordingly.

Expo Go is a development runner; it is not a signed standalone Android installer. To build an APK/AAB, install Android Studio with its Android SDK and a compatible JDK, then follow Expo’s EAS Build setup in the official Expo documentation. This repository does not include a signed release APK.

## Run in a browser

Run `npm install`, then `npm run web`. The web app is useful for development and can also be used as the desktop renderer.

## Run AgentHarbor Desktop

Run `npm install`, then `npm run web:build`, then `npm run desktop`. The desktop shell opens the generated web app and uses Electron IPC for model requests, keeping Node access out of the renderer.

## Build the portable Windows app

Run `npm run desktop:build`. The output is written to `releases/desktop/AgentHarbor-1.0.0-Windows.exe`. First build downloads Electron binaries and may take several minutes. This build produces a portable Windows executable; it is not code-signed.

## Local model setup

AgentHarbor sends prompts to the Base URL and model name saved in Settings. It uses the OpenAI-compatible `/chat/completions` endpoint. On desktop, the app reaches the model through its Electron main process. On Android, requests are made from the app to the URL you configured; use the computer’s LAN IP rather than `localhost`.

## Current scope

Agent and routine records and chat history persist on the current device. Routines are saved schedule labels and prompt templates; they do not start background jobs or send notifications in this starter version. Integrations, cloud sync, remote accounts, team collaboration and store-distributed builds are not included.

## License

MIT. See `LICENSE`.
