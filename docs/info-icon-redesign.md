# Info Icon位置変更 設計書

## 概要
PokemonListItemにあるinfo iconをPokemonHeroDisplayの右上に移動することで、リストに表示されていないポケモンでも詳細情報を確認できるようにする。

## 現状分析

### 現在の実装
- **PokemonListItem**: 各リストアイテムの右上にinfo iconがある
  - info iconクリックで詳細モーダルが開く
  - 詳細データの取得とモーダル表示機能を持つ
  - 問題点: リストに表示されていないポケモンの詳細情報を確認できない

- **PokemonHeroDisplay**: メインビューでポケモンの基本情報を表示
  - 現在はinfo iconがない
  - 画像、名前、タイプ、身長、体重を表示

### 問題点
検索機能を使用した際、リストに表示されていないポケモンは詳細情報を確認できない。
→ PokemonHeroDisplayにinfo iconを配置することで、常に選択中のポケモンの詳細情報を確認可能にする。

## 要件

### 機能要件
- PokemonHeroDisplayの右上にinfo iconを追加
- info iconクリックで選択中のポケモンの詳細モーダルを開く
- PokemonListItemからinfo icon関連のコードを削除
- 機能自体には変更なし（詳細モーダルの内容は同じ）

### UI/UX要件
- info iconはPokemonHeroDisplayの右上に配置
- ホバー時に視覚的フィードバックを提供
- クリック可能なことが分かりやすいデザイン
- モーダルは既存のPokemonDetailModalを使用

### 非機能要件
- テストは厳格に（世代切り替え時に他の世代と混ざらないように取得→表示）
- 既存の機能に影響を与えない

## 技術設計

### コンポーネント構造

**修正前**:
```
PokemonListItem
  ├── Info Icon（右上）
  ├── PokemonDetailModal
  └── 基本情報（画像、名前、番号）

PokemonHeroDisplay
  └── 基本情報（画像、名前、タイプ、身長、体重）
```

**修正後**:
```
PokemonListItem
  └── 基本情報（画像、名前、番号）

PokemonHeroDisplay
  ├── Info Icon（右上）← 追加
  ├── PokemonDetailModal ← 追加
  └── 基本情報（画像、名前、タイプ、身長、体重）
```

### PokemonHeroDisplayの変更

#### 追加する状態管理
```typescript
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
```

#### 追加する機能
1. info iconボタン
   - 位置: 絶対配置で右上（`absolute top-4 right-4`）
   - アイコン: `Info` from lucide-react
   - スタイル: 丸いボタン、ホバーで背景色変化

2. クリックハンドラー
   - `handleInfoClick`: モーダルを開く
   - pokemonがnullの場合は何もしない

3. モーダル表示
   - 既存のPokemonDetailModalを使用
   - `pokemon`が存在する場合のみレンダリング

### PokemonListItemの変更

#### 削除する内容
1. info icon関連の状態管理
   - `isDetailModalOpen`
   - `pokemonDetail`
   - `isLoadingDetail`

2. info icon関連の機能
   - `handleInfoClick`
   - `handleInfoKeyDown`

3. UI要素
   - info iconボタン
   - PokemonDetailModal

4. インポート
   - `PokemonDetailModal`
   - `Info` from lucide-react
   - `PokemonDetailWithJapanese` 型（詳細モーダル用）

## 実装コード

### PokemonHeroDisplay.tsx

