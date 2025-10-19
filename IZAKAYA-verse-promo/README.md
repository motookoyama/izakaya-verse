# IZAKAYA-verse-promo

ライト版プレビュー UI と Mini BFF (Express) を収めたリポジトリ構成。`npm run setup` で Pages / BFF / DNS / PayPal 設定のガイドを表示できます。

## ディレクトリ
- `apps/frontend/preview-ui` – React + Vite プレビュー UI
- `apps/bff-express` – Express/CommonJS Mini BFF
- `docs/specs` – ネットワーク仕様書
- `tools/cli/run.mjs` – CLI driven installer

## 主な npm スクリプト
```bash
npm run setup   # 対話形式で登録フローを案内
```

CI は `.github/workflows/ci.yml` で Node 18 ビルド + Docker build + 任意の Render/Railway デプロイを実行できます。
