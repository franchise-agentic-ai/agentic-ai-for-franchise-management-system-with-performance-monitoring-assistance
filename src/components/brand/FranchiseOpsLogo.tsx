import React from 'react';
import { cn } from '../../lib/utils';
import logoPng from '../../assets/brand/franchiseops-ai-logo.png';

export interface FranchiseOpsLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number;
  glow?: boolean;
  animate?: boolean;
  alt?: string;
}

/**
 * Official FranchiseOps AI Brand Mark Component
 * Reusable unified identity component across all dashboards, headers, agent cards, and AI tools.
 */
export function FranchiseOpsLogo({
  className = 'w-5 h-5',
  size,
  glow = false,
  animate = false,
  alt = 'FranchiseOps AI Logo',
  style,
  ...props
}: FranchiseOpsLogoProps) {
  const customStyle: React.CSSProperties = {
    ...(size ? { width: size, height: size } : {}),
    ...style,
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none aspect-square',
        animate && 'animate-pulse',
        className
      )}
      style={customStyle}
      {...props}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 pointer-events-none -z-10"
        />
      )}
      <img
        src={logoPng}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none drop-shadow-xs"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export default FranchiseOpsLogo;