```tsx
"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "./ui/badge";
import type { PokemonDetailWithJapanese } from "@/services/pokemonService";
import { getTypeColor, capitalizeFirstLetter, formatPokemonId, getTypeNameInJapanese } from "@/utils/pokemonNameMap";
import { ImageWithFallback } from "./ImageWithFallback";
import { PokemonDetailModal } from "./PokemonDetailModal";

type PokemonHeroDisplayProps = {
  pokemon: PokemonDetailWithJapanese | null;
};

export function PokemonHeroDisplay({
  pokemon,
}: PokemonHeroDisplayProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  if (!pokemon) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-6xl">?</span>
          </div>
          <p className="text-gray-500">ポケモンを選択してください</p>
        </div>
      </div>
    );
  }

  const paddedId = formatPokemonId(pokemon.id);

  // Info iconクリック時のハンドラー
  const handleInfoClick = () => {
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-center h-full p-6 text-center bg-white">
        {/* Info Icon Button - 右上 */}
        <button
          onClick={handleInfoClick}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
          aria-label="詳細情報を表示"
        >
          <Info className="w-6 h-6 text-gray-600" />
        </button>

        {/* ポケモン画像 */}
        <div className="relative mb-6">
          <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-gray-50 p-4 shadow-lg">
            <ImageWithFallback
              src={
                pokemon.sprites.other?.["official-artwork"]?.front_default || ""
              }
              fallbackSrc={pokemon.sprites.front_default || ""}
              alt={pokemon.name}
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* ポケモン基本情報 */}
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-lg mb-1">No.{paddedId}</p>
            <h1 className="text-gray-800 text-4xl mb-4">
              {pokemon.japaneseName || capitalizeFirstLetter(pokemon.name)}
            </h1>
          </div>

          {/* タイプ */}
          <div className="flex justify-center gap-2 mb-4">
            {pokemon.types.map((typeInfo) => (
              <Badge
                key={typeInfo.type.name}
                className="px-4 py-2 text-white border-0"
                style={{
                  backgroundColor: getTypeColor(typeInfo.type.name),
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                {getTypeNameInJapanese(typeInfo.type.name)}
              </Badge>
            ))}
          </div>

          {/* 基本データ */}
          <div className="flex justify-center gap-8 text-gray-700">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">身長</p>
              <p className="text-xl">{(pokemon.height / 10).toFixed(1)}m</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">体重</p>
              <p className="text-xl">{(pokemon.weight / 10).toFixed(1)}kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {pokemon && (
        <PokemonDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          pokemon={pokemon}
        />
      )}
    </>
  );
}
```

### PokemonListItem.tsx（簡略版）

info icon関連のコードを削除し、シンプルなリストアイテムに戻します。

```tsx
import { pokemonService } from "@/services/pokemonService";
import { formatPokemonId } from "@/utils/pokemonNameMap";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState, useEffect } from "react";

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

  return (
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
    </div>
  );
}
```

## メリット

### ユーザビリティ向上
1. **常にアクセス可能**: メインビュー（PokemonHeroDisplay）にinfo iconがあるため、どのポケモンでも詳細情報を確認できる
2. **検索時の利便性**: 検索で選択したポケモンがリストに表示されていなくても詳細情報を確認可能
3. **視認性向上**: メインビューの右上という目立つ位置に配置

### コード品質
1. **責任の明確化**: 詳細情報の表示はPokemonHeroDisplayが担当
2. **シンプル化**: PokemonListItemからモーダル関連のロジックを削除し、シンプルに

## テスト項目

1. **基本動作**
   - PokemonHeroDisplayの右上にinfo iconが表示される
   - info iconクリックで詳細モーダルが開く
   - モーダルに正しいポケモンの情報が表示される
   - モーダルを閉じることができる

2. **リストアイテム**
   - PokemonListItemからinfo iconが削除されている
   - リストアイテムのクリックで正しくポケモンが選択される

3. **検索機能との連携**
   - 検索でポケモンを選択した際、PokemonHeroDisplayに表示される
   - リストに表示されていないポケモンでもinfo iconから詳細情報を確認できる

4. **世代切り替え**
   - 世代を切り替えても正しく動作する
   - 詳細モーダルに正しい世代のポケモンが表示される

## 注意事項

- `PokemonHeroDisplay.tsx`を"use client"にする必要がある（useState使用のため）
- info iconは`z-10`で他の要素より前面に表示
- pokemonがnullの場合はinfo iconを表示しない（既にnullチェックがある）
- 既存のPokemonDetailModalを再利用（新規作成不要）

## まとめ

この変更により：
- ユーザーは常に選択中のポケモンの詳細情報にアクセスできる
- 検索機能との相性が向上
- コードがよりシンプルで保守しやすくなる
- リストアイテムは表示に専念し、詳細表示はメインビューが担当する責任分離が明確化
