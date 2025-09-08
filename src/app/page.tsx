"use client";

import { useState, useMemo } from "react";
import PokemonSearch from "@/components/PokemonSearch";
import PokemonCardNew from "@/components/PokemonCardNew";
import PokemonDetailModal from "@/components/PokemonDetailModal";
import { extractIdFromResourceUrl, getPokemonDetail, getPokemonList } from "@/lib/pokeapi";
import { getPokemonNameInJapanese } from "@/lib/pokeapi";
import type { PokemonDetail } from "@/lib/pokeapi";
import { useEffect } from "react";

export default function Page() {
  const [pokemonList, setPokemonList] = useState<PokemonDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load pokemon data
  useEffect(() => {
    async function loadPokemon() {
      try {
        const list = await getPokemonList(24, 0);
        const details = await Promise.all(
          list.results.map(async (r) => {
            const id = extractIdFromResourceUrl(r.url) ?? r.name;
            return getPokemonDetail(id);
          })
        );
        setPokemonList(details);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load pokemon:", error);
        setLoading(false);
      }
    }
    loadPokemon();
  }, []);

  // Filter pokemon based on search query
  const filteredPokemon = useMemo(() => {
    if (!searchQuery) return pokemonList;
    
    return pokemonList.filter((pokemon) =>
      getPokemonNameInJapanese(pokemon.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pokemon.id.toString().includes(searchQuery)
    );
  }, [pokemonList, searchQuery]);

  const handlePokemonClick = (pokemon: PokemonDetail) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PokemonSearch onSearch={setSearchQuery} />
        <div className="p-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <PokemonSearch onSearch={setSearchQuery} />

      {/* Pokemon List */}
      <div className="p-4">
        {filteredPokemon.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {searchQuery ? "ポケモンが見つかりません" : "ポケモンデータがありません"}
          </div>
        ) : (
          <div>
            {/* Featured Pokemon (first one) */}
            <PokemonCardNew
              pokemon={filteredPokemon[0]}
              onClick={() => handlePokemonClick(filteredPokemon[0])}
            />

            {/* Pokemon List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
              {filteredPokemon.slice(1).map((pokemon) => (
                <PokemonCardNew
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => handlePokemonClick(pokemon)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}