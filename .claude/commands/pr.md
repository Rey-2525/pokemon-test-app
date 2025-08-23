---
description: 'GitHub MCPを使用してプルリクエストを自動作成'
allowed-tools: ['mcp__github__*', 'bash']
---

# Create Pull Request with GitHub MCP

GitHub MCP を使用してプルリクエストを作成します。

## 手順

### 1. CLAUDE.md を読み込み

@CLAUDE.md

### 2. リポジトリ情報を取得（HTTPS 接続）

!git remote -v

### 3. 現在のブランチ情報を取得

!git branch

### 4. 差分を取得（develop または master との比較）

!git diff origin/develop 2>/dev/null || git diff origin/master 2>/dev/null || git diff HEAD~1

### 5. PR テンプレートを確認

!cat .github/pull_request_template.md

### 6. 適切なファイルをステージング（src 配下、設定ファイル、Claude 設定、GitHub 設定）

git add src/ package.json package-lock.json next.config.js tsconfig.json .claude/commands/ .github/ 2>/dev/null || true

### 7. ステージングされた変更を確認

!git status --porcelain

### 8. コミット履歴を確認

!git log --oneline -10

## プルリクエスト作成指示

上記の情報を基に、以下の要件でプルリクエストを作成してください：

**リポジトリ**: git remote -v の結果から取得
**元ブランチ**: 現在のブランチ（git branch の結果から取得）
**ターゲットブランチ**: `develop`（存在しない場合は`master`）

**タイトル**: 差分内容と実装内容から適切なタイトルを生成

**プルリク内容**:

- 発見された PR テンプレートがあれば、そのフォーマットに従う
- 差分内容（git diff）から変更点を分析して説明を作成
- 新規 API リクエストがある場合は、API 名とパラメータを明記
- 変更の目的と影響範囲を記載
- TypeScript の型安全性について言及
- Next.js のビルドエラーがないことを確認

**注意事項**:

- ローカルブランチがプッシュされていない場合は、まず git push を実行
- ブランチが存在しない等の問題があれば適切に対処
- PR テンプレートが複数見つかった場合は最も適切なものを選択
- **Git 接続**: HTTPS 接続を使用（`https://github.com/owner/repo.git`形式）
- TypeScript のコンパイルエラーがないことを確認
- ESLint の警告やエラーがないことを確認

引数: $ARGUMENTS（追加の指示や説明があれば使用）

GitHub MCP ツールを使用してプルリクエストを作成してください。
