import { exec as execCallback } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execCallback)
const ROOT = process.cwd()
const DEFAULT_PIPELINE_PATH = path.join(ROOT, 'pipelines/new-site.pipeline.json')

function parseArgs(argv) {
  const [command = 'status', ...rest] = argv
  const args = { command }
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = rest[index + 1] && !rest[index + 1].startsWith('--') ? rest[index + 1] : true
    args[key] = value
    if (value !== true) index += 1
  }
  return args
}

function normalizePath(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.join(ROOT, inputPath)
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content)
}

async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n')
}

function toRunId(siteSpec) {
  const domain = siteSpec.site?.domain || 'unknown-domain'
  const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '-').replace(/\.+/g, '.')
  const stamp = new Date().toISOString().replace(/[:]/g, '-').slice(0, 19)
  return `${stamp}-${safeDomain}`
}

function assertValidSiteSpec(spec) {
  const required = ['name', 'domain', 'lang', 'topic']
  if (!spec.site || typeof spec.site !== 'object') {
    throw new Error('Input must include object key: site')
  }
  for (const key of required) {
    if (!spec.site[key] || typeof spec.site[key] !== 'string') {
      throw new Error(`site.${key} is required and must be a string`)
    }
  }
}

function assertCommonAgentOutput(output) {
  if (!['ok', 'fail'].includes(output.status)) {
    throw new Error('status must be ok or fail')
  }
  if (!output.artifacts || typeof output.artifacts !== 'object') {
    throw new Error('artifacts must be an object')
  }
  if (!Array.isArray(output.risks)) {
    throw new Error('risks must be an array')
  }
  if (!Array.isArray(output.next_actions)) {
    throw new Error('next_actions must be an array')
  }
}

function requireArtifactKeys(output, keys) {
  for (const key of keys) {
    if (!(key in output.artifacts)) {
      throw new Error(`artifacts.${key} is required`)
    }
  }
}

function validateOutputForStep(stepId, output) {
  assertCommonAgentOutput(output)

  if (stepId === 'product') {
    requireArtifactKeys(output, [
      'niche',
      'audience',
      'positioning',
      'monetization',
      'initial_offers',
    ])
  }
  if (stepId === 'seo') {
    requireArtifactKeys(output, [
      'categories',
      'topic_clusters',
      'internal_link_rules',
      'onpage_requirements',
    ])
  }
  if (stepId === 'dev') {
    requireArtifactKeys(output, ['file_changes', 'env_vars', 'ads_plan', 'validation_checks'])
  }
  if (stepId === 'ops') {
    requireArtifactKeys(output, [
      'launch_checklist',
      'monitoring',
      'incident_playbook',
      'weekly_kpis',
    ])
  }
}

async function readState(runDir) {
  return readJson(path.join(runDir, 'state.json'))
}

async function writeState(runDir, state) {
  await writeJson(path.join(runDir, 'state.json'), state)
}

function getNextPendingStep(state) {
  return state.steps.find((step) => step.status === 'pending')
}

function getStepById(state, stepId) {
  const step = state.steps.find((entry) => entry.id === stepId)
  if (!step) {
    throw new Error(`Unknown step id: ${stepId}`)
  }
  return step
}

function interpolate(template, variables) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const value = variables[key]
    if (value === undefined || value === null) return ''
    return String(value)
  })
}

function quote(value) {
  return `"${String(value).replace(/"/g, '\\"')}"`
}

async function buildStepInput(runDir, state, step) {
  const siteInput = await readJson(path.join(runDir, 'inputs/site.json'))
  const previousOutputs = {}

  for (const item of state.steps) {
    if (item.id === step.id) continue
    const outputPath = path.join(runDir, item.output)
    try {
      previousOutputs[item.id] = await readJson(outputPath)
    } catch {
      // ignore missing output files
    }
  }

  return {
    site: siteInput.site,
    constraints: siteInput.constraints || {},
    current_step: step.id,
    previous_outputs: previousOutputs,
  }
}

async function loadRunnerConfig(runnerConfigPath) {
  const config = await readJson(runnerConfigPath)
  if (!config.command) {
    throw new Error('Runner config requires key: command')
  }
  return config
}

