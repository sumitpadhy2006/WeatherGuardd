import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0: initial, 1: logo, 2: tagline, 3: features, 4: exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),    // Show logo
      setTimeout(() => setPhase(2), 1800),   // Show tagline
      setTimeout(() => setPhase(3), 3200),   // Show features
      setTimeout(() => setPhase(4), 5500),   // Begin exit
      setTimeout(() => onComplete(), 6400),  // Done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Skip on click
  const handleSkip = useCallback(() => {
    setPhase(4);
    setTimeout(() => onComplete(), 600);
  }, [onComplete]);

  // Floating particle system
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 4,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #000000 70%)' }}
        >
          {/* Animated grid lines */}
          <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          {/* Floating particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                background: p.id % 3 === 0 ? '#06b6d4' : p.id % 3 === 1 ? '#3b82f6' : '#8b5cf6',
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, p.opacity, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Radial glow pulse behind logo */}
          <motion.div
            className="absolute"
            style={{
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Orbital ring */}
          <motion.div
            className="absolute border border-cyan-500/10 rounded-full"
            style={{ width: 320, height: 320 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400/60" />
          </motion.div>
          <motion.div
            className="absolute border border-blue-500/5 rounded-full"
            style={{ width: 450, height: 450 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-400/40" />
          </motion.div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
            
            {/* Shield / Logo icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: 0 } : {}}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="mb-6"
            >
              <div className="relative">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  {/* Shield shape */}
                  <path
                    d="M40 6 L68 20 C68 20 70 50 40 74 C10 50 12 20 12 20 Z"
                    fill="url(#shieldGrad)"
                    stroke="rgba(6,182,212,0.5)"
                    strokeWidth="1.5"
                  />
                  {/* Inner glow */}
                  <path
                    d="M40 14 L60 24 C60 24 62 48 40 66 C18 48 20 24 20 24 Z"
                    fill="url(#innerGrad)"
                    opacity="0.6"
                  />
                  {/* Globe lines */}
                  <circle cx="40" cy="38" r="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                  <path d="M28 38 C28 38 34 28 40 28 C46 28 52 38 52 38" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                  <path d="M28 38 C28 38 34 48 40 48 C46 48 52 38 52 38" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
                  <line x1="40" y1="26" x2="40" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="28" y1="38" x2="52" y2="38" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <defs>
                    <linearGradient id="shieldGrad" x1="40" y1="6" x2="40" y2="74" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#0891b2" />
                      <stop offset="100%" stopColor="#0c4a6e" />
                    </linearGradient>
                    <linearGradient id="innerGrad" x1="40" y1="14" x2="40" y2="66" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  style={{ borderRadius: '50%' }}
                />
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="mb-2"
            >
              <span
                className="text-sm font-mono tracking-[0.35em] uppercase"
                style={{ color: 'rgba(6,182,212,0.7)' }}
              >
                Welcome to
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="text-4xl min-[400px]:text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 40%, #3b82f6 70%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 40px rgba(6,182,212,0.3))',
              }}
            >
              WEATHERGUARD
            </motion.h1>

            {/* Divider line */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={phase >= 2 ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-48 h-px mb-6"
              style={{ background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)' }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed font-light"
            >
              Explore Earth's weather & space weather
              <br />
              <span className="text-slate-400">— all in one place.</span>
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {[
                { icon: '🌍', label: 'Planetary Intelligence' },
                { icon: '☀️', label: 'Atmosphere Core' },
                { icon: '🛰️', label: 'Space Weather' },
                { icon: '🔭', label: 'Sky & Space' },
                { icon: '⚠️', label: 'Earth Watch' },
              ].map((feat, i) => (
                <motion.div
                  key={feat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={phase >= 3 ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm"
                >
                  <span className="text-sm">{feat.icon}</span>
                  <span className="text-xs font-medium text-slate-300 tracking-wide">{feat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Enter prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.span
                className="text-xs font-mono text-slate-500 tracking-widest uppercase"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Click anywhere to enter
              </motion.span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                  <path d="M2 2 L10 10 L18 2" stroke="rgba(6,182,212,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          {/* Top corner scan lines */}
          <div className="absolute top-6 left-6 opacity-20">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-6 h-0.5 bg-cyan-400"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
                  style={{ originX: 0 }}
                />
              ))}
            </div>
          </div>
          <div className="absolute top-6 right-6 opacity-20">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-6 h-0.5 bg-cyan-400"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
                  style={{ originX: 1 }}
                />
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <motion.div
            className="absolute bottom-6 text-center"
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 0.3 } : {}}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] font-mono tracking-[0.3em] text-slate-500 uppercase">
              Planetary Intelligence System · v2.0
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
