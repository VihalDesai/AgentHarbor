# AgentHarbor 1.3.0

## Highlights

- New workspaces use the OpenAI provider preset. Ollama is used only when explicitly selected, and invalid or missing provider IDs never route to Ollama.
- The create-agent flow displays the active provider and whether its API key is saved. Model requests use the selected provider directly.
- Add eight original character illustrations and select one for each agent. Existing agents receive stable character artwork automatically.
- Define up to six work phases for an agent. Phases appear on its profile and guide its responses.
- Keep model conversations contextual with the latest 20 saved messages.
- Agent profiles now include a Computer section that clearly reports local computer-control availability.

## Security and reliability

- Reject redirects from keyed model requests and require HTTPS for keyed remote endpoints.
- Validate model provider IDs, request size, endpoint format, API key storage calls and Electron IPC callers.
- Write encrypted desktop credential files atomically and handle malformed local server requests without crashing the app.
- Normalize saved workspace records and migrate the old implicit Ollama default to OpenAI.

The project remains MIT-licensed and has no pricing, billing, subscription or payment features. The Computer section is informational; computer control is not implemented.
