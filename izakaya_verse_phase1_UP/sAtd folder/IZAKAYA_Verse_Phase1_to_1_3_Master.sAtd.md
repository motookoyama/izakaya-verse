# IZAKAYA_Verse_Phase1_to_1_3_Master.sAtd

VERSION: 1.0.0
LAST_UPDATED: 2025-08-24
AUTHOR: nohonx + GPT-5 Thinking
LANG: JA (JP) with some EN labels
STATUS: Approved (Master spec for Phase 1 → 1.3)

## PURPOSE
IZAKAYA verse の **Phase 1〜1.3** までに合意した仕様・運用・デプロイ手順・コスト憲法・拡張フックを、
**AI同士で正しく受け渡せる 1 ファイル** に統合。Cursor/GitHub/Gemini 等、異なるビルド環境でも
このファイルだけで最低限の箱（MVP）から段階拡張できることを目的とする。

---

## GLOSSARY (抜粋)
- **MVP**: Minimum Viable Product（最小実用）— まず動かす、美しくなくてよい、後で磨く。
- **V2カード**: SillyTavern互換のキャラクターカード。`.png` 埋込JSON or `*.json`/`*.sAtd`。
- **MetaCapture**: URL/キーワードから素材を軽量収集 → V2カード雛形生成。
- **Converter Hub**: V2カード / QR / API プロンプトを相互変換・配布するハブ。
- **Event Agent（Bias）**: 週替わり/季節などの小さな物語バイアスを注入する軽量拡張。
- **Satellite App**: Gemini Build 等で作る外部衛星アプリ（本体とAPI/Queueで連携）。
- **Points**: 内部ポイント。PayPal/Stripe/QR 書籍からの購入と付与・消費で循環。
- **Ticket PDF**: 正式課金チケット（1000pt）ドラフト。動的QR/説明文付き。

---

## BUILD_CONSTITUTION (ビルド憲法・抜粋)
- **Default=MVP**: まず軽量に動かす。高機能はトグルで後付け。
- **Phased Diffs**: 1.0 → 1.1 → 1.2 → 1.3 は `.sAtd` の差分適用で前進。
- **HashRouter**: GH Pages 前提。`/#/route`（History API 不使用）。
- **LLM抽象化**: OpenAI / Gemini / LocalLLM を Adapter で切替（機能同等でなくて良い）。
- **Cost Guardrails**: 軽量スクレイピング・要約段階選別・バイナリ解析は遅延/任意。
- **Rollback 1-step**: バージョンタグで即座に前バージョンへ戻せること。
- **Secrets**: `.env*` は常に除外。Actions/OIDC/Secret Manager を利用。

---

## PHASE MAP & DELTAS
| Phase | 目的 | 主な到達点 | 備考 |
|---|---|---|---|
| 1.0 | MVP着地 | Home / Play / Library / Tickets / Redeem / 404、V2(json/sAtd)読込、PNGはアバターのみ表示、Pointsモック、Ticket PDFドラフト | まず動かす |
| 1.1 | 決済導入 | **PayPal Smart Buttons**（カード/Apple/Google/PayPal統合）、寄付ボタン、Points反映 | Stripeは後続 |
| 1.2 | 配布強化 | Amazon QR 書籍（1000/5000円コース）併用、QR発行・検証、配布管理 | 収益の即金化導線 |
| 1.3 | 生成と衛星 | **MetaCapture(Lite)**、Converter Hub v0、Event Agent(季節/日替り) ON/OFF、**Satellite Gemini(Lite)** 連携 | コスト最適化前提 |

> 以降は Phase 2+ で：PNG埋込JSON解析、ノベルコンバータ本実装、カード共有市場、英語版同歩等

---

