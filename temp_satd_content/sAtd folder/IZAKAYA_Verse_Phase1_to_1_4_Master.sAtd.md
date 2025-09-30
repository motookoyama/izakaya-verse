# IZAKAYA_Verse_Phase1_to_1_4_Master.sAtd.md

VERSION: 1.4.0  
LAST_UPDATED: 2025-08-27  
AUTHOR: nohonx + GPT-5 Thinking  
STATUS: Master Specification (Phase1.0 → 1.4)

---

## PURPOSE
Phase 1.0〜1.3 のMVP基盤を発展させ、**IZAKAYAverse本体が安定運用に耐える三本柱**を強化する。また、Google Gemini Build による衛星アプリ版MetaCaptureの成果を本体で参照可能にする。

---

## DELTA SUMMARY (1.4拡張点)
- **三本柱の強化**  
  1. **チャットフィールド**: SillyTavern互換UIの安定化、タグバッジ表示、アイコン切替。  
  2. **MetaCapture**: Google版衛星の成果物をAPI経由で取り込み可能に。  
  3. **共通ライブラリ**: V2カードJSON/sAtd/PNG/QRの変換共通モジュールを抽出。  

- **Gemini版MetaCaptureの参照**  
  - 衛星アプリからのPOST結果を本体に受理するAPIを追加  
  - JWT署名によるセキュアな受け渡し  
  - 本体のConverter Hubで一元管理  

---

## PHASE MAP
| Phase | 内容 |
|---|---|
| 1.0 | MVP（チャット＋Library＋Tickets＋Redeem） |
| 1.1 | PayPal課金UI実装 |
| 1.2 | Amazon冊子連動 |
| 1.3 | MetaCapture Lite / Gemini Satellite |
| 1.4 | 三本柱強化、共通ライブラリ化、Gemini参照API |

---

## FRONTEND (Chat Field強化)
- **Playページ**  
  - SillyTavern風のチャット欄（発話者切替UI、スクロール保持）  
  - V2カード `tags` をバッジとして表示  
  - 初期化時にアバターPNGと `first_mes` を必ず表示  

---

## API (新規追加)
```
POST /api/satellite/metacapture
  body: { card_json, source: 'gemini', signature }
  verify: JWT署名
  res: { status: 'ok', card_id }
```

- DBに `satellite_origin` を追加し、ローカル生成と衛星生成を区別して保存可能

---

## CONVERTER HUB (共通ライブラリ)
- `/lib/card-tools` に集約  
  - parseCard (json|sAtd|png)  
  - exportCard (json|sAtd|png|qr)  
  - validateCard (spec準拠チェック)  

---

## COST GUARDRAILS
- 衛星経由: 既に高コスト解析済み → 本体で再要約は禁止  
- 本体MetaCapture: Liteモードに固定  
- 共通ライブラリ: JSON保存が最優先、PNG変換失敗は後処理へフォールバック  

---

## TEST PLAN
- PlayページでV2カードのタグがUI表示されること  
- Gemini衛星からの `card_json` が正常に受理・保存されること  
- Converter Hubでのjson→png→qr変換が往復成功すること  
- 本体Lite版と衛星版MetaCaptureの両立保存が可能なこと  

---

## CHANGELOG
- 1.4.0: 三本柱強化、Gemini版MetaCapture参照、共通ライブラリ化  
