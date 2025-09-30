# API Design v1.0
version: 1.0
owner: IZAKAYA verse
updated: 2025-08-27

## AUTHENTICATION

### JWT Token
```typescript
interface JWTPayload {
  sub: string;        // user_id
  handle: string;     // user handle
  iat: number;        // issued at
  exp: number;        // expiration
  scope: string[];    // permissions
}
```

### Auth Headers
```
Authorization: Bearer <jwt_token>
X-Idempotency-Key: <unique_key>
```

## CORE APIs (Phase 1-2)

### Authentication
```typescript
// POST /auth/login
interface LoginRequest {
  provider: 'paypal' | 'google' | 'github';
  token: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

// POST /auth/refresh
interface RefreshRequest {
  refresh_token: string;
}
```

### Wallet Management
```typescript
// GET /wallet
interface WalletResponse {
  balance_points: number;
  recent_transactions: Transaction[];
}

// POST /wallet/adjust (admin only)
interface WalletAdjustRequest {
  user_id: string;
  amount: number;
  reason: string;
  idempotency_key: string;
}
```

### PayPal Webhook
```typescript
// POST /webhooks/paypal
interface PayPalWebhookRequest {
  event_type: string;
  resource: {
    id: string;
    amount: {
      value: string;
      currency_code: string;
    };
    custom_id?: string; // user_id
  };
  // ... other PayPal fields
}

interface PayPalWebhookResponse {
  success: boolean;
  transaction_id?: string;
  error?: string;
}
```

### V2 Cards
```typescript
// GET /cards
interface CardsListRequest {
  owner_id?: string;
  status?: 'draft' | 'live' | 'blocked';
  tags?: string[];
  limit?: number;
  offset?: number;
}

interface CardsListResponse {
  cards: V2Card[];
  total: number;
  has_more: boolean;
}

// POST /cards
interface CreateCardRequest {
  title: string;
  first_mes?: string;
  spec?: Record<string, any>;
  data?: Record<string, any>;
  tags?: string[];
}

// GET /cards/:id
interface CardResponse {
  card: V2Card;
  versions: CardVersion[];
}

// POST /cards/:id/versions
interface CreateVersionRequest {
  payload_json: Record<string, any>;
  preview_url?: string;
}
```

## META CAPTURE APIs (Phase 2)

### Capture Submission
```typescript
// POST /metacapture/submit
interface CaptureSubmitRequest {
  source_type: 'url' | 'text';
  source_content: string;
  cost_class?: 'rough' | 'refine';
}

interface CaptureSubmitResponse {
  capture_id: string;
  status: 'pending' | 'processing';
  estimated_cost_ms?: number;
}

// GET /metacapture/:id
interface CaptureStatusResponse {
  capture_id: string;
  status: 'pending' | 'processing' | 'ok' | 'failed';
  result_json?: Record<string, any>;
  error_message?: string;
  cost_ms?: number;
  created_at: string;
  updated_at: string;
}
```

### Card Conversion
```typescript
// POST /cards/convert
interface CardConvertRequest {
  capture_id?: string;
  file?: File;
  options?: {
    auto_generate_preview?: boolean;
    validate_only?: boolean;
  };
}

interface CardConvertResponse {
  card_id: string;
  preview_url?: string;
  validation_errors?: string[];
}
```

## EVENT SYSTEM APIs (Phase 2)

### Event Calendar
```typescript
// GET /events/today
interface TodayEventsResponse {
  date: string;
  biases: EventBias[];
}

interface EventBias {
  bias_key: string;
  strength: number;
  note?: string;
}

// POST /events/override (admin only)
interface EventOverrideRequest {
  user_id?: string;
  bias_key: string;
  strength: number;
  ttl?: string; // ISO 8601 duration
}
```

## MARKETPLACE APIs (Phase 3)

### Listings
```typescript
// POST /listings
interface CreateListingRequest {
  card_id: string;
  price_points: number;
  visibility?: 'public' | 'private' | 'unlisted';
}

// GET /discover
interface DiscoverRequest {
  tags?: string[];
  price_min?: number;
  price_max?: number;
  sort?: 'newest' | 'popular' | 'diversity';
  limit?: number;
  offset?: number;
}

interface DiscoverResponse {
  listings: Listing[];
  total: number;
  has_more: boolean;
  diversity_score?: number;
}
```

### Orders
```typescript
// POST /orders
interface CreateOrderRequest {
  listing_id: string;
  idempotency_key: string;
}

interface CreateOrderResponse {
  order_id: string;
  status: 'pending' | 'completed';
  card_access_token?: string;
}
```

## ERROR RESPONSES

### Standard Error Format
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  request_id: string;
  timestamp: string;
}
```

### Common Error Codes
```typescript
enum ErrorCodes {
  // Auth
  UNAUTHORIZED = 'unauthorized',
  INVALID_TOKEN = 'invalid_token',
  INSUFFICIENT_PERMISSIONS = 'insufficient_permissions',
  
  // Wallet
  INSUFFICIENT_POINTS = 'insufficient_points',
  INVALID_AMOUNT = 'invalid_amount',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  
  // Cards
  CARD_NOT_FOUND = 'card_not_found',
  INVALID_CARD_DATA = 'invalid_card_data',
  CARD_ALREADY_EXISTS = 'card_already_exists',
  
  // MetaCapture
  CAPTURE_FAILED = 'capture_failed',
  INVALID_SOURCE = 'invalid_source',
  COST_LIMIT_EXCEEDED = 'cost_limit_exceeded',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  TOO_MANY_REQUESTS = 'too_many_requests'
}
```

## RATE LIMITING

### Limits by Endpoint
```typescript
const RATE_LIMITS = {
  // Auth
  '/auth/login': { window: '1m', max: 5 },
  '/auth/refresh': { window: '1m', max: 10 },
  
  // Wallet
  '/wallet': { window: '1m', max: 30 },
  '/wallet/adjust': { window: '1m', max: 10 },
  
  // Cards
  '/cards': { window: '1m', max: 60 },
  '/cards/convert': { window: '1m', max: 10 },
  
  // MetaCapture
  '/metacapture/submit': { window: '1m', max: 5 },
  '/metacapture/:id': { window: '1m', max: 30 },
  
  // Events
  '/events/today': { window: '1m', max: 60 },
  '/events/override': { window: '1m', max: 10 }
};
```

## MONITORING

### Health Check
```typescript
// GET /health
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    external_apis: HealthCheck;
  };
  version: string;
  uptime: number;
}

interface HealthCheck {
  status: 'ok' | 'error';
  response_time_ms?: number;
  error?: string;
}
```

### Metrics
```typescript
// GET /metrics (Prometheus format)
interface MetricsResponse {
  // Custom metrics
  webhook_success_rate: number;
  capture_latency_p95: number;
  convert_error_rate: number;
  active_users: number;
  total_transactions: number;
}
```




