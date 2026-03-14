// TokenShrink Cross-Session Codebook Store
// Manages per-project codebook persistence and cross-session learning.
// Storage: ~/.claude/ts-codebooks/<projectname>.json
// Fire log: ~/.claude/.ts-term-fires.jsonl

import fs from 'fs';
import os from 'os';
import path from 'path';

const CODEBOOKS_DIR = path.join(os.homedir(), '.claude', 'ts-codebooks');
const FIRE_LOG_PATH = path.join(os.homedir(), '.claude', '.ts-term-fires.jsonl');

/**
 * Ensure the codebooks storage directory exists.
 */
function ensureDir() {
  try {
    if (!fs.existsSync(CODEBOOKS_DIR)) {
      fs.mkdirSync(CODEBOOKS_DIR, { recursive: true });
    }
  } catch { /* non-fatal */ }
}

/**
 * Sanitize a project name to a safe filename (alphanumeric + dash/underscore).
 */
function sanitizeProjectName(projectName) {
  return String(projectName).toLowerCase().replace(/[^a-z0-9_\-]/g, '_').slice(0, 64);
}

/**
 * Get the file path for a project's codebook.
 */
function codebookPath(projectName) {
  return path.join(CODEBOOKS_DIR, sanitizeProjectName(projectName) + '.json');
}

/**
 * Load the stored codebook for a project.
 * Returns an empty array if the project has no stored codebook yet.
 *
 * @param {string} projectName
 * @returns {Array<{abbr:string, term:string, fireCount:number, sessionsSeen:number, firstSeen:string, lastSeen:string, promoted:boolean}>}
 */
export function loadProjectCodebook(projectName) {
  try {
    const filePath = codebookPath(projectName);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.terms) ? data.terms : [];
  } catch {
    return [];
  }
}

/**
 * Load the full project store document (including metadata).
 * Returns a default structure if not found.
 */
