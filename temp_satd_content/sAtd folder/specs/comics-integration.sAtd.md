# Comics Integration System v1.0
version: 1.0
owner: IZAKAYA verse
updated: 2025-08-27

## OVERVIEW
コミックス読書とV2カード体験を直結させるシステム

## CORE CONCEPT
「読者体験＝参加体験」の実現

## FEATURES

### QR Code Integration
```typescript
interface QRCodeData {
  type: 'chapter_complete' | 'character_unlock' | 'special_event';
  comic_id: string;
  chapter: number;
  character_id?: string;
  reward_points: number;
  unlock_content: string[];
}
```

### Chapter Progress Tracking
```typescript
interface ChapterProgress {
  user_id: string;
  comic_id: string;
  chapter: number;
  read_at: string;
  cards_unlocked: string[];
  chat_experiences_unlocked: string[];
  game_panels_unlocked: string[];
}
```

### Character Invitation System
```typescript
interface CharacterInvitation {
  user_id: string;
  character_id: string;
  comic_id: string;
  chapter: number;
  invitation_date: string;
  status: 'pending' | 'accepted' | 'expired';
}
```

## DATABASE SCHEMA

### comics
```sql
CREATE TABLE comics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES users(id),
  series_id UUID,
  volume_number INTEGER,
  total_chapters INTEGER,
  qr_codes JSONB, -- {chapter: {qr_data, rewards}}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### chapter_progress
```sql
CREATE TABLE chapter_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comic_id UUID REFERENCES comics(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cards_unlocked TEXT[], -- card_ids
  experiences_unlocked TEXT[], -- experience_ids
  UNIQUE(user_id, comic_id, chapter_number)
);
```

### character_invitations
```sql
CREATE TABLE character_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  comic_id UUID REFERENCES comics(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  invitation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

## API ENDPOINTS

### QR Code Processing
```typescript
// POST /comics/qr-scan
interface QRScanRequest {
  qr_data: string;
  user_id: string;
}

interface QRScanResponse {
  success: boolean;
  rewards: {
    points: number;
    cards: string[];
    experiences: string[];
  };
  message: string;
}
```

### Progress Tracking
```typescript
// GET /comics/:id/progress
interface ComicProgressResponse {
  comic_id: string;
  total_chapters: number;
  chapters_read: number[];
  total_cards_unlocked: number;
  total_experiences_unlocked: number;
  completion_percentage: number;
}
```

### Character Management
```typescript
// POST /characters/invite
interface CharacterInviteRequest {
  character_id: string;
  comic_id: string;
  chapter: number;
}

// GET /characters/invited
interface InvitedCharactersResponse {
  characters: {
    id: string;
    name: string;
    comic_title: string;
    chapter: number;
    invitation_date: string;
    status: string;
  }[];
}
```

## USER EXPERIENCE FLOW

### 1. Comics Reading
```
1. ユーザーがコミックスを読む
2. 巻末のQRコードをスキャン
3. 章完了として記録
4. 対応するV2カードを獲得
5. チャット体験・ゲームパネルが解放
```

### 2. Character Invitation
```
1. ストーリー内キャラクターを発見
2. QRコードでキャラクターを招待
3. 自分のアカウントにキャラクター追加
4. IZAKAYAバースで対話可能
```

### 3. Progress Tracking
```
1. 読書進捗を自動記録
2. 章ごとの特典を管理
3. 全体の進行度を表示
4. 次巻への誘導
```

## INTEGRATION WITH EXISTING SYSTEMS

### V2 Cards
- コミックスキャラクターのV2カード化
- 章進行に応じたカード解放
- ストーリー連動のチャット体験

### Event Agent
- 読者フィードバックの反映
- 人気選択肢の集約
- 次巻への影響

### MetaCapture
- コミックスキャラクターの自動生成
- ファン創作の支援
- コミュニティ参加の促進

## MONETIZATION

### QR Code Rewards
- 章完了ボーナスポイント
- 限定カードの獲得
- 特典コンテンツの解放

### Premium Features
- 早期アクセス権
- 限定チャット体験
- 特別なゲームパネル

## FUTURE EXPANSIONS

### Phase 2: Community Features
- 読者感想の共有
- ファン創作の投稿
- コミュニティイベント

### Phase 3: Advanced Integration
- リアルタイム連動
- 動的コンテンツ生成
- パーソナライズ体験




