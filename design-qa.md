# Skydive interface replication review

## Reference and implementation

- Reference: the user’s signed-in Skydive session, plus the public template catalog at `https://www.skydive.com/templates`.
- Reference viewport: approximately 1528 × 782.
- Screens reviewed: Home, Templates, Marketplace, Design Maven template detail, agent Posts/Chats/Routines/Computer, create-agent character picker, provider settings, and workspace settings.
- Implementation: AgentHarbor Expo app rendered in Edge from `http://localhost:8081`; the same React Native layouts serve desktop/web and Android.
- Skydive ownership or reproduction permission was explicitly confirmed by the user.

## Changes in this pass

- Replaced the hand-drawn avatars with all 24 Skydive catalog portraits and replaced the vector landscape with the Skydive profile cover photo. Assets are local for offline Android rendering.
- Added the Skydive flower mark and wordmark placement to the shared header.
- Rebuilt the Templates page around the reference’s centered narrow column, one wrapping filter row, `From Skydive` and `Marketplace` sections, round portraits, bylines, integration chips, skill counts, and Add to team actions.
- Added twelve built-in and twelve marketplace templates visible in the reference, including their published descriptions, authors, integrations, skills, and benefit copy. The main catalog shows four cards per section and “See all” opens the matching full list.
- Rebuilt template details to follow the reference hierarchy: back link, portrait/title/actions, Meet, Works with, Skills when present, What you get, and the final Add to your team action.
- Reworked Home shortcuts, feed, model status panel, and featured templates, and aligned agent profile cover/portrait placement and Posts, Chats, Routines, and Computer tabs.
- Kept provider configuration, encrypted API key storage, local workspace data, and work phases. Model requests continue to use the selected provider directly without switching to Ollama.
- Kept pricing and purchase flows out of the app.

## Verification

- `npm --prefix apps/app run lint` — passed.
- `npx tsc --noEmit -p apps/app/tsconfig.json` — passed.
- `npm run web:build` — passed and exported 15 routes.
- Compared the local Templates and Design Maven detail screenshots against the signed-in reference in Edge.
- Reviewed the agent profile with the local cover and character assets. No physical Android device was available for a visual capture.
- No API key was entered and no model request was made during this visual pass.

## Boundaries

- The catalog mirrors the 24 public templates visible across the reviewed Skydive listing and “See all” pages. It does not import private templates from the user’s workspace.
- AgentHarbor preserves local provider requests and workspace data. Skydive-only cloud teams, message channels, account administration, and computer control are not implemented.
- Integration marks use locally bundled Font Awesome brand glyphs and matching colors where available, with short text fallbacks for integrations without a brand glyph.
- The copied Skydive image and mark files are used under the permission the user provided. They are explicitly excluded from the repository MIT license in [ASSET-RIGHTS.md](apps/app/assets/ASSET-RIGHTS.md).
