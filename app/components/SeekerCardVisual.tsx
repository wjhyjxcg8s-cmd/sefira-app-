// Designed placeholder for the image slot of *seeker* listings ("Oda Arıyor" /
// "Alan Arıyor" — has_place=false). Seekers have no property photos by design, so
// instead of a dead gray box we show an illustrated "looking for a place" motif:
// a house/storefront under a magnifier, on the same palette as the seeker badge.
//
// Purely presentational and RTL-safe: it renders a centered, direction-neutral
// SVG scene, so it needs no translations and behaves identically in LTR and RTL.
// `className` is passed straight through to the root so it snaps to whatever size
// / corner radius the host card's image slot already uses (aspect-video card,
// 60×60 list thumbnail, full-width hero, …).

interface SeekerCardVisualProps {
  variant: "residential" | "commercial";
  className?: string;
}

export default function SeekerCardVisual({ variant, className = "" }: SeekerCardVisualProps) {
  const isCommercial = variant === "commercial";

  // Residential → blue/indigo (the "Oda Arıyor" badge family).
  // Commercial  → teal/emerald (the commercial "Alan Arıyor" family).
  const bg = isCommercial
    ? "from-emerald-100 via-teal-50 to-emerald-50"
    : "from-blue-100 via-sky-50 to-indigo-50";
  const primary = isCommercial ? "#14b8a6" : "#3b82f6"; // teal-500 / blue-500
  const deep = isCommercial ? "#0d9488" : "#4f46e5"; // teal-600 / indigo-600
  const soft = isCommercial ? "#ccfbf1" : "#dbeafe"; // teal-100 / blue-100

  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${bg} ${className}`}
    >
      {/* Faint backdrop — same line-art language as the seeker detail hero:
          skyline, a dashed "search route", and a few sparkles. Slices/fills the
          whole slot at any aspect ratio. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.16">
          <path d="M0 225 L0 198 L26 198 L26 180 L52 180 L52 192 L82 192 L82 168 L112 168 L112 188 L142 188 L142 176 L172 176 L172 196 L204 196 L204 172 L236 172 L236 190 L266 190 L266 176 L298 176 L298 196 L330 196 L330 182 L360 182 L360 194 L400 194 L400 225" />
          <path d="M56 138 c46 -30 108 14 152 -8 s84 -34 128 6" strokeDasharray="1 9" opacity="0.8" />
        </g>
        <g fill={primary} opacity="0.22">
          <circle cx="66" cy="52" r="2.5" />
          <circle cx="330" cy="64" r="2.5" />
          <circle cx="292" cy="34" r="2" />
          <circle cx="118" cy="30" r="2" />
        </g>
      </svg>

      {/* Centered motif — scales with the slot's height, always square. */}
      <svg
        className="relative h-3/5 max-h-[72px] min-h-[26px] w-auto drop-shadow-sm"
        viewBox="0 0 96 96"
        fill="none"
      >
        {/* ground shadow */}
        <ellipse cx="46" cy="84" rx="30" ry="4.5" fill={deep} opacity="0.12" />

        {isCommercial ? (
          <>
            {/* storefront body */}
            <rect x="22" y="44" width="48" height="36" rx="4" fill="#fff" stroke={primary} strokeWidth="3" />
            {/* awning */}
            <path d="M18 44 L18 36 Q18 32 22 32 L66 32 Q70 32 70 36 L70 44 Z" fill={soft} stroke={primary} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M28 32 L28 44 M40 32 L40 44 M52 32 L52 44 M64 32 L64 44" stroke={primary} strokeWidth="2" opacity="0.6" />
            {/* shop door + window */}
            <rect x="28" y="58" width="14" height="22" rx="1.5" fill={soft} stroke={primary} strokeWidth="2" />
            <rect x="50" y="58" width="14" height="12" rx="1.5" fill="#fff" stroke={primary} strokeWidth="2" />
          </>
        ) : (
          <>
            {/* roof fill + outline */}
            <path d="M20 46 L46 24 L72 46 Z" fill={soft} />
            <path d="M16 47 L46 22 L76 47" fill="none" stroke={primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* house body */}
            <rect x="24" y="46" width="44" height="34" rx="4" fill="#fff" stroke={primary} strokeWidth="3" />
            {/* door + window */}
            <rect x="40" y="60" width="13" height="20" rx="1.5" fill={soft} stroke={primary} strokeWidth="2" />
            <rect x="29" y="54" width="9" height="9" rx="1.5" fill="#fff" stroke={primary} strokeWidth="2" />
          </>
        )}

        {/* magnifier — the "searching" cue, overlapping the lower-right corner */}
        <circle cx="66" cy="64" r="15" fill="#fff" stroke={deep} strokeWidth="4" />
        <circle cx="66" cy="64" r="15" fill={primary} opacity="0.1" />
        <path d="M60 60 a7 7 0 0 1 6 -4" stroke={deep} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <line x1="77" y1="75" x2="88" y2="86" stroke={deep} strokeWidth="5.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
