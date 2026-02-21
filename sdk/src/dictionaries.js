// Domain-specific abbreviation dictionaries
// Each maps common long words/phrases to short codes
//
// v2.0 — Token-aware: every entry verified to save ≥1 token with cl100k_base.
// Zero-savings and negative-savings entries removed.
// See scripts/generate-token-costs.mjs for verification.

// Abbreviations that ALL LLMs understand without a Rosetta entry
// These save tokens without any decoder overhead
export const UNIVERSAL_ABBREVIATIONS = new Set([
  'fn', 'var', 'const', 'param', 'arg', 'ret', 'str', 'num', 'bool', 'int',
  'arr', 'obj', 'db', 'cfg', 'auth', 'app', 'env', 'dev', 'prod', 'repo',
  'dir', 'msg', 'req', 'res', 'info', 'desc', 'spec', 'docs', 'impl', 'init',
  'temp', 'max', 'min', 'admin', 'mgmt', 'perf', 'ref', 'prop', 'props',
  'attr', 'idx', 'len', 'prev', 'curr', 'tmp', 'calc', 'gen', 'src', 'mem',
  'ctx', 'cb', 'mw', 'txn', 'conn', 'nav', 'sub', 'cert', 'dep', 'deps',
  'pkg', 'lib', 'libs', 'util', 'utils', 'sync', 'async', 'exec', 'cmd',
  'args', 'opt', 'ops', 'id', 'ids', 'e.g.', 'i.e.', 'etc.', 'k8s',
]);

export const COMMON = {
  // Multi-token words → single-token abbreviations (verified savings with cl100k_base)
  'specification': 'spec',     // 2t → 1t
  'asynchronous': 'async',     // 2t → 1t
  'synchronize': 'sync',       // 2t → 1t
  'significant': 'major',      // 2t → 1t
  'identifiers': 'ids',        // 2t → 1t

  // Long words → shorter real words (saves tokens)
  'comprehensive': 'full',     // 2t → 1t
  'specifically': 'esp',       // 2t → 1t
  'functionality': 'features', // 2t → 1t
  'additionally': 'also',      // 2t → 1t
  'consequently': 'so',        // 3t → 1t
  'automatically': 'auto',     // 2t → 1t
  'immediately': 'now',        // 2t → 1t
  'successfully': 'OK',        // 2t → 1t
  'consistently': 'always',    // 3t → 1t
  'fundamentally': 'at core',  // 3t → 2t
  'alternatively': 'or',       // 2t → 1t
  'respectively': 'each',      // 2t → 1t
  'consideration': 'factor',   // 2t → 1t
};

export const PHRASES = {
  // Verbose → concise (sorted roughly by frequency in prompts)
  // All phrase entries verified to save tokens — multi-word → fewer tokens
  'you should': '',
  'you must': '',
  'please make sure to': '',
  'please ensure that': 'ensure',
  'please note that': 'note:',
  'it is important to': '',
  'it is essential to': '',
  'it is necessary to': '',
  'it is recommended to': '',
  'make sure that': 'ensure',
  'make sure to': 'ensure',
  'be sure to': '',
  'keep in mind that': 'note:',
  'take into account': 'consider',
  'take into consideration': 'consider',
  'in order to': 'to',
  'for the purpose of': 'to',
  'with the goal of': 'to',
  'with the intention of': 'to',
  'so as to': 'to',
  'due to the fact that': 'because',
  'owing to the fact that': 'because',
  'for the reason that': 'because',
  'on account of': 'because',
  'as a result of': 'from',
  'as a consequence of': 'from',
  'in the event that': 'if',
  'in the case that': 'if',
  'in the case of': 'for',
  'at this point in time': 'now',
  'at the present time': 'now',
  'at the current time': 'now',
  'in the process of': 'currently',
  'on the other hand': 'however',
  'in addition to': 'also',
  'in addition': 'also',
  'as well as': '&',
  'along with': '&',
  'together with': '&',
  'with respect to': 're:',
  'with regard to': 're:',
  'in regard to': 're:',
  'in terms of': 're:',
  'in relation to': 're:',
  'when it comes to': 're:',
  'in accordance with': 'per',
  'in compliance with': 'per',
  'at the same time': 'simultaneously',
  'prior to': 'before',
  'subsequent to': 'after',
  'in spite of': 'despite',
  'regardless of': 'despite',
  'each and every': 'every',
  'first and foremost': 'first',
  'null and void': 'void',
  'unless and until': 'until',
  'a large number of': 'many',
  'a significant number of': 'many',
  'a wide variety of': 'various',
  'a wide range of': 'various',
  'a variety of': 'various',
  'a number of': 'several',
  'a lot of': 'many',
  'on behalf of': 'for',
  // Removed: 'for example' → 'e.g.' (WORSE: 2t→3t)
  // Removed: 'that is' → 'i.e.' (WORSE: 2t→3t)
  // Removed: 'in other words' → 'i.e.' (ZERO: 3t→3t)
  'and so on': 'etc.',
  'and so forth': 'etc.',
  'et cetera': 'etc.',
  // Removed: 'such as' → 'e.g.' (WORSE: 2t→3t)
  // Additional filler phrases
  'you need to': '',
  'you will need to': '',
  'you have to': '',
  'it is crucial to': '',
  'it is critical to': '',
  'it is vital to': '',
  'it is also important to': '',
  'it is also essential to': '',
  'when dealing with': 'for',
  'when working with': 'for',
  'step by step': 'stepwise',
  'at all times': 'always',
  'on a regular basis': 'regularly',
  'as much as possible': 'maximally',
  'with the help of': 'using',
  // Prompt-specific filler
  'when responding to': 'for',
  'when answering': 'for',
  'your primary responsibility is to': '',
  'your main task is to': '',
  'your goal is to': '',
  'you are tasked with': '',
  'you are responsible for': '',
  'you are expected to': '',
  'always consider': 'consider',
  'always remember to': '',
  'remember to': '',
  'do not forget to': '',
  'be aware of': 'note',
  'be aware that': 'note:',
  'if you are unsure': 'if unsure',
  'if you are not sure': 'if unsure',
  'if you do not know': 'if unknown',
  'rather than': 'vs',
  'as opposed to': 'vs',
  'instead of': 'vs',
  'in this case': 'here',
  'in that case': 'then',
  'at this point': 'now',
  'at that point': 'then',
  'the fact that': 'that',
  'it should be noted that': 'note:',
  'it is worth noting that': 'note:',
  'it is important to note that': 'note:',
  'there is a need to': '',
  'there is a possibility that': 'possibly',
  'it is possible that': 'possibly',
  'is able to': 'can',
  'is unable to': 'cannot',
  'has the ability to': 'can',
  'does not have the ability to': 'cannot',
  'in a manner that': 'so that',
  // Removed: 'to the extent that' → 'insofar as' (ZERO: 4t→4t)
  'for the sake of': 'for',
  'on the basis of': 'based on',
  'by means of': 'via',
  'by way of': 'via',
  'with the exception of': 'except',
  'provided that': 'if',
  'assuming that': 'if',
  'given that': 'since',
};

