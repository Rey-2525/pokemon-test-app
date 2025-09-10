// Tailwind CSS v4 用の PostCSS 設定
// Turbopack 環境でネイティブバイナリの解決エラーを避けるため、
// プラグインは文字列指定で PostCSS 実行時に解決させます。
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
