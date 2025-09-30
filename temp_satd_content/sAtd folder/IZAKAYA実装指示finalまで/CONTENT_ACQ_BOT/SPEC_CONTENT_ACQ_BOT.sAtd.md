---
spec: izakaya_bot_v1
name: Content Acquisition Bot
version: 0.1.0
created: 2025-09-01
author: IZAKAYA Builder
---

# Purpose
Collects, drafts, and publishes engaging content for social channels (X/Bluesky/Discord).  
Focus: attract readers to IZAKAYA verse content and manga IP.

# Scope
- Local or cloud LLMs (Ollama, OpenAI, Gemini via API)
- Tasks: Plan → Draft → Guard → Publish → Metrics
- Excludes: Payment, commerce, account management

# Storyboard
ユーザー（管理者）は「今日のトピック」を入力する。  
Botは「犬・猿・雉チーム」のように役割分担して、案出し→文章化→トーンチェック→公開を行う。  
結果はダッシュボードで可視化される。

# Workflow
1. **Plan**: トレンドやタグを参照して下書きのテーマ案を生成。
2. **Draft**: 各テーマに沿った短文コンテンツを生成。
3. **Guard**: NGワードフィルタとトーンガイドを適用。
4. **Publish**: 選択したSNS APIへ投稿。
5. **Metrics**: 反応を収集し、次回改善に役立てる。

# API
- `POST /api/bot/plan`
- `POST /api/bot/draft`
- `POST /api/bot/guard`
- `POST /api/bot/publish`
- `GET /api/bot/metrics`

# Validation
- Blocklist が効いていること
- Draft と Publish の文面が一致すること
- Metrics が保存されること

# Definition of Done (DoD)
- 「今日のトピック」を入力→SNSへ投稿→メトリクス表示までを1クリックで完結
- sAtd → AGENTS.md → tasks/*.md へ自動変換可能
