'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import ContactModal from './ContactModal';
import { SiteSettings } from '@/types';

interface ContactModalContextValue {
  openContact: () => void;
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

export function ContactModalProvider({
  settings,
  children,
}: {
  settings?: SiteSettings;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const value = useMemo<ContactModalContextValue>(
    () => ({ openContact: () => setOpen(true) }),
    []
  );

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <ContactModal open={open} onClose={() => setOpen(false)} settings={settings} />
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error('useContactModal must be used within a ContactModalProvider');
  }
  return ctx;
}
