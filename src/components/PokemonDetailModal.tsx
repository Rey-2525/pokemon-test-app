"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatBar } from "@/components/StatBar";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { PokemonDetailWithJapanese } from "@/services/pokemonService";
import { getTypeColor, formatPokemonId, getTypeNameInJapanese } from "@/utils/pokemonNameMap";

type PokemonDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pokemon: PokemonDetailWithJapanese;
};

// ステータス名のマッピング
const statNameMap: Record<string, string> = {
  hp: "HP",
  attack: "攻撃",
  defense: "防御",
  "special-attack": "特攻",
  "special-defense": "特防",
  speed: "素早さ",
};

// ステータスバーの色
const statColorMap: Record<string, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
};

export function PokemonDetailModal({ isOpen, onClose, pokemon }: PokemonDetailModalProps) {
  const paddedId = formatPokemonId(pokemon.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ポケモン詳細情報</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ポケモン画像 */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-full bg-gray-50 p-4 shadow-lg">
              <ImageWithFallback
                src={pokemon.sprites.other?.["official-artwork"]?.front_default || ""}
                fallbackSrc={pokemon.sprites.front_default || ""}
                alt={pokemon.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* 基本情報 */}
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm">No.{paddedId}</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {pokemon.japaneseName}
            </h2>
            <p className="text-gray-500 text-sm capitalize">{pokemon.name}</p>
          </div>

          {/* タイプ */}
          <div className="flex justify-center gap-2">
            {pokemon.types.map((typeInfo) => (
              <Badge
                key={typeInfo.type.name}
                className="px-4 py-1 text-white border-0"
                style={{
                  backgroundColor: getTypeColor(typeInfo.type.name),
                }}
              >
                {getTypeNameInJapanese(typeInfo.type.name)}
              </Badge>
            ))}
          </div>

          {/* 身長・体重 */}
          <div className="flex justify-center gap-8 text-gray-700">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">身長</p>
              <p className="text-lg font-medium">{(pokemon.height / 10).toFixed(1)}m</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">体重</p>
              <p className="text-lg font-medium">{(pokemon.weight / 10).toFixed(1)}kg</p>
            </div>
          </div>

          {/* ステータス */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">ステータス</h3>
            {pokemon.stats.map((stat) => (
              <StatBar
                key={stat.stat.name}
                label={statNameMap[stat.stat.name] || stat.stat.name}
                value={stat.base_stat}
                color={statColorMap[stat.stat.name]}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
