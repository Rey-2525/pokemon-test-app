# ポケモン図鑑 追加読み込み機能 設計書

## 1. 概要

ポケモンリストの末尾に「もっと見る」ボタンを配置し、クリックすることで現在表示中のポケモンリストに追加で24体のポケモンをAPI経由で取得し、末尾に追加する機能を実装する。

## 2. 要件

### 機能要件
- 既存のポケモンリストの一番下に「もっと見る」ボタンを設置
- ボタン押下時、現在表示されているポケモンの最後のID以降のポケモン24体を取得
- 取得したポケモンを既存リストの末尾に追加（既存リストは置き換えない）
- 取得中はローディング表示を行う
- エラーハンドリングは最低限（コンソールログ出力）
- 第1世代ポケモン（151匹）まで読み込んだら「もっと見る」ボタンを非表示にする

### 非機能要件
- 既存のコード構造を維持
- 既存のAPIレイヤー・サービスレイヤーを活用
- UIは既存のデザインシステムに準拠

## 3. 現状の実装構造

### データフロー
```
UI Layer (page.tsx)
  ↓
Service Layer (pokemonService.ts)
  ↓
API Layer (pokemon.api.ts)
  ↓
PokeAPI
```

### 現在の状態管理（page.tsx）
- `pokemonList`: ポケモンリスト全体（`PokemonListResponse | null`）
- `selectedPokemon`: 選択中のポケモン詳細（`PokemonDetailWithJapanese | null`）
- `isLoadingList`: 初期読み込み中フラグ（`boolean`）
- `isLoadingDetail`: ポケモン詳細読み込み中フラグ（`boolean`）

### 既存API（pokemonService.ts）
```typescript
// 使用するメソッド
async getPokemonList(limit: number, offset: number): Promise<PokemonListResponse>
```

## 4. 実装設計

### 4.1 新規state追加

**ファイル**: `src/app/page.tsx:16`

```typescript
const [isLoadingMore, setIsLoadingMore] = useState(false);
```

**説明**:
- 「もっと見る」ボタン押下時のローディング状態を管理
- `true`の場合、ボタンを無効化しローディングアイコンを表示

### 4.2 追加読み込み関数の実装

**ファイル**: `src/app/page.tsx` (useEffectの後、returnの前)

**関数名**: `loadMorePokemon`

**実装内容**:
```typescript
const loadMorePokemon = async () => {
  if (!pokemonList) return;

  try {
    setIsLoadingMore(true);

    // 現在のリスト件数をoffsetとして使用
    const currentCount = pokemonList.results.length;

    // 次の24件を取得
    const newData = await pokemonService.getPokemonList(24, currentCount);

    // 既存リストに新規データを追加
    setPokemonList(prevList => ({
      ...newData,
      results: [...(prevList?.results || []), ...newData.results]
    }));
  } catch (error) {
    console.error('追加ポケモンの取得に失敗しました:', error);
  } finally {
    setIsLoadingMore(false);
  }
};
```

**処理フロー**:
1. `pokemonList`が未初期化の場合は早期リターン
2. `setIsLoadingMore(true)`でローディング開始
3. 現在のリスト件数（`pokemonList.results.length`）をoffsetとして取得
4. `pokemonService.getPokemonList(24, currentCount)`で次の24件を取得
5. `setPokemonList`で既存の`results`配列に新規取得データを結合
6. エラー時はコンソールにログ出力
7. `finally`で必ず`setIsLoadingMore(false)`を実行

### 4.3 UI実装

**ファイル**: `src/app/page.tsx` (ポケモンリストのmap後)

**配置場所**: `filteredPokemon.map(...)`の直後、`</>`の前

**実装内容**:
```typescript
{/* もっと読み込むボタン */}
{pokemonList && pokemonList.results.length < 151 && (
  <div className="text-center pt-4">
    <Button
      onClick={loadMorePokemon}
      disabled={isLoadingMore}
      className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300"
    >
      {isLoadingMore ? (
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
```

