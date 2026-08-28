'use client';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { AUTH_DISABLED } from '@/lib/auth';
import { MockGate } from '@/components/mock-gate';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';

const clerkAppearance = {
  variables: {
    colorPrimary: 'var(--primary)',
    colorPrimaryForeground: 'var(--primary-foreground)',
    colorDanger: 'var(--destructive)',
    colorBackground: 'var(--card)',
    colorForeground: 'var(--foreground)',
    colorMuted: 'var(--muted)',
    colorMutedForeground: 'var(--muted-foreground)',
    colorInput: 'var(--input)',
    colorInputForeground: 'var(--foreground)',
    colorBorder: 'var(--border)',
    colorRing: 'var(--ring)',
    fontFamily: 'var(--font-sans)'
  }
};

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  const app = (
    <MockGate>
      <QueryProvider>{children}</QueryProvider>
    </MockGate>
  );

  return (
    <ActiveThemeProvider initialTheme={activeThemeValue}>
      {AUTH_DISABLED ? app : <ClerkProvider appearance={clerkAppearance}>{app}</ClerkProvider>}
    </ActiveThemeProvider>
  );
}
