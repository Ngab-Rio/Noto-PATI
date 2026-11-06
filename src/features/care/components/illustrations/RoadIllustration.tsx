import type { SVGProps } from "react";

export function RoadIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi bahaya lubang jalan aspal dan penanda visual darurat"
      {...props}
    >
      {/* Background Sky / Horizon */}
      <rect width="320" height="180" rx="12" fill="#EBF3FA" />
      
      {/* Ground Grass */}
      <rect y="80" width="320" height="100" fill="#D9E6D5" />

      {/* Road Perspective */}
      <path d="M120 70 L200 70 L280 180 L40 180 Z" fill="#475569" />

      {/* Road Center Dashes */}
      <line x1="160" y1="75" x2="160" y2="90" stroke="#FBBF24" strokeWidth="3" strokeDasharray="6 4" />
      <line x1="160" y1="105" x2="160" y2="135" stroke="#FBBF24" strokeWidth="4" />
      <line x1="160" y1="150" x2="160" y2="180" stroke="#FBBF24" strokeWidth="6" />

      {/* Road Shoulder */}
      <path d="M40 180 L120 70 L115 70 L30 180 Z" fill="#94A3B8" />
      <path d="M280 180 L200 70 L205 70 L290 180 Z" fill="#94A3B8" />

      {/* Pothole with depth (Water puddling) */}
      <ellipse cx="120" cy="140" rx="36" ry="14" fill="#1E293B" />
      <ellipse cx="118" cy="142" rx="30" ry="10" fill="#334155" />
      <ellipse cx="116" cy="143" rx="22" ry="6" fill="#3B82F6" opacity="0.6" />

      {/* Warning Hazard Cone / Visual Marker */}
      <path d="M165 145 L175 105 L185 145 Z" fill="#EA580C" />
      <path d="M168 132 L172 118 L178 118 L182 132 Z" fill="#FFFFFF" />
      <rect x="160" y="145" width="30" height="4" rx="2" fill="#C2410C" />

      {/* Caution Icon */}
      <circle cx="118" cy="115" r="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      <path d="M118 109V115M118 119H118.01" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

