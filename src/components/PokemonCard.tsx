// components/PokemonCard.tsx
import Link from "next/link";
import Image from "next/image";
import type { PokemonDetail } from "@/lib/pokeapi";
import { getPokemonNameInJapanese, getTypeNameInJapanese, getTypeColor } from "@/lib/pokeapi";

export default function PokemonCard({ p }: { p: PokemonDetail }) {
  const art =
    p.sprites.other?.["official-artwork"]?.front_default ??
    p.sprites.front_default ??
    "";

  return (
    <Link
      href={`/pokemon/${p.name}`}
      className="group block rounded-2xl p-4 shadow hover:shadow-lg transition bg-white"
    >
      <div className="aspect-square grid place-items-center mb-2">
        {art ? (
          <Image
            alt={p.name}
            src={art}
            width={160}
            height={160}
            className="max-h-40 object-contain"
            priority={false}
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-black">{getPokemonNameInJapanese(p.name)}</h3>
        <span className="text-xs text-gray-500">#{p.id}</span>
      </div>
      <div className="mt-1 flex gap-2">
        {p.types
          .sort((a, b) => a.slot - b.slot)
          .map((t) => (
            <span
              key={t.type.name}
              className={`text-xs px-2 py-1 rounded-full text-white font-medium ${getTypeColor(t.type.name)}`}
            >
              {getTypeNameInJapanese(t.type.name)}
            </span>
          ))}
      </div>
    </Link>
  );
}