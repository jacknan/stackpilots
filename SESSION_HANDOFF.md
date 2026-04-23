# Session Handoff

This handoff is optimized for quickly resuming the multi-agent site factory workflow in a new chat session.

## Goal

- Run one full website through the `4+1` pipeline (`product -> seo -> dev -> ops`) and then scale to parallel runs.

## Current Status

- Done:
  - AdSense baseline is live on production (`ads script + ads.txt + CSP updates`).
  - `4+1` multi-agent scaffold is implemented in this repo.
  - Orchestrator supports `init`, `status`, `complete`, `run-step`, `run-all`.
  - Documentation for OpenCode usage exists in `docs/agent-factory-opencode.md`.
- In progress:
  - Configure local runner command in `pipelines/agent-runner.local.json`.
  - Execute first real run for one site input.

## Multi-Agent Scope Implemented

- Agent prompts:
  - `agents/orchestrator.md`
  - `agents/product-agent.md`
  - `agents/seo-agent.md`
  - `agents/dev-agent.md`
  - `agents/ops-agent.md`
- Schemas:
  - `schemas/product-output.schema.json`
  - `schemas/seo-output.schema.json`
  - `schemas/dev-output.schema.json`
  - `schemas/ops-output.schema.json`
- Pipeline:
  - `pipelines/new-site.pipeline.json`
  - `pipelines/site-input.example.json`
  - `pipelines/agent-runner.example.json`
- Orchestrator:
  - `scripts/agents/orchestrate.mjs`
- Scripts:
  - `package.json` includes `agents:init|status|complete|run-step|run-all`

## Commands Run (Verified)

- `yarn build` (passed before AdSense deployment)
- `node ./scripts/agents/orchestrate.mjs init --input pipelines/site-input.example.json --run-dir artifacts/demo-run-v2`
- `node ./scripts/agents/orchestrate.mjs status --run-dir artifacts/demo-run-v2`
- `node ./scripts/agents/orchestrate.mjs run-step --run-dir artifacts/demo-run-v2 --runner pipelines/agent-runner.example.json --dry-run`

## Open Issues / Blockers

- `opencode run` non-interactive mode remains unreliable on this machine (session/runtime issue).
- Local one-click execution is now fixed via deterministic runner script:
  - `scripts/agents/local-agent.mjs`
  - `pipelines/agent-runner.local.json` now points to this script.
- `app/tag-data.json` has an existing local modification unrelated to agent scaffold.
- `opencode run` currently cannot complete non-interactive execution on this machine:
  - Without explicit session: `Error: Session not found`.
  - With explicit session: process returns with no output and no file writes.
  - Result: `run-step` real execution cannot produce `outputs/<step>.json` yet.

## Manual Intervention Points (Expected)

- Required:
  - Fill each new site input JSON (`name/domain/lang/topic/constraints`).
  - Review each step output (`artifacts/<run-id>/outputs/*.json`) for strategy quality.
  - Approve or reject risky outputs before code/publish actions.
- Optional:
  - Run fully automatic with `run-all` after runner command is stable.

## Next Actions (One-Site First)

1. Create local runner config:
   - `cp pipelines/agent-runner.example.json pipelines/agent-runner.local.json`
2. Edit `pipelines/agent-runner.local.json` with real OpenCode command.
3. Create first site input:
   - `cp pipelines/site-input.example.json pipelines/site-one.json`
4. Initialize run:
   - `yarn agents:init --input pipelines/site-one.json --run-dir artifacts/site-one`
5. Dry run one step:
   - `yarn agents:run-step --run-dir artifacts/site-one --runner pipelines/agent-runner.local.json --dry-run`
6. Execute full pipeline:
   - `yarn agents:run-all --run-dir artifacts/site-one --runner pipelines/agent-runner.local.json`

## Latest Resume Notes (This Session)

- Completed:
  - Created `pipelines/agent-runner.local.json`.
  - Created `pipelines/site-one.json` with concrete defaults.
  - Initialized run dir: `artifacts/site-one`.
  - Verified dry-run command rendering for `product` step.
- Completed (manual fallback):
  - Produced manual outputs: `product.manual.json`, `seo.manual.json`, `dev.manual.json`, `ops.manual.json`.
  - Recorded all steps via `yarn agents:complete`.
  - Pipeline status for `artifacts/site-one` is now fully completed.
- Completed (automation fix):
  - Added `scripts/agents/local-agent.mjs` for stable step JSON generation.
  - Updated `pipelines/agent-runner.local.json` to call local runner script.
  - Verified one-click full run:
    - `yarn agents:init --input pipelines/site-one.json --run-dir artifacts/site-one-autofix`
    - `yarn agents:run-all --run-dir artifacts/site-one-autofix --runner pipelines/agent-runner.local.json`
  - Result: `product -> seo -> dev -> ops` all completed automatically.
- Repro commands:
  - `yarn agents:run-step --run-dir artifacts/site-one --runner pipelines/agent-runner.local.json`
  - `opencode run -- "reply with exactly: {}"` -> `Error: Session not found`

## Parallel Runs (After One-Site Validation)

- One site = one run dir.
- Run in separate terminals:
  - `yarn agents:run-all --run-dir artifacts/site-a --runner pipelines/agent-runner.local.json`
  - `yarn agents:run-all --run-dir artifacts/site-b --runner pipelines/agent-runner.local.json`

## Quick Context For Next Session

- Branch: `main`
- Last checked commit: `2bac51b`
- Recent deployed commits:
  - `2bac51b` allow AdSense frame origins in CSP
  - `4a86067` fix CSP for AdSense and Cloudflare Insights scripts
  - `5a3f108` add AdSense site-wide integration and ads.txt
- Current working tree snapshot:
  - Modified: `.gitignore`, `package.json`, `app/tag-data.json`
  - Added directories: `agents/`, `docs/`, `pipelines/`, `schemas/`, `scripts/agents/`
