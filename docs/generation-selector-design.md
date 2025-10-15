# ポケモン世代選択機能 設計書

## 概要
ポケモン図鑑に世代選択機能を追加し、第1世代と第2世代のポケモンを切り替えて表示できるようにする。

## 要件

### 機能要件
- 第1世代（1-151）と第2世代（152-251）のポケモンをAPIから取得
- 画面右上に世代選択ボタンを配置
- ボタンをクリックして世代を切り替え
- 世代切り替え時は、選択した世代のポケモンのみを表示
- 検索機能も選択中の世代のポケモンのみを対象とする
- 画面上部の「ポケモン図鑑」タイトルと虫眼鏡アイコンを削除
- 世代選択ボタンと検索機能は統合（ボタンの横に検索アイコンを配置）

### UI/UX要件
- 世代選択は2つのボタン（「第1世代」「第2世代」）で切り替え
- 選択中の世代のボタンはアクティブ状態を表示
- 世代切り替え時は選択中のポケモンをリセットし、新しい世代の最初のポケモンを表示
- ローディング状態を表示
- レスポンシブ対応

### 非機能要件
- **テストは厳格に**: 世代切り替え時に1世代と2世代のポケモンが混ざらないように取得・表示
- パフォーマンス: 世代切り替え時のローディングは最小限に
- データの一貫性: 世代ごとに完全にデータをクリアして再取得

## 技術設計

### ポケモン世代の定義

```typescript
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
```

### 状態管理

**ModernPokedex** (`src/app/page.tsx`):

新しい状態:
```typescript
const [currentGeneration, setCurrentGeneration] = useState<Generation>(1);
```

既存の状態:
- `pokemonList`: 世代切り替え時にクリア
- `selectedPokemon`: 世代切り替え時にクリア
- `allPokemonForSearch`: 世代ごとに再取得

### データフロー

#### 初期読み込み
1. デフォルトで第1世代を選択
2. 第1世代のポケモン24匹を取得
3. 最初のポケモンを自動選択
4. 検索用に第1世代の全ポケモン（151匹）を取得

#### 世代切り替え時
1. ユーザーが世代選択ボタンをクリック
2. `currentGeneration` を更新
3. **全ての既存データをクリア**:
   - `pokemonList` を null に
   - `selectedPokemon` を null に
   - `allPokemonForSearch` を空配列に
4. 選択した世代のポケモン24匹を取得
5. 最初のポケモンを自動選択
6. 検索用に選択した世代の全ポケモンを取得

### UI構造

```
ModernPokedex
├── Header (修正)
│   ├── Generation Selector (新規)
│   │   ├── Button "第1世代" (active if gen === 1)
│   │   └── Button "第2世代" (active if gen === 2)
│   └── Search Icon Button (移動)
├── SearchModal (既存 - 世代対応)
└── Main Content (既存)
```

### 実装ファイル

#### 修正
- `src/app/page.tsx`:
  - ヘッダーUIの修正（タイトル削除、世代選択ボタン追加）
  - 世代選択の状態管理
  - 世代切り替えロジック
  - データ取得処理の世代対応

#### 新規作成
- なし（既存コンポーネントの修正のみ）

### API呼び出しの修正

#### 現在の実装
```typescript
// 初期読み込み: 0から24匹取得
await pokemonService.getPokemonList(24, 0);

// 検索用: 0から151匹取得
await pokemonService.getPokemonList(151, 0);
```

#### 修正後
```typescript
// 初期読み込み: 世代に応じたoffsetとlimit
const config = GENERATION_CONFIG[currentGeneration];
await pokemonService.getPokemonList(24, config.startId - 1);

// 検索用: 世代の全ポケモンを取得
await pokemonService.getPokemonList(config.count, config.startId - 1);
```

### 世代切り替えハンドラー

```typescript
const handleGenerationChange = useCallback(async (generation: Generation) => {
  if (generation === currentGeneration) return;

  try {
    // 全データをクリア（世代が混ざらないようにする）
    setPokemonList(null);
    setSelectedPokemon(null);
    setAllPokemonForSearch([]);

    // 世代を更新
    setCurrentGeneration(generation);

    setIsLoadingList(true);

    const config = GENERATION_CONFIG[generation];
    const data = await pokemonService.getPokemonList(24, config.startId - 1);
    setPokemonList(data);

    if (data.results.length > 0) {
      await handlePokemonSelect(data.results[0].url);
    }

    // 検索用の全ポケモンを取得
    const allData = await pokemonService.getPokemonList(config.count, config.startId - 1);
    const pokemonWithJapanese = await Promise.all(
      allData.results.map(async (pokemon) => {
        const id = pokemonService.extractIdFromResourceUrl(pokemon.url);
        if (!id) return { ...pokemon, japaneseName: pokemon.name };

        try {
          const japaneseName = await pokemonService.getPokemonNameInJapanese(id);
          return { ...pokemon, japaneseName };
        } catch (error) {
          return { ...pokemon, japaneseName: pokemon.name };
        }
      })
    );

    setAllPokemonForSearch(pokemonWithJapanese);
  } catch (error) {
    console.error('世代切り替えに失敗しました:', error);
  } finally {
    setIsLoadingList(false);
  }
}, [currentGeneration, handlePokemonSelect]);
```

