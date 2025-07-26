'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useSupabaseQuery<T = any>(
  queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  deps: any[] = [],
  options: {
    cacheKey?: string;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    cacheTime?: number;
  } = {}
) {
  const {
    cacheKey,
    enabled = true,
    onSuccess,
    onError,
    cacheTime = CACHE_DURATION,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);

  const prevDeps = useRef(deps);
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const fetchData = useCallback(async (ignoreCache = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Check cache
    if (cacheKey && !ignoreCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setLoading(false);
        setStale(false);
        onSuccess?.(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const { data: newData, error: newError } = await queryFnRef.current(supabase);

      if (newError) {
        throw newError;
      }

      if (newData) {
        setData(newData);
        if (cacheKey) {
          cache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
          });
        }
        onSuccess?.(newData);
      }
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
      setStale(false);
    }
  }, [cacheKey, cacheTime, enabled, onError, onSuccess]);

  // Fetch on mount and when deps change
  useEffect(() => {
    const depsChanged = deps.some((dep, i) => dep !== prevDeps.current[i]);
    if (depsChanged) {
      prevDeps.current = deps;
      fetchData();
    } else if (!data && !error) {
      fetchData();
    }
  }, [fetchData, ...deps]);

  // Refetch when window regains focus
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible' && enabled) {
        setStale(true);
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData, enabled]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    error,
    loading,
    stale,
    refetch,
  };
} 