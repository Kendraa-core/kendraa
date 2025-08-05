// Cache management utility to prevent cache conflicts

export class CacheManager {
  private static instance: CacheManager;
  private cacheVersion = 'v1';
  private cachePrefix = 'kendraa';

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[CacheManager] All caches cleared');
    } catch (error) {
      console.error('[CacheManager] Error clearing caches:', error);
    }
  }

  // Clear old caches
  async clearOldCaches(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith(this.cachePrefix) && 
        !name.includes(this.cacheVersion)
      );
      
      if (oldCaches.length > 0) {
        await Promise.all(
          oldCaches.map(cacheName => caches.delete(cacheName))
        );
        console.log('[CacheManager] Cleared old caches:', oldCaches);
      }
    } catch (error) {
      console.error('[CacheManager] Error clearing old caches:', error);
    }
  }

  // Clear specific cache
  async clearCache(cacheName: string): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return;
    }

    try {
      await caches.delete(cacheName);
      console.log('[CacheManager] Cache cleared:', cacheName);
    } catch (error) {
      console.error('[CacheManager] Error clearing cache:', error);
    }
  }

  // Get cache info
  async getCacheInfo(): Promise<{ total: number; caches: Array<{ name: string; size: number }> }> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { total: 0, caches: [] };
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          return {
            name: cacheName,
            size: keys.length,
          };
        })
      );

      const total = cacheInfo.reduce((sum, cache) => sum + cache.size, 0);
      return { total, caches: cacheInfo };
    } catch (error) {
      console.error('[CacheManager] Error getting cache info:', error);
      return { total: 0, caches: [] };
    }
  }

  // Check if cache is stale
  async isCacheStale(): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return false;
    }

    try {
      const cacheNames = await caches.keys();
      const hasOldCaches = cacheNames.some(name => 
        name.startsWith(this.cachePrefix) && 
        !name.includes(this.cacheVersion)
      );
      
      return hasOldCaches;
    } catch (error) {
      console.error('[CacheManager] Error checking cache staleness:', error);
      return false;
    }
  }

  // Force cache refresh
  async forceRefresh(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Clear all caches
      await this.clearAllCaches();
      
      // Reload the page to force fresh content
      window.location.reload();
    } catch (error) {
      console.error('[CacheManager] Error forcing refresh:', error);
    }
  }

  // Initialize cache management
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Check if cache is stale
      const isStale = await this.isCacheStale();
      
      if (isStale) {
        console.log('[CacheManager] Cache is stale, clearing old caches');
        await this.clearOldCaches();
      }

      // Set up cache version tracking
      localStorage.setItem('cacheVersion', this.cacheVersion);
      
      console.log('[CacheManager] Cache management initialized');
    } catch (error) {
      console.error('[CacheManager] Error initializing cache management:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  cacheManager.initialize().catch(console.error);
} 