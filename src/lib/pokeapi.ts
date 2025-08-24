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

// 一覧の results の url から ID を抜くユーティリティ（/pokemon/25/ -> 25）
export function extractIdFromResourceUrl(url: string): number | null {
  const m = url.match(/\/pokemon\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

// ポケモン名の日本語化マッピング（一部の代表的なポケモン）
const POKEMON_NAME_JP: Record<string, string> = {
  bulbasaur: "フシギダネ",
  ivysaur: "フシギソウ",
  venusaur: "フシギバナ",
  charmander: "ヒトカゲ",
  charmeleon: "リザード",
  charizard: "リザードン",
  squirtle: "ゼニガメ",
  wartortle: "カメール",
  blastoise: "カメックス",
  caterpie: "キャタピー",
  metapod: "トランセル",
  butterfree: "バタフリー",
  weedle: "ビードル",
  kakuna: "コクーン",
  beedrill: "スピアー",
  pidgey: "ポッポ",
  pidgeotto: "ピジョン",
  pidgeot: "ピジョット",
  rattata: "コラッタ",
  raticate: "ラッタ",
  spearow: "オニスズメ",
  fearow: "オニドリル",
  ekans: "アーボ",
  arbok: "アーボック",
  pikachu: "ピカチュウ",
  raichu: "ライチュウ",
  sandshrew: "サンド",
  sandslash: "サンドパン",
  "nidoran-f": "ニドラン♀",
  nidorina: "ニドリーナ",
  nidoqueen: "ニドクイン",
  "nidoran-m": "ニドラン♂",
  nidorino: "ニドリーノ",
  nidoking: "ニドキング",
  clefairy: "ピッピ",
  clefable: "ピクシー",
  vulpix: "ロコン",
  ninetales: "キュウコン",
  jigglypuff: "プリン",
  wigglytuff: "プクリン",
  zubat: "ズバット",
  golbat: "ゴルバット",
  oddish: "ナゾノクサ",
  gloom: "クサイハナ",
  vileplume: "ラフレシア",
  paras: "パラス",
  parasect: "パラセクト",
  venonat: "コンパン",
  venomoth: "モルフォン",
  diglett: "ディグダ",
  dugtrio: "ダグトリオ",
  meowth: "ニャース",
  persian: "ペルシアン",
  psyduck: "コダック",
  golduck: "ゴルダック",
  mankey: "マンキー",
  primeape: "オコリザル",
  growlithe: "ガーディ",
  arcanine: "ウインディ",
  poliwag: "ニョロモ",
  poliwhirl: "ニョロゾ",
  poliwrath: "ニョロボン",
  abra: "ケーシィ",
  kadabra: "ユンゲラー",
  alakazam: "フーディン",
  machop: "ワンリキー",
  machoke: "ゴーリキー",
  machamp: "カイリキー",
  bellsprout: "マダツボミ",
  weepinbell: "ウツドン",
  victreebel: "ウツボット",
  tentacool: "メノクラゲ",
  tentacruel: "ドククラゲ",
  geodude: "イシツブテ",
  graveler: "ゴローン",
  golem: "ゴローニャ",
  ponyta: "ポニータ",
  rapidash: "ギャロップ",
  slowpoke: "ヤドン",
  slowbro: "ヤドラン",
  magnemite: "コイル",
  magneton: "レアコイル",
  "farfetchd": "カモネギ",
  doduo: "ドードー",
  dodrio: "ドードリオ",
  seel: "パウワウ",
  dewgong: "ジュゴン",
  grimer: "ベトベター",
  muk: "ベトベトン",
  shellder: "シェルダー",
  cloyster: "パルシェン",
  gastly: "ゴース",
  haunter: "ゴースト",
  gengar: "ゲンガー",
  onix: "イワーク",
  drowzee: "スリープ",
  hypno: "スリーパー",
  krabby: "クラブ",
  kingler: "キングラー",
  voltorb: "ビリリダマ",
  electrode: "マルマイン",
  exeggcute: "タマタマ",
  exeggutor: "ナッシー",
  cubone: "カラカラ",
  marowak: "ガラガラ",
  hitmonlee: "サワムラー",
  hitmonchan: "エビワラー",
  lickitung: "ベロリンガ",
  koffing: "ドガース",
  weezing: "マタドガス",
  rhyhorn: "サイホーン",
  rhydon: "サイドン",
  chansey: "ラッキー",
  tangela: "モンジャラ",
  kangaskhan: "ガルーラ",
  horsea: "タッツー",
  seadra: "シードラ",
  goldeen: "トサキント",
  seaking: "アズマオウ",
  staryu: "ヒトデマン",
  starmie: "スターミー",
  "mr-mime": "バリヤード",
  scyther: "ストライク",
  jynx: "ルージュラ",
  electabuzz: "エレブー",
  magmar: "ブーバー",
  pinsir: "カイロス",
  tauros: "ケンタロス",
  magikarp: "コイキング",
  gyarados: "ギャラドス",
  lapras: "ラプラス",
  ditto: "メタモン",
  eevee: "イーブイ",
  vaporeon: "シャワーズ",
  jolteon: "サンダース",
  flareon: "ブースター",
  porygon: "ポリゴン",
  omanyte: "オムナイト",
  omastar: "オムスター",
  kabuto: "カブト",
  kabutops: "カブトプス",
  aerodactyl: "プテラ",
  snorlax: "カビゴン",
  articuno: "フリーザー",
  zapdos: "サンダー",
  moltres: "ファイヤー",
  dratini: "ミニリュウ",
  dragonair: "ハクリュー",
  dragonite: "カイリュー",
  mewtwo: "ミュウツー",
  mew: "ミュウ",
};

// ポケモンタイプの日本語化マッピング
const TYPE_NAME_JP: Record<string, string> = {
  normal: "ノーマル",
  fighting: "かくとう",
  flying: "ひこう",
  poison: "どく",
  ground: "じめん",
  rock: "いわ",
  bug: "むし",
  ghost: "ゴースト",
  steel: "はがね",
  fire: "ほのお",
  water: "みず",
  grass: "くさ",
  electric: "でんき",
  psychic: "エスパー",
  ice: "こおり",
  dragon: "ドラゴン",
  dark: "あく",
  fairy: "フェアリー",
};

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

// ポケモン名を日本語化する関数
export function getPokemonNameInJapanese(englishName: string): string {
  return POKEMON_NAME_JP[englishName] || englishName;
}

// ポケモンタイプを日本語化する関数
export function getTypeNameInJapanese(englishType: string): string {
  return TYPE_NAME_JP[englishType] || englishType;
}

// ポケモンタイプの背景色を取得する関数
export function getTypeColor(typeName: string): string {
  return TYPE_COLORS[typeName] || "bg-gray-100";
}