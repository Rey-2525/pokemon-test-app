import { pokemonService, type PokemonDetailWithJapanese } from "@/services/pokemonService";
import { formatPokemonId } from "@/utils/pokemonNameMap";
import { ImageWithFallback } from "./ImageWithFallback";
import { PokemonDetailModal } from "./PokemonDetailModal";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";

const POKEMON_SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

type PokemonListItemProps = {
  name: string;
  url: string;
  onClick: () => void;
  isSelected?: boolean;
};

export function PokemonListItem({
  name,
  url,
  onClick,
  isSelected = false,
}: PokemonListItemProps) {
  const pokemonId = pokemonService.extractIdFromResourceUrl(url);
  const paddedId = formatPokemonId(pokemonId || 0);

  // 動的日本語名取得の状態管理
  const [japaneseName, setJapaneseName] = useState<string>('');
  const [isLoadingJapaneseName, setIsLoadingJapaneseName] = useState(true);

  // 詳細モーダルの状態管理
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetailWithJapanese | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    // 常に動的取得を実行
    if (pokemonId) {
      setIsLoadingJapaneseName(true);
      pokemonService.getPokemonNameInJapanese(pokemonId)
        .then(dynamicName => {
          setJapaneseName(dynamicName);
        })
        .catch(error => {
          console.warn(`Failed to get dynamic Japanese name for ${name}:`, error);
          // エラー時は元の名前を保持
          setJapaneseName(name);
        })
        .finally(() => {
          setIsLoadingJapaneseName(false);
        });
    }
  }, [name, pokemonId]);

  // Info iconクリック時のハンドラー
  const handleInfoClick = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // リスト選択イベントを止める

    if (!pokemonId) return;

    // 既に詳細データがある場合はモーダルを開くだけ
    if (pokemonDetail) {
      setIsDetailModalOpen(true);
      return;
    }

    // 詳細データを取得
    try {
      setIsLoadingDetail(true);
      const detail = await pokemonService.getPokemonDetailWithJapaneseName(pokemonId);
      setPokemonDetail(detail);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error(`Failed to get pokemon detail for ${name}:`, error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // キーボードイベントハンドラー
  const handleInfoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleInfoClick(e);
    }
  };

  return (
    <>
      <div
        className={`
          relative flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200
          ${
            isSelected
              ? "bg-red-50 scale-105 shadow-md border-2 border-red-200"
              : "bg-white hover:bg-gray-50 shadow-sm border border-gray-100"
          }
        `}
        onClick={onClick}
      >
        <div className="flex items-center space-x-4 flex-1">
          {/* ポケモン画像 */}
          <div className="w-12 h-12 flex-shrink-0">
            <ImageWithFallback
              src={`${POKEMON_SPRITE_BASE_URL}/${pokemonId || 0}.png`}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* ポケモン情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-gray-600 text-sm">No.{paddedId}</span>
            </div>
            <h3 className="text-gray-800 truncate text-lg">
              {isLoadingJapaneseName ? (
                <span className="text-gray-500 animate-pulse">読み込み中...</span>
              ) : (
                japaneseName || name
              )}
            </h3>
          </div>
        </div>

        {/* Info Icon Button */}
        <button
          onClick={handleInfoClick}
          onKeyDown={handleInfoKeyDown}
          disabled={isLoadingDetail}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="詳細情報を表示"
          tabIndex={0}
        >
          <Info className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 詳細モーダル */}
      {pokemonDetail && (
        <PokemonDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          pokemon={pokemonDetail}
        />
      )}
    </>
  );
}
