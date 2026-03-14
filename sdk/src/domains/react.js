// TokenShrink Domain Rotor — React / Next.js
// Pre-built vocabulary pack for React and Next.js codebases.
// All entries satisfy: term.length - abbr.length >= 3
// No overlap with base dictionaries (COMMON, PHRASES, CODE_DOMAIN).

/**
 * React and Next.js specific vocabulary.
 * @type {Array<{abbr: string, term: string}>}
 */
export const REACT_VOCAB = [
  // ── React Hooks ──────────────────────────────────────────────────────────
  { abbr: 'UEF', term: 'useEffect' },           // 9 - 3 = 6 saved
  { abbr: 'UCB', term: 'useCallback' },          // 11 - 3 = 8 saved
  { abbr: 'UCX', term: 'useContext' },           // 10 - 3 = 7 saved
  { abbr: 'USC', term: 'useState' },             // 8 - 3 = 5 saved
  { abbr: 'UMM', term: 'useMemo' },              // 7 - 3 = 4 saved
  { abbr: 'URD', term: 'useReducer' },           // 10 - 3 = 7 saved
  { abbr: 'ULD', term: 'useLayoutEffect' },      // 15 - 3 = 12 saved ★
  { abbr: 'UIE', term: 'useImperativeHandle' },  // 19 - 3 = 16 saved ★
  { abbr: 'UDV', term: 'useDebugValue' },        // 13 - 3 = 10 saved ★

  // ── React Core ───────────────────────────────────────────────────────────
  { abbr: 'CTX', term: 'createContext' },        // 13 - 3 = 10 saved ★
  { abbr: 'FWD', term: 'forwardRef' },           // 10 - 3 = 7 saved
  { abbr: 'CMP', term: 'component' },            // 9 - 3 = 6 saved
  { abbr: 'PRD', term: 'props.children' },       // 14 - 3 = 11 saved ★
  { abbr: 'FCT', term: 'React.Fragment' },       // 14 - 3 = 11 saved ★
  { abbr: 'RDR', term: 'ReactDOM.render' },      // 15 - 3 = 12 saved ★
  { abbr: 'STL', term: 'StrictMode' },           // 10 - 3 = 7 saved
  { abbr: 'MZD', term: 'React.memo' },           // 10 - 3 = 7 saved
  { abbr: 'LZY', term: 'React.lazy' },           // 10 - 3 = 7 saved
  { abbr: 'SPN', term: 'Suspense' },             // 8 - 3 = 5 saved

  // ── Next.js ──────────────────────────────────────────────────────────────
  { abbr: 'SSP', term: 'getServerSideProps' },   // 18 - 3 = 15 saved ★
  { abbr: 'SSG', term: 'getStaticProps' },       // 14 - 3 = 11 saved ★
  { abbr: 'GSP', term: 'getStaticPaths' },       // 14 - 3 = 11 saved ★
  { abbr: 'NXR', term: 'useRouter' },            // 9 - 3 = 6 saved
  { abbr: 'NXL', term: 'next/link' },            // 9 - 3 = 6 saved
  { abbr: 'NXI', term: 'next/image' },           // 10 - 3 = 7 saved
];
