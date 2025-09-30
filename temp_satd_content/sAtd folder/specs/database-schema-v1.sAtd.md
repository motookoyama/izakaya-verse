# Database Schema v1.0
version: 1.0
owner: IZAKAYA verse
updated: 2025-08-27

## CORE TABLES (Phase 1-2)

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  flags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### auth_providers
```sql
CREATE TABLE auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'paypal', 'google', 'github'
  subject VARCHAR(255) NOT NULL, -- provider's user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, subject)
);
```

### wallets
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance_points INTEGER DEFAULT 0 CHECK (balance_points >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('charge', 'spend', 'adjust')),
  amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'paypal', 'redeem', 'admin'
  raw JSONB, -- 元データ（PayPal webhook等）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### cards
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'blocked')),
  tags TEXT[], -- PostgreSQL array
  first_mes TEXT,
  spec JSONB,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### card_versions
```sql
CREATE TABLE card_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  payload_json JSONB NOT NULL,
  preview_url VARCHAR(500),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## META CAPTURE TABLES (Phase 2)

### captures
```sql
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('url', 'text')),
  source_content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ok', 'failed')),
  cost_class VARCHAR(20) DEFAULT 'rough' CHECK (cost_class IN ('rough', 'refine')),
  result_json JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### capture_jobs
```sql
CREATE TABLE capture_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID REFERENCES captures(id) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'ok', 'failed')),
  cost_ms INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

## EVENT SYSTEM TABLES (Phase 2)

### events_calendar
```sql
CREATE TABLE events_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  bias_key VARCHAR(100) NOT NULL,
  strength INTEGER DEFAULT 1 CHECK (strength >= 0 AND strength <= 10),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, bias_key)
);
```

### agent_bias_overrides
```sql
CREATE TABLE agent_bias_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bias_key VARCHAR(100) NOT NULL,
  strength INTEGER DEFAULT 1 CHECK (strength >= 0 AND strength <= 10),
  ttl TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## MARKETPLACE TABLES (Phase 3)

### listings
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  price_points INTEGER NOT NULL CHECK (price_points > 0),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  price_points INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## INDEXES

```sql
-- Performance indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_cards_owner_id ON cards(owner_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_captures_user_id ON captures(user_id);
CREATE INDEX idx_captures_status ON captures(status);
CREATE INDEX idx_events_calendar_date ON events_calendar(date);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_visibility ON listings(visibility);

-- Full-text search
CREATE INDEX idx_cards_title_fts ON cards USING gin(to_tsvector('japanese', title));
CREATE INDEX idx_cards_tags_gin ON cards USING gin(tags);
```

## MIGRATIONS

### Phase 1 to Phase 2
```sql
-- Add MetaCapture tables
-- Add Event system tables
```

### Phase 2 to Phase 3
```sql
-- Add Marketplace tables
-- Add indexes for performance
```

## BACKUP STRATEGY

- **Daily**: Full backup (PostgreSQL pg_dump)
- **Hourly**: WAL backup (Point-in-time recovery)
- **Retention**: 30 days for daily, 7 days for hourly



