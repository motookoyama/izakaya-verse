# IZAKAYA Kit Component

このディレクトリは `apps/web/src/components` をベースにした再利用用キットです。

- バージョン: v0.3.0
- 元リポジトリ: `/apps/web/src/components`
- 更新日: 2025-09-30

## 内容
- Vue 3 コンポーネント一式（チャット、ホーム、MetaCapture、ナレッジ等）
- 仕様書: `components/README.md` を参照
- 依存関係: `vue`, `vue-i18n`, `qrcode`, `pako` ほか

## 利用方法
1. 任意のVueプロジェクトに `components/` 以下をコピー
2. テーマ変数や i18n 文言を必要に応じて `themes/`, `locales/` 相当の構造へ合わせる
3. MetaCaptureを利用する場合は `types/metacapture.ts` と `utils/metacaptureLibrary.ts` も取り込む

---
最終更新: 2025-09-30 / 作成者: Codex
