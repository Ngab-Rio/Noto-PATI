import type { SVGProps } from "react";

export function SidewalkIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi trotoar pejalan kaki dengan ubin pemandu disabilitas yang rusak"
      {...props}
    >
      {/* Background */}
      <rect width="320" height="180" rx="12" fill="#F8FAFC" />

      {/* Road adjacent */}
      <rect y="125" width="320" height="55" fill="#475569" />
      <line x1="0" y1="152" x2="320" y2="152" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="12 8" />

      {/* Curb Barrier */}
      <rect y="115" width="320" height="10" fill="#94A3B8" />

      {/* Sidewalk Paving */}
      <rect y="20" width="320" height="95" fill="#E2E8F0" />
      {/* Paving grid lines */}
      <line x1="0" y1="65" x2="320" y2="65" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="80" y1="20" x2="80" y2="115" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="160" y1="20" x2="160" y2="115" stroke="#CBD5E1" strokeWidth="1.5" />
      <line x1="240" y1="20" x2="240" y2="115" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Yellow Tactile Guiding Blocks (Straight Line Motif) */}
      <rect x="0" y="45" width="130" height="38" fill="#FACC15" rx="2" />
      {/* Guiding ridges */}
      <line x1="0" y1="52" x2="130" y2="52" stroke="#CA8A04" strokeWidth="2" />
      <line x1="0" y1="64" x2="130" y2="64" stroke="#CA8A04" strokeWidth="2" />
      <line x1="0" y1="76" x2="130" y2="76" stroke="#CA8A04" strokeWidth="2" />

      {/* Broken Gap Section / Damage Area */}
      <rect x="135" y="40" width="60" height="48" fill="#64748B" rx="4" />
      <ellipse cx="165" cy="65" rx="20" ry="12" fill="#334155" />
      <path d="M145 52 L152 75 L160 58 L175 72" stroke="#94A3B8" strokeWidth="2" />

      {/* Tactile block continuation */}
      <rect x="200" y="45" width="120" height="38" fill="#FACC15" rx="2" />
      <line x1="200" y1="52" x2="320" y2="52" stroke="#CA8A04" strokeWidth="2" />
      <line x1="200" y1="64" x2="320" y2="64" stroke="#CA8A04" strokeWidth="2" />
      <line x1="200" y1="76" x2="320" y2="76" stroke="#CA8A04" strokeWidth="2" />

      {/* Warning Alert Icon on Broken Path */}
      <circle cx="165" cy="30" r="12" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
      <path d="M165 24V29M165 33H165.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

