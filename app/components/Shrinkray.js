export default function Shrinkray({ size = 120, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Shrinkray mascot"
    >
      {/* Body - intentionally tiny (it IS shrunken) */}
      <ellipse cx="55" cy="72" rx="18" ry="22" fill="#10b981" />
      <ellipse cx="55" cy="72" rx="15" ry="19" fill="#34d399" />

      {/* Big head (big head, small body) */}
      <circle cx="55" cy="42" r="24" fill="#10b981" />
      <circle cx="55" cy="42" r="21" fill="#34d399" />
      <circle cx="55" cy="42" r="18" fill="#10b981" />

      {/* Antenna */}
      <line x1="55" y1="18" x2="55" y2="10" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      <circle cx="55" cy="8" r="3" fill="#6ee7b7" />

      {/* Eyes - big and expressive */}
      <ellipse cx="46" cy="38" rx="6" ry="7" fill="white" />
      <ellipse cx="64" cy="38" rx="6" ry="7" fill="white" />
      <circle cx="48" cy="37" r="3" fill="#1e293b" />
      <circle cx="66" cy="37" r="3" fill="#1e293b" />
      {/* Eye highlights */}
      <circle cx="49.5" cy="35.5" r="1.5" fill="white" />
      <circle cx="67.5" cy="35.5" r="1.5" fill="white" />

      {/* Confident grin */}
      <path
        d="M 44 50 Q 55 58 66 50"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <ellipse cx="38" cy="46" rx="4" ry="2.5" fill="#6ee7b7" opacity="0.5" />
      <ellipse cx="72" cy="46" rx="4" ry="2.5" fill="#6ee7b7" opacity="0.5" />

      {/* Shrink ray gun (oversized, held forward) */}
      {/* Gun body */}
      <rect x="78" y="48" width="28" height="12" rx="3" fill="#64748b" />
      <rect x="80" y="50" width="24" height="8" rx="2" fill="#94a3b8" />
      {/* Gun barrel */}
      <rect x="106" y="50" width="10" height="8" rx="2" fill="#475569" />
      {/* Gun tip / emitter */}
      <circle cx="118" cy="54" r="4" fill="#10b981" />
      <circle cx="118" cy="54" r="2" fill="#6ee7b7" />
      {/* Gun handle */}
      <rect x="84" y="60" width="8" height="14" rx="2" fill="#475569" />
      {/* Gun details - energy lines */}
      <line x1="92" y1="52" x2="104" y2="52" stroke="#10b981" strokeWidth="1" opacity="0.6" />
      <line x1="92" y1="56" x2="104" y2="56" stroke="#10b981" strokeWidth="1" opacity="0.6" />

      {/* Right arm holding gun */}
      <path
        d="M 70 62 Q 76 58 82 54"
        stroke="#059669"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left arm (waving) */}
      <path
        d="M 38 62 Q 30 55 25 48"
        stroke="#059669"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Tiny legs */}
      <rect x="46" y="90" width="6" height="10" rx="3" fill="#059669" />
      <rect x="57" y="90" width="6" height="10" rx="3" fill="#059669" />
      {/* Feet */}
      <ellipse cx="49" cy="101" rx="5" ry="3" fill="#059669" />
      <ellipse cx="60" cy="101" rx="5" ry="3" fill="#059669" />

      {/* Body circuit lines */}
      <line x1="48" y1="68" x2="48" y2="76" stroke="#059669" strokeWidth="1" opacity="0.4" />
      <line x1="55" y1="66" x2="55" y2="80" stroke="#059669" strokeWidth="1" opacity="0.4" />
      <line x1="62" y1="68" x2="62" y2="76" stroke="#059669" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
