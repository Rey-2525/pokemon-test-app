"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import type { PokemonDetail } from "@/lib/pokeapi";
import { getTypeColor, capitalizeFirstLetter } from "../utils/pokemonTypes";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type PokemonDetailWithJapanese = PokemonDetail & {
  japaneseName?: string;
};

interface PokemonDetailModalProps {
  pokemon: PokemonDetailWithJapanese | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PokemonDetailModal({
  pokemon,
  isOpen,
  onClose,
}: PokemonDetailModalProps) {
  if (!pokemon) return null;

  const paddedId = pokemon.id.toString().padStart(3, "0");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            #{paddedId} {pokemon.japaneseName || capitalizeFirstLetter(pokemon.name)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ポケモン画像 */}
          <div className="text-center">
            <ImageWithFallback
              src={pokemon.sprites.other?.["official-artwork"]?.front_default || ""}
              fallbackSrc={pokemon.sprites.front_default || ""}
              alt={pokemon.name}
              className="w-32 h-32 mx-auto object-contain"
            />
          </div>

          {/* タイプ */}
          <div className="text-center">
            <p className="mb-2">タイプ</p>
            <div className="flex justify-center gap-2">
              {pokemon.types.map((typeInfo) => (
                <Badge
                  key={typeInfo.type.name}
                  style={{
                    backgroundColor: getTypeColor(typeInfo.type.name),
                    color: "white",
                  }}
                >
                  {capitalizeFirstLetter(typeInfo.type.name)}
                </Badge>
              ))}
            </div>
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-muted-foreground">身長</p>
              <p>{(pokemon.height / 10).toFixed(1)} m</p>
            </div>
            <div>
              <p className="text-muted-foreground">体重</p>
              <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
            </div>
          </div>

          {/* ステータス */}
          <div>
            <p className="mb-3 text-center">ベースステータス</p>
            <div className="space-y-3">
              {pokemon.stats.map((stat) => {
                const statName =
                  {
                    hp: "HP",
                    attack: "攻撃",
                    defense: "防御",
                    "special-attack": "特攻",
                    "special-defense": "特防",
                    speed: "素早さ",
                  }[stat.stat.name] || stat.stat.name;

                return (
                  <div key={stat.stat.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{statName}</span>
                      <span>{stat.base_stat}</span>
                    </div>
                    <Progress
                      value={(stat.base_stat / 200) * 100}
                      className="h-2"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
