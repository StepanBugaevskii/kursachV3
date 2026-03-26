'use client';

import { useEffect } from 'react';
import { useP2P } from '@/modules/p2p/hooks/useP2P';
import { useUserStore } from '@/modules/users/model/userStore';

export const P2PProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialized } = useP2P();
  const { currentUser } = useUserStore();

  useEffect(() => {
    // P2P will auto-initialize via useP2P hook when user is available
  }, [currentUser, initialized]);

  return <>{children}</>;
};
