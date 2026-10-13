'use client';

import { useRef, type ReactNode, type PointerEvent } from 'react';

/** Small, event-driven depth effect; no continuous animation loop. */
export default function DepthSurface({ children, className = '', strength = 4 }: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function reset() {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--depth-x', '0deg');
    node.style.setProperty('--depth-y', '0deg');
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--depth-x', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * strength}deg`);
    node.style.setProperty('--depth-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * strength}deg`);
  }
  return <div ref={ref} className={`depth-surface ${className}`} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>{children}</div>;
}
