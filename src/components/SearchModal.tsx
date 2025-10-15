"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import type { NamedAPIResource } from "@/api/pokemon.api";

type PokemonWithJapaneseName = NamedAPIResource & {
  japaneseName?: string;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: PokemonWithJapaneseName[];
  onSelectPokemon: (pokemonUrl: string) => void;
};

export function SearchModal({
  isOpen,
  onClose,
  pokemonList,
  onSelectPokemon,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // モーダルが閉じられたら検索クエリをリセット
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // 検索結果のフィルタリング
  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const lowerQuery = searchQuery.toLowerCase();
    return pokemonList.filter((pokemon) => {
      // 英語名での部分一致
      const matchesEnglish = pokemon.name.toLowerCase().includes(lowerQuery);
      // 日本語名での部分一致
      const matchesJapanese =
        pokemon.japaneseName && pokemon.japaneseName.includes(searchQuery);

      return matchesEnglish || matchesJapanese;
    });
  }, [searchQuery, pokemonList]);

  const handleSelect = (pokemonUrl: string) => {
    onSelectPokemon(pokemonUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>ポケモン検索</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ポケモン名を入力..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <ScrollArea className="flex-1 mt-4">
          {searchQuery.trim() === "" ? (
            <div className="text-center py-8 text-gray-500">
              ポケモン名を入力してください
            </div>
          ) : filteredPokemon.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ポケモンが見つかりません
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPokemon.map((pokemon) => (
                <button
                  key={pokemon.name}
                  onClick={() => handleSelect(pokemon.url)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      {pokemon.japaneseName || pokemon.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {pokemon.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
