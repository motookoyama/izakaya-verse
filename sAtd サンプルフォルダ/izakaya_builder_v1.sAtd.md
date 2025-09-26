---
spec: izakaya_builder_v1
version: 1.0
title: IZAKAYA Builder 再現構築
author: Motoo Koyama
created: 2025-09-01
---

## Purpose
- ローカル環境での **LLM駆動アプリ構築ビルダー**
- Chat・Preview・Spec・Settings を統合したUI
- Run / Deploy / Codex の実行ボタンを備え、プロトタイピングを短時間で可能にする
- 他環境でも再現可能な手順を保持

---

## Features

### UI構成
- **タブ構造**
  - SPEC: sAtd仕様を記述・保存・インポート/エクスポート
  - Chat: プロンプト対話 + ファイルアップロード
  - Preview: 生成コードを逐次表示、Run/Deploy可能
  - Settings: Provider, APIキー, モデル名, System Prompt を設定

- **デフォルト画面**
  - Chat + Preview を常時表示（70%以上をPreviewに割り当て）
  - Run / Deploy / Codex ボタンを右上に配置
  - Spec・Settings はオーバーレイ表示（確認/編集後すぐ閉じられる）

---

### Backend (BFF)
- Express ベースAPI
- `/api/health` `/api/models` `/api/exec` `/api/deploy` を提供
- Preview 実行は一時コードを iframe 内でレンダリング
- Deploy は GitHub へ push（`.env` に `GITHUB_TOKEN` を設定）
- Codex は CLI / Cloud の両モードをサポート予定

---

### Setup 手順
```bash
# 依存インストール
npm install

# .env 設定例
PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen3:4b
PORT=8787
# オプション
# GITHUB_TOKEN=xxxxxx

# 開発サーバ起動
npm run dev