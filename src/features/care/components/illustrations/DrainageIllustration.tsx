import type { SVGProps } from "react";

export function DrainageIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi sedimentasi saluran drainase dan aliran limpasan air"
      {...props}
    >
      {/* Background */}
      <rect width="320" height="180" rx="12" fill="#F0F9FF" />

      {/* Surface Soil & Road Curb */}
      <rect x="0" y="40" width="110" height="140" fill="#CBD5E1" />
      <rect x="210" y="40" width="110" height="140" fill="#CBD5E1" />
      <rect x="0" y="40" width="110" height="15" fill="#94A3B8" />
      <rect x="210" y="40" width="110" height="15" fill="#94A3B8" />

      {/* Drain Channel (Concrete U-Ditch) */}
      <path d="M110 50 V155 H210 V50" stroke="#64748B" strokeWidth="8" strokeLinecap="round" />
      <rect x="114" y="55" width="92" height="96" fill="#E2E8F0" />

      {/* Sedimentation (Mud/Sand accumulation at bottom) */}
      <path d="M114 125 Q160 115 206 125 V151 H114 Z" fill="#78350F" opacity="0.8" />
      <path d="M125 120 Q160 108 195 120" stroke="#92400E" strokeWidth="2" strokeDasharray="3 3" />

      {/* Water Level & Flow Arrows */}
      <rect x="114" y="90" width="92" height="35" fill="#38BDF8" opacity="0.65" />
      <path d="M140 105 L160 105 M155 100 L162 105 L155 110" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M165 105 L185 105 M180 100 L187 105 L180 110" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Trash / Debris Blockage */}
      <circle cx="185" cy="122" r="7" fill="#DC2626" opacity="0.8" />
      <rect x="170" y="118" width="10" height="6" rx="2" fill="#F59E0B" />
      <line x1="168" y1="124" x2="182" y2="114" stroke="#475569" strokeWidth="2" />

      {/* Warning Barrier / Clean Warning */}
      <circle cx="160" cy="35" r="14" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
      <path d="M160 27V34M160 39H160.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

