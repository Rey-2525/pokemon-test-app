"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import type { PokemonDetail } from "@/lib/pokeapi";
import { getPokemonNameInJapanese, getTypeNameInJapanese } from "@/lib/pokeapi";

interface PokemonCardNewProps {
  pokemon: PokemonDetail;
  onClick: () => void;
}

export default function PokemonCardNew({ pokemon, onClick }: PokemonCardNewProps) {
  const art = pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default ?? "";

  // Main card - large featured card design
  if (pokemon.id === 1) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
        {/* Pokemon image with circular background */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              {art ? (
                <Image
                  alt={pokemon.name}
                  src={art}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Image</div>
              )}
            </div>
            {/* Number badge */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {pokemon.id}
            </div>
          </div>
        </div>

        {/* Pokemon number */}
        <div className="text-center text-sm text-gray-500 mb-1">
          No.{pokemon.id.toString().padStart(3, "0")}
        </div>

        {/* Pokemon name */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
          {getPokemonNameInJapanese(pokemon.name)}
        </h2>

        {/* Type badges */}
        <div className="flex justify-center gap-2 mb-4">
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
                  className={`${typeColors[t.type.name] || "bg-gray-100"} text-white text-sm`}
                >
                  {getTypeNameInJapanese(t.type.name)}
                </Badge>
              );
            })}
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="text-gray-600">身長</div>
            <div className="font-medium">{(pokemon.height / 10).toFixed(1)}m</div>
          </div>
          <div>
            <div className="text-gray-600">体重</div>
            <div className="font-medium">{(pokemon.weight / 10).toFixed(1)}kg</div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">24匹のポケモン</span>
          <button 
            onClick={onClick}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            詳細
          </button>
        </div>
      </div>
    );
  }

  // List item design for other pokemon
  return (
    <div className="flex items-center p-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
      {/* Pokemon image */}
      <div className="w-10 h-10 mr-3 flex-shrink-0">
        {art ? (
          <Image
            alt={pokemon.name}
            src={art}
            width={40}
            height={40}
            className="object-contain"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-400">?</span>
          </div>
        )}
      </div>

      {/* Pokemon info */}
      <div className="flex-1">
        <div className="text-sm text-gray-500">No.{pokemon.id.toString().padStart(3, "0")}</div>
        <div className="font-medium text-gray-900">{getPokemonNameInJapanese(pokemon.name)}</div>
      </div>

      {/* View icon */}
      <Eye className="w-5 h-5 text-red-500" />
    </div>
  );
}