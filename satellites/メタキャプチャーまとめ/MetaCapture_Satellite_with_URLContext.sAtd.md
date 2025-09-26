了解しました 👍
先ほどの考察をベースに、Gemini の URL Context Tool を前提とした最適化版の指示書をまとめます。
この仕様は「衛星アプリ（Satellite）」として独立し、母艦（IZAKAYA verse）と.sAtdで連携することを想定しています。

⸻

📄 MetaCapture_Satellite_with_URLContext.sAtd

# MetaCapture Satellite (with Google Gemini URL Context Tool)

## Purpose
衛星アプリとして、ユーザー指定のURLや外部リソースを効率的にキャプチャーし、  
構造化された.sAtdファイルとして母艦（IZAKAYA verse）に転送する。

---

## Core Components

### 1. Input
- ユーザーからの入力形式  
  - URL（Webページ、PDF、画像、JSON、CSVなど）  
  - QRコード（→ URL展開処理）  
  - テキスト直接入力（補助用途）

### 2. Processing Engine
- **Google Gemini URL Context Tool**
  - GA版（2025/08時点）を使用  
  - サポート対象：HTML, PDF, PNG, JPEG, WebP, JSON, CSV, Plain text
  - 出力フォーマット：テキスト＋構造化メタデータ

- **仕分けモード**
  - `LightScan` : 概要抽出（タイトル、見出し、要点）  
  - `DeepScan` : 詳細解析（段落、表、図解）  
  - `OCRMode` : 画像OCR専用（低解像度画像向け）  

### 3. Output
- 標準出力：`.sAtd`形式のキャプチャーレポート  
  ```yaml
  MetaCapture:
    source_url: <URL>
    capture_mode: <LightScan | DeepScan | OCRMode>
    timestamp: <ISO8601>
    extracted_text: "..."
    structured_data:
      headings: [...]
      tables: [...]
      metadata: {...}

	•	母艦への転送：REST API または ファイルエクスポートで連携

⸻

Workflow
	1.	ユーザーがURL／QRを入力
	2.	URL Context Tool がリソースを解析
	3.	.sAtd形式に変換
	4.	母艦（IZAKAYA verse）へ送信
	•	転送時は「イベントタグ」（例: #SeasonEvent, #Campaign, #Research）を付与し、母艦が利用先を判断できるようにする。

⸻

Control Panel (衛星UI)
	•	URL入力欄＋QR読み取りボタン
	•	モード選択（LightScan / DeepScan / OCR）
	•	「結果をプレビュー」「母艦に送信」ボタン
	•	エラー処理（404/403、解析失敗時は簡易テキストのみ返す）

⸻

Cost Optimization
	•	デフォルトは LightScan に設定（低コスト）
	•	DeepScan はユーザーが明示的に選択した場合のみ実行
	•	母艦連携時に「詳細要求」がある場合は自動で DeepScan に昇格可能

⸻

Integration
	•	Gemini API Key 管理（環境変数）
	•	母艦への転送方式
	•	選択肢1: RESTエンドポイント
	•	選択肢2: GitHubリポジトリに .sAtd をPush
	•	選択肢3: ローカル保存→ユーザーが手動で母艦に登録

⸻

Future Extensions
	•	Grounding with Google Search の併用（精度強化）
	•	リアルタイムイベント用「Auto Capture」モード（定期的にURLをクロール）
	•	マルチURL一括投入（ニュースサイト等での応用）

---

✅ この仕様は「衛星アプリ専用」のため、母艦の複雑なUIやV2カード処理とは切り離して軽量化しました。  
✅ **コスト最適化**のため、常に `LightScan` をデフォルトにし、必要時のみ詳細解析するルールを組み込んでいます。  

---

👉 ご希望なら、このまま **ダウンロードファイル（MetaCapture_Satellite_with_URLContext.sAtd.md）** を生成してお渡しできますが、どうしますか？