### 「もっと見る」ボタンの修正

世代の範囲を超えないように制御:

```typescript
const handleLoadMore = useCallback(async () => {
  if (!pokemonList || isLoadingMore) return;

  const config = GENERATION_CONFIG[currentGeneration];
  const lastPokemon = pokemonList.results[pokemonList.results.length - 1];
  const lastPokemonId = pokemonService.extractIdFromResourceUrl(lastPokemon.url);

  if (!lastPokemonId) return;

  // 世代の範囲を超えている場合は読み込まない
  if (lastPokemonId >= config.endId) return;

  // 次の24体を取得（世代の範囲内に制限）
  const remainingCount = config.endId - lastPokemonId;
  const loadCount = Math.min(24, remainingCount);

  const newData = await pokemonService.getPokemonList(loadCount, lastPokemonId);

  setPokemonList({
    count: newData.count,
    next: lastPokemonId + loadCount < config.endId ? newData.next : null,
    previous: pokemonList.previous,
    results: [...pokemonList.results, ...newData.results]
  });
}, [pokemonList, isLoadingMore, currentGeneration]);
```

## UI設計

### ヘッダーレイアウト

**修正前**:
```
┌────────────────────────────────────────┐
│ ポケモン図鑑              [🔍]        │
└────────────────────────────────────────┘
```

**修正後**:
```
┌────────────────────────────────────────┐
│         [第1世代] [第2世代]     [🔍]  │
└────────────────────────────────────────┘
```

### 世代選択ボタンのスタイル

**非選択時**:
- 背景: 白または薄いグレー
- 文字色: グレー
- ボーダー: グレー

**選択時**:
- 背景: 青色（bg-blue-500）
- 文字色: 白
- ボーダー: 青色
- シャドウ: 軽いシャドウ

## 実装手順

1. **定数の定義**
   - `GENERATION_CONFIG` を定義
   - `Generation` 型を定義

2. **状態管理の追加**
   - `currentGeneration` state を追加

3. **ヘッダーUIの修正**
   - 「ポケモン図鑑」タイトルを削除
   - 世代選択ボタンを追加
   - 検索アイコンを右側に移動

4. **世代切り替えハンドラーの実装**
   - `handleGenerationChange` を実装
   - データクリア処理
   - 新しい世代のデータ取得

5. **初期読み込み処理の修正**
   - 世代に応じたoffsetを使用
   - `currentGeneration` に依存

6. **検索用データ取得の修正**
   - 世代に応じたcount/offsetを使用
   - `currentGeneration` に依存

7. **「もっと見る」ボタンの修正**
   - 世代の範囲チェック
   - 残りのポケモン数を計算

8. **テスト**
   - 第1世代の表示確認（1-151のみ）
   - 第2世代の表示確認（152-251のみ）
   - 世代切り替え時にデータが混ざらないことを確認
   - 検索機能が世代に応じて動作することを確認
   - 「もっと見る」ボタンが世代の範囲内で動作することを確認

## テスト方針

### 厳格なテスト項目

1. **世代の分離**
   - 第1世代選択時: ID 1-151 のみ表示
   - 第2世代選択時: ID 152-251 のみ表示
   - 世代切り替え時に前の世代のデータが残らない

2. **データの一貫性**
   - リストに表示されるポケモンは全て選択中の世代
   - 検索結果も選択中の世代のポケモンのみ
   - 「もっと見る」で追加されるポケモンも選択中の世代

3. **境界値のテスト**
   - 第1世代の最後（No.151 フシギバナ系統の最終進化）
   - 第2世代の最初（No.152 チコリータ）
   - 第2世代の最後（No.251 セレビィ）

4. **状態管理のテスト**
   - 世代切り替え時に選択中のポケモンがリセットされる
   - 世代切り替え時にリストがクリアされる
   - 世代切り替え時に検索用データがクリアされる

## 注意事項

- 世代切り替え時は必ず全データをクリアしてから新しいデータを取得
- `useEffect` の依存配列に `currentGeneration` を追加
- API呼び出しのoffsetは `startId - 1`（PokeAPIは0始まり）
- 第2世代は100匹（152-251）
- エラーハンドリングを適切に実装
- ローディング状態を適切に管理

## 将来の拡張性

将来的に第3世代以降を追加する場合:
- `GENERATION_CONFIG` に新しい世代を追加
- `Generation` 型を拡張（`type Generation = 1 | 2 | 3 | ...`）
- UIのボタンを動的に生成するように修正（ハードコードを避ける）
