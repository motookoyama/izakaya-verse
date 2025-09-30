<script setup lang="ts">
import { computed } from 'vue'
import ChatConsole from './ChatConsole.vue'
import type { ChatContent } from '../types/home'

type LogEntry = {
  who: 'you' | 'comp' | 'sys'
  text: string
}

const props = withDefaults(defineProps<{
  title?: string
  version?: string
  subtitle?: string
  statusLabel?: string
  statusTone?: 'ready' | 'neutral' | 'busy'
  chatContent?: ChatContent
  useMockChat?: boolean
  mockLog?: LogEntry[]
  footerNotes?: string[]
}>(), {
  title: 'IZAKAYA games',
  version: 'UI Mock · v0',
  subtitle: 'Standalone Game Panel + Chat',
  statusLabel: 'Ready',
  statusTone: 'ready',
  useMockChat: true,
  mockLog: () => ([
    { who: 'sys', text: 'IZAKAYA games: UI mock loaded' },
    { who: 'comp', text: '準備OK。A/Bは後で割り当てよう。' },
    { who: 'you', text: '画面比はこのままで。' },
    { who: 'comp', text: '了解。チャットは右に固定するね。' },
  ]),
  footerNotes: () => [
    '※ 現時点では見た目のみのモックです（ゲームロジック未実装）',
    '将来的にV2チャット／メタキャプチャーと連携する想定です。',
  ],
})

const statusClass = computed(() => {
  switch (props.statusTone) {
    case 'busy':
      return 'status-pill status-pill--busy'
    case 'neutral':
      return 'status-pill status-pill--neutral'
    default:
      return 'status-pill status-pill--ready'
  }
})

const hasChatConsole = computed(() => Boolean(!props.useMockChat && props.chatContent))
</script>

<template>
  <div class="game-panel">
    <header class="game-panel__header">
      <div class="game-panel__brand">{{ title }}</div>
      <div class="game-panel__meta">
        <span>{{ version }}</span>
        <span class="game-panel__divider">/</span>
        <span>{{ subtitle }}</span>
      </div>
    </header>

    <main class="game-panel__body">
      <section class="stage">
        <div class="stage__monitor">
          <span class="stage__bezel">RETRO / TV-16:9</span>
          <div class="stage__screen">
            <div class="stage__overlay stage__overlay--vignette"></div>
            <div class="stage__overlay stage__overlay--glass"></div>
            <slot name="viewport">
              <div class="stage__grid">
                <div
                  v-for="index in 112"
                  :key="index"
                  :class="['stage__tile', index % 7 === 0 ? 'stage__tile--highlight' : '']"
                ></div>
              </div>
              <div class="stage__sprites">
                <span class="stage__sprite stage__sprite--emerald"></span>
                <span class="stage__sprite stage__sprite--crimson"></span>
                <span class="stage__sprite stage__sprite--amber"></span>
              </div>
              <div class="stage__hud">
                <span class="stage__hud-chip stage__hud-chip--hp">HP 20/20</span>
                <span class="stage__hud-chip stage__hud-chip--mp">MP 10/10</span>
              </div>
              <span class="stage__compass">Facing E</span>
            </slot>
          </div>
        </div>

        <div class="controller">
          <div class="controller__pad">
            <div class="controller__dpad">
              <button type="button" class="controller__arrow controller__arrow--up">↑</button>
              <button type="button" class="controller__arrow controller__arrow--down">↓</button>
              <button type="button" class="controller__arrow controller__arrow--left">←</button>
              <button type="button" class="controller__arrow controller__arrow--right">→</button>
            </div>
          </div>
          <div class="controller__center">
            <button type="button" class="controller__pill">Select</button>
            <button type="button" class="controller__pill">Start</button>
          </div>
          <div class="controller__actions">
            <button type="button" class="controller__button controller__button--a" aria-label="A"></button>
            <button type="button" class="controller__button controller__button--b" aria-label="B"></button>
          </div>
        </div>
      </section>

      <aside class="chat-dock">
        <div class="chat-dock__header">
          <span class="chat-dock__label">IZAKAYA V2 Chat</span>
          <span :class="statusClass">{{ statusLabel }}</span>
        </div>

        <div class="chat-dock__body" v-if="hasChatConsole">
          <ChatConsole :content="chatContent!" />
        </div>
        <div v-else class="chat-dock__mock">
          <div class="chat-dock__log" role="log">
            <p
              v-for="(entry, index) in mockLog"
              :key="`${entry.who}-${index}`"
              :class="['chat-dock__line', `chat-dock__line--${entry.who}`]"
            >
              <span v-if="entry.who === 'sys'">● </span>
              <span v-else-if="entry.who === 'comp'">◇ </span>
              {{ entry.text }}
            </p>
          </div>
          <form class="chat-dock__composer" aria-label="Mock chat input">
            <input
              class="chat-dock__input"
              type="text"
              placeholder="メッセージを入力（モック）"
              disabled
            />
            <button type="button" class="chat-dock__send" disabled>送信</button>
          </form>
        </div>
      </aside>
    </main>

    <footer class="game-panel__footer">
      <span v-for="(note, index) in footerNotes" :key="index">{{ note }}</span>
    </footer>
  </div>
</template>

<style scoped>
.game-panel {
  display: grid;
  gap: clamp(20px, 3vw, 32px);
  min-height: 100vh;
  width: 100%;
  color: #e5e7eb;
  background: #0b0b0d;
  padding: clamp(16px, 4vw, 36px);
  box-sizing: border-box;
}

.game-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  padding-bottom: 12px;
}

.game-panel__brand {
  font-size: 0.75rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.game-panel__meta {
  display: flex;
  gap: 8px;
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.75);
  align-items: center;
}