## REPO_LAYOUT (推奨)
```
/apps
  /web        # Vite+React(HashRouter) - GH Pages可
  /api        # Express/Koa/FastAPI(いずれか) - モック→本番差替
/specs
  IZAKAYA_Verse_Phase1_to_1_3_Master.sAtd (本ファイル)
  Payments.sAtd, Events.sAtd, MetaCapture.sAtd (分冊可)
/infra
  Dockerfile.web.dev, Dockerfile.web.prod, docker-compose.*.yml
.github/workflows
  pages.yml, api-ci.yml
```

---

## ENV (最小)
```
# apps/web
VITE_APP_NAME=IZAKAYA verse
VITE_API_BASE=/api         # GH Pagesの場合は相対 or 外部URL

# apps/api
PORT=8787
OPENAI_API_KEY=
GEMINI_API_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
```

---

## FRONTEND (Phase 1.0 MVP)
- **技術**: Vite + React + HashRouter（`#/`）
- **ページ**: Home / Play / Library / Tickets / Redeem / 404
- **Play**:
  - `*.json` / `*.sAtd` をアップロード → `first_mes` を挨拶に反映
  - `*.png` は**アバター表示のみ**（埋込JSON解析は Phase 2）
  - チャットUIはモック（ログ保存：ローカル + DL）
- **Tickets**: 1000pt 正式課金チケットの**PDFドラフト生成**（軽量テキストPDF）
- **Admin bar**（開発用）: Points +/-、TTS ON/OFF（モック）、送受信カウンタ
- **i18n**: JA 基本、EN スイッチの器だけ配置（文言は後追い）

---

## PAYMENTS (Phase 1.1)
- **PayPal Smart Buttons**（優先）
  - モード: PayPal / Debit/Credit / (Apple/Google Pay 対応可能な国/端末)
  - 成功時: `points.add(order.points)`、レシートJSONを Library に保存
- **Stripe**（バックアップ/将来の定期課金）
  - Stripe Elements or Checkout。成功Webhook → Points サービスが反映
- **寄付**: 上限なしボタン（通知閾値アラート）。支援者へ**ボーナスポイント**付与可。
- **Amazon QR 書籍**（Phase 1.2）: 書籍内QR→Redeem でポイント発行。

**SECURITY**
- 支払い結果は**API側で検証**（クライアントのみで確定しない）
- Webhook署名検証 / OrderID二重使用防止 / 失敗時のリカバリ導線

---

## POINTS ENGINE
```
PointEvent:
  type: 'purchase'|'gift'|'bonus'|'spend'|'refund'
  amount: number (int)
  source: 'paypal'|'stripe'|'amazon'|'admin'|'system'
  user_id: string
  idempotency_key: string
  meta: json

Rules:
- purchase/gift/bonus -> 加算
- spend -> 減算（0未満拒否）
- refund -> 差戻し
- idempotency_key で二重反映禁止
```

---

## META_CAPTURE (Phase 1.3 Lite)
**方針**: 低コスト・二段階収集（サイト負荷＆API料金を抑制）

```
Intake:
  input: { url?: string, keywords?: string[], theme_hint?: string }
  mode: 'LITE' | 'DEEP' (default LITE)
  max_tokens: small

Pipeline(LITE):
  1) HEAD/robots.txt 確認 → fetch 1〜3ページ
  2) 主要テキスト抽出（タイトル/H1/Meta/見出しのみ）
  3) LLM要約（要点・語彙リスト）
  4) V2雛形: name, short persona, first_mes, tags, sample prompts
  5) 画像は**代表1枚**のURLのみ（DLしない）

Pipeline(DEEP):
  + サブページ2〜5、画像Alt、FAQ抽出（※初期はOFF）

Output:
  - `*.json` or `*.sAtd`（PNG化は後段）
  - Converter Hub に登録（ID発行）
```

---

## CONVERTER_HUB v0 (Phase 1.3)
- 役割: V2カード（json/sAtd）↔ PNG化、QR生成、外部フロント（ChatGPTs等）への**軽量プロンプト**発行。
- API(モック例):
```
POST /hub/card
  body: { card_json or sAtd_text }
  res: { card_id }

GET /hub/card/:id.png
GET /hub/card/:id.qr
GET /hub/prompt/:id?target=gpts|gemini|claude
```

