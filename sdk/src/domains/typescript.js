// TokenShrink Domain Rotor — TypeScript
// Pre-built vocabulary pack for TypeScript codebases.
// All entries satisfy: term.length - abbr.length >= 3

export const TYPESCRIPT_VOCAB = [
  // ── Type System ─────────────────────────────────────────────────────────
  { abbr: 'INT', term: 'interface' },
  { abbr: 'TYP', term: 'type' },
  { abbr: 'GEN', term: 'generic' },
  { abbr: 'ENM', term: 'enum' },
  { abbr: 'IMP', term: 'implements' },
  { abbr: 'EXT', term: 'extends' },
  { abbr: 'ABT', term: 'abstract' },
  { abbr: 'NMS', term: 'namespace' },
  { abbr: 'DFL', term: 'declare' },

  // ── Utility Types ───────────────────────────────────────────────────────
  { abbr: 'PTN', term: 'Partial<T>' },
  { abbr: 'RQN', term: 'Required<T>' },
  { abbr: 'PKN', term: 'Pick<T, K>' },
  { abbr: 'OMN', term: 'Omit<T, K>' },
  { abbr: 'RCN', term: 'Record<K, V>' },
  { abbr: 'RTN', term: 'ReturnType' },
  { abbr: 'PRM', term: 'Parameters' },
  { abbr: 'RO',  term: 'Readonly<T>' },

  // ── Async / Promises ────────────────────────────────────────────────────
  { abbr: 'PMS', term: 'Promise' },
  { abbr: 'APT', term: 'as Promise' },

  // ── Common Patterns ─────────────────────────────────────────────────────
  { abbr: 'DCR', term: 'decorator' },
  { abbr: 'NVR', term: 'never' },
  { abbr: 'UNK', term: 'unknown' },
  { abbr: 'AST', term: 'assert' },
  { abbr: 'SAT', term: 'satisfies' },
  { abbr: 'ASO', term: 'as const' },
  { abbr: 'NAR', term: 'narrow' },
];
