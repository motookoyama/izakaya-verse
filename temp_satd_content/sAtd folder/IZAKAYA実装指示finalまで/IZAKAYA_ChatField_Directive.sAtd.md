# .sAtd: IZAKAYA Chat Field — Directive (Phase 1.4)
[IDENTITY]
app: IZAKAYA verse
module: chat_field_core
version: 1.4

[CHAT_FIELD]
# Single LLM chat surface that blends Master card (admin), active user cards (≤3),
# and optional Event Pack biases. This is the runtime contract for Cursor.
input_box:
  multiline: true
  max_chars: 4000
send_keys: ["Enter"]
newline_keys: ["Shift+Enter"]
attachments:
  allow_drop: true
  accept: [".png",".json",".sAtd",".md",".txt"]
cards_slots:
  max: 3
  overflow_policy: "fifo_drop_oldest"   # 4th card drops the oldest to Trash (keep last-1 for undo).
  allow_reorder: true
  reset_all_button: true
  reset_confirms: ["はい","いいえ"]
log_download:
  enabled: true
  formats: ["md","json"]
  include: ["turn_history","active_card_ids","timestamp","user_id_hash"]
language:
  ui_languages: ["ja","en"]
  chat_follows_ui: true
  fallback: "compact"
render:
  avatar_from_png: true        # PNG avatar only (no embedded JSON parse at Phase 1.4)
  card_name_from_meta: true
  show_system_prompts: false   # userには非表示（Adminのみ参照可）

[MASTER_CARD]
slot: "admin_only"
apply_scope: "global_base"
priority: "top"
import_fields_whitelist:
  persona: ["speech_style","tone","first_person","second_person"]
  skills: ["tool_whitelist","domain_knowledge","safety_prefs"]
announce_on_switch: true
announce_templates:
  ja: "【本日のマスター】{name} に交代しました。"
  en: "[Master of the Day] has switched to {name}."
rollback_last_change: true

[EVENT_PACK]
enable: true
consent_mode:
  propose_only: true
  button_labels:
    ja: ["参加する","スキップ"]
    en: ["Join","Skip"]
bias_cap: 0.3
validation_require: ["id","name","type","trigger","on_accept"]
priority_chain:
  - "master"
  - "event"     # keep 0.1–0.2 for light flavor
  - "card"
  - "user_prefs"
conflict_resolution: "higher_wins"

[SECURITY]
admin_roles: ["owner","operator"]
snapshot_before_apply: true
block_user_override: true

[FILENAME_POLICY]
ascii_only: true
separator: "-"
examples:
  event_pack: "events-autumn-2025.sAtd.md"
  v2card_png: "char-maddy-v2.png"
  chat_log: "log-2025-09-01-uidXXXX.json"

[QA_CHECKLIST]
- 3 slots work; overflow drops oldest safely with Trash/Undo
- Reset All clears UI/state; 1 click log download functional
- Master switch modifies tone/first message; rollback available
- Event Pack proposes; user can Join/Skip; bias never >0.3
- Admin digest shows active_events/opt_in/chat_volume/errors
