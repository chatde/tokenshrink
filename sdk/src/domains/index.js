// TokenShrink Domain Rotors — Auto-Detector
// Reads package.json (or filesystem signals) and returns the combined vocab
// for all detected tech stacks. Multiple rotors can activate simultaneously.

import { REACT_VOCAB } from './react.js';
import { NODE_VOCAB } from './node.js';
import { PYTHON_VOCAB } from './python.js';
import { SUPABASE_VOCAB } from './supabase.js';
import { SQL_VOCAB } from './sql.js';
import { TYPESCRIPT_VOCAB } from './typescript.js';
import { DOCKER_VOCAB } from './docker.js';
import { TAILWIND_VOCAB } from './tailwind.js';

/**
 * Registry mapping domain names to their vocab arrays.
 * Consumers can import this directly to access individual packs.
 */
export const DOMAIN_REGISTRY = {
  react: REACT_VOCAB,
  node: NODE_VOCAB,
  python: PYTHON_VOCAB,
  supabase: SUPABASE_VOCAB,
  sql: SQL_VOCAB,
  typescript: TYPESCRIPT_VOCAB,
  docker: DOCKER_VOCAB,
  tailwind: TAILWIND_VOCAB,
};

/**
 * Detect which domain rotors apply based on project signals.
 *
 * @param {string | object | null} packageJsonContent
 *   - String: raw package.json content
 *   - Object: already-parsed package.json
 *   - null: no package.json (Python-only project detection via filesystem)
 * @returns {{ vocab: Array<{abbr: string, term: string}>, domains: string[] }}
 */
export function getDomainVocab(packageJsonContent, cwd = null) {
  const detectedDomains = [];
  const pkg = parsePackageJson(packageJsonContent);

  if (pkg !== null) {
    const allDeps = collectAllDeps(pkg);

    // React / Next.js
    if (hasAny(allDeps, ['react', 'next', 'react-dom', 'react-router', 'react-router-dom'])) {
      detectedDomains.push('react');
    }

    // Node.js / Express
    if (hasAny(allDeps, ['express', 'fastify', 'koa', 'hapi', '@hapi/hapi'])) {
      detectedDomains.push('node');
    }

    // Supabase
    if (hasAny(allDeps, ['@supabase/supabase-js', '@supabase/ssr', '@supabase/auth-helpers-nextjs'])) {
      detectedDomains.push('supabase');
    }

    // SQL / Database ORMs
    if (hasAny(allDeps, ['pg', 'mysql', 'mysql2', 'prisma', 'drizzle-orm', 'knex', 'sequelize', 'typeorm', '@prisma/client'])) {
      detectedDomains.push('sql');
    }

    // TypeScript
    if (hasAny(allDeps, ['typescript', 'ts-node', 'tsx', 'tslib'])) {
      detectedDomains.push('typescript');
    }

    // Tailwind CSS
    if (hasAny(allDeps, ['tailwindcss', '@tailwindcss/typography', '@tailwindcss/forms', '@tailwindcss/postcss'])) {
      detectedDomains.push('tailwind');
    }
  } else {
    // No package.json — attempt filesystem-based Python detection
    if (hasPythonSignals(cwd)) {
      detectedDomains.push('python');
    }
  }

  // Docker detection via filesystem (works regardless of package.json)
  if (hasDockerSignals(cwd)) {
    detectedDomains.push('docker');
  }

  // Deduplicate vocab across all activated rotors
  const combined = deduplicateVocab(
    detectedDomains.flatMap((domain) => DOMAIN_REGISTRY[domain])
  );

  return { vocab: combined, domains: detectedDomains };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse package.json content into an object.
 * Returns null if content is null/undefined or fails to parse.
 *
 * @param {string | object | null} content
 * @returns {object | null}
 */
function parsePackageJson(content) {
  if (content === null || content === undefined) return null;
  if (typeof content === 'object') return content;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Collect all dependency names from dependencies, devDependencies, and peerDependencies.
 *
 * @param {object} pkg
 * @returns {Set<string>}
 */
function collectAllDeps(pkg) {
  const sections = [
    pkg.dependencies,
    pkg.devDependencies,
    pkg.peerDependencies,
  ];
  const names = new Set();
  for (const section of sections) {
    if (section && typeof section === 'object') {
      for (const name of Object.keys(section)) {
        names.add(name);
      }
    }
  }
  return names;
}

/**
 * Returns true if any of the given package names appear in the dep set.
 *
 * @param {Set<string>} deps
 * @param {string[]} candidates
 * @returns {boolean}
 */
function hasAny(deps, candidates) {
  return candidates.some((name) => deps.has(name));
}

/**
 * Attempt to detect Python project signals via the filesystem.
 * Only runs when no package.json is available.
 *
 * @returns {boolean}
 */
function hasPythonSignals(cwd = null) {
  try {
    const { existsSync } = require('fs');
    const { resolve } = require('path');
    const dir = cwd || process.cwd();
    return (
      existsSync(resolve(dir, 'requirements.txt')) ||
      existsSync(resolve(dir, 'setup.py')) ||
      existsSync(resolve(dir, 'pyproject.toml')) ||
      existsSync(resolve(dir, 'Pipfile'))
    );
  } catch {
    return false;
  }
}

/**
 * Detect Docker/DevOps signals via the filesystem.
 *
 * @returns {boolean}
 */
function hasDockerSignals(cwd = null) {
  try {
    const { existsSync } = require('fs');
    const { resolve } = require('path');
    const dir = cwd || process.cwd();
    return (
      existsSync(resolve(dir, 'Dockerfile')) ||
      existsSync(resolve(dir, 'docker-compose.yml')) ||
      existsSync(resolve(dir, 'docker-compose.yaml')) ||
      existsSync(resolve(dir, 'compose.yml')) ||
      existsSync(resolve(dir, 'compose.yaml'))
    );
  } catch {
    return false;
  }
}

/**
 * Remove duplicate abbr entries — first occurrence wins.
 *
 * @param {Array<{abbr: string, term: string}>} entries
 * @returns {Array<{abbr: string, term: string}>}
 */
function deduplicateVocab(entries) {
  const seen = new Set();
  const result = [];
  for (const entry of entries) {
    const key = entry.abbr;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  }
  return result;
}
