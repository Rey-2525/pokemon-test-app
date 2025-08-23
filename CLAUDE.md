# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## プロジェクト概要

これは `create-next-app` で作成されたNext.js 15プロジェクトで、App Routerアーキテクチャ、TypeScript、Tailwind CSS v4を使用しています。プロジェクト名は「pokemon-canference」で、開発初期段階にあります。

## 開発コマンド

- **開発サーバー**: `npm run dev` - Turbopackを使用してhttp://localhost:3000で開発サーバーを起動
- **ビルド**: `npm run build` - Turbopackを使用して本番用アプリケーションをビルド
- **開始**: `npm run start` - 本番サーバーを起動
- **リント**: `npm run lint` - Next.js設定でESLintを実行
- **型チェック**: `npm run typecheck` - TypeScriptの型チェックを実行

## アーキテクチャと構造

- **フレームワーク**: Next.js 15 with App Router
- **TypeScript**: strict mode有効、パスエイリアス設定済み（`@/*` は `./src/*` にマップ）
- **スタイリング**: テーマ用のカスタムCSS変数を使用したTailwind CSS v4
- **フォント**: Google FontsのGeist SansとGeist Mono
- **エントリーポイント**:
  - メインページ: `src/app/page.tsx`
  - レイアウト: `src/app/layout.tsx`
  - グローバルスタイル: `src/app/globals.css`

## 主要な設定ファイル

- `next.config.ts`: Next.js設定（現在は最小限）
- `tsconfig.json`: strict modeとNext.jsプラグインを使用したTypeScript設定
- `eslint.config.mjs`: Next.js core-web-vitalsとTypeScriptルールを使用したESLint
- `postcss.config.mjs`: Tailwind CSS用のPostCSS設定

## Git Hooks

- **pre-push**: `npm run typecheck && npm run lint` - プッシュ前に型チェックとリントを実行
- simple-git-hooksを使用してGitフックを管理

## 開発ノート

- プロジェクトは開発と本番ビルドの両方でTurbopackを使用
- ダークモードはCSS カスタムプロパティと `prefers-color-scheme` でサポート
- ESLintは `.next/`、`out/`、`build/`、`node_modules/` ディレクトリを無視
- メインページの編集は `src/app/page.tsx` で行い、ホットリロードが有効