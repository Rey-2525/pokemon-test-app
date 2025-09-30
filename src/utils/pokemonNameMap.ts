// ポケモン関連のマッピングとユーティリティ

// タイプ名の日本語マッピング
const TYPE_NAME_MAP: Record<string, string> = {
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

// タイプ名の日本語を取得
export function getTypeNameInJapanese(typeName: string): string {
  return TYPE_NAME_MAP[typeName] || typeName;
}

// タイプ別の背景色定義（Hex値で返す）
const TYPE_COLORS: Record<string, string> = {
  normal: "#9CA3AF",   // gray-400
  fighting: "#DC2626", // red-600
  flying: "#818CF8",   // indigo-400
  poison: "#A855F7",   // purple-500
  ground: "#CA8A04",   // yellow-600
  rock: "#854D0E",     // yellow-800
  bug: "#4ADE80",      // green-400
  ghost: "#6B21A8",    // purple-700
  steel: "#6B7280",    // gray-500
  fire: "#EF4444",     // red-500
  water: "#3B82F6",    // blue-500
  grass: "#22C55E",    // green-500
  electric: "#FACC15", // yellow-400
  psychic: "#EC4899",  // pink-500
  ice: "#93C5FD",      // blue-300
  dragon: "#4338CA",   // indigo-700
  dark: "#1F2937",     // gray-800
  fairy: "#FBCFE8",    // pink-300
};

// タイプの色を取得（Hex値）
export function getTypeColor(typeName: string): string {
  return TYPE_COLORS[typeName] || "#F3F4F6"; // デフォルトはgray-100
}

// タイプのCSSクラス名を取得（Tailwind用）
export function getTypeColorClass(typeName: string): string {
  const colorMap: Record<string, string> = {
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
  return colorMap[typeName] || "bg-gray-100";
}

// 文字列の最初の文字を大文字にする
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ポケモンIDを3桁にフォーマット
export function formatPokemonId(id: number): string {
  return id.toString().padStart(3, "0");
}

// ステータス名の日本語化
export function getStatNameInJapanese(statName: string): string {
  const statNames: Record<string, string> = {
    hp: "HP",
    attack: "こうげき",
    defense: "ぼうぎょ",
    "special-attack": "とくこう",
    "special-defense": "とくぼう",
    speed: "すばやさ"
  };
  return statNames[statName] || statName;
}

// ステータスの最大値（プログレスバー用）
export function getStatMaxValue(statName: string): number {
  // ポケモンのステータス最大値の目安
  return statName === "hp" ? 255 : 200;
}

// ステータス値のカラー
export function getStatColor(value: number, max: number): string {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return "#22C55E"; // green-500
  if (percentage >= 60) return "#3B82F6"; // blue-500
  if (percentage >= 40) return "#FACC15"; // yellow-400
  return "#EF4444"; // red-500
}