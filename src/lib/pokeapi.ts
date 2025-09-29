// lib/pokeapi.ts
export const POKEAPI_BASE = "https://pokeapi.co/api/v2";

export type NamedAPIResource = { name: string; url: string };

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[]; // name, url（詳細は別取得）
};

// 必要最小限のサブセット型（用途に応じて拡張してください）
export type PokemonStat = { base_stat: number; stat: { name: string } };
export type PokemonType = { slot: number; type: { name: string } };
export type PokemonAbility = { is_hidden: boolean; ability: { name: string } };

export type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
  };
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
};

export type PokemonSpecies = {
  color: { name: string };
  flavor_text_entries: { language: { name: string }; flavor_text: string }[];
  genera: { language: { name: string }; genus: string }[];
  evolution_chain: { url: string } | null;
  names: { language: { name: string }; name: string }[];
};

export type TypeDetail = {
  id: number;
  name: string;
  names: { language: { name: string }; name: string }[];
};

// 共有フェッチャ（App Router のサーバー実行前提）
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${POKEAPI_BASE}${path}`, {
      // CDN キャッシュが効く。必要に応じて revalidate 調整
      cache: "force-cache",
      // サンプル：1時間に一度は最新化
      next: { revalidate: 3600 },
      ...init,
    });
    
    if (!res.ok) {
      // より詳細なエラーログを出力
      console.error(`PokeAPI request failed: ${res.status} ${res.statusText} for path: ${path}`);
      throw new Error(`PokeAPI error: ${res.status} ${res.statusText} (${path})`);
    }
    
    return res.json() as Promise<T>;
  } catch (error) {
    // ネットワークエラーやJSON parse エラーのログ出力
    console.error(`PokeAPI fetch error for path ${path}:`, error);
    throw error;
  }
}

export async function getPokemonList(limit: number, offset: number) {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return api<PokemonListResponse>(`/pokemon?${qs.toString()}`);
}

export async function getPokemonDetail(idOrName: string | number) {
  return api<PokemonDetail>(`/pokemon/${idOrName}`);
}

export async function getPokemonSpecies(idOrName: string | number) {
  return api<PokemonSpecies>(`/pokemon-species/${idOrName}`);
}

export async function getTypeDetail(idOrName: string | number) {
  return api<TypeDetail>(`/type/${idOrName}`);
}

// 一覧の results の url から ID を抜くユーティリティ（/pokemon/25/ -> 25）
export function extractIdFromResourceUrl(url: string): number | null {
  const m = url.match(/\/pokemon\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}


// タイプ別の背景色定義
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-400",
  fighting: "bg-red-600",
  flying: "bg-indigo-400",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  rock: "bg-yellow-800",
  bug: "bg-green-400",
  ghost: "bg-purple-700",
  steel: "bg-gray-500",
  fire: "bg-red-500",
  water: "bg-blue-500",
  grass: "bg-green-500",
  electric: "bg-yellow-400",
  psychic: "bg-pink-500",
  ice: "bg-blue-300",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  fairy: "bg-pink-300",
};


// ポケモンタイプの背景色を取得する関数
export function getTypeColor(typeName: string): string {
  return TYPE_COLORS[typeName] || "bg-gray-100";
}

// ジェネリック関数でキャッシュ機能付きの日本語化処理を共通化
async function getJapaneseNameWithCache<T>(
  key: string | number,
  fetchFunction: () => Promise<T>,
  extractName: (data: T) => string | undefined,
  fallbackValue: string
): Promise<string> {
  // キャッシュのインポートは動的にして、初期化時のエラーを防ぐ
  const { pokemonNameCache } = await import("../utils/pokemonNameCache");

  // キャッシュから取得を試行
  const cachedName = pokemonNameCache.get(key);
  if (cachedName) {
    return cachedName;
  }

  try {
    const data = await fetchFunction();
    const japaneseName = extractName(data);
    const result = japaneseName || fallbackValue;

    // 結果をキャッシュに保存
    pokemonNameCache.set(key, result);

    return result;
  } catch (error) {
    console.error(`Failed to get Japanese name for ${key}:`, error);
    const fallback = fallbackValue;

    // フォールバック結果もキャッシュ（短いTTL）
    pokemonNameCache.set(key, fallback, 60 * 60 * 1000); // 1時間

    return fallback;
  }
}

// 動的にポケモン名を日本語化する関数（species情報から取得）
export async function getPokemonNameInJapaneseDynamic(idOrName: string | number): Promise<string> {
  return getJapaneseNameWithCache(
    idOrName,
    () => getPokemonSpecies(idOrName),
    (species) => species.names.find(name => name.language.name === "ja")?.name,
    `${idOrName}（取得中）` // 一貫したフォールバック表示
  );
}

// 動的にタイプ名を日本語化する関数（type情報から取得）
export async function getTypeNameInJapaneseDynamic(typeName: string): Promise<string> {
  return getJapaneseNameWithCache(
    `type_${typeName}`, // タイプ名のキャッシュキーにプレフィックスを追加
    () => getTypeDetail(typeName),
    (typeDetail) => typeDetail.names.find(name => name.language.name === "ja")?.name,
    `${typeName}（取得中）` // 一貫したフォールバック表示
  );
}

// ポケモンの詳細情報に日本語名を付加する関数
export async function getPokemonDetailWithJapaneseName(idOrName: string | number) {
  const [detail, japaneseName] = await Promise.all([
    getPokemonDetail(idOrName),
    getPokemonNameInJapaneseDynamic(idOrName)
  ]);

  return {
    ...detail,
    japaneseName
  };
}