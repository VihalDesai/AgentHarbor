# AgentHarbor product specification

## Product

AgentHarbor is a personal, local-first workspace for focused AI agents on Android and Windows desktop. Each agent has a name, role and goal. People can keep separate conversations with each agent, save recurring prompt schedules, and optionally connect a local OpenAI-compatible model server.

The app has no payment, subscription, billing or price features.

## Screen map

| Screen | Purpose | Primary actions |
| --- | --- | --- |
| Home | Summarize agents, saved conversations and enabled routines | Create an agent, open an agent, navigate to a workspace section |
| Agents | Browse agents by name, role and goal | Open a conversation, create an agent |
| Create agent | Define an agent identity and purpose | Save agent, open its new conversation |
| Agent conversation | Keep a separate thread for one agent | Send a message, receive a local-model response when configured |
| Routines | Store reusable recurring prompt schedules | Add a sample routine, enable or disable a routine |
| Settings | Connect an OpenAI-compatible local endpoint and manage local data | Save endpoint/model, reset this device’s workspace |

## Core flows

### First use

1. Open Home and review the starter agents and routines.
2. Open Settings to replace starter data or configure the local model endpoint.
3. Create a focused agent by entering a name, role and goal.
4. Send the first task from the agent’s conversation screen.

### Local chat

1. The app saves the user’s message in the agent-specific conversation.
2. If a local endpoint is configured and reachable, send a non-streaming request to `<base-url>/chat/completions` with the agent role and goal as system context.
3. Save the assistant response and label it as local-model output.
4. On connection failure, retain the user message and show a clear fallback reply.

On desktop, the renderer calls the Electron preload bridge. The main process performs model requests. On Android and web, the app calls the configured endpoint directly. A phone must use a computer’s LAN address rather than `localhost` to reach a model server on that computer.

### Routines

Routines are stored prompt and schedule records. Users can create, enable or disable them. This starter build does not schedule background tasks or notifications; the UI calls this out directly.

## Data and privacy

- Persist the workspace in device-local storage using AsyncStorage.
- Workspace records contain agents, routines, per-agent messages and model endpoint settings.
- Do not add a cloud account, telemetry, sync service or third-party model provider by default.
- Prompts leave the device only when the user sends them to the endpoint they configured.
- Reset removes the saved workspace from the current device and restores starter records.

## Technical structure

- `apps/app`: Expo Router application, React Native UI shared across Android and web.
- `apps/desktop`: Electron wrapper that serves the static web export on loopback and exposes a narrowly scoped model-completion IPC method.
- `apps/app/src/state/WorkspaceStore.tsx`: device persistence and workspace actions.
- `apps/app/src/services/model.ts`: endpoint request and offline fallback.
- `apps/app/src/data/seed.ts`: starter agent and routine data.
- `apps/app/src/app`: screens and navigation routes.

## Acceptance criteria

- Android and web exports compile from the same app source.
- Desktop portable build opens the same UI from packaged local assets.
- Creating an agent creates an initial conversation and the agent persists after restart.
- Messages persist in separate agent conversations.
- Model endpoint and model name can be changed in Settings.
- Model failures do not discard the user’s saved message.
- Routines can be created and toggled, and are described accurately as non-executing schedule records.
- No pricing or payment interface appears anywhere in the app.
