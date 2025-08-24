// src/app/page.tsx
import PokemonCard from "@/components/PokemonCard";
import Pagination from "@/components/Pagination";
import { extractIdFromResourceUrl, getPokemonDetail, getPokemonList } from "@/lib/pokeapi";

// App Router の RSC。1時間に一度は再検証
export const revalidate = 3600;

const DEFAULT_LIMIT = 24;

type SearchParams = { page?: string; limit?: string };

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const limit = Math.max(1, Math.min(60, Number(searchParams.limit ?? DEFAULT_LIMIT)));
  const offset = (page - 1) * limit;

  // 1) name/url 一覧を取得
  const list = await getPokemonList(limit, offset);

  // 2) 必要なカード表示のための最小限の詳細を並列取得
  // フェアユースの観点で limit は 24〜48 程度に留めるのが現実的
  // 注意: 大量データ取得時はAPI rate limitやパフォーマンスに配慮が必要
  // 本番環境では適切なエラーハンドリングとローディング状態の実装を推奨
  const details = await Promise.all(
    list.results.map(async (r) => {
      // 名前で引くのが最も確実（URL から ID でもOK）
      const id = extractIdFromResourceUrl(r.url) ?? r.name;
      return getPokemonDetail(id);
    })
  );

  return (
    <>
      <Pagination page={page} limit={limit} totalCount={list.count} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {details.map((p) => (
          <PokemonCard key={p.id} p={p} />
        ))}
      </div>
      <Pagination page={page} limit={limit} totalCount={list.count} />
    </>
  );
}