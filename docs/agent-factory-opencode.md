# 4+1 Agent Factory (OpenCode)

This setup is tailored for this repository type: content-focused Next.js sites with SEO and AdSense monetization.

## 1) OpenCode IDE minimal settings

- Model routing
  - `orchestrator`: high-quality model.
  - child agents (`product`, `seo`, `dev`, `ops`): cost-efficient model.
- Permission boundaries
  - Only orchestrator can run write + git operations.
  - Child agents should run read/search and output JSON artifacts.
- Secrets
  - Store tokens in IDE/CI secrets, not in files.
  - Recommended: `OPENAI_API_KEY`, deploy token, analytics keys.

## 2) What is included in this repo

- Agent prompts: `agents/*.md`
- Step schemas: `schemas/*.json`
- Pipeline definition: `pipelines/new-site.pipeline.json`
- Site input example: `pipelines/site-input.example.json`
- Orchestrator CLI: `scripts/agents/orchestrate.mjs`

## 3) Quickstart

Initialize one run:

```bash
yarn agents:init --input pipelines/site-input.example.json
```

Or initialize with explicit run folder:

```bash
yarn agents:init --input pipelines/site-input.example.json --run-dir artifacts/my-first-run
```

The command creates `artifacts/<run-id>/` with:

- `inputs/site.json`
- `briefs/<agent>.md`
- `state.json`

Check progress:

```bash
yarn agents:status --run-dir artifacts/<run-id>
```

## 4) Automatic execution (OpenCode runner)

Create your local runner config from the example:

```bash
cp pipelines/agent-runner.example.json pipelines/agent-runner.local.json
```

Update `pipelines/agent-runner.local.json` so the command matches your local OpenCode CLI syntax.

Supported placeholders in command templates:

- `{step}`
- `{run_dir}`
- `{brief}`
- `{prompt}`
- `{input}`
- `{output}`

Run one pending step automatically:

```bash
yarn agents:run-step --run-dir artifacts/<run-id> --runner pipelines/agent-runner.local.json
```

Run the full pipeline automatically:

```bash
yarn agents:run-all --run-dir artifacts/<run-id> --runner pipelines/agent-runner.local.json
```

Dry run (print command only):

```bash
yarn agents:run-step --run-dir artifacts/<run-id> --runner pipelines/agent-runner.local.json --dry-run
```

## 5) Manual mode (fallback)

After an agent returns JSON, you can still mark the step manually:

```bash
yarn agents:complete --run-dir artifacts/<run-id> --step product --output /path/to/product-output.json
```

Repeat for `seo`, `dev`, and `ops`.

## 6) Recommended control loop

1. Orchestrator opens `briefs/product.md` and runs product-agent.
2. Save output JSON and record completion.
3. Move to next step only after schema-compliant output.
4. If output status is `fail`, pipeline enters blocked state.
5. Resolve risks and rerun that single step.

## 7) Scale pattern for multiple sites

- One run folder per domain.
- Run 3-5 sites in parallel with the same pipeline.
- Add CI later (GitHub Actions or scheduler) once manual loop is stable.
