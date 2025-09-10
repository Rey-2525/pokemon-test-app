"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { PokemonListItem } from "../components/PokemonListItem";
import { PokemonHeroDisplay } from "../components/PokemonHeroDisplay";
import { PokemonDetailModal } from "../components/PokemonDetailModal";
import { fetchPokemonList, fetchPokemonDetails, getPokemonIdFromUrl } from "../utils/pokemonApi";
import { Pokemon, PokemonListResponse } from "../types/pokemon";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

export function ModernPokedex() {
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
  const [filteredPokemon, setFilteredPokemon] = useState<{name: string; url: string}[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedPokemonUrl, setSelectedPokemonUrl] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handlePokemonSelect = useCallback(async (pokemonUrl: string) => {
    try {
      setLoadingDetail(true);
      setSelectedPokemonUrl(pokemonUrl);
      const pokemonId = getPokemonIdFromUrl(pokemonUrl);
      const pokemonDetail = await fetchPokemonDetails(pokemonId);
      setSelectedPokemon(pokemonDetail);
    } catch (error) {
      console.error('ポケモン詳細の取得に失敗しました:', error);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    if (pokemonList) {
      const filtered = pokemonList.results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemon(filtered);

      // 最初のポケモンを自動選択（検索結果がある場合）
      if (filtered.length > 0 && !selectedPokemon) {
        handlePokemonSelect(filtered[0].url);
      }
    }
  }, [pokemonList, searchTerm, selectedPokemon, handlePokemonSelect]);

  const loadPokemonList = async () => {
    try {
      setLoading(true);
      const data = await fetchPokemonList(50); // より多くのポケモンを読み込み
      setPokemonList(data);
    } catch (error) {
      console.error('ポケモンリストの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoClick = () => {
    setIsDetailModalOpen(true);
  };

  const loadMorePokemon = async () => {
    if (!pokemonList) return;

    try {
      setLoading(true);
      const currentCount = pokemonList.results.length;
      const newData = await fetchPokemonList(currentCount + 50);
      setPokemonList(newData);
    } catch (error) {
      console.error('追加ポケモンの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上部: 選択中のポケモン表示 */}
        <div className="h-1/2 relative overflow-hidden">
          {loadingDetail ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 mb-2 mx-auto" />
                <p className="text-gray-500">読み込み中...</p>
              </div>
            </div>
          ) : (
            <PokemonHeroDisplay
              pokemon={selectedPokemon}
              onInfoClick={handleInfoClick}
            />
          )}
        </div>

        {/* 下部: ポケモンリスト */}
        <div className="h-1/2 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">
                {filteredPokemon.length}匹のポケモン
              </p>
              <span className="text-gray-500 text-sm">音順</span>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="p-4 space-y-1">
              {loading && filteredPokemon.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : (
                <>
                  {filteredPokemon.map((pokemon) => (
                    <PokemonListItem
                      key={pokemon.name}
                      name={pokemon.name}
                      url={pokemon.url}
                      onClick={() => handlePokemonSelect(pokemon.url)}
                      isSelected={selectedPokemonUrl === pokemon.url}
                    />
                  ))}

                  {/* もっと読み込むボタン */}
                  {pokemonList && pokemonList.results.length < 151 && (
                    <div className="text-center pt-4">
                      <Button
                        onClick={loadMorePokemon}
                        disabled={loading}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            読み込み中...
                          </>
                        ) : (
                          'もっと見る'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* 検索結果なし */}
              {filteredPokemon.length === 0 && !loading && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-gray-500">「{searchTerm}」に一致するポケモンが見つかりませんでした。</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ポケモン詳細モーダル */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}

export default ModernPokedex;