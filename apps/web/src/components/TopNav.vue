<script setup lang="ts">
import { toRefs } from 'vue'
import type { HeroContent } from '../types/home'

const props = defineProps<{
  hero: HeroContent
  navLinks: { id: string; label: string; path?: string }[]
  themes: { id: string; name: string }[]
  currentThemeId: string
  languageOptions: { value: string; label: string }[]
  currentLocale: string
  themeLabel: string
  languageLabel: string
  showOverlayToggle?: boolean
}>()

const emits = defineEmits<{(
  event: 'change-theme', value: string
): void; (
  event: 'change-locale', value: string
): void; (
  event: 'toggle-overlay'
): void; (
  event: 'navigate', value: string
): void }>()

const { hero, navLinks, themes, currentThemeId, languageOptions, currentLocale, themeLabel, languageLabel, showOverlayToggle } = toRefs(props)

function onThemeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  emits('change-theme', value)
}

function onLocaleClick(value: string) {
  emits('change-locale', value)
}

function onToggleOverlay() {
  emits('toggle-overlay')
}

function onNavigate(path: string | undefined, id: string) {
  emits('navigate', path ?? id)
}
</script>

<template>
  <header class="top-nav">
    <div class="branding">
      <span class="phase">{{ hero.phase }}</span>
      <p class="title">{{ hero.title }}</p>
      <p class="subtitle">{{ hero.welcome }}</p>
      <nav class="primary-nav">
        <a
          v-for="link in navLinks"
          :key="link.id"
          class="primary-nav__item"
          :href="link.path || '#/'"
          @click.prevent="onNavigate(link.path, link.id)"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
    <div class="toolbar">
      <button
        v-if="showOverlayToggle"
        type="button"
        class="overlay-toggle"
        @click="onToggleOverlay"
        aria-label="toggle quick panel"
      >
        ☰
      </button>
      <label class="toolbar-field">
        <span>{{ themeLabel }}</span>
        <select :value="currentThemeId" @change="onThemeChange">
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">{{ theme.name }}</option>
        </select>
      </label>
      <div class="toolbar-field">
        <span>{{ languageLabel }}</span>
        <div class="language-toggle">
          <button
            v-for="option in languageOptions"
            :key="option.value"
            type="button"
            :class="{ active: currentLocale === option.value }"
            @click="onLocaleClick(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px;
  padding: 20px clamp(16px, 3vw, 36px);
  border-radius: 20px;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.1));
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.75), var(--panel, rgba(0, 0, 0, 0.35)));
  box-shadow: var(--shadow, 0 14px 40px rgba(0, 0, 0, 0.28));
}

.branding {
  display: grid;
  gap: 6px;
}

.phase {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brand-2, #58cff5);
}

.title {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
}

.subtitle {
  margin: 0;
  opacity: 0.75;
}

.primary-nav {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.primary-nav__item {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  text-decoration: none;
  font-size: 0.85rem;
  transition: border-color 0.2s ease, opacity 0.2s ease;
}

.primary-nav__item:hover {
  border-color: rgba(255, 255, 255, 0.4);
  opacity: 0.9;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.overlay-toggle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(12, 18, 32, 0.45);
  color: inherit;
  font-size: 1.1rem;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.toolbar-field {
  display: grid;
  gap: 4px;
  font-size: 0.85rem;
}

.toolbar-field span {
  opacity: 0.75;
}

.language-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.language-toggle button {
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: 10px;
  opacity: 0.65;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.language-toggle button.active {
  background: linear-gradient(90deg, var(--brand, #e87b25), var(--brand-2, #58cff5));
  color: #0b0f14;
  opacity: 1;
}

@media (max-width: 640px) {
  .language-toggle {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
