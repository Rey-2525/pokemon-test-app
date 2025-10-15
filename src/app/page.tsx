"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { PokemonListItem } from "../components/PokemonListItem";
import { PokemonHeroDisplay } from "../components/PokemonHeroDisplay";
import { SearchModal } from "../components/SearchModal";
import { pokemonService, type PokemonDetailWithJapanese } from "@/services/pokemonService";
import type { PokemonListResponse, NamedAPIResource } from "@/api/pokemon.api";
import { Loader2, Search } from "lucide-react";

type PokemonWithJapaneseName = NamedAPIResource & {
  japaneseName?: string;
};

type Generation = 1 | 2;

const GENERATION_CONFIG = {
  1: {
    label: "第1世代",
    startId: 1,
    endId: 151,
    count: 151,
  },
  2: {
    label: "第2世代",
    startId: 152,
    endId: 251,
    count: 100,
  },
} as const;

export function ModernPokedex() {
  const [currentGeneration, setCurrentGeneration] = useState<Generation>(1);
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailWithJapanese | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allPokemonForSearch, setAllPokemonForSearch] = useState<PokemonWithJapaneseName[]>([]);

  // 表示するポケモンリスト（検索機能を削除したので直接使用）
  const filteredPokemon = pokemonList?.results || [];

  // 選択されているポケモンのURL
  const selectedPokemonUrl = selectedPokemon
    ? `https://pokeapi.co/api/v2/pokemon/${selectedPokemon.id}/`
    : '';

  const handlePokemonSelect = useCallback(async (pokemonUrl: string) => {
    try {
      setIsLoadingDetail(true);
      const pokemonId = pokemonService.extractIdFromResourceUrl(pokemonUrl);
      if (!pokemonId) throw new Error('Invalid Pokemon URL');
      const pokemonDetail = await pokemonService.getPokemonDetailWithJapaneseName(pokemonId);
      setSelectedPokemon(pokemonDetail);
    } catch (error) {
      console.error('ポケモン詳細の取得に失敗しました:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // タスク1.初期読み込みと最初のポケモン自動選択
  useEffect(() => {
    const loadInitialPokemon = async () => {
      try {
        setIsLoadingList(true);
        const config = GENERATION_CONFIG[currentGeneration];
        const data = await pokemonService.getPokemonList(24, config.startId - 1);
        setPokemonList(data);

        if (data.results.length > 0) {
          handlePokemonSelect(data.results[0].url);
        }
      } catch (error) {
        console.error('初期ポケモンの読み込みに失敗しました:', error);
      } finally {
        setIsLoadingList(false);
      }
    }
    loadInitialPokemon();
  }, [currentGeneration, handlePokemonSelect]);

  // 全ポケモンリストを取得（検索用）
  useEffect(() => {
    const loadAllPokemonForSearch = async () => {
      try {
        const config = GENERATION_CONFIG[currentGeneration];
        // 選択中の世代の全ポケモンを取得
        const allData = await pokemonService.getPokemonList(config.count, config.startId - 1);

        // 日本語名を並行取得
        const pokemonWithJapanese = await Promise.all(
          allData.results.map(async (pokemon) => {
            const id = pokemonService.extractIdFromResourceUrl(pokemon.url);
            if (!id) return { ...pokemon, japaneseName: pokemon.name };

            try {
              const japaneseName = await pokemonService.getPokemonNameInJapanese(id);
              return { ...pokemon, japaneseName };
            } catch (error) {
              console.error(`Failed to get Japanese name for ${pokemon.name}:`, error);
              return { ...pokemon, japaneseName: pokemon.name };
            }
          })
        );

        setAllPokemonForSearch(pokemonWithJapanese);
      } catch (error) {
        console.error('検索用ポケモンリストの取得に失敗しました:', error);
      }
    };

    loadAllPokemonForSearch();
  }, [currentGeneration]);

  // 追加読み込み処理
  const handleLoadMore = useCallback(async () => {
    if (!pokemonList || isLoadingMore) return;

    try {
      setIsLoadingMore(true);

      const config = GENERATION_CONFIG[currentGeneration];

      // 現在の最後のポケモンのIDを取得
      const lastPokemon = pokemonList.results[pokemonList.results.length - 1];
      const lastPokemonId = pokemonService.extractIdFromResourceUrl(lastPokemon.url);

      if (!lastPokemonId) {
        throw new Error('最後のポケモンのIDを取得できませんでした');
      }

      // 世代の範囲を超えている場合は読み込まない
      if (lastPokemonId >= config.endId) {
        setIsLoadingMore(false);
        return;
      }

      // 次の24体を取得（世代の範囲内に制限）
      const remainingCount = config.endId - lastPokemonId;
      const loadCount = Math.min(24, remainingCount);

      const newData = await pokemonService.getPokemonList(loadCount, lastPokemonId);

      // 既存のリストに追加
      setPokemonList({
        count: newData.count,
        next: lastPokemonId + loadCount < config.endId ? newData.next : null,
        previous: pokemonList.previous,
        results: [...pokemonList.results, ...newData.results]
      });
    } catch (error) {
      console.error('追加ポケモンの読み込みに失敗しました:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [pokemonList, isLoadingMore, currentGeneration]);

  // 世代切り替えハンドラー
  const handleGenerationChange = useCallback((generation: Generation) => {
    if (generation === currentGeneration) return;

    // 全データをクリア（世代が混ざらないようにする）
    setPokemonList(null);
    setSelectedPokemon(null);
    setAllPokemonForSearch([]);

    // 世代を更新（useEffectが自動的に新しいデータを取得する）
    setCurrentGeneration(generation);
  }, [currentGeneration]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 世代選択ボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerationChange(1)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentGeneration === 1
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              第1世代
            </button>
            <button
              onClick={() => handleGenerationChange(2)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentGeneration === 2
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              第2世代
            </button>
          </div>

          {/* 検索ボタン */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="ポケモンを検索"
          >
            <Search className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 検索モーダル */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pokemonList={allPokemonForSearch}
        onSelectPokemon={handlePokemonSelect}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上部: 選択中のポケモン表示 */}
        <div className="h-1/2 relative overflow-hidden">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 mb-2 mx-auto" />
                <p className="text-gray-500">読み込み中...</p>
              </div>
            </div>
          ) : (
            <PokemonHeroDisplay
              pokemon={selectedPokemon}
            />
          )}
        </div>

        {/* 下部: ポケモンリスト */}
        <div className="h-1/2 bg-white flex flex-col">
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">
                {filteredPokemon.length}匹のポケモン
              </p>
              <span className="text-gray-500 text-sm">音順</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-4 py-2 space-y-1">
              {isLoadingList && filteredPokemon.length === 0 ? (
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
                  {/* もっと見るボタン */}
                  {pokemonList && pokemonList.next && (
                    <div className="px-4 py-4 border-t border-gray-200">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            読み込み中...
                          </>
                        ) : (
                          'もっと見る'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

    </div>
  );
}
export default ModernPokedex;