**表示条件**:
- `pokemonList`が存在する（初期化済み）
- かつ `pokemonList.results.length < 151`（第1世代の上限に未到達）

**ボタンの状態**:
- `isLoadingMore === true`の場合:
  - ボタンを無効化（`disabled={true}`）
  - ローディングアイコン（`Loader2`）と「読み込み中...」テキストを表示
- `isLoadingMore === false`の場合:
  - ボタンを有効化
  - 「もっと見る」テキストを表示

### 4.4 既存コンポーネントの影響範囲

**影響なし**: 以下のコンポーネントは変更不要
- `PokemonListItem`: リストアイテムの表示ロジックは変更なし
- `PokemonHeroDisplay`: 選択中ポケモンの表示ロジックは変更なし
- `handlePokemonSelect`: ポケモン選択時のロジックは変更なし
- 初期読み込み処理（useEffect）: 変更なし

## 5. データフロー図

```
【ユーザー操作】
「もっと見る」ボタンクリック
         ↓
【UI Layer】loadMorePokemon実行
  - setIsLoadingMore(true)
  - currentCount = pokemonList.results.length を計算
         ↓
【Service Layer】pokemonService.getPokemonList(24, currentCount)
         ↓
【API Layer】pokemonAPI.getPokemonList(24, currentCount)
  - クエリパラメータ: ?limit=24&offset={currentCount}
         ↓
【PokeAPI】HTTP GET リクエスト
         ↓
【API Layer】レスポンス受信（PokemonListResponse）
         ↓
【Service Layer】そのまま返却
         ↓
【UI Layer】
  - setPokemonList: 既存results + 新規results をマージ
  - setIsLoadingMore(false)
  - ボタンを再度有効化
```

## 6. エラーハンドリング

### エラーパターン
1. **ネットワークエラー**: fetch失敗時
2. **APIエラー**: PokeAPIが4xx/5xxステータスを返す場合
3. **予期しないエラー**: その他の例外

### 対応方針
- すべてのエラーを`try-catch`でキャッチ
- `console.error`でエラー内容を出力
- `finally`で必ず`setIsLoadingMore(false)`を実行してボタンを再度有効化
- ユーザーへのエラートースト等は実装しない（最低限のハンドリング）

## 7. テストシナリオ

### 正常系
1. 初期表示で24匹のポケモンが表示される
2. 「もっと見る」ボタンが表示される
3. ボタンをクリックするとローディング表示になる
4. 24匹のポケモンが末尾に追加され、合計48匹になる
5. 再度「もっと見る」をクリックして72匹になる
6. 繰り返して151匹に到達すると「もっと見る」ボタンが非表示になる

### 異常系
1. ネットワークエラー時、コンソールにエラーログが出力される
2. エラー後もボタンは有効化され、再試行可能

## 8. 実装ファイル一覧

| ファイル | 変更内容 | 変更箇所 |
|---------|---------|---------|
| `src/app/page.tsx` | state追加 | 16行目付近 |
| `src/app/page.tsx` | 関数追加 | 62-79行目付近 |
| `src/app/page.tsx` | UI追加 | 131-149行目付近 |

## 9. 補足事項

### キャッシュについて
- `pokemon.api.ts`で`cache: "force-cache"`と`revalidate: 3600`が設定されている
- 同じoffset/limitの組み合わせは1時間キャッシュされる
- 追加読み込みは異なるoffsetを使用するため、キャッシュの影響は受けない

### パフォーマンスについて
- 24件ずつの分割読み込みにより、初期表示を高速化
- PokeAPIのレート制限を考慮し、一度に大量のリクエストを発行しない設計

### 将来的な拡張案（本実装では対象外）
- 無限スクロールによる自動読み込み
- 読み込み済みポケモンの永続化（LocalStorage等）
- エラー時のリトライ機能
- エラートースト表示
- 第2世代以降のポケモンへの対応
