// TokenShrink Domain Rotor — SQL / Databases
// Pre-built vocabulary pack for SQL and database work.
// All entries satisfy: term.length - abbr.length >= 3

export const SQL_VOCAB = [
  // ── SQL Keywords ────────────────────────────────────────────────────────
  { abbr: 'SEL', term: 'SELECT' },
  { abbr: 'INS', term: 'INSERT INTO' },
  { abbr: 'UPD', term: 'UPDATE' },
  { abbr: 'DEL', term: 'DELETE FROM' },
  { abbr: 'CRE', term: 'CREATE TABLE' },
  { abbr: 'ALT', term: 'ALTER TABLE' },
  { abbr: 'DRP', term: 'DROP TABLE' },
  { abbr: 'JN',  term: 'INNER JOIN' },
  { abbr: 'LJN', term: 'LEFT JOIN' },
  { abbr: 'RJN', term: 'RIGHT JOIN' },
  { abbr: 'GBY', term: 'GROUP BY' },
  { abbr: 'OBY', term: 'ORDER BY' },
  { abbr: 'HAV', term: 'HAVING' },
  { abbr: 'SUB', term: 'SUBSTRING' },
  { abbr: 'CNT', term: 'COUNT(*)' },
  { abbr: 'COA', term: 'COALESCE' },
  { abbr: 'BTW', term: 'BETWEEN' },
  { abbr: 'EXS', term: 'EXISTS' },
  { abbr: 'CTE', term: 'WITH RECURSIVE' },

  // ── Schema ──────────────────────────────────────────────────────────────
  { abbr: 'FK',  term: 'FOREIGN KEY' },
  { abbr: 'PK',  term: 'PRIMARY KEY' },
  { abbr: 'NN',  term: 'NOT NULL' },
  { abbr: 'UNQ', term: 'UNIQUE' },

  // ── Databases / ORMs ────────────────────────────────────────────────────
  { abbr: 'PGN', term: 'PostgreSQL' },
  { abbr: 'MDB', term: 'MongoDB' },
  { abbr: 'RDS', term: 'Redis' },
  { abbr: 'PRIS', term: 'PrismaClient' },
  { abbr: 'DRZ', term: 'drizzle-orm' },
  { abbr: 'SEQ', term: 'Sequelize' },
  { abbr: 'TYO', term: 'TypeORM' },
];
