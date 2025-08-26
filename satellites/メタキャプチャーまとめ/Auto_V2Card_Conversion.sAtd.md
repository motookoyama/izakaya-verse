

📄 Auto_V2Card_Conversion.sAtd

# Specification: Auto V2Card Conversion  
version: 1.0  
author: moto koyama  
date: 2025-08-25  

## Purpose
メタキャプチャーから取得したデータを、標準的な V2 カードフォーマットに自動変換し保存する。  
画像データが存在しない場合には、背景やキャラクターイメージを補完生成する。  

---

## Core Features

### 1. Input
- テキスト: JSON, .sAtd, Markdown 形式のキャラ定義
- 画像: PNG, JPEG （オプション。PNG 内部 tEXt メタデータがあれば優先的に読む）

### 2. Output
- 標準 V2 カード JSON ファイル  
- 同時に PNG 画像版（アバターポートレートつき）を生成・保存  

### 3. Image Handling
- **ポートレート生成**: キャラクターデータがある場合 → アニメ風 or 実写風（選択式）
- **背景生成**: データがない場合は「雄大な背景」「ファンタジックな映画ポスター風」を生成
- **ファイル形式**: `character_name_card.png`  
- **API依存性**: 利用中のプラットフォーム（OpenAI DALL·E / Gemini Imagen / Stable Diffusion）に自動切替  

### 4. Conversion Rules
- `name`, `description`, `first_mes`, `personality` を必須フィールドとして抽出
- 欠落フィールドはデフォルトテンプレで補完
- 画像生成が成功すれば、PNG 内に JSON メタデータを埋め込み
- 失敗時は JSON 単体出力（フォールバック）

### 5. Save & Download
- 出力形式：
  - `character_name.json`（テキストカード）
  - `character_name.png`（画像カード）
- ダウンロード可能にする（Web/アプリ UI から確認）

---

## Admin / Developer Options
- **低コストモード**: 画像は低解像度（512x512）＋単色背景  
- **高精度モード**: 高解像度（1024x1024〜4K）＋ポスター風演出  
- **切替方法**: `.sAtd` 内で `render_mode: low | high` を指定  

---

## Example
Input:  
```json
{
  "name": "Lady Mahoro",
  "description": "スピリチュアルライターでDr.Orbの友人",
  "first_mes": "こんにちは、私はマホロ。あなたの心を覗いていい？",
  "personality": "優しく、神秘的、直感的"
}

Output:
	•	Lady_Mahoro.json
	•	Lady_Mahoro.png（アニメ風ポートレート＋幻想的な背景つき）

⸻

Notes
	•	出力カードは SillyTavern / TavernAI / IZAKAYAverse 全てで互換性を持つことを目標とする
	•	プラットフォームに応じて最適な画像APIを利用する（自動選択）
	•	エラー発生時はテキスト変換のみ成功扱いとする

---

これをベースにすれば、**Gemini ビルダーにも渡せる仕様書**になりますし、Cursor / Docker 側でも即座に再利用できます。  

👉 次のステップは、この `.sAtd` を実際に Gemini 側に流して **「入力 → JSON/PNG V2カード出力」** が一発で通るかテストすることです。  

---

🔹質問：  
背景補完時のデフォルトスタイル（映画ポスター風／抽象アート風／シンプル背景など）、どれを最優先にしましょうか？