export const CODE_DOMAIN = {
  // Only entries that save tokens (verified with cl100k_base)
  'infrastructure': 'infra',       // 2t → 1t
  'inheritance': 'inherit',        // 2t → 1t
  'polymorphism': 'poly',          // 3t → 1t
  // Removed zero-savings: endpoint, middleware, controller, repository,
  //   interface, abstract, constructor, destructor, encapsulation,
  //   serialization, deserialization, microservice
  // Removed WORSE: kubernetes → k8s (2t→3t)
};

export const MEDICAL_DOMAIN = {
  // Only entries that save tokens (verified with cl100k_base)
  'prescription': 'Rx',     // 2t → 1t
  'diagnosis': 'dx',        // 2t → 1t
  'treatment': 'tx',        // 2t → 1t
  'symptoms': 'sx',         // 2t → 1t
  'examination': 'exam',    // 2t → 1t
  'laboratory': 'lab',      // 2t → 1t
  'medication': 'med',      // 2t → 1t
  // Removed zero-savings: patient, temperature, medications
  // Removed WORSE: hospital → hosp (1t→2t)
};

export const LEGAL_DOMAIN = {
  // Only entries that save tokens (verified with cl100k_base)
  'plaintiff': 'pl',        // 3t → 1t
  'defendant': 'def',       // 2t → 1t
  'whereas': 'since',       // 2t → 1t
  'pursuant to': 'under',   // 4t → 1t
  // Removed zero-savings: paragraph, subsection, jurisdiction, hereinafter,
  //   aforementioned, notwithstanding, hereby, therein, thereof
  // Removed WORSE: agreement → agmt (1t→2t)
};

export const BUSINESS_DOMAIN = {
  // Only entries that save tokens (verified with cl100k_base)
  'stakeholder': 'SH',        // 2t → 1t
  'infrastructure': 'infra',  // 2t → 1t
  'quarterly': 'Q',           // 2t → 1t
  // Removed zero-savings: deliverable, implementation, organization, department, approximately
  // Removed WORSE: management → mgmt (1t→2t), requirements → reqs (1t→2t)
};

export const ALL_DOMAINS = {
  common: COMMON,
  phrases: PHRASES,
  code: CODE_DOMAIN,
  medical: MEDICAL_DOMAIN,
  legal: LEGAL_DOMAIN,
  business: BUSINESS_DOMAIN,
};

export function getDictionary(domain) {
  if (domain === 'auto' || !domain) {
    return { ...COMMON, ...PHRASES };
  }
  const domainDict = ALL_DOMAINS[domain];
  return domainDict ? { ...COMMON, ...PHRASES, ...domainDict } : { ...COMMON, ...PHRASES };
}
