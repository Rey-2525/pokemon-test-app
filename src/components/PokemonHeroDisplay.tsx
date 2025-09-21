import { Badge } from "./ui/badge";
import type { PokemonDetail } from "@/lib/pokeapi";
import { getTypeColor, capitalizeFirstLetter } from "../utils/pokemonTypes";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Info } from "lucide-react";

type PokemonDetailWithJapanese = PokemonDetail & {
  japaneseName?: string;
};

interface PokemonHeroDisplayProps {
  pokemon: PokemonDetailWithJapanese | null;
  onInfoClick?: () => void;
}

export function PokemonHeroDisplay({ pokemon, onInfoClick }: PokemonHeroDisplayProps) {
  if (!pokemon) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-6xl">?</span>
          </div>
          <p className="text-gray-500">ポケモンを選択してください</p>
        </div>
      </div>
    );
  }

  const paddedId = pokemon.id.toString().padStart(3, '0');

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white">
      {/* ポケモン画像 */}
      <div className="relative mb-6">
        <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gray-50 p-4 shadow-lg">
          <ImageWithFallback
            src={pokemon.sprites.other?.['official-artwork']?.front_default || ""}
            fallbackSrc={pokemon.sprites.front_default || ""}
            alt={pokemon.name}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* 詳細ボタン */}
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <Info className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* ポケモン基本情報 */}
      <div className="space-y-4">
        <div>
          <p className="text-gray-600 text-lg mb-1">No.{paddedId}</p>
          <h1 className="text-gray-800 text-4xl mb-4">
            {pokemon.japaneseName || capitalizeFirstLetter(pokemon.name)}
          </h1>
        </div>

        {/* タイプ */}
        <div className="flex justify-center gap-2 mb-4">
          {pokemon.types.map((typeInfo) => (
            <Badge
              key={typeInfo.type.name}
              className="px-4 py-2 text-white border-0"
              style={{ 
                backgroundColor: getTypeColor(typeInfo.type.name),
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              {capitalizeFirstLetter(typeInfo.type.name)}
            </Badge>
          ))}
        </div>

        {/* 基本データ */}
        <div className="flex justify-center gap-8 text-gray-700">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">身長</p>
            <p className="text-xl">{(pokemon.height / 10).toFixed(1)}m</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-1">体重</p>
            <p className="text-xl">{(pokemon.weight / 10).toFixed(1)}kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
