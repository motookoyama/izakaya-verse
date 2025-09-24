
Image_Delegation_Spec.sAtd

# Specification: Cross-Platform Image Delegation for IZAKAYA Verse

## Purpose
To unify image generation across different environments (OpenAI, Google Imagen, Stability AI, Local SDXL) by **delegating requests from satellites to the IZAKAYA Core**, where the actual image generation is executed.

---

## 1. Request Contract (Satellite → Core)

Each satellite must send a structured payload:

```json
{
  "prompt": "character: samurai, setting: neon city",
  "style": "anime | photo | background",
  "quality": "draft | standard | premium",
  "size": "400x600 | 512x768 | 1024x1536",
  "ar": "2:3 | 16:9 | 1:1",
  "safety": true,
  "fallback": "background"
}

	•	prompt: User’s text input.
	•	style: Controls the rendering mode.
	•	quality: Defines resolution and API tier.
	•	size/ar: Optional overrides.
	•	safety: Always true, Core enforces NSFW policy.
	•	fallback: Defines substitute (e.g. “background image”) when primary fails.

⸻

2. Core Routing Rules

Core decides the engine:

Platform Context	Preferred Engine	Backup
Google App / Gemini	Imagen	Stable Diffusion
OpenAI App / ChatGPT	DALL·E (OpenAI Images)	Stability API
Local Server	SDXL / ComfyUI	Cache reuse
Offline	Last cached result	Placeholder art


⸻

3. Budget & Safety
	•	Draft tier = lowest cost (e.g. 256px test).
	•	Standard = production quality (512px).
	•	Premium = showcase (HD or 4K).

Safety checks at Core level:
	•	NSFW blocklist.
	•	Forced background fallback when violation detected.

⸻

4. Response Format

Core responds with:

{
  "status": "ok",
  "engine": "OpenAI",
  "url": "https://cdn.izakaya/img/abc123.png",
  "v2_embed": true
}

	•	engine = which generator was chosen.
	•	url = accessible image URL.
	•	v2_embed = Core ensures embedding into V2 card (PNG metadata).

⸻

5. Authentication
	•	Satellite must attach its API token.
	•	Core validates and applies per-user quota.
	•	Nonce for idempotency (to avoid duplicate costs).

⸻

6. Failover Rules
	1.	If engine timeout > 20s → fallback to backup.
	2.	If all fail → deliver “雄大な背景 only” image.
	3.	Always log error to Admin Console.

⸻

7. Testing Checklist
	•	Satellite sends minimal prompt ("samurai warrior") → Core returns anime portrait.
	•	Safety test: "nsfw content" → background fallback auto-applied.
	•	Quality tiers verified: draft < standard < premium (resolution + cost).
	•	Satellite doesn’t need to know which engine was used.

⸻

Notes
	•	Delegation ensures low complexity for satellites and centralized policy control.
	•	Any future generator (Runway, MidJourney API, etc.) can be added inside Core without changing satellite code.

---

👉 この `.sAtd` を貼り付ければ、Googleサテライトや他環境で**画像処理は本家コアに丸投げ**、どのエンジンを使うかは Core が選択する ― という仕組みになります。  

保存名の推奨例:  
`Image_Delegation_Spec.sAtd.md`  

---

質問：この仕様、今のフェーズ1.3にも統合して「画像生成＝Coreで統一」としてしまいますか？ それともまずサテライト専用の追加仕様として独立で保存しておきますか？