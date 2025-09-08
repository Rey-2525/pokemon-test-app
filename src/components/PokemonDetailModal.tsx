"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import Image from "next/image";
import type { PokemonDetail } from "@/lib/pokeapi";
import { getPokemonNameInJapanese, getTypeNameInJapanese } from "@/lib/pokeapi";

interface PokemonDetailModalProps {
  pokemon: PokemonDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PokemonDetailModal({ pokemon, isOpen, onClose }: PokemonDetailModalProps) {
  if (!pokemon) return null;

  const art = pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default ?? "";

  const getStatName = (statName: string) => {
    const statNames: Record<string, string> = {
      hp: "HP",
      attack: "攻撃",
      defense: "防御", 
      "special-attack": "特攻",
      "special-defense": "特防",
      speed: "素早さ",
    };
    return statNames[statName] || statName;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-lg p-0 border-0">
        <div className="relative">
          {/* Header with close button */}
          <DialogHeader className="bg-white border-b border-gray-200 p-4 flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold text-center flex-1">
              #{pokemon.id.toString().padStart(3, "0")} {getPokemonNameInJapanese(pokemon.name)}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </DialogHeader>

          <div className="p-6">
            {/* Pokemon Image */}
            <div className="flex justify-center mb-6">
              {art ? (
                <Image
                  alt={pokemon.name}
                  src={art}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Type badges */}
            <div className="flex justify-center gap-2 mb-6">
              {pokemon.types
                .sort((a, b) => a.slot - b.slot)
                .map((t) => {
                  const typeColors: Record<string, string> = {
                    normal: "bg-gray-400",
                    grass: "bg-green-500",
                    poison: "bg-purple-500",
                    fire: "bg-red-500",
                    water: "bg-blue-500",
                    electric: "bg-yellow-400",
                    ice: "bg-blue-300",
                    fighting: "bg-red-600",
                    ground: "bg-yellow-600",
                    flying: "bg-indigo-400",
                    psychic: "bg-pink-500",
                    bug: "bg-green-400",
                    rock: "bg-yellow-800",
                    ghost: "bg-purple-700",
                    dragon: "bg-indigo-700",
                    dark: "bg-gray-800",
                    steel: "bg-gray-500",
                    fairy: "bg-pink-300",
                  };
                  return (
                    <Badge 
                      key={t.type.name}
                      className={`${typeColors[t.type.name] || "bg-gray-100"} text-white text-sm px-3 py-1`}
                    >
                      {getTypeNameInJapanese(t.type.name)}
                    </Badge>
                  );
                })}
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-center">
              <div>
                <div className="text-sm text-gray-600">身長</div>
                <div className="text-lg font-medium">{(pokemon.height / 10).toFixed(1)} m</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">体重</div>
                <div className="text-lg font-medium">{(pokemon.weight / 10).toFixed(1)} kg</div>
              </div>
            </div>

            {/* Base Stats */}
            <div>
              <h3 className="text-center font-medium mb-4">ベースステータス</h3>
              <div className="space-y-3">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">
                        {getStatName(stat.stat.name)}
                      </span>
                      <span className="text-sm font-medium">
                        {stat.base_stat}
                      </span>
                    </div>
                    <Progress value={(stat.base_stat / 255) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}