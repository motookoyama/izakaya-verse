# IZAKAYA Mini BFF (Express/CommonJS)

IZAKAYA Stable Stack 構成（Node.js LTS + Express 4 + CommonJS + `tsc` prebuild）で動作するミニ BFF です。  
ユグドラシルおよび Vertex AI 側の本線 BFF と互換性を保ちながら、プレビュー用のチャット／ウォレット API を提供します。

## セットアップ

最小操作は CLI ラッパーで行えます。

```bash
# すべて自動で実行（依存導入 → Preview ビルド → docker compose up --build → /preview をブラウザで表示）
npm run up

# 停止
npm run down

# ヘルス確認
npm run status

# ログ追跡
npm run logs
```

デフォルトでは `http://localhost:4117` で起動します。`PROVIDER=mock` 設定のため、外部 LLM への接続なしでレスポンスが得られます。`npm run up` が完了するとブラウザで `/preview/` が自動的に開きます。

### Docker での自動検証

```bash
npm run docker:test
```

- `docker compose up -d --build` を実行し、ヘルスチェック（`/health`）通過を待機します。
- 起動確認後、自動でブラウザを開き `http://localhost:4117/preview/` を表示します（macOS / Windows / Linux 対応）。
- コンテナを停止する場合は `npm run docker:down` を使用してください。

Docker 操作を手動で行う場合:

```bash
npm run docker:build   # docker build -t izakaya-mini-bff .
npm run docker:up      # docker compose up -d
npm run docker:down    # docker compose down
```

### プレビュー UI（React / Vite）

`preview-ui/` 配下に React + Tailwind 製の UI を配置しています。Mini BFF の `/chat/v1` / `/cards` を叩く実際の操作パネルです。

```bash
# 開発サーバー（http://localhost:4173）
npm run preview:dev

# ビルド（/preview 用静的ファイルを public/ に出力）
npm run preview:build
```

Docker イメージをビルドする際は `preview:build` が自動実行されるため、生成物が `/preview/` で配信されます。

### 主な環境変数

| 変数 | 既定値 | 説明 |
| --- | --- | --- |
| `PORT` | `4117` | リッスンポート |
| `HOST` | `0.0.0.0` | バインドホスト（Docker / Cloud Run を想定） |
| `PROVIDER` | `mock` \| `gemini` \| `openai` | LLM プロバイダ |
| `CARDS_JSON` | `./data/cards/cards.json` | カード定義ファイル。存在しない場合は自動生成 |
| `DATA_DIR` | `./data` | ウォレット保存ディレクトリ |

Gemini / OpenAI を利用する場合は対応する API キーとモデル名を `.env` に設定してください。

## エンドポイント

| メソッド | パス | 説明 |
| --- | --- | --- |
| `GET /health` | サービスのヘルス情報 |
| `GET /cards` | カード一覧（`cards.json` またはフォールバック） |
| `POST /chat/v1` | `prompt`, `cardId`, `temperature` を受け取り LLM 応答を返却 |
| `POST /wallet/redeem` | `txId` と `points` を受け付けてポイント加算（冪等） |
| `GET /wallet/balance` | 残高と最近のトランザクションを返却 |
| `POST /wallet/consume` | ポイント消費。残高不足時は 400 |

## ディレクトリ構成

```
mini-bff-express
├── data/            # cards.json / wallet.json を保存
├── src/
│   ├── config.ts
│   ├── index.ts
│   ├── routes/      # health / cards / chat / wallet
│   └── services/    # cardRegistry / chatService / walletStore / systemPrompt
├── preview-ui/      # React + Tailwind プレビュー（Vite）
├── public/          # /preview 用のビルド成果物
└── dist/            # `npm run build` で生成される出力
```

## 今後の予定

- Vertex AI チームの Express 版 Mini BFF へ同構成を適用し、Cloud Run での稼働を確認。
- ウォレットの TX-ID ポイント制と PayPal IPN 連携を追加（P-2 フェーズ）。
- GitHub リポジトリに CI/CD を整備し、安定稼働後に GCP 申請を実施予定。
