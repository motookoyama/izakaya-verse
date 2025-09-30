# IZAKAYA Verse API (Rails) — 準備手順

このディレクトリには Rails API を Docker 上で構築するための最低限の設定を置いています。まだ `rails new` を実行していない状態なので、以下の手順で初期化してください。

## 1. コンテナのビルドと Rails プロジェクト生成

```bash
# ルートで一度だけ
docker compose -f docker-compose.api.yml build api

# Rails 7.1 API プロジェクトを ./apps/api に生成
docker compose -f docker-compose.api.yml run --rm api \
  bundle exec rails new . --force --no-deps --api --database=postgresql
```

コマンド完了後、`apps/api` には Rails のファイル一式が展開されます（`Gemfile` 等は上書きされます）。

## 2. データベース設定

`config/database.yml` を開き、下記のように `postgres://izakaya:izakaya@db:5432/izakaya_dev` を利用する設定へ変更します。

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  url: <%= ENV.fetch("DATABASE_URL") %>

development:
  <<: *default
  database: izakaya_dev
```

その後、DB を作成します。

```bash
docker compose -f docker-compose.api.yml run --rm api bundle exec rails db:create
```

## 3. サーバー起動

```bash
docker compose -f docker-compose.api.yml up
```

- Rails: http://localhost:3000
- PostgreSQL: localhost:5432 (`izakaya / izakaya`)

## 4. 今後の作業メモ

- ポイント残高テーブル (`point_ledgers`) とユーザー (`users`) から先に実装する
- API エンドポイント案:
  - `GET /account` (ユーザー情報＋残高サマリ)
  - `POST /points/charge` / `POST /points/spend`
  - `GET /cards` (V2 カード一覧)
- 認証方式（JWT / セッション等）は別途検討

## 5. 既存フロントとの連携

フロント (`apps/web`) 側では `useAccount` コンポーザブルを用意済みです。API 実装後に Axios などで接続し、ダミーデータをリアルデータへ置き換えてください。