async function initRun({ inputPath, runDirPath, pipelinePath }) {
  const pipeline = await readJson(pipelinePath)
  const inputSpec = await readJson(inputPath)
  assertValidSiteSpec(inputSpec)

  const resolvedRunDir = runDirPath || path.join(ROOT, 'artifacts', toRunId(inputSpec))
  await ensureDir(resolvedRunDir)
  await ensureDir(path.join(resolvedRunDir, 'inputs'))
  await ensureDir(path.join(resolvedRunDir, 'outputs'))
  await ensureDir(path.join(resolvedRunDir, 'briefs'))

  await writeJson(path.join(resolvedRunDir, 'inputs/site.json'), inputSpec)

  const steps = pipeline.steps.map((step, index) => ({
    id: step.id,
    prompt: step.prompt,
    output: step.output,
    schema: step.schema,
    order: index + 1,
    status: 'pending',
    completed_at: null,
  }))

  const state = {
    pipeline: pipeline.name,
    version: pipeline.version,
    run_dir: resolvedRunDir,
    created_at: new Date().toISOString(),
    site: inputSpec.site,
    steps,
  }

  await writeState(resolvedRunDir, state)

  for (const step of pipeline.steps) {
    const promptPath = path.join(ROOT, step.prompt)
    const prompt = await fs.readFile(promptPath, 'utf8')
    const brief = [
      `# Agent Brief: ${step.id}`,
      '',
      `Prompt file: ${step.prompt}`,
      '',
      '## System Prompt',
      prompt,
      '',
      '## Input JSON Path',
      path.join(resolvedRunDir, `inputs/${step.id}.input.json`),
      '',
      '## Required Output Path',
      path.join(resolvedRunDir, step.output),
      '',
      '## Rules',
      '- Output strict JSON only, no markdown wrappers.',
      '- Follow the required output keys exactly.',
      '- Keep risk and next action lists concise and actionable.',
      '',
    ].join('\n')

    await fs.writeFile(path.join(resolvedRunDir, `briefs/${step.id}.md`), brief)
  }

  console.log(`Run initialized: ${resolvedRunDir}`)
  const firstStep = pipeline.steps[0]
  if (firstStep) {
    console.log(`Next step: ${firstStep.id}`)
    console.log(`Brief: ${path.join(resolvedRunDir, `briefs/${firstStep.id}.md`)}`)
  }
}

async function showStatus({ runDirPath }) {
  const state = await readState(runDirPath)
  console.log(`Pipeline: ${state.pipeline} (v${state.version})`)
  console.log(`Site: ${state.site.name} (${state.site.domain})`)
  for (const step of state.steps) {
    console.log(`- ${step.id}: ${step.status}`)
  }
  const nextStep = getNextPendingStep(state)
  console.log(nextStep ? `Next step: ${nextStep.id}` : 'All steps completed')
}

async function recordStepCompletion({ runDirPath, stepId, outputPath }) {
  const state = await readState(runDirPath)
  const step = getStepById(state, stepId)

  const outputJson = await readJson(outputPath)
  validateOutputForStep(stepId, outputJson)

  const targetOutputPath = path.join(runDirPath, step.output)
  await writeJson(targetOutputPath, outputJson)

  step.status = outputJson.status === 'ok' ? 'completed' : 'blocked'
  step.completed_at = new Date().toISOString()

  await writeState(runDirPath, state)

  if (step.status === 'blocked') {
    console.log(`Step ${stepId} blocked. Review risks before continuing.`)
    return
  }

  const nextStep = getNextPendingStep(state)
  if (nextStep) {
    console.log(`Next step: ${nextStep.id}`)
    console.log(`Brief: ${path.join(runDirPath, `briefs/${nextStep.id}.md`)}`)
  } else {
    console.log('All steps completed')
  }

  console.log(`Step ${stepId} recorded: ${step.status}`)
}

