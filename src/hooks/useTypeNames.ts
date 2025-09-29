import { useState, useEffect } from "react";
import { getTypeNameInJapaneseDynamic } from "@/lib/pokeapi";
import type { PokemonType } from "@/lib/pokeapi";

/**
 * ポケモンタイプ名の日本語化を管理するカスタムフック
 * @param types ポケモンのタイプ配列
 * @returns 英語名→日本語名のマッピングオブジェクト
 */
export function useTypeNames(types?: PokemonType[]): Record<string, string> {
  const [typeNames, setTypeNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (types && types.length > 0) {
      // 全タイプの日本語名を並行取得
      const typePromises = types.map(async (typeInfo) => {
        const japaneseName = await getTypeNameInJapaneseDynamic(typeInfo.type.name);
        return { englishName: typeInfo.type.name, japaneseName };
      });

      Promise.all(typePromises)
        .then(results => {
          const newTypeNames: Record<string, string> = {};
          results.forEach(({ englishName, japaneseName }) => {
            newTypeNames[englishName] = japaneseName;
          });
          setTypeNames(newTypeNames);
        })
        .catch(error => {
          console.warn('Failed to get Japanese names for types:', error);
          // エラー時は空のオブジェクトを維持
        });
    } else {
      // typesが空の場合はリセット
      setTypeNames({});
    }
  }, [types]);

  return typeNames;
}