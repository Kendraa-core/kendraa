'use client';

import { useState, useEffect } from 'react';

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export function useSafeState<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeSetValue = (newValue: T | ((prev: T) => T)) => {
    if (isClient) {
      setValue(newValue);
    }
  };

  return [value, safeSetValue, isClient] as const;
}

export function useSafeEffect(effect: () => void | (() => void), deps: React.DependencyList = []) {
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient) {
      return effect();
    }
  }, [isClient, ...deps]);
} 