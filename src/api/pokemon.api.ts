// API通信層 - PokeAPIとの通信を担当
export const POKEAPI_BASE = "https://pokeapi.co/api/v2";

// 基本の型定義
export type NamedAPIResource = { name: string; url: string };

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
};

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

// 共通HTTPクライアント
class PokemonAPIClient {
  private async fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${POKEAPI_BASE}${path}`, {
        cache: "force-cache",
        next: { revalidate: 3600 },
        ...init,
      });

      if (!res.ok) {
        console.error(`PokeAPI request failed: ${res.status} ${res.statusText} for path: ${path}`);
        throw new Error(`PokeAPI error: ${res.status} ${res.statusText} (${path})`);
      }

      return res.json() as Promise<T>;
    } catch (error) {
      console.error(`PokeAPI fetch error for path ${path}:`, error);
      throw error;
    }
  }

  async getPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
    return this.fetchAPI<PokemonDetail>(`/pokemon/${idOrName}`);
  }

  async getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
    return this.fetchAPI<PokemonSpecies>(`/pokemon-species/${idOrName}`);
  }

  async getTypeDetail(idOrName: string | number): Promise<TypeDetail> {
    return this.fetchAPI<TypeDetail>(`/type/${idOrName}`);
  }
}

// シングルトンインスタンスをエクスポート
export const pokemonAPI = new PokemonAPIClient();