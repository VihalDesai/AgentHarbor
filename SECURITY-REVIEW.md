# Security review — 2026-10-29

## Fixes in this update

- Custom OpenAI-compatible provider URLs now accept either a base URL or a full `/chat/completions` endpoint. Connection errors return actionable, non-secret messages.
- The desktop asset server now checks path containment with `path.relative`, sends frame/object/base security headers, disables webviews, and denies Electron permission requests.
- Workspace hydration now preserves stored data after a storage read/parse failure instead of automatically overwriting it with starter data. Changes made while hydration is pending are applied after the saved workspace loads.
- Electron is pinned to 45.0.0. The dependency graph uses Zod 4.6.7 for Expo CLI, `node-forge` 1.4.2 for Expo signing tools, and a local CommonJS adaptation of the fixed `decode-uri-component` 0.5.1 decoder for Expo Router's CommonJS consumer.

## Remaining dependency finding

`node-forge` is overridden to 1.4.2; `npm ls node-forge --all` confirms that Expo CLI and its signing package resolve that patched version. `npm audit --audit-level=high` now reports no high-severity issues. The [advisory affects versions through 1.4.0](https://github.com/advisories/GHSA-86w9-cpqp-85rv), and the [upstream maintainer confirmed the fix in 1.4.1](https://github.com/digitalbazaar/forge/pull/1152); npm currently serves 1.4.2.

`npm audit` still reports seven low-severity paths through Expo tooling's `deepmerge@4.3.1`. The [GitHub advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) currently lists no patched release. I left this visible instead of disguising the finding with a forced Expo downgrade or an unverified fork.

## Strix status

No Strix CLI, Docker runtime, or local Strix LLM configuration is available on this machine, and there is no Strix report for this revision. This review is not a Strix pentest and does not claim Strix verification. A managed scan would upload the reviewed source snapshot and consume Strix credits; a CI scan also needs repository secrets for `STRIX_LLM` and `LLM_API_KEY` and can spend up to its configured per-run budget.

The GitHub Actions workflow in `.github/workflows/security.yml` is configured for pull requests and manual runs. It needs repository secrets named `STRIX_LLM` and `LLM_API_KEY`, caps each run at `$10` of LLM usage, skips forked pull requests that cannot access secrets, and rejects incomplete scans. It has not run from this workspace; add the secrets in GitHub to activate it. Configure the workflow check as required in branch protection if it should block merges.
