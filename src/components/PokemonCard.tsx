import { Card, CardContent } from "./ui/card";
import { getPokemonIdFromUrl } from "../utils/pokemonApi";
import { capitalizeFirstLetter } from "../utils/pokemonTypes";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PokemonCardProps {
  name: string;
  url: string;
  onClick: () => void;
}

export function PokemonCard({ name, url, onClick }: PokemonCardProps) {
  const pokemonId = getPokemonIdFromUrl(url);
  const paddedId = pokemonId.toString().padStart(3, "0");

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className="relative mb-3">
          <ImageWithFallback
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
            alt={name}
            className="w-20 h-20 mx-auto object-contain"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              // フォールバック画像
              (
                e.target as HTMLImageElement
              ).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
            }}
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
