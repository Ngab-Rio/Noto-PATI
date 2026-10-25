import { Info } from 'lucide-react';
import { DISCLAIMERS } from '@/config/labels';

interface DataSimulationBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * DataSimulationBadge
 * Badge untuk menandai data simulasi/mock sesuai dengan disclaimer aplikasi
 * Digunakan pada featured reports di landing page
 */
export function DataSimulationBadge({ className = '', size = 'sm' }: DataSimulationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200 ${sizeClasses[size]} ${className}`}
      title={DISCLAIMERS.dataSimulation}
    >
      <Info className="h-3 w-3" />
      <span>Data Simulasi</span>
    </div>
  );
}
