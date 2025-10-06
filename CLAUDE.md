# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## プロジェクト概要

これはNext.js 15とTypeScriptを使用したポケモン図鑑アプリケーションです。PokeAPIを使用してポケモンのデータを取得し、モダンなUIでポケモンの情報を表示します。プロジェクト名は「pokemon-canference」です。

## 開発コマンド

- **開発サーバー**: `npm run dev` - Turbopackを使用してhttp://localhost:3000で開発サーバーを起動
- **ビルド**: `npm run build` - Turbopackを使用して本番用アプリケーションをビルド
- **開始**: `npm run start` - 本番サーバーを起動
- **リント**: `npm run lint` - ESLintを実行
- **型チェック**: `npm run typecheck` - TypeScriptの型チェックを実行

## アーキテクチャと構造

- **フレームワーク**: Next.js 15 with App Router
- **TypeScript**: strict mode有効、パスエイリアス設定済み（`@/*` は `./src/*` にマップ）
- **スタイリング**: Tailwind CSS v4 + shadcn/ui コンポーネント
- **UIライブラリ**: Radix UI プリミティブ（Dialog, Progress, ScrollArea, Slot）
- **アイコン**: Lucide React
- **データソース**: PokeAPI (https://pokeapi.co/api/v2)
- **エントリーポイント**:
  - メインページ: `src/app/page.tsx` - ModernPokedexコンポーネントを表示
  - レイアウト: `src/app/layout.tsx`
  - グローバルスタイル: `src/app/globals.css`

## 主要なコンポーネント

- **ModernPokedex** (`src/app/page.tsx`): メインのポケモン図鑑UI（現在使用中）
- **Pokedex** (`src/components/Pokedex.tsx`): 旧版のポケモン図鑑UI
- **PokemonCard** (`src/components/PokemonCard.tsx`): ポケモンカード表示
- **PokemonDetailModal** (`src/components/PokemonDetailModal.tsx`): ポケモン詳細モーダル
- **PokemonHeroDisplay** (`src/components/PokemonHeroDisplay.tsx`): メインビューのポケモン表示
- **PokemonListItem** (`src/components/PokemonListItem.tsx`): リストアイテム表示
- **StatBar** (`src/components/StatBar.tsx`): ステータス値のプログレスバー

## API・データ層

- **pokeapi.ts** (`src/lib/pokeapi.ts`): PokeAPIとの通信、日本語名マッピング、型定義
- **pokemon.ts** (`src/types/pokemon.ts`): Pokemon関連の型定義
- **pokemonApi.ts** (`src/utils/pokemonApi.ts`): API呼び出しユーティリティ
- **pokemonTypes.ts** (`src/utils/pokemonTypes.ts`): ポケモンタイプ関連ユーティリティ

## 主要な設定ファイル

- `next.config.ts`: Next.js設定（画像の最適化でPokeAPIのスプライトを許可）
- `components.json`: shadcn/ui設定（New Yorkスタイル、RSC対応）
- `tsconfig.json`: strict modeとNext.jsプラグインを使用したTypeScript設定
- `package.json`: 依存関係とスクリプト

## 主要な依存関係

- **UI**: @radix-ui/react-*, lucide-react, class-variance-authority, clsx, tailwind-merge
- **開発**: TypeScript, ESLint, Tailwind CSS v4, tw-animate-css
- **Git**: simple-git-hooks

## Git Hooks

- **pre-push**: `npm run typecheck && npm run lint` - プッシュ前に型チェックとリントを実行

## 特徴・機能

- PokeAPIからポケモンデータを取得
- 日本語名対応（静的マッピング + 動的取得）
- タイプ別カラーリング
- レスポンシブデザイン
- モーダルによる詳細表示
- 無限スクロール対応（24件ずつ読み込み）
- ローディング状態の表示
- エラーハンドリング

## 開発ノート

- プロジェクトは開発と本番ビルドの両方でTurbopackを使用
- 現在は第1世代ポケモン（151匹）を対象としている
- 画像はPokeAPIの公式スプライト画像を使用
- APIレスポンスは1時間のキャッシュ設定
- メインページは `src/app/page.tsx` の ModernPokedex コンポーネント

## 開発ルール

- 実装のための設計書の作成は、すべてマークダウン(.md)形式で行う