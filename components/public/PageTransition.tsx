'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Fades + rises the page content on every route change (list → detail,
 * detail → detail, etc). Keying on pathname forces a remount so the
 * entrance animation replays each navigation, instead of only on first load.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
