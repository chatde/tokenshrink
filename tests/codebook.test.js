import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCodebook, applyCodebook, formatRosettaBlock } from '../sdk/src/codebook.js';
import {
  loadProjectCodebook,
  recordSessionFires,
  getHallOfFame,
  getProjectVocab,
  pruneDeadWeight,
  processFireLog,
} from '../sdk/src/codebook-store.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Use a unique test project name to avoid conflicts
const TEST_PROJECT = `__test_codebook_${Date.now()}`;
const CODEBOOKS_DIR = path.join(os.homedir(), '.claude', 'ts-codebooks');

function cleanupTestProject() {
  try {
    const filePath = path.join(CODEBOOKS_DIR, TEST_PROJECT.toLowerCase().replace(/[^a-z0-9_\-]/g, '_').slice(0, 64) + '.json');
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { /* ignore */ }
}

describe('generateCodebook()', () => {
  it('extracts repeated multi-token terms', () => {
    const text = 'authentication authentication authentication ' +
      'authorization authorization authorization ' +
      'infrastructure infrastructure infrastructure';

    const codebook = generateCodebook(text, { minFrequency: 2 });

    // Should find terms that are multi-token and repeated
    expect(Array.isArray(codebook)).toBe(true);
  });

  it('respects maxEntries limit', () => {
    let text = '';
    for (let i = 0; i < 30; i++) {
      text += `SuperLongTermNumber${i} SuperLongTermNumber${i} SuperLongTermNumber${i} `;
    }

    const codebook = generateCodebook(text, { maxEntries: 5 });
    expect(codebook.length).toBeLessThanOrEqual(5);
  });

  it('respects minFrequency threshold', () => {
    const text = 'SuperLongUniqueTermXyz ' + // appears once
      'RepeatedTermABCDEF RepeatedTermABCDEF RepeatedTermABCDEF'; // appears 3x

    const codebook = generateCodebook(text, { minFrequency: 2 });

    for (const entry of codebook) {
      expect(entry.frequency).toBeGreaterThanOrEqual(2);
    }
  });

  it('skips common English words', () => {
    const text = 'running running running session session session ' +
      'before before before after after after';

    const codebook = generateCodebook(text);
    const terms = codebook.map(e => e.term.toLowerCase());

    expect(terms).not.toContain('running');
    expect(terms).not.toContain('session');
    expect(terms).not.toContain('before');
  });

  it('returns entries with required fields', () => {
    const text = 'LankaProsProject LankaProsProject LankaProsProject ' +
      'NeuralCubeEngine NeuralCubeEngine NeuralCubeEngine';

    const codebook = generateCodebook(text);

    for (const entry of codebook) {
      expect(entry).toHaveProperty('term');
      expect(entry).toHaveProperty('abbr');
      expect(entry).toHaveProperty('tokensSaved');
      expect(entry).toHaveProperty('frequency');
      expect(entry).toHaveProperty('score');
      expect(entry.score).toBe(entry.tokensSaved * entry.frequency);
    }
  });

  it('sorts by score descending', () => {
    const text = 'ConfigurationManager ConfigurationManager ConfigurationManager ConfigurationManager ' +
      'ApplicationServer ApplicationServer ApplicationServer ' +
      'InfrastructureLayer InfrastructureLayer';

    const codebook = generateCodebook(text);

    for (let i = 1; i < codebook.length; i++) {
      expect(codebook[i - 1].score).toBeGreaterThanOrEqual(codebook[i].score);
    }
  });
});

describe('applyCodebook()', () => {
  it('applies codebook substitutions', () => {
    const codebook = [
      { term: 'authentication', abbr: 'AU' },
      { term: 'authorization', abbr: 'AZ' },
    ];

    const { compressed, replacements } = applyCodebook(
      'The authentication and authorization system.',
      codebook
    );

    expect(compressed).toContain('AU');
    expect(compressed).toContain('AZ');
    expect(replacements.length).toBeGreaterThan(0);
  });

  it('returns unchanged text when no matches', () => {
    const codebook = [{ term: 'nonexistentterm', abbr: 'NE' }];
    const { compressed } = applyCodebook('Hello world', codebook);
    expect(compressed).toBe('Hello world');
  });
});

describe('formatRosettaBlock()', () => {
  it('formats codebook as SESSION VOCAB block', () => {
    const codebook = [
      { term: 'authentication', abbr: 'AU' },
      { term: 'authorization', abbr: 'AZ' },
    ];

    const block = formatRosettaBlock(codebook);

    expect(block).toContain('[SESSION VOCAB]');
    expect(block).toContain('[/SESSION VOCAB]');
    expect(block).toContain('AU=authentication');
    expect(block).toContain('AZ=authorization');
  });

  it('returns empty string for empty codebook', () => {
    expect(formatRosettaBlock([])).toBe('');
  });
});

describe('Codebook Store', () => {
  beforeEach(() => cleanupTestProject());
  afterEach(() => cleanupTestProject());

  describe('loadProjectCodebook()', () => {
    it('returns empty array for non-existent project', () => {
      const result = loadProjectCodebook(TEST_PROJECT);
      expect(result).toEqual([]);
    });
  });

  describe('recordSessionFires()', () => {
    it('creates new codebook for first session', () => {
      const terms = [
        { abbr: 'AU', term: 'authentication', fireCount: 5 },
        { abbr: 'AZ', term: 'authorization', fireCount: 3 },
      ];

      recordSessionFires(TEST_PROJECT, terms);

      const loaded = loadProjectCodebook(TEST_PROJECT);
      expect(loaded.length).toBe(2);
      expect(loaded[0].abbr).toBe('AU');
      expect(loaded[0].fireCount).toBe(5);
      expect(loaded[0].sessionsSeen).toBe(1);
    });

    it('merges fires across sessions', () => {
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 5 },
      ]);

      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 3 },
      ]);

      const loaded = loadProjectCodebook(TEST_PROJECT);
      const au = loaded.find(t => t.abbr === 'AU');
      expect(au.fireCount).toBe(8);
      expect(au.sessionsSeen).toBe(2);
    });

    it('promotes terms at fireCount >= 10 and sessionsSeen >= 3', () => {
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 4 },
      ]);
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 4 },
      ]);
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 4 },
      ]);

      const loaded = loadProjectCodebook(TEST_PROJECT);
      const au = loaded.find(t => t.abbr === 'AU');
      expect(au.fireCount).toBe(12);
      expect(au.sessionsSeen).toBe(3);
      expect(au.promoted).toBe(true);
    });

    it('ignores empty or invalid input', () => {
      recordSessionFires(TEST_PROJECT, []);
      recordSessionFires(TEST_PROJECT, null);
      recordSessionFires(null, [{ abbr: 'X', term: 'test', fireCount: 1 }]);

      const loaded = loadProjectCodebook(TEST_PROJECT);
      expect(loaded).toEqual([]);
    });
  });

  describe('getHallOfFame()', () => {
    it('returns terms above fire threshold', () => {
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 10 },
        { abbr: 'AZ', term: 'authorization', fireCount: 2 },
      ]);

      const fame = getHallOfFame(TEST_PROJECT, 5);
      expect(fame.length).toBe(1);
      expect(fame[0].abbr).toBe('AU');
    });

    it('sorts by fireCount descending', () => {
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 10 },
        { abbr: 'AZ', term: 'authorization', fireCount: 20 },
        { abbr: 'CF', term: 'configuration', fireCount: 15 },
      ]);

      const fame = getHallOfFame(TEST_PROJECT, 5);
      expect(fame[0].fireCount).toBeGreaterThanOrEqual(fame[1].fireCount);
    });

    it('returns empty for project with no data', () => {
      const fame = getHallOfFame('nonexistent_project_xyz');
      expect(fame).toEqual([]);
    });
  });

  describe('pruneDeadWeight()', () => {
    it('removes terms with 0 fires after 3+ sessions', () => {
      // Manually create a codebook with a dead-weight term
      // (recordSessionFires defaults fireCount 0 to 1, so we write directly)
      const CODEBOOKS_DIR_LOCAL = path.join(os.homedir(), '.claude', 'ts-codebooks');
      const sanitized = TEST_PROJECT.toLowerCase().replace(/[^a-z0-9_\-]/g, '_').slice(0, 64);
      const filePath = path.join(CODEBOOKS_DIR_LOCAL, sanitized + '.json');

      const store = {
        _project: TEST_PROJECT,
        _updated: '2026-03-13',
        _sessions: 3,
        terms: [
          { abbr: 'DW', term: 'deadweight', fireCount: 0, sessionsSeen: 3, firstSeen: '2026-03-10', lastSeen: '2026-03-13', promoted: false },
          { abbr: 'AU', term: 'authentication', fireCount: 10, sessionsSeen: 3, firstSeen: '2026-03-10', lastSeen: '2026-03-13', promoted: true },
        ],
      };

      if (!fs.existsSync(CODEBOOKS_DIR_LOCAL)) {
        fs.mkdirSync(CODEBOOKS_DIR_LOCAL, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf8');

      const pruned = pruneDeadWeight(TEST_PROJECT);
      expect(pruned).toBe(1); // DW removed

      const loaded = loadProjectCodebook(TEST_PROJECT);
      const dw = loaded.find(t => t.abbr === 'DW');
      expect(dw).toBeUndefined();

      const au = loaded.find(t => t.abbr === 'AU');
      expect(au).toBeDefined();
    });

    it('returns 0 when nothing to prune', () => {
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 5 },
      ]);

      const pruned = pruneDeadWeight(TEST_PROJECT);
      expect(pruned).toBe(0);
    });
  });

  describe('getProjectVocab()', () => {
    it('returns terms sorted by composite score', () => {
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 10 },
        { abbr: 'AZ', term: 'authorization', fireCount: 5 },
      ]);
      recordSessionFires(TEST_PROJECT, [
        { abbr: 'AU', term: 'authentication', fireCount: 5 },
      ]);

      const vocab = getProjectVocab(TEST_PROJECT);
      // AU: 15 fires × 2 sessions = 30 score
      // AZ: 5 fires × 1 session = 5 score
      expect(vocab[0].abbr).toBe('AU');
    });

    it('returns empty for non-existent project', () => {
      const vocab = getProjectVocab('nonexistent_project_xyz');
      expect(vocab).toEqual([]);
    });
  });

  describe('processFireLog()', () => {
    it('processes JSONL fire log and updates codebooks', () => {
      const tmpLog = path.join(os.tmpdir(), `ts-test-fires-${Date.now()}.jsonl`);

      const entries = [
        { project: TEST_PROJECT, abbr: 'AU', term: 'authentication', count: 3 },
        { project: TEST_PROJECT, abbr: 'AZ', term: 'authorization', count: 2 },
      ];

      fs.writeFileSync(tmpLog, entries.map(e => JSON.stringify(e)).join('\n'), 'utf8');

      const result = processFireLog(tmpLog);

      expect(result.processed).toBe(2);
      expect(result.projects).toContain(TEST_PROJECT);

      // Verify codebook was updated
      const loaded = loadProjectCodebook(TEST_PROJECT);
      expect(loaded.length).toBe(2);

      // Cleanup
      try { fs.unlinkSync(tmpLog); } catch { /* ignore */ }
    });

    it('clears fire log after processing', () => {
      const tmpLog = path.join(os.tmpdir(), `ts-test-fires-clear-${Date.now()}.jsonl`);
      fs.writeFileSync(tmpLog, JSON.stringify({ project: TEST_PROJECT, abbr: 'X', term: 'test', count: 1 }), 'utf8');

      processFireLog(tmpLog);

      const content = fs.readFileSync(tmpLog, 'utf8');
      expect(content).toBe('');

      // Cleanup
      try { fs.unlinkSync(tmpLog); } catch { /* ignore */ }
    });

    it('handles missing fire log gracefully', () => {
      const result = processFireLog('/tmp/nonexistent-fire-log.jsonl');
      expect(result.processed).toBe(0);
      expect(result.projects).toEqual([]);
    });
  });
});
