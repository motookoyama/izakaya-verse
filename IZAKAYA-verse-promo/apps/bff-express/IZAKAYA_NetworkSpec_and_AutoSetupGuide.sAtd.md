# 🏮 IZAKAYA verse Network Spec ＆ Auto Setup Guide v1.0
（保存版｜2025-10-19）

## 🧭 概要
IZAKAYA verse のネットワーク構成・ドメイン命名規則・自動登録スクリプト仕様を定義。
目的は「UI／BFF／AI連携／決済APIを一貫した命名・配置で扱う」こと。

## 1️⃣ リポジトリ情報
- 名称: IZAKAYA-verse-promo
- 概要: ライト版プレビュー／TX-IDエコノミクス検証環境
- 環境: GitHub Pages（UI）＋ Cloudflare Workers / Render（BFF）

## 2️⃣ サブドメイン命名規格
| サブドメイン | 用途 | 主なエンドポイント例 |
|:--|:--|:--|
| api.izakayaverse.com | 一般API（BFF） | /health, /wallet/*, /chat/v1 |
| ipn.izakayaverse.com | 決済通知 | /paypal/ipn/notify |
| llm.izakayaverse.com | LLM連携ハブ | /openai/chat, /gemini/chat |
| app.izakayaverse.com | UI（Lite） | /preview |
| cdn.izakayaverse.com | 静的ファイル配信 | /cards/*.png |
| dev.izakayaverse.com | 開発・検証 | /health |

## 3️⃣ PayPal IPN 固定設定
- 通知URL: https://ipn.izakayaverse.com/paypal/ipn/notify
- 転送: ipn → api
- テストURL: https://sandbox.ipn.izakayaverse.com/paypal/ipn/notify

## 4️⃣ DNS 登録（Cloudflare）
| レコード | 種別 | 値 |
|:--|:--|:--|
| api | CNAME | your-bff-host.example.com |
| ipn | CNAME | api.izakayaverse.com |
| llm | CNAME | your-llm-gateway.example.com |
| app | CNAME | your-pages-host.example.com |
| cdn | CNAME | your-cdn-host.example.com |
| dev | CNAME | your-staging-host.example.com |

## 5️⃣ BFF API仕様
| エンドポイント | メソッド | 概要 |
|:--|:--|:--|
| /health | GET | 稼働確認 |
| /cards/list | GET | V2カード一覧 |
| /wallet/balance | GET | 残高確認 |
| /wallet/redeem | POST | ポイント加算 |
| /wallet/consume | POST | ポイント消費 |
| /chat/v1 | POST | チャット |
| /paypal/ipn/notify | POST | IPN受信 |

## 6️⃣ 自動登録スクリプト（CLI Driven Installer）
実行例: `npm run setup` → 認証ターン付きで順次登録。

フロー:
init → github → pages → bff-deploy → dns → paypal → llm-keys → verify

成功条件:
1. UI表示 (`https://app.izakayaverse.com/preview`)
2. `/health` が 200
3. 残高変動確認
4. PayPal Sandbox反映

## 7️⃣ 環境変数
UI: VITE_API_BASE, VITE_STAGE  
BFF: DOMAIN_STAGE, TX_LEDGER_PATH, PROVIDER, PAYPAL_TX_ENDPOINT, PAYPAL_NOTIFY_URL  
CI: GH_TOKEN, OPENAI_API_KEY, GEMINI_API_KEY, CLOUDFLARE_API_TOKEN, RENDER_TOKEN

## 8️⃣ 将来拡張指針
| フェーズ | 内容 |
|:--|:--|
| 1.4 → 1.5 | Mini BFF → Pro BFF（Workers化） |
| 2.0 | Yggdrasill 統合 |
| 3.0 | ユーザー主導AI配信・DLC販売 |
| 4.0 | 各AIエージェント自律連携 |

---
✅ 保存名: IZAKAYA_NetworkSpec_and_AutoSetupGuide.sAtd.md
