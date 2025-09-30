# 🍶 IZAKAYA verse

IZAKAYAverse のポイント購入・管理システム

## 📋 概要

- **目的**: コンテンツ拡張を継続できる器の構築
- **技術**: Vite + React + HashRouter（フロント）、Express/FastAPI（バックエンド）
- **デプロイ**: GitHub Pages（フロント）、Render（API）
- **決済**: PayPal（1000P/5000P、JPY/USD対応）

## 🚀 現在の状況

- ✅ PayPal QRコード生成済み
- ✅ GitHub Pages用HTML作成済み
- ✅ モノレポ構成整備済み
- 🔄 API開発中
- 🔄 V2カード対応中

## 📁 プロジェクト構成

```
IZAKAYA verse/
├── apps/
│   ├── web/          # Vite + Vue (フロントエンド)
│   └── api/          # Express/FastAPI (バックエンド)
├── specs/            # 仕様書 (.sAtd)
├── assets/           # 画像・QRコード
├── satellites/       # 衛星アプリ（Gemini Lite等）
├── infra/           # Docker・インフラ設定
├── _incoming/       # 新規追加ファイル
└── .github/workflows/ # CI/CD
```

## 💳 ポイント購入

### 国内向け（JPY）
- **IZAKAYA 1000P**: ¥1,000
- **IZAKAYA 5000P**: ¥5,000

### 海外向け（USD）
- **IZAKAYA 1000P**: $10 USD
- **IZAKAYA 5000P**: $50 USD

### 支援
- **IZAKAYA Support**: 自由設定（ポイント付与なし）

## 🔗 関連リンク

- **バーチャルコミックマーケット**: https://www.amazon.co.jp/dp/B0CQQ3YNPR
- **電子妖精アバタモ⭐︎エクボ2.0**: https://www.amazon.co.jp/dp/B0CW1NBPTB
- **studioMOTO**: https://studiomoto.booth.pm/


### フロントエンドの状態
- Vue 3 + TypeScript で再構築した管理ダッシュボード。
- CSS変数ベースのスキン切替（5テーマ）と日本語/英語の言語トグルに対応。
- デザイン参照は `apps/web/public/design/` と `IZAKAYA verse/apps/webstyle/` に整理。

### BFF: Fastify ベースのゲートウェイ
- ディレクトリ: `bff/`
- 起動: `npm -w bff run dev`（ポート既定 4117）
- データ永続化: `bff/data/points.json`（自動生成、Git 管理外）
- 仕様書: `docs/BFF_SPEC.md`

### バックエンドの状態
- `apps/api/` に Docker ベースの Rails 7.1 API 初期化用テンプレートを追加。
- `docker-compose.api.yml` で PostgreSQL 15 + Rails サービスを起動。
- Rails プロジェクト未生成の場合は README の手順で `rails new` を実行してください。
## 🛠️ 開発環境

### フロントエンド
```bash
cd apps/web
npm install
npm run dev
```

### バックエンド
```bash
cd apps/api
npm install
npm run dev
```

## 📝 フェーズ計画

- **Phase 1.0**: MVP（Home/Play/Library/Tickets/Redeem）
- **Phase 1.1**: 決済導入（PayPal Smart Buttons）
- **Phase 1.2**: 配布強化（Amazon QR書籍）
- **Phase 1.3**: 生成と衛星（MetaCapture、Event Agent）

## 🔐 Secrets設定

以下の環境変数を設定してください：

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `JWT_SECRET`

## 📄 ライセンス

このプロジェクトは非公開です。
