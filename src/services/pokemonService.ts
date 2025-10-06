// サービス層 - ビジネスロジックとデータ変換を担当
import { pokemonAPI, type PokemonDetail, type PokemonListResponse } from '@/api/pokemon.api';

// サービス層で使用する拡張型
export type PokemonDetailWithJapanese = PokemonDetail & {
  japaneseName: string;
};

// キャッシュマップ
class PokemonNameCache {
  private cache = new Map<string | number, { value: string; expiry: number }>();

  get(key: string | number): string | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: string | number, value: string, ttl: number = 24 * 60 * 60 * 1000): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
}

// ポケモンサービスクラス
class PokemonService {
  private nameCache = new PokemonNameCache();
  private typeNameCache = new PokemonNameCache();

  // URLからIDを抽出するユーティリティ
  extractIdFromResourceUrl(url: string): number | null {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }

  // ポケモンの詳細情報を取得
  async getPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
    return pokemonAPI.getPokemonDetail(idOrName);
  }

  // ポケモンの日本語名を取得（キャッシュ機能付き）
  async getPokemonNameInJapanese(idOrName: string | number): Promise<string> {
    const cached = this.nameCache.get(idOrName);
    if (cached) return cached;

    try {
      const species = await pokemonAPI.getPokemonSpecies(idOrName);
      const japaneseName = species.names.find(name => name.language.name === "ja")?.name;
      const result = japaneseName || `${idOrName}`;

      this.nameCache.set(idOrName, result);
      return result;
    } catch (error) {
      console.error(`Failed to get Japanese name for ${idOrName}:`, error);
      const fallback = `${idOrName}`;
      this.nameCache.set(idOrName, fallback, 60 * 60 * 1000); // 1時間のTTL
      return fallback;
    }
  }

  // タイプの日本語名を取得（キャッシュ機能付き）
  async getTypeNameInJapanese(typeName: string): Promise<string> {
    const cacheKey = `type_${typeName}`;
    const cached = this.typeNameCache.get(cacheKey);
    if (cached) return cached;

    try {
      const typeDetail = await pokemonAPI.getTypeDetail(typeName);
      const japaneseName = typeDetail.names.find(name => name.language.name === "ja")?.name;
      const result = japaneseName || typeName;

      this.typeNameCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to get Japanese type name for ${typeName}:`, error);
      const fallback = typeName;
      this.typeNameCache.set(cacheKey, fallback, 60 * 60 * 1000);
      return fallback;
    }
  }

  // ポケモンの詳細情報に日本語名を付加
  async getPokemonDetailWithJapaneseName(idOrName: string | number): Promise<PokemonDetailWithJapanese> {
    const [detail, japaneseName] = await Promise.all([
      this.getPokemonDetail(idOrName),
      this.getPokemonNameInJapanese(idOrName)
    ]);

    return {
      ...detail,
      japaneseName
    };
  }

  // 複数のタイプ名を日本語化
  async getTypeNamesInJapanese(typeNames: string[]): Promise<Record<string, string>> {
    const promises = typeNames.map(async (typeName) => ({
      key: typeName,
      value: await this.getTypeNameInJapanese(typeName)
    }));

    const results = await Promise.all(promises);
    return results.reduce((acc, { key, value }) => ({
      ...acc,
      [key]: value
    }), {} as Record<string, string>);
  }
}

// シングルトンインスタンスをエクスポート
export const pokemonService = new PokemonService();