import type { SVGProps } from "react";

export function StreetLightIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi tiang lampu jalan padam di area gelap dan peringatan bahaya listrik"
      {...props}
    >
      {/* Night Sky Background */}
      <rect width="320" height="180" rx="12" fill="#0F172A" />

      {/* Road & Ground */}
      <rect y="125" width="320" height="55" fill="#1E293B" />
      <line x1="0" y1="150" x2="320" y2="150" stroke="#475569" strokeWidth="2" strokeDasharray="16 10" />

      {/* Street Light Pole */}
      <path d="M70 145 V50 C70 30 110 25 130 38 L140 44" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
      <rect x="64" y="140" width="12" height="15" fill="#64748B" rx="1" />

      {/* Lamp Fixture (Unlit / Broken Bulb) */}
      <path d="M130 40 L155 48 L145 58 L125 48 Z" fill="#475569" />
      <circle cx="140" cy="52" r="4" fill="#64748B" />

      {/* Light Cone Indicator (Dashed line showing missed illumination) */}
      <path d="M140 54 L60 170 M140 54 L220 170" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Electrical Hazard Warning Badge */}
      <circle cx="210" cy="85" r="24" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
      {/* Lightning Bolt */}
      <path d="M211 72 L202 85 H211 L207 98 L220 83 H211 L215 72 Z" fill="#D97706" />

      {/* Keep Distance / No Touching Indicator */}
      <rect x="180" y="120" width="60" height="20" rx="4" fill="#EF4444" opacity="0.9" />
      <text x="210" y="134" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">JAGA JARAK</text>
    </svg>
  );
}

