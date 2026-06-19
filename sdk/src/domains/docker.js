// TokenShrink Domain Rotor — Docker / DevOps
// Pre-built vocabulary pack for Docker and container orchestration.
// All entries satisfy: term.length - abbr.length >= 3

export const DOCKER_VOCAB = [
  // ── Docker ──────────────────────────────────────────────────────────────
  { abbr: 'DKF', term: 'Dockerfile' },
  { abbr: 'DCP', term: 'docker-compose' },
  { abbr: 'DCY', term: 'docker-compose.yml' },
  { abbr: 'CON', term: 'container' },
  { abbr: 'IMG', term: 'image' },
  { abbr: 'REG', term: 'registry' },
  { abbr: 'VOL', term: 'volume' },
  { abbr: 'BLD', term: 'build' },

  // ── Kubernetes ──────────────────────────────────────────────────────────
  { abbr: 'KNS', term: 'namespace' },
  { abbr: 'DPY', term: 'deployment' },
  { abbr: 'ING', term: 'ingress' },
  { abbr: 'CFM', term: 'configmap' },
  { abbr: 'SCR', term: 'secret' },

  // ── Infrastructure as Code ──────────────────────────────────────────────
  { abbr: 'TFM', term: 'terraform' },
  { abbr: 'HLM', term: 'helm' },
  { abbr: 'ANS', term: 'ansible' },
  { abbr: 'CFL', term: 'cloudformation' },
];
