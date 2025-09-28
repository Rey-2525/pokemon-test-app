# Repository Guidelines

## プロジェクト構成とモジュール配置
- ソース: `src/`（App Router のページは `src/app/`）。
- UI: 再利用可能なコンポーネントは `src/components/`（ファイル名は PascalCase）。ユーティリティは `src/lib/` と `src/utils/`。
- アセット: 静的ファイルは `public/`。設定はリポジトリ直下（`next.config.ts`、`eslint.config.mjs`、`tsconfig.json`）。
- パスエイリアス: `@/*` でインポート（`tsconfig.json` 参照）。

## ビルド・テスト・開発コマンド
- `npm run dev`: ローカル開発サーバー（Turbopack）を `http://localhost:3000` で起動。
- `npm run build`: Next.js（Turbopack）で本番ビルド。
- `npm start`: 本番ビルドを起動。
- `npm run lint`: Next.js ルールで ESLint 実行。
- `npm run typecheck`: TypeScript 厳格チェック（`noEmit`）。
- プリプッシュフック: `simple-git-hooks` により typecheck と lint を実行（`package.json` 参照）。問題を解消してから push。

## コーディング規約と命名
- 言語: TypeScript（`strict: true`）。境界（props/戻り値）では明示的な型を推奨。
- コンポーネント: PascalCase ファイル名（例: `src/components/PokemonCard.tsx`）。変数/関数は camelCase。定数は UPPER_SNAKE_CASE。
- インポート: ローカルは `@/` エイリアスを使用。標準/ライブラリ/ローカルの順にグループ化。
- フォーマット: ESLint（`next/core-web-vitals`、`next/typescript`）に準拠。インデント2スペース。未使用の import/変数禁止。
- スタイリング: Tailwind CSS v4 を JSX で使用。クラスは最小・合成可能に。

## テスト方針
- フレームワーク: 未導入。導入する場合は、コンポーネントに React Testing Library、E2E に Playwright を推奨。
- 配置: ソースに対応して `__tests__/` 配下、または `*.test.ts(x)` として同居。
- コマンド: テストランナー導入時に `test` とカバレッジのスクリプトを追加し、本書に追記。

## コミット/プルリクエスト方針
- コミット: 簡潔に命令形（例: "Add Pokemon search pagination"）。必要に応じてディレクトリスコープ（例: `components:`）。
- PR: `.github/pull_request_template.md` を使用。概要、チェックリストの結果、UI 変更はスクリーンショット（Before/After表）を添付。
- 関連 Issue をリンクし、アプローチ/トレードオフ、フォローアップを記載。

## アーキテクチャ備考
- スタック: Next.js 15（App Router）+ React 19、Tailwind CSS v4、Radix UI。
- 画像: `next.config.ts` の remotePatterns により `raw.githubusercontent.com/PokeAPI/sprites/**` を許可。
