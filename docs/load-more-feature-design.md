# ポケモン図鑑 追加読み込み機能 設計書

## 1. 概要

ポケモン図鑑のリストに「もっと見る」ボタンを追加し、表示されている最後のポケモンNo以降の24体を追加で取得してリストに追加する機能を実装する。

## 2. 要件

### 機能要件
- 現在表示されているポケモンリストの最後のポケモンNo以降の24体をAPI経由で取得
- 取得したポケモンをリストの末尾に追加表示
- リストの最下部に「もっと見る」ボタンを配置
- ボタンクリックで追加読み込みを実行

### 非機能要件
- ローディング中の適切なUI表示
- エラー時の適切なハンドリング
- 全てのポケモンを読み込んだ場合のボタン非表示

## 3. 現状分析

### 3.1 現在の実装

#### ファイル構成
- `src/app/page.tsx`: ModernPokedexコンポーネント（メインUI）
- `src/services/pokemonService.ts`: ビジネスロジック層
- `src/api/pokemon.api.ts`: API通信層

#### 現在の動作
- 初期表示時に24体を取得 (`pokemonService.getPokemonList(24, 0)`)
- `PokemonListResponse`の構造:
  ```typescript
  {
    count: number;        // 総数
    next: string | null;  // 次のページのURL
    previous: string | null;
    results: NamedAPIResource[];
  }
  ```

### 3.2 問題点

#### API層の問題
`src/api/pokemon.api.ts:71-74`:
```typescript
async getPokemonList(limit: number, offset: number): Promise<PokemonListResponse> {
  const qs = new URLSearchParams();
  return this.fetchAPI<PokemonListResponse>(`/pokemon?${qs.toString()}`);
}
```
- URLSearchParamsを作成しているが、limitとoffsetを設定していない
- クエリパラメータが空の状態でリクエストしている
- 常に最初の20件（PokeAPIのデフォルト）を取得している

## 4. 設計

### 4.1 アーキテクチャ

```
UI層 (page.tsx)
  ↓ getPokemonList(limit, offset)
サービス層 (pokemonService.ts)
  ↓ getPokemonList(limit, offset)
API層 (pokemon.api.ts)
  ↓ /pokemon?limit={limit}&offset={offset}
PokeAPI
```

### 4.2 状態管理

#### 追加する状態
```typescript
const [isLoadingMore, setIsLoadingMore] = useState(false);
```

#### 既存の状態
```typescript
const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailWithJapanese | null>(null);
const [isLoadingList, setIsLoadingList] = useState(true);
const [isLoadingDetail, setIsLoadingDetail] = useState(false);
```

### 4.3 データフロー

1. ユーザーが「もっと見る」ボタンをクリック
2. `handleLoadMore`関数を実行
3. 現在のリストから最後のポケモンのIDを取得
4. `pokemonService.getPokemonList(24, lastPokemonId)`で次の24体を取得
5. 既存のリストに新しいデータを追加
6. 状態を更新してUIに反映

### 4.4 実装箇所

#### 4.4.1 API層の修正 (`src/api/pokemon.api.ts`)

**修正箇所**: 71-74行目

**修正内容**:
```typescript
async getPokemonList(limit: number, offset: number): Promise<PokemonListResponse> {
  const qs = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  });
  return this.fetchAPI<PokemonListResponse>(`/pokemon?${qs.toString()}`);
}
```

**理由**: limitとoffsetをURLSearchParamsに設定し、正しいクエリパラメータでAPIをリクエストする

#### 4.4.2 UI層の修正 (`src/app/page.tsx`)

**追加1: 状態管理**

追加位置: 15行目の後
```typescript
const [isLoadingMore, setIsLoadingMore] = useState(false);
```

**追加2: 追加読み込み関数**

