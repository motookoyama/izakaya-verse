# MetaCapture Creation Experience v1.0
version: 1.0
owner: IZAKAYA verse
updated: 2025-08-27

## OVERVIEW
ユーザーの創作を民主化するMetaCaptureシステム

## CORE CONCEPT
「URL/テキスト → V2カード → 個性化 → 共有」の創作体験

## CREATION PROCESS

### Phase 1: Input & Rough Capture
```typescript
interface CaptureInput {
  source_type: 'url' | 'text' | 'file';
  content: string;
  user_preferences?: {
    character_type?: string;
    personality_traits?: string[];
    visual_style?: string;
  };
}
```

### Phase 2: Character Generation
```typescript
interface CharacterGeneration {
  capture_id: string;
  rough_result: {
    name: string;
    personality: string;
    background: string;
    key_traits: string[];
  };
  refine_options: {
    name_variations: string[];
    personality_adjustments: string[];
    visual_styles: string[];
  };
}
```

### Phase 3: Personalization
```typescript
interface CharacterPersonalization {
  character_id: string;
  customizations: {
    name: string;
    speech_style: string;
    visual_avatar?: string;
    background_story?: string;
    relationships?: string[];
  };
}
```

## DATABASE SCHEMA

### captures (Enhanced)
```sql
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('url', 'text', 'file')),
  source_content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ok', 'failed')),
  cost_class VARCHAR(20) DEFAULT 'rough' CHECK (cost_class IN ('rough', 'refine')),
  result_json JSONB,
  error_message TEXT,
  user_preferences JSONB, -- ユーザーの希望する方向性
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### character_customizations
```sql
CREATE TABLE character_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  speech_style TEXT,
  visual_avatar_url VARCHAR(500),
  background_story TEXT,
  relationships JSONB, -- 他のキャラクターとの関係
  personality_traits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### character_combinations
```sql
CREATE TABLE character_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  card_ids TEXT[], -- 組み合わせたカードのID配列
  cost_points INTEGER DEFAULT 0,
  return_points INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API ENDPOINTS

### Capture & Generation
```typescript
// POST /metacapture/submit
interface CaptureSubmitRequest {
  source_type: 'url' | 'text' | 'file';
  content: string;
  user_preferences?: {
    character_type?: string;
    personality_traits?: string[];
    visual_style?: string;
  };
}

interface CaptureSubmitResponse {
  capture_id: string;
  status: 'pending' | 'processing';
  estimated_cost_ms?: number;
}

// GET /metacapture/:id/result
interface CaptureResultResponse {
  capture_id: string;
  status: 'pending' | 'processing' | 'ok' | 'failed';
  rough_result?: {
    name: string;
    personality: string;
    background: string;
    key_traits: string[];
  };
  refine_options?: {
    name_variations: string[];
    personality_adjustments: string[];
    visual_styles: string[];
  };
  error_message?: string;
}
```

### Character Customization
```typescript
// POST /characters/:id/customize
interface CharacterCustomizeRequest {
  name?: string;
  speech_style?: string;
  visual_avatar?: string;
  background_story?: string;
  relationships?: string[];
  personality_traits?: string[];
}

// GET /characters/:id/customization
interface CharacterCustomizationResponse {
  card_id: string;
  customizations: {
    name: string;
    speech_style: string;
    visual_avatar?: string;
    background_story?: string;
    relationships: string[];
    personality_traits: string[];
  };
}
```

### Character Combinations
```typescript
// POST /characters/combine
interface CharacterCombineRequest {
  name: string;
  description?: string;
  card_ids: string[];
  cost_points: number;
}

interface CharacterCombineResponse {
  combination_id: string;
  total_cost: number;
  return_points: number;
  estimated_return_time: string;
}

// GET /characters/combinations
interface CharacterCombinationsResponse {
  combinations: {
    id: string;
    name: string;
    description: string;
    card_count: number;
    cost_points: number;
    return_points: number;
    status: string;
    created_at: string;
  }[];
}
```

## USER EXPERIENCE FLOW

### 1. Character Creation
```
1. URL/テキストを入力
2. ユーザー希望を指定（性格、見た目等）
3. 粗取り（Rough）で基本キャラクター生成
4. 精査（Refine）で詳細調整
5. 個性化（名前、口調、背景等）
6. V2カードとして保存
```

### 2. Character Personalization
```
1. 生成されたキャラクターを選択
2. 名前を変更
3. 口調を調整
4. ビジュアルアバターを設定
5. 背景ストーリーを追加
6. 他のキャラクターとの関係を設定
```

### 3. Character Combination
```
1. 複数のキャラクターを選択
2. パーティー/チーム名を設定
3. ポイントを消費して組み合わせ作成
4. 一定時間後にポイント返却
5. チームとして活用
```

## COST STRUCTURE

### Rough Capture
- **Cost**: 低コスト（基本料金）
- **Features**: 基本的なキャラクター生成
- **Quality**: 標準品質

### Refine Capture
- **Cost**: 高コスト（追加料金）
- **Features**: 詳細な性格・背景生成
- **Quality**: 高品質

### Customization
- **Cost**: 無料（ユーザー入力）
- **Features**: 個性化・調整
- **Quality**: ユーザー定義

## COMMUNITY FEATURES

### Character Sharing
```typescript
interface CharacterShare {
  card_id: string;
  share_type: 'public' | 'community' | 'private';
  tags: string[];
  description: string;
  download_cost?: number; // ポイント
  creator_reward?: number; // 作成者への還元
}
```

### QR Code Exchange
```typescript
interface QRExchange {
  card_id: string;
  qr_code_url: string;
  exchange_type: 'gift' | 'trade' | 'sale';
  cost_points?: number;
  expires_at: string;
}
```

## INTEGRATION WITH IZAKAYA VERSE

### Chat Experience
- 生成されたキャラクターとの対話
- 個性化された口調・性格
- 背景ストーリーに基づく会話

### Game Panel
- キャラクター組み合わせでの冒険
- パーティー編成システム
- チーム戦略要素

### Event Integration
- 季節イベントでの特別な生成
- コミュニティイベントでの限定キャラクター
- ファン創作コンテスト

## MONETIZATION

### Creation Costs
- Rough Capture: 基本料金
- Refine Capture: 追加料金
- Premium Templates: 高品質テンプレート

### Sharing Economy
- カード販売（ポイント）
- 作成者への還元
- 限定カードの配布

### Premium Features
- 高品質生成
- 無制限カスタマイズ
- 早期アクセス権




