'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds, useful when several Reveal siblings enter together */
  delay?: number;
  /** Distance (px) the element travels while fading in */
  distance?: number;
  /** Entrance duration in seconds */
  duration?: number;
  as?: 'div' | 'section';
}

/**
 * Scroll-triggered fade + rise reveal used across the public site for a
 * restrained, editorial entrance motion. Respects prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
  duration = 0.7,
  as = 'div',
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const MotionTag = as === 'section' ? motion.section : motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
