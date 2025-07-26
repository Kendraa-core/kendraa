'use client';

import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (user) {
    redirect('/feed');
  }

  return children;
} 