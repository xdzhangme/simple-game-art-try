import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_FILE = fileURLToPath(new URL('../src/data/use-cases.json', import.meta.url));
const LANGS = ['en', 'nl'];
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const DEPARTMENTS = ['finance', 'hr', 'sales', 'marketing', 'it', 'operations', 'legal', 'general'];
export const WORKLOADS = ['low', 'medium', 'high'];
export const EXECUTION_MODES = ['chat', 'local', 'cloud'];
export const COLLABORATION_SCOPES = ['individual', 'team', 'organization'];

const isStr = (v) => typeof v === 'string' && v.trim() !== '';

function checkText(errors, where, v) {
  if (!v || typeof v !== 'object') return errors.push(`${where}: missing bilingual text {en, nl}`);
  for (const l of LANGS) if (!isStr(v[l])) errors.push(`${where}.${l}: missing or empty`);
}

function checkSteps(errors, where, v) {
  if (!v || typeof v !== 'object') return errors.push(`${where}: missing bilingual step list {en, nl}`);
  for (const l of LANGS) {
    if (!Array.isArray(v[l]) || v[l].length === 0 || !v[l].every(isStr)) {
      errors.push(`${where}.${l}: must be a non-empty array of non-empty strings`);
    }
  }
}

export function validate(data) {
  const errors = [];
  if (!Array.isArray(data)) return ['root: must be an array of use cases'];
  if (data.length === 0) errors.push('root: must contain at least one use case');
  const seen = new Set();
  const seenRewards = new Map();

  data.forEach((uc, i) => {
    const at = `[${i}]${uc && isStr(uc.id) ? ` (${uc.id})` : ''}`;
    if (!uc || typeof uc !== 'object') return errors.push(`${at}: must be an object`);

    if (!isStr(uc.id)) errors.push(`${at}.id: missing`);
    else {
      if (!ID_PATTERN.test(uc.id)) errors.push(`${at}.id: must be lowercase kebab-case`);
      if (seen.has(uc.id)) errors.push(`${at}.id: duplicate id "${uc.id}"`);
      seen.add(uc.id);
    }
    if (!isStr(uc.icon)) errors.push(`${at}.icon: missing`);
    if (!isStr(uc.rewardId)) errors.push(`${at}.rewardId: missing`);
    else {
      if (!ID_PATTERN.test(uc.rewardId)) errors.push(`${at}.rewardId: must be lowercase kebab-case`);
      if (seenRewards.has(uc.rewardId)) {
        errors.push(`${at}.rewardId: "${uc.rewardId}" already used by ${seenRewards.get(uc.rewardId)}`);
      } else seenRewards.set(uc.rewardId, uc.id);
    }

    for (const f of ['title', 'summary', 'prompt', 'fitIntoWork', 'howItWorks', 'whyCowork']) {
      checkText(errors, `${at}.${f}`, uc[f]);
    }
    checkSteps(errors, `${at}.seeItRun`, uc.seeItRun);

    const m = uc.meta;
    if (!m || typeof m !== 'object') return errors.push(`${at}.meta: missing`);
    const oneOf = (k, list) => {
      if (!list.includes(m[k])) errors.push(`${at}.meta.${k}: must be one of ${list.join(', ')}`);
    };
    oneOf('department', DEPARTMENTS);
    oneOf('workload', WORKLOADS);
    oneOf('executionMode', EXECUTION_MODES);
    oneOf('collaborationScope', COLLABORATION_SCOPES);
    if (!isStr(m.role)) errors.push(`${at}.meta.role: missing`);
    if (!isStr(m.capability)) errors.push(`${at}.meta.capability: missing`);
    if (!Number.isInteger(m.credits) || m.credits < 0) errors.push(`${at}.meta.credits: must be a non-negative integer`);
  });
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const file = process.argv[2] ?? DEFAULT_FILE;
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${file}: ${e.message}`);
    process.exit(1);
  }
  const errors = validate(data);
  if (errors.length) {
    console.error(`Use case validation failed (${errors.length} problem${errors.length > 1 ? 's' : ''}):`);
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
  console.log(`OK: ${data.length} use cases valid.`);
}
