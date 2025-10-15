# ポケモン検索機能 設計書

## 概要
ポケモン図鑑にリアルタイム検索機能を追加し、ユーザーがポケモン名で素早く絞り込みできるようにする。

## 要件

### 機能要件
- 画面上部にある検索アイコンをクリックすると「ポケモン検索」モーダルが表示される
- モーダル内に検索用のテキストボックスを配置
- プレースホルダーテキスト: 「ポケモン名を入力...」
- 1文字でも入力されたら即座に合致するポケモンを表示
- 日本語名と英語名の両方で検索可能
- 部分一致検索をサポート（前方一致・中間一致）
- 検索結果はリアルタイムで更新

### UI/UX要件
- モーダルは shadcn/ui の Dialog コンポーネントを使用
- 検索ボックスは shadcn/ui の Input コンポーネントを使用
- 検索結果は一覧表示し、クリックで詳細モーダルを開く
- 検索結果が0件の場合は「ポケモンが見つかりません」メッセージを表示
- モーダルはESCキーまたは背景クリックで閉じる

### 非機能要件
- テストは厳格でなくても良い（基本的な動作確認のみ）
- レスポンシブ対応
- パフォーマンス: 検索は即座に反応すること

## 技術設計

### コンポーネント構成

#### 1. SearchModal コンポーネント (新規作成)
**ファイル**: `src/components/SearchModal.tsx`

**Props**:
```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: SimplePokemon[];
  onSelectPokemon: (pokemon: SimplePokemon) => void;
}
```

**責務**:
- 検索モーダルの表示制御
- 検索入力の管理
- 検索結果のフィルタリング
- 検索結果の一覧表示

**状態管理**:
```typescript
const [searchQuery, setSearchQuery] = useState<string>("");
const [filteredPokemon, setFilteredPokemon] = useState<SimplePokemon[]>([]);
```

**検索ロジック**:
```typescript
// 日本語名と英語名の両方で部分一致検索
const filterPokemon = (query: string) => {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  return pokemonList.filter(pokemon =>
    pokemon.name.toLowerCase().includes(lowerQuery) ||
    (pokemon.japaneseName && pokemon.japaneseName.includes(query))
  );
};
```

#### 2. 既存コンポーネントの修正

**ModernPokedex** (`src/app/page.tsx`):
- 検索アイコンボタンを追加（画面上部）
- SearchModal の統合
- 検索モーダルの開閉状態を管理
- 検索結果からポケモン選択時の処理

### UI構造

```
ModernPokedex (page.tsx)
├── Header
│   ├── Title
│   └── Search Icon Button (新規)
├── SearchModal (新規)
│   ├── Dialog
│   │   ├── DialogContent
│   │   │   ├── DialogHeader
│   │   │   │   └── DialogTitle "ポケモン検索"
│   │   │   ├── Input (検索ボックス)
│   │   │   └── ScrollArea (検索結果)
│   │   │       └── PokemonListItem[] or Empty State
└── (既存のコンポーネント)
```

### データフロー

1. ユーザーが検索アイコンをクリック
2. `isSearchOpen` state が true になる
3. SearchModal が表示される
4. ユーザーが検索ボックスに入力
5. `searchQuery` state が更新される
6. `useEffect` で `filterPokemon` を実行
7. `filteredPokemon` state が更新される
8. 検索結果が再レンダリングされる
9. ユーザーがポケモンをクリック
10. 詳細モーダルが開く
11. 検索モーダルが閉じる

### 実装ファイル

#### 新規作成
- `src/components/SearchModal.tsx`: 検索モーダルコンポーネント

#### 修正
- `src/app/page.tsx`: 検索ボタンとモーダルの統合

### スタイリング

Tailwind CSS を使用:
- モーダル: `Dialog` の既存スタイル
- 検索ボックス: `Input` コンポーネントのデフォルトスタイル
- 検索結果: `PokemonListItem` の既存スタイルを再利用
- 空状態: 中央配置のテキスト表示

### パフォーマンス最適化

- `useMemo` で検索結果をメモ化
- デバウンス処理は不要（ポケモン数が少ないため）
- 検索結果の表示件数制限は不要（最大151匹）

## 実装手順

1. SearchModal コンポーネントの作成
   - Dialog, Input, ScrollArea を使用した基本構造
   - 検索ロジックの実装
   - 検索結果の表示

2. ModernPokedex の修正
   - 検索アイコンボタンの追加
   - 検索モーダルの状態管理
   - SearchModal の統合

3. 動作確認
   - 検索機能の基本動作
   - 日本語・英語の両方で検索
   - モーダルの開閉
   - 検索結果からの選択

4. スタイル調整
   - レスポンシブ対応
   - モバイル表示の確認

## テスト方針

基本的な動作確認のみ:
- 検索ボックスへの入力
- 日本語名での検索
- 英語名での検索
- 部分一致検索
- 検索結果が0件の場合
- ポケモン選択時の動作

## 注意事項

- テストは厳格でなくても良い（ユニットテストは不要）
- 既存のコンポーネントスタイルを可能な限り再利用
- shadcn/ui の既存コンポーネントを活用
- シンプルで直感的なUIを心がける
