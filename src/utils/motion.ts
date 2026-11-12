import { Variants, Transition } from 'motion/react';

// Apple-style natural spring physics
export const appleSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
  mass: 0.8,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
  mass: 1,
};

export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

// Container stagger variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Fade In Up variant
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: appleSpring,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.985,
    transition: { duration: 0.2 },
  },
};

// Scale In variant
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: gentleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.15 },
  },
};

// Slide in from right (for drawers, side panels)
export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: snappySpring },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
};

// Page / Tab transition
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] },
  },
};
