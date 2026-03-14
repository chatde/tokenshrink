// TokenShrink Domain Rotor — Python
// Pre-built vocabulary pack for Python codebases (data science, Django, FastAPI).
// All entries satisfy: term.length - abbr.length >= 3
// No overlap with base dictionaries (COMMON, PHRASES, CODE_DOMAIN).

/**
 * Python specific vocabulary.
 * @type {Array<{abbr: string, term: string}>}
 */
export const PYTHON_VOCAB = [
  // ── Data Science / Libraries ──────────────────────────────────────────────
  { abbr: 'DF',  term: 'DataFrame' },              // 9 - 2 = 7 saved ★
  { abbr: 'MPL', term: 'matplotlib' },             // 10 - 3 = 7 saved ★
  { abbr: 'PLT', term: 'plt.show' },               // 8 - 3 = 5 saved
  { abbr: 'TF',  term: 'tensorflow' },             // 10 - 2 = 8 saved ★
  { abbr: 'TRF', term: 'transformers' },           // 12 - 3 = 9 saved ★
  { abbr: 'SKL', term: 'sklearn' },                // 7 - 3 = 4 saved
  { abbr: 'SCL', term: 'StandardScaler' },         // 13 - 3 = 10 saved ★
  { abbr: 'VNV', term: 'virtualenv' },             // 10 - 3 = 7 saved
  { abbr: 'RQR', term: 'requirements.txt' },       // 16 - 3 = 13 saved ★

  // ── Django ────────────────────────────────────────────────────────────────
  { abbr: 'MDL', term: 'models.Model' },           // 12 - 3 = 9 saved ★
  { abbr: 'SRL', term: 'serializers.Serializer' }, // 22 - 3 = 19 saved ★
  { abbr: 'VWS', term: 'views.py' },               // 8 - 3 = 5 saved
  { abbr: 'ORM', term: 'QuerySet' },               // 8 - 3 = 5 saved
  { abbr: 'MIG', term: 'makemigrations' },         // 14 - 3 = 11 saved ★
  { abbr: 'ADM', term: 'admin.site.register' },    // 19 - 3 = 16 saved ★

  // ── FastAPI ───────────────────────────────────────────────────────────────
  { abbr: 'FAS', term: 'FastAPI' },                // 7 - 3 = 4 saved
  { abbr: 'PDM', term: 'pydantic' },               // 8 - 3 = 5 saved
  { abbr: 'DEP', term: 'Depends' },                // 7 - 3 = 4 saved
  { abbr: 'BDY', term: 'BaseModel' },              // 9 - 3 = 6 saved

  // ── Python General ────────────────────────────────────────────────────────
  { abbr: 'CLS', term: '__init__' },               // 8 - 3 = 5 saved
  { abbr: 'PEP', term: 'pyproject.toml' },         // 14 - 3 = 11 saved ★
];
