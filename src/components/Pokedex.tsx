import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { PokemonCard } from "./PokemonCard";
import { PokemonDetailModal } from "./PokemonDetailModal";
import {
  fetchPokemonList,
  fetchPokemonDetails,
  getPokemonIdFromUrl,
} from "../utils/pokemonApi";
import { Pokemon, PokemonListResponse } from "../types/pokemon";
import { Search, Loader2 } from "lucide-react";

export function Pokedex() {
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(
    null
  );
  const [filteredPokemon, setFilteredPokemon] = useState<{name: string; url: string}[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    if (pokemonList) {
      const filtered = pokemonList.results.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemon(filtered);
    }
  }, [pokemonList, searchTerm]);

  const loadPokemonList = async () => {
    try {
      setLoading(true);
      const data = await fetchPokemonList(24);
      setPokemonList(data);
    } catch (error) {
      console.error("ポケモンリストの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonClick = async (
    pokemonUrl: string
  ) => {
    try {
      setLoadingDetail(true);
      const pokemonId = getPokemonIdFromUrl(pokemonUrl);
      const pokemonDetail = await fetchPokemonDetails(pokemonId);
      setSelectedPokemon(pokemonDetail);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("ポケモン詳細の取得に失敗しました:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadMorePokemon = async () => {
    if (!pokemonList) return;

    try {
      setLoading(true);
      const currentCount = pokemonList.results.length;
      const newData = await fetchPokemonList(currentCount + 24);
      setPokemonList(newData);
    } catch (error) {
      console.error("追加ポケモンの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-red-600">ポケモン図鑑</h1>
          <p className="text-muted-foreground">
            お気に入りのポケモンを見つけよう！
          </p>
        </div>

        {/* 検索バー */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ポケモンの名前を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* ポケモンリスト */}
        {loading && filteredPokemon.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">ポケモンを読み込み中...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.name}
                  name={pokemon.name}
                  url={pokemon.url}
                  onClick={() => handlePokemonClick(pokemon.url)}
                />
              ))}
            </div>

            {/* もっと読み込むボタン */}
            {pokemonList && pokemonList.results.length < 151 && (
              <div className="text-center">
                <Button onClick={loadMorePokemon} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      読み込み中...
                    </>
                  ) : (
                    "もっと見る"
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* 検索結果なし */}
        {filteredPokemon.length === 0 && !loading && searchTerm && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              「{searchTerm}」に一致するポケモンが見つかりませんでした。
            </p>
          </div>
        )}

        {/* ポケモン詳細モーダル */}
        <PokemonDetailModal
          pokemon={selectedPokemon}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />

        {/* ローディング中のオーバーレイ */}
        {loadingDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <span>ポケモン情報を取得中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
