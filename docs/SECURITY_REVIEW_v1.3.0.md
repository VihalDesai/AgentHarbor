# Security review · AgentHarbor 1.3.0

## Scope

This is a local source review and dependency audit. A Strix assessment was not run: the Strix CLI and Docker are unavailable in this environment. The managed Strix service would receive a source snapshot and may use account credits, so that upload and usage still need the maintainer’s approval.

## Changes in this release

- Missing or invalid provider IDs no longer select Ollama. New workspaces use OpenAI, and existing records matching the old untouched Ollama default migrate to OpenAI.
- Provider keys are stored by the desktop encrypted storage bridge or Android SecureStore. Model requests go directly to the provider selected in Settings.
- Remote endpoints that receive a key must use HTTPS. Redirects are rejected so a key cannot be forwarded to a different host.
- Provider IDs, endpoint and model lengths, message history, message roles, API key lengths, and Electron IPC callers are validated.
- Desktop credential updates use a temporary file and rename. The local static server limits methods, handles malformed URLs, and adds basic response headers.

## Verification performed

- Expo lint and TypeScript checks pass.
- The web export succeeds and emits 15 routes.
- Electron main and preload syntax checks pass.
- The Windows portable build succeeds at `releases/desktop/AgentHarbor-1.3.0-Windows.exe` (unsigned).
- The browser preview loads the agent profile and provider settings without new console warnings.

## Remaining dependency findings

`npm audit --omit=dev` reports 8 findings in the Expo dependency tree (3 moderate, 5 high, 0 critical), involving `decode-uri-component` through Expo Router, `node-forge` through Expo CLI code-signing packages, and `zod` through Expo tooling. The current compatible dependency graph does not offer a safe, non-breaking fix for all of them: the audited `node-forge` advisory lists no patched release, while the other fixes require dependency changes that would need a broader Expo upgrade or compatibility review. No forced upgrade or unverified override was applied.

These findings are from the package audit; they are not evidence that a Strix scan passed. Re-run the audit and Strix after the Expo toolchain publishes compatible fixes and after an approved Strix scan.

## Platform limit

Android source is included, but this machine has no Android SDK, `adb`, or Java installation, so an APK/AAB was not produced here.
