# ポケモン詳細情報モーダル 設計書

## 概要
ポケモンリストアイテムに情報アイコン（info icon）を追加し、クリックで詳細情報を表示するモーダルを実装する。

## 要件

### 機能要件
- ポケモンリストアイテムの右上に info icon（"i"の丸アイコン）を配置
- 情報アイコンをクリック/Enter/Spaceキーで詳細モーダルを開く
- モーダル内にポケモンの詳細情報を表示:
  - ポケモン画像
  - 名前（日本語・英語）
  - 図鑑番号（No.XXX）
  - タイプ（バッジ表示）
  - 身長
  - 体重
  - ステータスバー（HP、攻撃、防御、特攻、特防、素早さ）
- モーダルはESCキーまたは背景クリックで閉じる

### UI/UX要件
- info icon は lucide-react の `Info` アイコンを使用
- アイコンは小さく控えめに配置（ポケモン画像の右上隅）
- ホバー時に背景色が変わりクリック可能であることを示す
- キーボードアクセシビリティ対応（Enter/Space）
- モーダルは shadcn/ui の Dialog コンポーネントを使用
- ステータスバーは shadcn/ui の Progress コンポーネントを使用
- レスポンシブ対応

### 非機能要件
- テストは厳格でなくても良い（基本的な動作確認のみ）
- 既存のデザインシステムとの一貫性を保つ
- パフォーマンス: モーダルは即座に開くこと

## 技術設計

### コンポーネント構成

#### 1. PokemonDetailModal コンポーネント (新規作成)
**ファイル**: `src/components/PokemonDetailModal.tsx`

**Props**:
```typescript
interface PokemonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: PokemonDetailWithJapanese;
}
```

**責務**:
- ポケモン詳細情報のモーダル表示
- ステータスバーの表示
- タイプバッジの表示
- キーボードナビゲーション対応

**表示内容**:
```typescript
- ポケモン画像（official-artwork）
- 図鑑番号
- 日本語名
- 英語名（サブテキスト）
- タイプバッジ（複数対応）
- 身長・体重
- ステータスバー:
  - HP
  - 攻撃（Attack）
  - 防御（Defense）
  - 特攻（Special Attack）
  - 特防（Special Defense）
  - 素早さ（Speed）
```

#### 2. StatBar コンポーネント (新規作成)
**ファイル**: `src/components/StatBar.tsx`

**Props**:
```typescript
interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number; // デフォルト: 255
  color?: string;
}
```

**責務**:
- ステータス値の可視化
- プログレスバーの表示
- ラベルと数値の表示

#### 3. 既存コンポーネントの修正

**PokemonListItem** (`src/components/PokemonListItem.tsx`):
- info icon ボタンを追加（右上隅に配置）
- ボタンクリック時のイベント処理
- キーボードアクセシビリティ（Enter/Space）
- クリックイベントの伝播を止める（リスト選択と競合しないように）

### UI構造

```
PokemonListItem (修正)
├── Container (既存)
│   ├── Pokemon Image (既存)
│   ├── Pokemon Info (既存)
│   └── Info Icon Button (新規)
│       └── Info Icon
└── PokemonDetailModal (新規)
    └── Dialog
        └── DialogContent
            ├── DialogHeader
            │   └── DialogTitle
            ├── Pokemon Image
            ├── Pokemon Info
            │   ├── No. & Name
            │   ├── Type Badges
            │   └── Height & Weight
            └── Stats Section
                └── StatBar[] (6個)
```

### データフロー

1. ユーザーが info icon をクリック
2. イベント伝播を stop（リスト選択を発火させない）
3. ポケモン詳細データを取得（既に取得済みの場合はスキップ）
4. `isDetailModalOpen` state が true になる
5. PokemonDetailModal が表示される
6. ステータス情報がプログレスバーで表示される
7. ユーザーがモーダルを閉じる
8. `isDetailModalOpen` state が false になる

### 実装ファイル

#### 新規作成
- `src/components/PokemonDetailModal.tsx`: 詳細モーダルコンポーネント
- `src/components/StatBar.tsx`: ステータスバーコンポーネント

#### 修正
- `src/components/PokemonListItem.tsx`: info icon の追加とモーダル制御

#### 必要なshadcn/uiコンポーネント
- `Dialog`: 既にインストール済み
- `Progress`: 新規インストール必要

