'use client';

import { AuthProvider } from '../lib/contexts/AuthContext';
import { ToastProvider } from './Toast';
import UserMenu from './UserMenu';
import type { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <UserMenu />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
