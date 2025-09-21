// app/pokemon/[name]/page.tsx
import { getPokemonDetail, getPokemonSpecies, getPokemonNameInJapaneseDynamic, getTypeNameInJapaneseDynamic, getTypeColor } from "@/lib/pokeapi";
import StatBar from "@/components/StatBar";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600;

type Params = { name: string };

export default async function PokemonDetailPage({ params }: { params: Params }) {
  const { name } = params;

  // 詳細 & 種情報、日本語名を並列取得
  const [detail, species, japaneseName] = await Promise.all([
    getPokemonDetail(name),
    getPokemonSpecies(name),
    getPokemonNameInJapaneseDynamic(name),
  ]);

  // タイプの日本語名も並列取得
  const typeJapaneseNames = await Promise.all(
    detail.types.map(t => getTypeNameInJapaneseDynamic(t.type.name))
  );

  const art =
    detail.sprites.other?.["official-artwork"]?.front_default ??
    detail.sprites.front_default ??
    "";

  const jpGenus =
    species.genera.find((g) => g.language.name === "ja-Hrkt")?.genus ??
    species.genera.find((g) => g.language.name === "ja")?.genus ??
    species.genera.find((g) => g.language.name === "en")?.genus ??
    "";

  const jpFlavor =
    species.flavor_text_entries.find((f) => f.language.name === "ja-Hrkt")?.flavor_text ??
    species.flavor_text_entries.find((f) => f.language.name === "ja")?.flavor_text ??
    species.flavor_text_entries.find((f) => f.language.name === "en")?.flavor_text ??
    "";

  return (
    <article className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl p-4 bg-white shadow">
        {art && (
          <Image
            alt={detail.name}
            src={art}
            width={320}
            height={320}
            className="w-full max-h-80 object-contain"
            priority={true}
          />
        )}
      </div>

      <div className="rounded-2xl p-4 bg-white shadow">
        <Link href="/" className="text-sm text-blue-600">← Back</Link>
        <h1 className="mt-2 text-2xl font-semibold">
          {japaneseName} <span className="text-gray-400">#{detail.id}</span>
        </h1>
        {jpGenus && <p className="text-gray-600 mt-1">{jpGenus}</p>}

        <div className="mt-3 flex gap-2">
          {detail.types
            .sort((a, b) => a.slot - b.slot)
            .map((t, index) => (
              <span key={t.type.name} className={`text-xs px-3 py-1 rounded-full text-white font-medium ${getTypeColor(t.type.name)}`}>
                {typeJapaneseNames[index]}
              </span>
            ))}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Height</dt><dd>{detail.height}</dd></div>
          <div><dt className="text-gray-500">Weight</dt><dd>{detail.weight}</dd></div>
          <div className="col-span-2">
            <dt className="text-gray-500 mb-2">Abilities</dt>
            <dd className="flex flex-wrap gap-2">
              {detail.abilities.map((a) => (
                <span key={a.ability.name} className="px-2 py-1 rounded bg-gray-100 text-xs capitalize">
                  {a.ability.name}{a.is_hidden ? " (hidden)" : ""}
                </span>
              ))}
            </dd>
          </div>
        </dl>

        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Base Stats</h2>
          <div className="grid gap-2">
            {detail.stats.map((s) => (
              <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} />
            ))}
          </div>
        </section>

        {jpFlavor && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-1">図鑑説明</h2>
            <p className="whitespace-pre-wrap text-gray-700">{jpFlavor.replace(/\s+/g, " ")}</p>
          </section>
        )}
      </div>
    </article>
  );
}