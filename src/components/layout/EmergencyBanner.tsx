import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface EmergencyBannerProps {
  threatTitle: string;
  threatDetails: string;
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  threatTitle,
  threatDetails,
  onDismiss,
}) => {
  return (
    <div className="bg-red-950/90 border-b border-red-500/50 text-red-100 px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm animate-fadeIn shadow-lg shadow-red-950/40">
      <div className="flex items-center gap-2.5">
        <AlertTriangle size={17} className="text-red-400 shrink-0 animate-bounce" />
        <span className="font-bold uppercase tracking-wider text-red-300 font-mono">
          [{threatTitle}]
        </span>
        <span className="text-red-200 line-clamp-1">{threatDetails}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-red-300 hover:text-white rounded hover:bg-red-900/50 transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};
