"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { PokemonListItem } from "../components/PokemonListItem";
import { PokemonHeroDisplay } from "../components/PokemonHeroDisplay";
import { pokemonService, type PokemonDetailWithJapanese } from "@/services/pokemonService";
import type { PokemonListResponse } from "@/api/pokemon.api";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

export function ModernPokedex() {
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailWithJapanese | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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

  // 初期読み込みと最初のポケモン自動選択
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoadingList(true);
        const data = await pokemonService.getPokemonList(24, 0);
        setPokemonList(data);

        // 最初のポケモンを自動選択
        if (data.results.length > 0) {
          handlePokemonSelect(data.results[0].url);
        }
      } catch (error) {
        console.error('ポケモンリストの取得に失敗しました:', error);
      } finally {
        setIsLoadingList(false);
      }
    };

    initialize();
  }, [handlePokemonSelect]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
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