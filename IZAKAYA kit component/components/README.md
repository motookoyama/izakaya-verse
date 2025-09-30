# IZAKAYA Verse Vue Components

- バージョン: v0.3.0 (2025-09-30 更新)
- フレームワーク: Vue 3 + Vite
- 共通スタイル: `apps/web/src/style.css` とテーマ変数 (`apps/web/src/themes/`)

| コンポーネント | 役割 | 主要依存 |
| --- | --- | --- |
| `HeroSection.vue` | ホームヒーロー（タイトル／リード表示） | i18n 文言 |
| `TopNav.vue` | ハッシュベースのページ切替ナビゲーション | `useTheme`, `i18n` |
| `FeatureGrid.vue` / `InfoGrid.vue` / `KnowledgeSection.vue` | ホームカード群・ナレッジ表示 | データ: `home.ts` |
| `AccountPanel.vue` | ユーザ残高・ステータス表示 | `useAccount` |
| `V2GamePanel.vue` | V2カードスロット要約 | `data/v2cards` |
| `PaymentGrid.vue` | PayPal QRによるポイント／支援導線 | `home.payments` i18n |
| `ChatConsole.vue` / `V2ChatWorkspace.vue` / `V2ChatLog.vue` / `V2ChatComposer.vue` | チャット画面一式 | `useChat`, `useAccount` |
| `MetaCaptureWorkspace.vue` | 画像→V2カード草案生成ワークスペース | `qrcode`, `pako` |
|

## 応用ヒント
- V2カードデータ構造は `apps/web/src/types/metacapture.ts` と `data/v2cards` に集約しているため、他プロジェクトへ転用しやすい。
- ペイメントQR等の静的アセットは `apps/web/src/assets/payments/` にまとめている。
- カラーテーマは `apps/web/src/themes/palettes.ts` を差し替えることで適用変更が可能。

## 使用方法
1. ルートで `npm install`、続いて `npm install --workspace apps/web` を実行
2. 必要な追加依存（`qrcode`, `pako`）をインストール
3. `npm -w apps/web run dev` で起動し `http://localhost:5173/#/home` へアクセス
4. 各ページの導線からコンポーネントを確認

---
最終更新: 2025-09-30 / 作成者: Codex
