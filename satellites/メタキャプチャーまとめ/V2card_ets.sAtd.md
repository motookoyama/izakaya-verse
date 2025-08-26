# V2 Card Handling Guide (.sAtd)
This document describes how IZAKAYA verse Phase 1 handles SillyTavern‑compatible **V2 Cards** (PNG / JSON / .sAtd).

---

## Supported Formats
- **PNG (recommended 400x600)**  
  JSON text embedded in PNG chunks (**tEXt / iTXt / zTXt(deflate)**).
- **JSON (.json)**  
  Direct JSON text.
- **.sAtd**  
  JSON‑compatible text (treated like JSON).

> Note: zTXt extraction requires browser support for `DecompressionStream('deflate')`.  
> When unavailable, only tEXt and non‑compressed iTXt are parsed.

---

## Field Normalization Priority
When multiple shapes exist, the app picks the first that matches:

1. `data.first_mes`  
2. `spec.first_mes`  
3. `card.first_mes`  
4. `first_mes` (root)

Additional fields:
- **name**: `name` → `character` → `title`
- **behavior**: `description` → `system_prompt` → `behavior`
- **links**: `links` array is used as‑is

---

## UI Behavior (Phase 1)
- Uploading a card creates an admin‑switchable **Custom** tab.
- `first_mes` is injected as the initial greeting in the chat.
- If a PNG is uploaded, it is shown as the **avatar icon** (circular) in header/chat/library.
- **Japanese UI mode**: when text contains no Japanese characters, the chat bubble shows a mock header line `【日本語要約(Mock)】` before the original text (placeholder for a future translation step).

---

## Example JSON
```json
{
  "name": "Dr. Orb",
  "first_mes": "こんにちは。私は Dr. Orb。",
  "behavior": "Logic→Metaphor→Humor",
  "links": [{"title":"Lab notes","url":"#"}]
}
```

### SillyTavern‑style (data.first_mes)
```json
{
  "data": {
    "first_mes": "Hello there!",
    "name": "Kasou Kawari",
    "description": "Guide & friend",
    "links": []
  }
}
```

---

## PNG Extraction Details
- **tEXt**: read UTF‑8 after keyword NUL.
- **iTXt**: if `compressionFlag=0`, read as UTF‑8; if `compressionFlag=1` and `compressionMethod=0`, inflate via `DecompressionStream('deflate')`.
- **zTXt**: if `compressionMethod=0`, inflate via `DecompressionStream('deflate')`.

The app also attempts **Base64‑decoded** and **substring** JSON recovery as a fallback.

---

## Known Limitations
- zTXt requires a modern Chromium‑based browser.
- Heavily customized/obfuscated embeddings may fail to parse.
- Avatar SVG conversion is not implemented yet (PNG thumbnail is used).

---

## Roadmap (toward SillyTavern‑like UX)
- Multi‑chat / group conversation UI
- Behavior style visualization and reply templates
- Language auto‑detection & proper translation step
- TTS / payments / points / QR redeem integration
- Real backend for `usePoints()` and `/redeem/:token`

---

## .sAtd
`.sAtd` is treated as JSON text with a different extension.

— IZAKAYA verse / Phase 1 (UI only)
