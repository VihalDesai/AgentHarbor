# AgentHarbor product specification

## Product

AgentHarbor is a personal, local-first workspace for focused AI agents on Android and Windows desktop. Each agent has a name, role, goal, Skydive template portrait, and an editable sequence of work phases. People can keep separate, contextual conversations with each agent, save recurring prompt schedules, start from the visible Skydive templates, and connect a model provider they configure.

The app has no payment, subscription, billing or price features.

## Screen map

| Screen | Purpose | Primary actions |
| --- | --- | --- |
| Home | Template-first studio with featured starters, recent agent activity and routines | Create an agent, open templates, configure a provider, open an agent |
| Templates | Browse local agent starters by work category | Filter templates, add a starter agent |
| Agents | Browse agents by name, role and goal | Open a conversation, create an agent |
| Create agent | Define an agent identity, character and work phases | Save agent, open its new conversation |
| Agent profile | Review posts, chat, routines, computer access status and phases | Open a conversation, review the agent process |
| Agent conversation | Keep a separate contextual thread for one agent | Send a message to the selected provider when configured |
| Routines | Store reusable recurring prompt schedules | Add a sample routine, enable or disable a routine |
| Settings | Choose a model provider, store its key securely, and manage local data | Save provider/model/endpoint, test the connection, remove a key, reset this device’s workspace |

## Core flows

### First use

1. Open Home and review the starter agents and routines.
2. Browse templates to create a specialist, or open Provider settings to connect a model API or local server.
3. Create a focused agent by choosing a character and entering a name, role, goal and up to six work phases.
4. Send the first task from the agent’s conversation screen.

### Local chat

1. The app saves the user’s message in the agent-specific conversation.
2. If a provider is configured and reachable, send a non-streaming request using that provider’s API format with the agent role, goal, phases and recent conversation as context.
3. Use only the explicitly selected provider and its saved API key; never fall back to Ollama automatically.
4. Save the assistant response and label its source accurately.
5. On connection failure, retain the user message and show a clear recovery message.

Supported providers are OpenAI, Anthropic, Google Gemini, OpenRouter, Groq, DeepSeek, Ollama, and custom OpenAI-compatible endpoints. New workspaces default to OpenAI; Ollama must be explicitly selected. On desktop, the renderer calls an Electron preload bridge; the main process reads the API key from Electron `safeStorage` and performs requests. Provider redirects are rejected, keyed remote endpoints require HTTPS, and Electron IPC validates the sender and request fields. Android stores keys with Expo SecureStore and sends requests directly to the chosen provider. Browser previews use session storage for keys. A phone must use a computer’s LAN address rather than `localhost` to reach a model server on that computer.

### Routines

Routines are stored prompt and schedule records. Users can create, enable or disable them. This starter build does not schedule background tasks or notifications; the UI calls this out directly.

## Data and privacy

- Persist the workspace in device-local storage using AsyncStorage.
- Workspace records contain agents, templates the user added, routines, per-agent messages and provider/model/endpoint settings. They do not contain API keys.
- Store provider API keys in platform secure storage; never serialize them with workspace records.
- Do not add a cloud account, telemetry, sync service or third-party model provider by default.
- Prompts leave the device only when the user sends them to the endpoint they configured.
- Reset removes the saved workspace from the current device and restores starter records.

## Technical structure

- `apps/app`: Expo Router application, React Native UI shared across Android and web.
- `apps/desktop`: Electron wrapper that serves the static web export on loopback, exposes a narrowly scoped model-completion IPC method, and encrypts provider keys with `safeStorage`.
- `apps/app/src/state/WorkspaceStore.tsx`: device persistence and workspace actions.
- `apps/app/src/services/model.ts`: provider API requests and connection fallback.
- `apps/app/src/services/credentials.ts`: platform credential storage boundary.
- `apps/app/src/services/providers.ts`: provider presets, OpenAI default and settings normalization.
- `apps/app/src/services/characters.ts`: template character presets for the create flow and profiles.
- `apps/app/src/data/seed.ts`: starter agent and routine data.
- `apps/app/src/app`: screens and navigation routes.

## Acceptance criteria

- Android and web exports compile from the same app source.
- Desktop portable build opens the same UI from packaged local assets.
- Creating an agent saves its selected character and work phases, creates an initial conversation and persists after restart.
- Agent profiles expose Posts, Chats, Routines, Computer availability and Work phases sections.
- Messages persist in separate agent conversations and recent history is sent with each model request.
- The home screen exposes agent creation, templates and provider settings.
- Provider, endpoint and model can be changed in Settings; OpenAI, Anthropic, Gemini, OpenRouter, Groq, DeepSeek, Ollama and compatible custom APIs are available. The selected provider receives requests directly; Ollama is never an automatic fallback.
- API keys are absent from AsyncStorage workspace exports and use platform secure storage on Android and desktop.
- Model failures do not discard the user’s saved message.
- Routines can be created and toggled, and are described accurately as non-executing schedule records.
- No pricing or payment interface appears anywhere in the app.
