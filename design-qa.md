# Design QA

## Reference review

- Reference: the signed-in Skydive workspace in the user’s Edge session at 1528 × 760.
- Screens reviewed in this pass: Skydive Home, new-agent character picker, and an agent profile (Posts, Chats, Routines, Computer). The earlier review also covered Templates and template detail, Agents, Integrations, Account, Workspace, and the agent chat composer.
- Implementation: AgentHarbor desktop/web preview at `http://localhost:8081`.
- Visual direction: Skydive’s compact dark workspace, round quick actions, narrow centered feed, quiet borders, settings rail, and edge-to-edge agent cover. AgentHarbor retains its own identity, names, wording, and provider flows.

## Changes in this revision

- Removed the permanent desktop navigation rail; added an account-style menu on the main screens and a settings rail on the provider screen.
- Aligned the Home feed and Templates catalog with the reference widths and top navigation placement.
- Added a template detail route with a clear add-to-workspace action, focus areas, and an explicit note that focus areas are not connected services.
- Added direct provider choices from Home, with all API setup handled by the provider settings page.
- Made the agent cover edge-to-edge and added an original, vector sunset landscape.
- Added visible recovery messages for failed API-key storage and chat requests, and ensured connection loading state always ends.
- Replaced default Ollama routing with an explicit OpenAI default; the create flow shows the selected provider and whether its key is saved.
- Added eight original character illustrations, editable agent work phases, contextual chat history, and a Computer availability section.
- Hardened provider requests against missing/invalid provider IDs, keyed cleartext remote endpoints, redirects, and untrusted desktop IPC callers.
- Kept mobile bottom navigation, local-first data, provider API configuration, and the no-pricing scope.

## Verification

- Lint, TypeScript, Electron syntax and `git diff --check` — passed.
- Reviewed the signed-in Skydive creation options and Betsy agent profile sections in Edge.
- A provider API key was not entered and no model request was sent.

## Known differences

- This is a clean-room AgentHarbor implementation, not a pixel-for-pixel copy. It uses distinct branding, original copy, seeded agents, original character art, and custom vector covers instead of Skydive’s artwork and photography.
- Skydive-only services such as external message channels, computer control, cloud teams, and account/workspace administration are not implemented. AgentHarbor only presents working local features and the supported model-provider API settings.
- Android uses the same dark visual system with mobile navigation and safe-area-aware layouts; this browser review did not capture a physical Android device.
- Provider connection behavior was not exercised because no key or model endpoint was supplied.