async function runStep({ runDirPath, stepId, runnerConfigPath, dryRun = false }) {
  const state = await readState(runDirPath)
  const step = stepId ? getStepById(state, stepId) : getNextPendingStep(state)
  if (!step) {
    console.log('No pending step found')
    return
  }
  if (step.status !== 'pending') {
    throw new Error(`Step ${step.id} is not pending`)
  }

  const runnerConfig = await loadRunnerConfig(runnerConfigPath)
  const inputPayload = await buildStepInput(runDirPath, state, step)

  const stepInputPath = path.join(runDirPath, `inputs/${step.id}.input.json`)
  const stepOutputPath = path.join(runDirPath, step.output)
  const briefPath = path.join(runDirPath, `briefs/${step.id}.md`)
  const promptPath = path.join(ROOT, step.prompt)

  await writeJson(stepInputPath, inputPayload)

  const variables = {
    step: step.id,
    run_dir: runDirPath,
    input: quote(stepInputPath),
    output: quote(stepOutputPath),
    brief: quote(briefPath),
    prompt: quote(promptPath),
  }

  const commandTemplate = runnerConfig.steps?.[step.id] || runnerConfig.command
  const command = interpolate(commandTemplate, variables)

  console.log(`Running step: ${step.id}`)
  console.log(`Command: ${command}`)

  if (dryRun) return

  await ensureDir(path.dirname(stepOutputPath))
  const { stdout, stderr } = await exec(command, { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 })
  if (stdout.trim()) console.log(stdout.trim())
  if (stderr.trim()) console.log(stderr.trim())

  const outputJson = await readJson(stepOutputPath)
  validateOutputForStep(step.id, outputJson)

  step.status = outputJson.status === 'ok' ? 'completed' : 'blocked'
  step.completed_at = new Date().toISOString()

  await writeState(runDirPath, state)

  if (step.status === 'blocked') {
    console.log(`Step ${step.id} blocked. Review output risks.`)
    return
  }

  const nextStep = getNextPendingStep(state)
  console.log(nextStep ? `Next step: ${nextStep.id}` : 'All steps completed')
}

async function runAll({ runDirPath, runnerConfigPath, dryRun = false }) {
  while (true) {
    const state = await readState(runDirPath)
    const blockedStep = state.steps.find((step) => step.status === 'blocked')
    if (blockedStep) {
      console.log(`Pipeline blocked at step: ${blockedStep.id}`)
      return
    }

    const pendingStep = getNextPendingStep(state)
    if (!pendingStep) {
      console.log('All steps completed')
      return
    }

    await runStep({ runDirPath, stepId: pendingStep.id, runnerConfigPath, dryRun })
    if (dryRun) return
  }
}

async function requireRunDir(args) {
  if (!args['run-dir']) {
    throw new Error('Please pass --run-dir <path>')
  }
  return normalizePath(args['run-dir'])
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const pipelinePath = normalizePath(args.pipeline || DEFAULT_PIPELINE_PATH)

  if (args.command === 'init') {
    const inputPath = normalizePath(
      args.input || path.join(ROOT, 'pipelines/site-input.example.json')
    )
    const runDirPath = args['run-dir'] ? normalizePath(args['run-dir']) : null
    await initRun({ inputPath, runDirPath, pipelinePath })
    return
  }

  if (args.command === 'status') {
    const runDirPath = await requireRunDir(args)
    await showStatus({ runDirPath })
    return
  }

  if (args.command === 'complete') {
    const runDirPath = await requireRunDir(args)
    const stepId = args.step
    const outputPath = args.output ? normalizePath(args.output) : null
    if (!stepId || !outputPath) {
      throw new Error('complete requires --run-dir <path> --step <id> --output <file>')
    }
    await recordStepCompletion({ runDirPath, stepId, outputPath })
    return
  }

  if (args.command === 'run-step') {
    const runDirPath = await requireRunDir(args)
    const runnerConfigPath = normalizePath(args.runner || 'pipelines/agent-runner.example.json')
    const dryRun = Boolean(args['dry-run'])
    await runStep({ runDirPath, stepId: args.step, runnerConfigPath, dryRun })
    return
  }

  if (args.command === 'run-all') {
    const runDirPath = await requireRunDir(args)
    const runnerConfigPath = normalizePath(args.runner || 'pipelines/agent-runner.example.json')
    const dryRun = Boolean(args['dry-run'])
    await runAll({ runDirPath, runnerConfigPath, dryRun })
    return
  }

  throw new Error(`Unknown command: ${args.command}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
