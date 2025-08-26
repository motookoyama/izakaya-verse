# 🚀 IZAKAYA verse フェーズ1.3一気通貫開発計画

## 📋 開発方針
- **並行開発**: Phase 1.0 → 1.3を同時進行
- **MVP優先**: 基本機能を最優先で実装
- **衛星連携**: MetaCaptureを核とした自動生成システム
- **ユーザー体験**: 美しいUI/UXを維持

## 🎯 Phase 1.0: MVP（1-2週間）

### フロントエンド（Vite + React）
```
apps/web/
├── src/
│   ├── components/
│   │   ├── Home.tsx          # 現在のページ
│   │   ├── Play.tsx          # V2カード遊び場
│   │   ├── Library.tsx       # カード一覧
│   │   ├── Tickets.tsx       # チケット生成
│   │   └── Redeem.tsx        # コード入力
│   ├── pages/
│   ├── services/
│   └── types/
```

### バックエンド（Express/FastAPI）
```
apps/api/
├── src/
│   ├── routes/
│   │   ├── v2cards.ts        # V2カード管理
│   │   ├── tickets.ts        # チケット生成
│   │   ├── redeem.ts         # コード処理
│   │   └── points.ts         # ポイント管理
│   ├── services/
│   └── models/
```

## 🔍 Phase 1.3: MetaCapture統合（2-3週間）

### MetaCaptureシステム
```
satellites/meta-capture/
├── src/
│   ├── capture/
│   │   ├── urlProcessor.ts   # URL解析
│   │   ├── textAnalyzer.ts   # テキスト分析
│   │   └── v2Generator.ts    # V2カード生成
│   ├── api/
│   │   ├── gemini.ts         # Gemini API連携
│   │   └── openai.ts         # OpenAI API連携
│   └── types/
```

### V2カード自動生成フロー
```
1. URL/テキスト入力
   ↓
2. Gemini/OpenAIで分析
   ↓
3. キャラクター特性抽出
   ↓
4. V2カード形式で出力
   ↓
5. ライブラリに追加
```

## 🎭 Event Agent（1週間）

### 季節イベントシステム
```
apps/api/src/services/
├── eventAgent.ts
├── seasonalEvents.ts
└── dynamicContent.ts
```

### イベント例
- **クリスマス**: 雪の妖精V2カード
- **夏祭り**: 祭り屋台キャラクター
- **ハロウィン**: お化けキャラクター
- **バレンタイン**: 愛のキューピッド

## 🤖 Gemini Lite衛星アプリ（2週間）

### モバイル専用機能
```
satellites/gemini-lite/
├── src/
│   ├── qrScanner.ts          # QRコードスキャン
│   ├── voiceInput.ts         # 音声入力
│   ├── locationService.ts    # 位置情報
│   └── offlineMode.ts        # オフライン対応
```

## 💳 決済自動化（1週間）

### PayPal Webhook統合
```
apps/api/src/services/
├── paypalWebhook.ts
├── pointManager.ts
└── transactionLogger.ts
```

## 📊 開発スケジュール

### Week 1-2: MVP基盤
- [ ] Vite + React プロジェクト作成
- [ ] 基本ルーティング設定
- [ ] V2カード遊び場実装
- [ ] カードライブラリ実装

### Week 3-4: MetaCapture統合
- [ ] Gemini API連携
- [ ] URL解析機能
- [ ] V2カード自動生成
- [ ] 生成品質向上

### Week 5: Event Agent
- [ ] 季節イベントシステム
- [ ] 動的コンテンツ生成
- [ ] イベントスケジューラー

### Week 6: 衛星アプリ
- [ ] Gemini Lite実装
- [ ] モバイル最適化
- [ ] QRコードスキャン

### Week 7: 決済自動化
- [ ] PayPal Webhook
- [ ] 自動ポイント付与
- [ ] 購入履歴管理

## 🛠️ 技術スタック

### フロントエンド
- **Vite + React + TypeScript**
- **HashRouter**（GitHub Pages対応）
- **Tailwind CSS**（美しいUI）
- **Framer Motion**（アニメーション）

### バックエンド
- **Express.js**（Node.js）
- **TypeScript**
- **Prisma**（データベース）
- **JWT**（認証）

### AI/ML
- **Google Gemini API**
- **OpenAI API**
- **LangChain**（プロンプト管理）

### インフラ
- **GitHub Pages**（フロント）
- **Render**（API）
- **PostgreSQL**（データベース）
- **Redis**（キャッシュ）

## 🎨 UI/UX方針

### デザインシステム
- **カラーパレット**: 紫グラデーション（現在の美しい配色を維持）
- **フォント**: Helvetica Neue
- **アイコン**: カスタムアイコンセット
- **アニメーション**: スムーズな遷移

### レスポンシブ対応
- **デスクトップ**: フル機能
- **タブレット**: 最適化されたレイアウト
- **モバイル**: タッチフレンドリー

## 📈 成功指標

### Week 1-2
- [ ] MVP動作確認
- [ ] 基本ユーザーフロー完成
- [ ] V2カード遊び場稼働

### Week 3-4
- [ ] MetaCapture基本機能
- [ ] 自動生成品質確認
- [ ] ユーザーテスト実施

### Week 5-7
- [ ] 全機能統合
- [ ] パフォーマンス最適化
- [ ] 本格リリース準備

## 🚀 次のアクション

1. **開発環境セットアップ**
   - Vite + React プロジェクト作成
   - Express API プロジェクト作成
   - データベース設計

2. **MetaCapture詳細設計**
   - Gemini API 統合仕様
   - V2カード生成ロジック
   - 品質保証システム

3. **UI/UX設計**
   - デザインシステム確立
   - コンポーネントライブラリ
   - アニメーション仕様

**この計画で進めますか？** 特定の部分から始めたい場合は教えてください。
