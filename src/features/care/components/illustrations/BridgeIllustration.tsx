import type { SVGProps } from "react";

export function BridgeIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi struktur jembatan sungai dengan gerusan pilar dan retakan oprit"
      {...props}
    >
      {/* Background Sky */}
      <rect width="320" height="180" rx="12" fill="#E0F2FE" />

      {/* River Water Surface */}
      <rect y="110" width="320" height="70" fill="#0284C7" />
      <path d="M0 120 Q80 115 160 125 T320 120 V180 H0 Z" fill="#0369A1" opacity="0.8" />
      <path d="M0 145 Q80 140 160 150 T320 145 V180 H0 Z" fill="#075985" opacity="0.9" />

      {/* River banks / Embankment */}
      <path d="M0 50 L65 110 H0 Z" fill="#94A3B8" />
      <path d="M320 50 L255 110 H320 Z" fill="#94A3B8" />

      {/* Bridge Deck / Girder Slab */}
      <rect x="20" y="45" width="280" height="14" rx="2" fill="#475569" />
      <rect x="15" y="40" width="290" height="5" fill="#334155" />

      {/* Bridge Railing */}
      <line x1="20" y1="30" x2="300" y2="30" stroke="#94A3B8" strokeWidth="2.5" />
      <line x1="60" y1="30" x2="60" y2="40" stroke="#94A3B8" strokeWidth="2" />
      <line x1="120" y1="30" x2="120" y2="40" stroke="#94A3B8" strokeWidth="2" />
      <line x1="160" y1="30" x2="160" y2="40" stroke="#94A3B8" strokeWidth="2" />
      <line x1="200" y1="30" x2="200" y2="40" stroke="#94A3B8" strokeWidth="2" />
      <line x1="260" y1="30" x2="260" y2="40" stroke="#94A3B8" strokeWidth="2" />

      {/* Bridge Pier Pillars (Pilar Jembatan) */}
      <rect x="145" y="58" width="30" height="95" fill="#64748B" rx="3" />
      
      {/* Structural Crack on Pier */}
      <path d="M152 75 L160 88 L155 100 L163 115" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />

      {/* Water Scouring Swirls around pillar */}
      <path d="M115 138 C130 132 142 145 145 150" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M175 150 C180 142 195 135 210 140" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Bridge Weight Warning Badge */}
      <circle cx="160" cy="20" r="14" fill="#FEF2F2" stroke="#DC2626" strokeWidth="2" />
      <text x="160" y="24" textAnchor="middle" fill="#DC2626" fontSize="11" fontWeight="bold">MST</text>
    </svg>
  );
}

