'use client';

import { useEffect, useState } from 'react';

import { bootstrapSession } from '@/services/session';
import { getAccessToken } from '@/services/token-store';

interface IAuthSessionState {
  readonly isSessionReady: boolean;
  readonly isAuthenticated: boolean;
}

export function useAuthSession(): IAuthSessionState {
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void bootstrapSession().then((hasSession) => {
      if (!isMounted) {
        return;
      }

      setIsAuthenticated(hasSession && Boolean(getAccessToken()));
      setIsSessionReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isSessionReady,
    isAuthenticated,
  };
}