追加位置: 57行目の後（`loadInitialPokemon`関数の後）
```typescript
// 追加読み込み処理
const handleLoadMore = useCallback(async () => {
  if (!pokemonList || isLoadingMore) return;

  try {
    setIsLoadingMore(true);

    // 現在の最後のポケモンのIDを取得
    const lastPokemon = pokemonList.results[pokemonList.results.length - 1];
    const lastPokemonId = pokemonService.extractIdFromResourceUrl(lastPokemon.url);

    if (!lastPokemonId) {
      throw new Error('最後のポケモンのIDを取得できませんでした');
    }

    // 次の24体を取得
    const newData = await pokemonService.getPokemonList(24, lastPokemonId);

    // 既存のリストに追加
    setPokemonList({
      count: newData.count,
      next: newData.next,
      previous: pokemonList.previous,
      results: [...pokemonList.results, ...newData.results]
    });
  } catch (error) {
    console.error('追加ポケモンの読み込みに失敗しました:', error);
  } finally {
    setIsLoadingMore(false);
  }
}, [pokemonList, isLoadingMore]);
```

**追加3: UIコンポーネント**

追加位置: 109行目の後（`</ScrollArea>`の直前）

```typescript
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
```

### 4.5 UIデザイン

#### ボタン仕様
- **位置**: ポケモンリストの最下部、ScrollArea内
- **デザイン**:
  - 幅: 100%
  - 背景色: 青 (`bg-blue-500`)
  - ホバー: 濃い青 (`hover:bg-blue-600`)
  - 無効時: グレー (`disabled:bg-gray-300`)
- **状態表示**:
  - 通常時: "もっと見る"
  - ローディング中: スピナー + "読み込み中..."
  - 全件表示時: ボタン非表示（`pokemonList.next === null`の場合）

### 4.6 エッジケース

| ケース | 対応 |
|--------|------|
| 全てのポケモンを表示済み | `pokemonList.next === null`の場合、ボタンを非表示 |
| APIエラー | `try-catch`でエラーをキャッチし、コンソールにログ出力。ユーザーには既存のリストを維持 |
| 連続クリック防止 | `isLoadingMore`状態でボタンを無効化 |
| 初期ロード中 | `pokemonList === null`の場合、ボタンを表示しない |

## 5. テストシナリオ

### 5.1 正常系
1. ページを開く → 最初の24体が表示される
2. リストを下にスクロール → 「もっと見る」ボタンが表示される
3. ボタンをクリック → ローディング表示が出る
4. 読み込み完了 → 新しい24体がリストに追加される
5. 選択中のポケモンは変更されない

### 5.2 異常系
1. APIエラー発生 → エラーログが出力され、既存のリストは維持される
2. ボタンの連続クリック → 最初のクリックのみ処理され、2回目は無効化される

### 5.3 境界値
1. 最後の24体を読み込む → ボタンが非表示になる
2. 151匹目（第1世代の最後）を表示 → それ以降は存在しないためボタンが非表示

## 6. 実装順序

1. **API層の修正** (`src/api/pokemon.api.ts`)
   - `getPokemonList`関数にlimitとoffsetのパラメータ設定を追加

2. **UI層の修正** (`src/app/page.tsx`)
   - `isLoadingMore`状態を追加
   - `handleLoadMore`関数を実装
   - 「もっと見る」ボタンのUIを追加

3. **動作確認**
   - 開発サーバーは起動しない（プロジェクトルールに従う）
   - 型チェックとリントを実行

## 7. 注意事項

- 現在のAPIレスポンスには`count`フィールドがあり、総ポケモン数を把握可能
- PokeAPIの仕様上、`next`フィールドが`null`の場合は全件取得済み
- 第1世代は151匹なので、151匹を超えた場合の表示は不要（自動的に制限される）
- 選択中のポケモンは追加読み込み後も維持される

## 8. 今後の拡張性

- ページング表示（1/10ページなど）
- 無限スクロール機能（ボタンではなく自動読み込み）
- 世代選択機能（第2世代以降も表示）
- スクロール位置の保持
