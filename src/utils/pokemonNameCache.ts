// ポケモン名の動的取得結果をキャッシュするユーティリティ

type CacheEntry = {
  japaneseName: string;
  timestamp: number;
  ttl: number; // Time To Live (ミリ秒)
};

class PokemonNameCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24時間

  /**
   * キャッシュから日本語名を取得
   */
  get(pokemonId: number | string): string | null {
    const key = String(pokemonId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // TTL チェック
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.japaneseName;
  }

  /**
   * キャッシュに日本語名を保存
   */
  set(pokemonId: number | string, japaneseName: string, ttl?: number): void {
    const key = String(pokemonId);
    this.cache.set(key, {
      japaneseName,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 期限切れのエントリを削除
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * キャッシュサイズを取得
   */
  size(): number {
    return this.cache.size;
  }
}

// シングルトンインスタンス
export const pokemonNameCache = new PokemonNameCache();

// 定期的なクリーンアップ機能を提供（手動制御）
export function startCacheCleanup(intervalMs: number = 10 * 60 * 1000): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // サーバーサイドでは何もしない
  }

  const intervalId = setInterval(() => {
    pokemonNameCache.cleanup();
  }, intervalMs);

  // クリーンアップ関数を返す
  return () => {
    clearInterval(intervalId);
  };
}