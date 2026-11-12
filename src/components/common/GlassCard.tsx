import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { fadeInUp } from '../../utils/motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'frosted' | 'subtle' | 'elevated' | 'glow-cyan' | 'glow-indigo' | 'glow-amber' | 'glow-rose';
  className?: string;
  id?: string;
  animateIn?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'frosted',
  className = '',
  id,
  animateIn = true,
  ...props
}) => {
  const baseStyles = 'relative overflow-hidden rounded-3xl transition-all duration-300 backdrop-blur-2xl';
  let surfaceStyles = 'bg-slate-900/60 border border-white/12 shadow-xl shadow-black/30';
  let specularHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent';

  switch (variant) {
    case 'subtle':
      surfaceStyles = 'bg-slate-950/45 border border-white/8 shadow-lg shadow-black/20';
      break;
    case 'elevated':
      surfaceStyles = 'bg-slate-900/75 border border-white/18 shadow-2xl shadow-black/45';
      specularHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent';
      break;
    case 'glow-cyan':
      surfaceStyles = 'bg-gradient-to-b from-slate-900/75 to-slate-950/85 border border-cyan-500/35 shadow-xl shadow-cyan-950/30';
      specularHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-cyan-400/45 before:to-transparent';
      break;
    case 'glow-indigo':
      surfaceStyles = 'bg-gradient-to-b from-slate-900/75 to-slate-950/85 border border-indigo-500/35 shadow-xl shadow-indigo-950/30';
      specularHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-indigo-400/45 before:to-transparent';
      break;
    case 'glow-amber':
      surfaceStyles = 'bg-gradient-to-b from-slate-900/75 to-slate-950/85 border border-amber-500/35 shadow-xl shadow-amber-950/30';
      specularHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-amber-400/45 before:to-transparent';
      break;
    case 'glow-rose':
      surfaceStyles = 'bg-gradient-to-b from-slate-900/75 to-slate-950/85 border border-rose-500/35 shadow-xl shadow-rose-950/30';
      specularHighlight = 'before:absolute before:inset-x-0 before:top-0 before:h-[1.5px] before:bg-gradient-to-r before:from-transparent before:via-rose-400/45 before:to-transparent';
      break;
    default:
      surfaceStyles = 'bg-slate-900/60 border border-white/12 shadow-xl shadow-black/30';
  }

  return (
    <motion.div
      id={id}
      variants={animateIn ? fadeInUp : undefined}
      initial={animateIn ? 'hidden' : undefined}
      animate={animateIn ? 'visible' : undefined}
      exit={animateIn ? 'exit' : undefined}
      className={`${baseStyles} ${surfaceStyles} ${specularHighlight} p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
