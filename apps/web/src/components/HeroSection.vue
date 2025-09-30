<script setup lang="ts">
import { toRefs } from 'vue'
import type { HeroContent } from '../types/home'

const props = defineProps<{
  hero: HeroContent
}>()

const { hero } = toRefs(props)
</script>

<template>
  <section class="hero">
    <div class="hero-text">
      <p v-for="line in hero.slogans" :key="line" class="hero-slogan">{{ line }}</p>
      <p v-for="line in hero.description" :key="line" class="hero-description">{{ line }}</p>
    </div>
    <div class="hero-actions">
      <button type="button" class="cta">{{ hero.cta }}</button>
      <nav class="hero-nav">
        <a
          v-for="link in hero.navLinks"
          :key="link.id"
          class="hero-nav__item"
          :href="link.path || '#/'"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 24px;
  padding: clamp(20px, 4vw, 36px);
  border-radius: 24px;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.12));
  background: linear-gradient(180deg, rgba(12, 18, 32, 0.7), rgba(12, 18, 32, 0.45));
  box-shadow: var(--shadow, 0 14px 40px rgba(0, 0, 0, 0.25));
}

.hero-text {
  display: grid;
  gap: 10px;
}

.hero-slogan {
  margin: 0;
  font-size: clamp(1.1rem, 2.8vw, 1.6rem);
  font-weight: 700;
}

.hero-description {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
}

.hero-actions {
  display: grid;
  gap: 16px;
}

.cta {
  padding: 14px 22px;
  font-size: 1rem;
  border-radius: 14px;
  background: linear-gradient(90deg, var(--brand, #e87b25), var(--brand-2, #58cff5));
  color: #0b0f14;
  font-weight: 700;
}

.hero-nav {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-nav__item {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.85rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s ease, opacity 0.2s ease;
}

.hero-nav__item:hover {
  border-color: rgba(255, 255, 255, 0.4);
  opacity: 0.9;
}
</style>