function loadProjectStore(projectName) {
  try {
    const filePath = codebookPath(projectName);
    if (!fs.existsSync(filePath)) {
      return {
        _project: projectName,
        _updated: todayISO(),
        _sessions: 0,
        terms: [],
      };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return {
      _project: data._project ?? projectName,
      _updated: data._updated ?? todayISO(),
      _sessions: typeof data._sessions === 'number' ? data._sessions : 0,
      terms: Array.isArray(data.terms) ? data.terms : [],
    };
  } catch {
    return {
      _project: projectName,
      _updated: todayISO(),
      _sessions: 0,
      terms: [],
    };
  }
}

/**
 * Persist the project store document atomically.
 */
function saveProjectStore(projectName, store) {
  try {
    ensureDir();
    const filePath = codebookPath(projectName);
    const payload = JSON.stringify(store, null, 2);
    fs.writeFileSync(filePath, payload, 'utf8');
  } catch { /* non-fatal */ }
}

/**
 * Return today's date as YYYY-MM-DD (local time).
 */
function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Save/merge new term fires into the project's persistent codebook.
 * Increments fireCount for existing terms, creates new entries for new ones.
 * Bumps sessionsSeen once per call (represents one session's contribution).
 * Marks a term as promoted when fireCount >= 10 and sessionsSeen >= 3.
 *
 * @param {string} projectName
 * @param {Array<{abbr:string, term:string, fireCount:number}>} terms - terms from the current session
 */
export function recordSessionFires(projectName, terms) {
  if (!projectName || !Array.isArray(terms) || terms.length === 0) return;

  try {
    const store = loadProjectStore(projectName);
    const today = todayISO();

    // Build a lookup map by abbr for O(1) access
    const byAbbr = new Map(store.terms.map(t => [t.abbr, t]));

    for (const { abbr, term, fireCount } of terms) {
      if (!abbr || !term) continue;
      const count = typeof fireCount === 'number' && fireCount > 0 ? fireCount : 1;

      if (byAbbr.has(abbr)) {
        // Merge into existing entry — return new object (immutable pattern)
        const existing = byAbbr.get(abbr);
        const updated = {
          ...existing,
          fireCount: existing.fireCount + count,
          sessionsSeen: existing.sessionsSeen + 1,
          lastSeen: today,
          promoted: (existing.fireCount + count >= 10 && existing.sessionsSeen + 1 >= 3),
        };
        byAbbr.set(abbr, updated);
      } else {
        // New term — create fresh entry
        const entry = {
          abbr,
          term,
          fireCount: count,
          sessionsSeen: 1,
          firstSeen: today,
          lastSeen: today,
          promoted: false,
        };
        byAbbr.set(abbr, entry);
      }
    }

    const updatedStore = {
      _project: store._project,
      _updated: today,
      _sessions: store._sessions + 1,
      terms: Array.from(byAbbr.values()),
    };

    saveProjectStore(projectName, updatedStore);
  } catch { /* non-fatal */ }
}

/**
 * Get the "hall of fame" — terms that have fired enough to be considered proven.
 * Returns terms filtered to fireCount >= minFires, sorted by fireCount descending.
 *
 * @param {string} projectName
 * @param {number} [minFires=5]
 * @returns {Array<{abbr:string, term:string, fireCount:number, sessionsSeen:number, firstSeen:string, lastSeen:string, promoted:boolean}>}
 */
export function getHallOfFame(projectName, minFires = 5) {
  try {
    const terms = loadProjectCodebook(projectName);
    return terms
      .filter(t => t.fireCount >= minFires)
      .sort((a, b) => b.fireCount - a.fireCount);
  } catch {
    return [];
  }
}

/**
 * Get all terms for a project, sorted by composite score (fireCount × sessionsSeen).
 * Higher score = more valuable across more sessions.
 *
 * @param {string} projectName
 * @returns {Array<{abbr:string, term:string, fireCount:number, sessionsSeen:number, firstSeen:string, lastSeen:string, promoted:boolean}>}
 */
export function getProjectVocab(projectName) {
  try {
    const terms = loadProjectCodebook(projectName);
    return [...terms].sort((a, b) => {
      const scoreA = a.fireCount * a.sessionsSeen;
      const scoreB = b.fireCount * b.sessionsSeen;
      return scoreB - scoreA;
    });
  } catch {
    return [];
  }
}

/**
 * Prune dead weight — remove terms that have fired 0 times after appearing in 3+ sessions.
 * These terms exist in the codebook but never actually matched anything useful.
 *
 * @param {string} projectName
 * @returns {number} count of pruned terms
 */
export function pruneDeadWeight(projectName) {
  try {
    const store = loadProjectStore(projectName);
    const before = store.terms.length;

    const surviving = store.terms.filter(t => !(t.fireCount === 0 && t.sessionsSeen >= 3));

    if (surviving.length === before) return 0; // nothing to prune

    const updatedStore = {
      ...store,
      _updated: todayISO(),
      terms: surviving,
    };

    saveProjectStore(projectName, updatedStore);
    return before - surviving.length;
  } catch {
    return 0;
  }
}

/**
 * Process the fire log (~/.claude/.ts-term-fires.jsonl) and update project codebooks.
 * Groups entries by project, calls recordSessionFires for each project,
 * then CLEARS the fire log to prevent reprocessing.
 *
 * Called at session start from the session-init hook.
 *
 * @param {string} [fireLogPath] - override path (defaults to ~/.claude/.ts-term-fires.jsonl)
 * @returns {{ processed: number, projects: string[] }} summary of what was processed
 */
export function processFireLog(fireLogPath) {
  const logPath = fireLogPath ?? FIRE_LOG_PATH;
  const result = { processed: 0, projects: [] };

  try {
    if (!fs.existsSync(logPath)) return result;

    const raw = fs.readFileSync(logPath, 'utf8').trim();
    if (!raw) return result;

    const lines = raw.split('\n').filter(l => l.trim());
    if (lines.length === 0) return result;

    // Group fires by project — accumulate fireCount per project+abbr
    // Map structure: projectName → Map(abbr → {abbr, term, fireCount})
    const byProject = new Map();

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        const { project, abbr, term, count } = entry;
        if (!project || !abbr || !term) continue;

        if (!byProject.has(project)) {
          byProject.set(project, new Map());
        }

        const projectMap = byProject.get(project);
        if (projectMap.has(abbr)) {
          const existing = projectMap.get(abbr);
          projectMap.set(abbr, { ...existing, fireCount: existing.fireCount + (count ?? 1) });
        } else {
          projectMap.set(abbr, { abbr, term, fireCount: count ?? 1 });
        }

        result.processed++;
      } catch { /* skip malformed lines */ }
    }

    // Persist to each project's codebook
    for (const [projectName, termMap] of byProject) {
      const terms = Array.from(termMap.values());
      recordSessionFires(projectName, terms);
      result.projects.push(projectName);
    }

    // Clear the fire log — truncate to empty so we don't reprocess
    try {
      fs.writeFileSync(logPath, '', 'utf8');
    } catch { /* non-fatal — worst case we reprocess next session */ }

  } catch { /* non-fatal */ }

  return result;
}