.game-panel__divider {
  opacity: 0.5;
}

.game-panel__body {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.9fr);
  align-items: start;
}

.stage {
  display: grid;
  gap: 18px;
}

.stage__monitor {
  position: relative;
  border-radius: 28px;
  padding: clamp(16px, 3vw, 24px);
  background: linear-gradient(180deg, #10121a, #1a1d26);
  border: 1px solid rgba(100, 116, 139, 0.45);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.55);
}

.stage__bezel {
  position: absolute;
  top: -12px;
  right: 24px;
  font-size: 0.65rem;
  color: rgba(148, 163, 184, 0.7);
}

.stage__screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #050506;
}

.stage__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stage__overlay--vignette {
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08), transparent 60%);
}

.stage__overlay--glass {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 42%, rgba(0, 0, 0, 0.4));
  mix-blend-mode: overlay;
}

.stage__grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(14, minmax(0, 1fr));
  gap: 3px;
  place-items: center;
  padding: 18px 32px;
  box-sizing: border-box;
}

.stage__tile {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 1px solid rgba(30, 41, 59, 0.8);
  background: rgba(15, 23, 42, 0.95);
}

.stage__tile--highlight {
  background: rgba(30, 41, 59, 0.9);
}

.stage__sprites {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-columns: repeat(3, 24px);
  gap: 12px;
}

.stage__sprite {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.stage__sprite--emerald {
  background: #10b981;
}

.stage__sprite--crimson {
  background: #f87171;
}

.stage__sprite--amber {
  background: #fbbf24;
}

.stage__hud {
  position: absolute;
  left: 18px;
  top: 18px;
  display: flex;
  gap: 8px;
  font-size: 0.7rem;
}

.stage__hud-chip {
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stage__hud-chip--hp {
  border-color: rgba(52, 211, 153, 0.8);
  color: rgba(167, 243, 208, 0.9);
  background: rgba(16, 185, 129, 0.22);
}

.stage__hud-chip--mp {
  border-color: rgba(125, 211, 252, 0.8);
  color: rgba(191, 219, 254, 0.9);
  background: rgba(59, 130, 246, 0.22);
}

.stage__compass {
  position: absolute;
  right: 16px;
  bottom: 16px;
  font-size: 0.65rem;
  color: rgba(148, 163, 184, 0.65);
}

.controller {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 3vw, 24px);
  border-radius: 24px;
  padding: clamp(16px, 3vw, 24px);
  background: rgba(15, 17, 26, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.controller__pad {
  display: flex;
  justify-content: center;
  align-items: center;
}

.controller__dpad {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 22px;
  background: rgba(30, 34, 45, 0.9);
  border: 1px solid rgba(100, 116, 139, 0.55);
  box-shadow: inset 0 12px 22px rgba(0, 0, 0, 0.45);
}

.controller__arrow {
  position: absolute;
  min-width: 44px;
  padding: 6px 0;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  background: rgba(71, 85, 105, 0.9);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.controller__arrow:hover {
  background: rgba(148, 163, 184, 0.9);
}

.controller__arrow:active {
  transform: translateY(1px);
}

.controller__arrow--up {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.controller__arrow--down {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.controller__arrow--left {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
}

.controller__arrow--right {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
}

.controller__center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 2vw, 18px);
}

.controller__pill {
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(30, 34, 45, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
  cursor: pointer;
}

.controller__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(16px, 3vw, 24px);
}

.controller__button {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  border: 4px solid rgba(254, 226, 226, 0.65);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.controller__button:active {
  transform: scale(0.96);
}

.controller__button--a {
  background: #f43f5e;
  border-color: rgba(254, 202, 202, 0.9);
}

.controller__button--b {
  background: #f59e0b;
  border-color: rgba(254, 235, 200, 0.9);
}

.chat-dock {
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  padding: clamp(18px, 3vw, 24px);
  background: rgba(15, 17, 26, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 32px 60px rgba(0, 0, 0, 0.45);
  min-height: 520px;
}

.chat-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 12px;
}

.chat-dock__label {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.status-pill--ready {
  color: rgba(167, 243, 208, 0.9);
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(52, 211, 153, 0.6);
}

.status-pill--neutral {
  color: rgba(148, 163, 184, 0.9);
  background: rgba(71, 85, 105, 0.35);
  border-color: rgba(148, 163, 184, 0.35);
}

.status-pill--busy {
  color: rgba(254, 226, 226, 0.85);
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.55);
}

.chat-dock__body {
  flex: 1;
  overflow: hidden;
  margin-top: 16px;
}

.chat-dock__mock {
  flex: 1;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
  margin-top: 16px;
}

.chat-dock__log {
  overflow-y: auto;
  padding-right: 4px;
  display: grid;
  gap: 10px;
}

.chat-dock__line {
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(229, 231, 235, 0.85);
}

.chat-dock__line--comp {
  color: rgba(167, 243, 208, 0.92);
}

.chat-dock__line--sys {
  color: rgba(148, 163, 184, 0.75);
}

.chat-dock__composer {
  display: flex;
  gap: 12px;
}

.chat-dock__input {
  flex: 1;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(30, 34, 45, 0.85);
  color: inherit;
  padding: 10px 14px;
}

.chat-dock__send {
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.5);
  background: rgba(16, 185, 129, 0.35);
  color: rgba(229, 255, 247, 0.9);
  padding: 10px 16px;
  cursor: pointer;
}

.chat-dock__send:disabled,
.chat-dock__input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-panel__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.75);
}

@media (max-width: 960px) {
  .game-panel__body {
    grid-template-columns: 1fr;
  }

  .chat-dock {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .game-panel__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .controller {
    grid-template-columns: 1fr;
  }

  .controller__center {
    justify-content: space-between;
  }
}
</style>
