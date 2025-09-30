# IZAKAYA Builder Runbook

目的: プロジェクトを迷わず起動・停止・再開できるよう簡潔な手順をまとめる。

## よく使うコマンド
- 起動: `scripts/start.sh`

## BFF 起動
- コマンド: `npm -w bff install`（初回のみ）→ `npm -w bff run dev`
- ポート: `4117`（`.env` の `PORT` で変更可能）
- API 仕様: `docs/BFF_SPEC.md`
- データ: `bff/data/points.json` が自動生成される。不要なら削除するだけでリセット可能。
- 停止: `scripts/stop.sh`
- 再起動: `scripts/restart.sh`
- 起動補助: `scripts/start-lite.sh`
- 状態確認: `scripts/diag.sh`

## スタック概要
- フロント: Vue 3 (Vite) — `apps/web`
- API: Rails (準備中) — `apps/api` (既定 3117)
- 仕様: `docs/` と `backups/20250926/` の sAtd アーカイブ


## フロントエンド補足
- Vue 3 + Vite。`apps/web/src/themes/` でスキン定義、`src/plugins/i18n.ts` で日本語/英語を管理。
- `npm run build --workspace apps/web` で GitHub Pages 向け `apps/web/docs/` を生成。
- デザイン参照: `apps/web/public/design/` / `IZAKAYA verse/apps/webstyle/`。

## API セットアップ
- Docker Compose: `docker compose -f docker-compose.api.yml build` で Rails 用イメージを準備
- プロジェクト生成: `docker compose -f docker-compose.api.yml run --rm api bundle exec rails new . --force --no-deps --api --database=postgresql`
- DB 作成: `docker compose -f docker-compose.api.yml run --rm api bundle exec rails db:create`
- 起動: `docker compose -f docker-compose.api.yml up` で API (3000) / PostgreSQL (5432) を起動

Rails のジェネレータを実行するときも同じコンテナを利用してください:
```bash
docker compose -f docker-compose.api.yml run --rm api bundle exec rails g model User email:string persona:string tier:string
```
## クラウド（Codespaces / Dev Container）
- GitHubへプッシュ → 「Create codespace on main」
- Dev Container 起動後に `npm install` と `scripts/start.sh`
- ポート: 5173 (Vue dev server), 3117 (API予定), 4117 (BFF)

## 起動の基本
1. `scripts/stop.sh` で既存プロセスを止める
2. `scripts/start.sh`
3. 画面を開く: `http://localhost:5173/`
4. API (準備後): `http://localhost:3117/`

`scripts/start.sh` は Vue dev server を起動し、`apps/api/bin/dev` が存在する場合に Rails も同時に立ち上げる。Rails が未構築の間はスキップされる。

## ポートが塞がっているとき
- 画面: `kill -9 $(lsof -ti :5173) 2>/dev/null || true`
- API: `kill -9 $(lsof -ti :3117) 2>/dev/null || true`
- 迷ったら `scripts/start-lite.sh`

## 番号を変えたいとき
```
FRONTEND_PORT=5174 API_PORT=8118 VITE_API_BASE=http://localhost:8118 scripts/start.sh
```

## 困ったとき
- まとめ: `scripts/diag.sh`
- Vueログ: `logs/stack.*.log`
- Railsログ: Rails起動後 `logs/stack.*.log` に追記

## 環境変数（例）
- `FRONTEND_PORT` (既定: `5173`)
- `API_PORT` (既定: `3117`), `BFF_PORT` (既定: `4117`)
- `VITE_API_BASE` (`http://localhost:3117`)

## 再開手順
1. `RUNBOOK.md` を開く
2. `scripts/diag.sh`
3. `scripts/stop.sh`
4. `scripts/start.sh`
5. 画面を確認

## 変更メモの場所
- 日々の記録: `SESSION_NOTES.md`
- 引き継ぎ: `docs/HANDOVER_TEMPLATE.md`