### ステータスバーの設計

**ステータス名のマッピング**:
```typescript
const statNameMap: Record<string, string> = {
  hp: "HP",
  attack: "攻撃",
  defense: "防御",
  "special-attack": "特攻",
  "special-defense": "特防",
  speed: "素早さ",
};
```

**ステータスバーの色**:
```typescript
const statColorMap: Record<string, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
};
```

**最大値**: 255（ポケモンのステータスの一般的な最大値）

### スタイリング

Tailwind CSS を使用:
- info icon: 絶対配置で右上隅、小さめのサイズ（w-6 h-6）
- ホバー効果: `hover:bg-gray-200` で背景変化
- モーダル: `Dialog` の既存スタイル + カスタムレイアウト
- ステータスバー: `Progress` コンポーネント + カスタムカラー
- レスポンシブ: モバイルでもスクロール可能

### アクセシビリティ

- info icon button に `aria-label="詳細情報を表示"` を追加
- キーボードナビゲーション対応（Enter/Space）
- モーダルのフォーカストラップ（shadcn/ui Dialogが自動対応）
- ESCキーでモーダルを閉じる（shadcn/ui Dialogが自動対応）

## 実装手順

1. shadcn/ui Progress コンポーネントのインストール
   ```bash
   npx shadcn@latest add progress
   ```

2. StatBar コンポーネントの作成
   - Progress コンポーネントを使用
   - ラベル、値、カラーを props で受け取る
   - シンプルで再利用可能な設計

3. PokemonDetailModal コンポーネントの作成
   - Dialog, Badge, Progress を使用
   - ポケモン詳細情報の表示
   - ステータスバーの配置

4. PokemonListItem の修正
   - info icon ボタンの追加（右上隅に絶対配置）
   - モーダルの状態管理
   - ポケモン詳細データの取得
   - イベント伝播の制御

5. 動作確認
   - info icon のクリック
   - モーダルの表示・非表示
   - ステータスバーの表示
   - キーボード操作（Enter/Space/ESC）
   - レスポンシブ表示

6. スタイル調整
   - アイコンの配置とサイズ
   - モーダルのレイアウト
   - モバイル表示の確認

## テスト方針

基本的な動作確認のみ:
- info icon のクリックでモーダルが開く
- モーダル内に正しい情報が表示される
- ステータスバーが正しく表示される
- ESCキーでモーダルが閉じる
- 背景クリックでモーダルが閉じる
- Enter/Spaceキーでモーダルが開く
- リスト選択と競合しない

## 注意事項

- テストは厳格でなくても良い（ユニットテストは不要）
- 既存のコンポーネントスタイルを可能な限り再利用
- shadcn/ui の既存コンポーネントを活用
- イベント伝播の制御に注意（リスト選択との競合を避ける）
- ポケモン詳細データは `PokemonListItem` 内で管理（props drilling を避ける）

## データ構造

### PokemonDetailWithJapanese 型
```typescript
type PokemonDetailWithJapanese = PokemonDetail & {
  japaneseName: string;
};

type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
  };
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
};

type PokemonStat = {
  base_stat: number;
  stat: { name: string }
};
```

## レイアウトイメージ

### PokemonListItem with Info Icon
```
┌────────────────────────────────────────┐
│ [Image] [Name]              [(i)]     │ <- info icon
│         No.001                         │
└────────────────────────────────────────┘
```

### PokemonDetailModal
```
┌──────────────────────────────────────────┐
│  ポケモン詳細情報                    [X] │
│                                          │
│        [Pokemon Image]                   │
│                                          │
│           No.001                         │
│          フシギダネ                      │
│          Bulbasaur                       │
│                                          │
│    [くさ] [どく]                        │
│                                          │
│   身長: 0.7m    体重: 6.9kg             │
│                                          │
│  ステータス                              │
│  HP         ▓▓▓▓▓░░░░░ 45              │
│  攻撃       ▓▓▓▓░░░░░░ 49              │
│  防御       ▓▓▓▓░░░░░░ 49              │
│  特攻       ▓▓▓▓▓▓░░░░ 65              │
│  特防       ▓▓▓▓▓▓░░░░ 65              │
│  素早さ     ▓▓▓▓░░░░░░ 45              │
│                                          │
└──────────────────────────────────────────┘
```