---

## EVENT AGENT (Phase 1.3)
- `Events.sAtd` で **季節/月替わり/日替わり**の軽バイアスを定義
- Play 起動時に 0〜1個注入（ユーザーが OFF 可能）
- 例: 夏祭り、小さな噂話、ハッカーの足音 など（演出＋小目標）

---

## SATELLITE GEMINI (Lite)
- 役割: MetaCapture の LITE 版を**衛星アプリ**で回し、本体に**結果だけ**送る
- **実装**: Gemini Build（Web App）+ Cloud Functions（Queue/Webhook）
- **連携**: 本体 `/api/satellite/intake` に `card_json` をPOST（JWT署名）
- **フェイルオーバ**: 衛星停止時は本体の簡易 Intake を使う

---

## COST_GUARDRAILS（コスト憲法）
- 収集: **テキスト主体**。画像はURL参照のみ。スクレイピングは 1〜3ページ/リクエスト。
- 要約: まず**小要約** → 必要時のみ再要約。`max_tokens` を小さく。
- 遅延: PNG化/高精度解析は **要求時のみ** 実行（既定OFF）。
- LLM: 低コストモデル優先。政策/性格はテンプレを再利用。

---

## DEPLOYMENT
- **Frontend**: GH Pages（HashRouter）。Actions: `npm ci && npm run build && deploy`。
- **API**: Render/Fly/Cloud Run など（無料枠→低額）。CORS は厳格。
- **Docker**: Local dev / Preview prod 用。`make dev` / `make prod` 用意。

---

## TEST PLAN（要点）
- ルーティング: `#/`, `#/play`, `#/library`, `#/tickets`, `#/redeem/:code` 正常遷移
- V2 読込: `.json/.sAtd` → first_mes 反映、`.png` → アバターのみ
- Ticket PDF: DLでき、QR/文言が意図通り
- PayPal: SandBox で成功/失敗/キャンセル 3系統
- Redeem: 同コード二重使用不可
- MetaCapture(LITE): 代表URLで 1→カード雛形生成
- Event Agent: ON/OFF と注入差がログで確認可

---

## ROLLBACK
- Git Tag & Release を**必須**。1つ前のReleaseに GH UI で即戻す手順を README に明記。

---

## SECURITY & COMPLIANCE
- PII 保存しない方針（ニックネームID）。
- 決済はサーバ検証・署名検証。ログは最小化。
- 画像/外部サイト取り扱いは robots と利用規約遵守。

---

## APPENDIX A: Minimal V2 JSON (雛形)
```json
{
  "name": "Guide-chan",
  "description": "Friendly park guide.",
  "first_mes": "ようこそ！今日はどこを回る？",
  "system_prompt": "",
  "tags": ["guide","friendly","jp"],
  "talkativeness": "0.6",
  "spec": "chara_card_v3",
  "data": {}
}
```

---

## APPENDIX B: Tickets (1000pt) PDF 文言（ドラフト）
- タイトル：IZAKAYA Verse 正式課金チケット（1000pt）
- 注記：本チケットはポイント付与専用。現金払戻不可。QR は 1 回限り有効。

---

## HOW_TO_USE (AI/人間 共通手順)
1) **この .sAtd をそのままプロジェクトに配置**（`/specs` 推奨）。  
2) ビルダー（Cursor/Gemini/ChatGPT）には **「本 .sAtd に従い MVP から実装」** とだけ伝える。  
3) フェーズ差分は `.sAtd` で順次指示（1.1 決済 → 1.2 配布 → 1.3 生成/衛星）。  
4) 支払い鍵は Secrets へ。デプロイは GH Actions の雛形を流用。  
5) 大型機能は **トグル OFF で導入** → 監視後に ON。

---

## CHANGELOG (ダイジェスト)
- 1.0.0: Phase 1〜1.3 の合意仕様を統合し初版化（本書）。
