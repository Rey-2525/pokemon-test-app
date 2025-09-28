import { extractIdFromResourceUrl } from "@/lib/pokeapi";
import { capitalizeFirstLetter } from "../utils/pokemonTypes";
import { ImageWithFallback } from "./ImageWithFallback";
import { Eye } from "lucide-react";

const POKEMON_SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

type PokemonListItemProps = {
  name: string;
  url: string;
  onClick: () => void;
  isSelected?: boolean;
};

export function PokemonListItem({
  name,
  url,
  onClick,
  isSelected = false,
}: PokemonListItemProps) {
  const pokemonId = extractIdFromResourceUrl(url);
  const paddedId = (pokemonId || 0).toString().padStart(3, "0");

  return (
    <div
      className={`
        flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "bg-red-50 scale-105 shadow-md border-2 border-red-200"
            : "bg-white hover:bg-gray-50 shadow-sm border border-gray-100"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 flex-1">
        {/* ポケモン画像 */}
        <div className="w-12 h-12 flex-shrink-0">
          <ImageWithFallback
            src={`${POKEMON_SPRITE_BASE_URL}/${pokemonId || 0}.png`}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* ポケモン情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-gray-600 text-sm">No.{paddedId}</span>
          </div>
          <h3 className="text-gray-800 truncate capitalize text-lg">
            {capitalizeFirstLetter(name)}
          </h3>
        </div>
      </div>
    </div>
  );
}
