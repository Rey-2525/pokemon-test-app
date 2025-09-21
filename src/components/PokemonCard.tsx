import { Card, CardContent } from "./ui/card";
import { extractIdFromResourceUrl } from "@/lib/pokeapi";
import { capitalizeFirstLetter } from "../utils/pokemonTypes";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PokemonCardProps {
  name: string;
  url: string;
  onClick: () => void;
}

export function PokemonCard({ name, url, onClick }: PokemonCardProps) {
  const pokemonId = extractIdFromResourceUrl(url);
  const paddedId = (pokemonId || 0).toString().padStart(3, "0");

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className="relative mb-3">
          <ImageWithFallback
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId || 0}.png`}
            fallbackSrc={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId || 0}.png`}
            alt={name}
            className="w-20 h-20 mx-auto object-contain"
          />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">#{paddedId}</p>
          <h3 className="capitalize">{capitalizeFirstLetter(name)}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
