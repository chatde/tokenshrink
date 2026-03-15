import { describe, it, expect } from 'vitest';
import { getDomainVocab, DOMAIN_REGISTRY } from '../sdk/src/domains/index.js';
import { REACT_VOCAB } from '../sdk/src/domains/react.js';
import { NODE_VOCAB } from '../sdk/src/domains/node.js';
import { PYTHON_VOCAB } from '../sdk/src/domains/python.js';
import { SUPABASE_VOCAB } from '../sdk/src/domains/supabase.js';

describe('DOMAIN_REGISTRY', () => {
  it('exports all 4 domains', () => {
    expect(Object.keys(DOMAIN_REGISTRY)).toEqual(['react', 'node', 'python', 'supabase']);
  });

  it('each domain has vocab entries', () => {
    for (const [domain, vocab] of Object.entries(DOMAIN_REGISTRY)) {
      expect(Array.isArray(vocab)).toBe(true);
      expect(vocab.length).toBeGreaterThan(0);
    }
  });

  it('each vocab entry has abbr and term', () => {
    for (const [domain, vocab] of Object.entries(DOMAIN_REGISTRY)) {
      for (const entry of vocab) {
        expect(typeof entry.abbr).toBe('string');
        expect(typeof entry.term).toBe('string');
        expect(entry.abbr.length).toBeGreaterThan(0);
        expect(entry.term.length).toBeGreaterThan(0);
      }
    }
  });

  it('abbreviations are shorter than terms', () => {
    for (const [domain, vocab] of Object.entries(DOMAIN_REGISTRY)) {
      for (const entry of vocab) {
        expect(entry.abbr.length).toBeLessThan(entry.term.length);
      }
    }
  });
});

describe('getDomainVocab()', () => {
  it('detects React from package.json with react dependency', () => {
    const pkg = { dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('react');
    expect(result.vocab.length).toBeGreaterThan(0);
  });

  it('detects React from Next.js dependency', () => {
    const pkg = { dependencies: { next: '^14.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('react');
  });

  it('detects Node/Express from express dependency', () => {
    const pkg = { dependencies: { express: '^4.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('node');
  });

  it('detects Node from fastify dependency', () => {
    const pkg = { dependencies: { fastify: '^4.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('node');
  });

  it('detects Supabase from @supabase/supabase-js', () => {
    const pkg = { dependencies: { '@supabase/supabase-js': '^2.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('supabase');
  });

  it('detects multiple domains simultaneously', () => {
    const pkg = {
      dependencies: {
        react: '^18.0.0',
        express: '^4.0.0',
        '@supabase/supabase-js': '^2.0.0',
      },
    };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('react');
    expect(result.domains).toContain('node');
    expect(result.domains).toContain('supabase');
  });

  it('deduplicates vocab across domains', () => {
    const pkg = {
      dependencies: {
        react: '^18.0.0',
        express: '^4.0.0',
        '@supabase/supabase-js': '^2.0.0',
      },
    };
    const result = getDomainVocab(pkg);

    const abbrs = result.vocab.map(v => v.abbr);
    const unique = new Set(abbrs);
    expect(abbrs.length).toBe(unique.size);
  });

  it('returns empty for unrecognized dependencies', () => {
    const pkg = { dependencies: { lodash: '^4.0.0', axios: '^1.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toEqual([]);
    expect(result.vocab).toEqual([]);
  });

  it('handles string package.json input', () => {
    const pkgStr = JSON.stringify({ dependencies: { react: '^18.0.0' } });
    const result = getDomainVocab(pkgStr);

    expect(result.domains).toContain('react');
  });

  it('handles null package.json (Python detection)', () => {
    // Without a real filesystem, Python won't be detected
    const result = getDomainVocab(null);
    expect(result.domains).toBeDefined();
    expect(Array.isArray(result.vocab)).toBe(true);
  });

  it('checks devDependencies too', () => {
    const pkg = { devDependencies: { react: '^18.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('react');
  });

  it('checks peerDependencies too', () => {
    const pkg = { peerDependencies: { react: '^18.0.0' } };
    const result = getDomainVocab(pkg);

    expect(result.domains).toContain('react');
  });
});

describe('Individual vocab packs', () => {
  it('React vocab has hooks and core entries', () => {
    const hookAbbrs = REACT_VOCAB.filter(v => v.term.startsWith('use')).map(v => v.abbr);
    expect(hookAbbrs.length).toBeGreaterThanOrEqual(5);

    const terms = REACT_VOCAB.map(v => v.term);
    expect(terms).toContain('useEffect');
    expect(terms).toContain('useState');
    expect(terms).toContain('useCallback');
  });

  it('Node vocab has Express and core entries', () => {
    const terms = NODE_VOCAB.map(v => v.term);
    expect(terms).toContain('middleware');
    expect(terms).toContain('EventEmitter');
    expect(terms).toContain('Promise.all');
  });

  it('Python vocab has data science and framework entries', () => {
    const terms = PYTHON_VOCAB.map(v => v.term);
    expect(terms).toContain('DataFrame');
    expect(terms).toContain('tensorflow');
    expect(terms).toContain('FastAPI');
  });

  it('Supabase vocab has auth and database entries', () => {
    const terms = SUPABASE_VOCAB.map(v => v.term);
    expect(terms).toContain('supabase');
    expect(terms).toContain('Row Level Security');
    expect(terms).toContain('createClient');
  });
});
