<script setup lang="ts">
import type { PaymentNote, PaymentOption, PaymentSupport } from '../types/home'

defineProps<{
  title: string
  description: string
  options: PaymentOption[]
  support?: PaymentSupport
  notes?: PaymentNote[]
}>()
</script>

<template>
  <section class="payments">
    <header class="payments__header">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </header>

    <div class="payments__grid">
      <article v-for="option in options" :key="option.id" class="payments__card">
        <div v-if="option.localeTag" class="payments__tag">{{ option.localeTag }}</div>
        <h3>{{ option.title }}</h3>
        <p class="payments__lead">{{ option.description }}</p>
        <div class="payments__price">{{ option.price }}</div>
        <img :src="option.qrImage" :alt="option.title" class="payments__qr" />
        <p v-if="option.caption" class="payments__caption">{{ option.caption }}</p>
        <a
          class="payments__button"
          :href="option.paypalLink"
          target="_blank"
          rel="noopener"
        >
          {{ option.buttonLabel }}
        </a>
      </article>
    </div>

    <div v-if="support" class="support">
      <div class="support__body">
        <h3>{{ support.title }}</h3>
        <p>{{ support.description }}</p>
        <div class="support__price">{{ support.price }}</div>
      </div>
      <div class="support__media">
        <img :src="support.qrImage" :alt="support.title" class="support__qr" />
        <a
          class="support__button"
          :href="support.paypalLink"
          target="_blank"
          rel="noopener"
        >
          {{ support.buttonLabel }}
        </a>
      </div>
    </div>

    <ul v-if="notes?.length" class="notes">
      <li v-for="(note, index) in notes" :key="index">
        <span>{{ note.text }}</span>
        <a v-if="note.url" :href="note.url" target="_blank" rel="noopener">
          {{ note.urlLabel ?? note.url }}
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.payments {
  display: grid;
  gap: 28px;
  padding: clamp(24px, 4vw, 36px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(135deg, rgba(103, 118, 199, 0.35), rgba(118, 75, 162, 0.2));
  box-shadow: 0 28px 64px rgba(8, 14, 28, 0.45);
}

.payments__header {
  display: grid;
  gap: 8px;
}

.payments__header h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
}

.payments__header p {
  margin: 0;
  opacity: 0.85;
  max-width: 640px;
}

.payments__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.payments__card {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(12, 16, 30, 0.55);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.payments__tag {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.payments__card h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.payments__lead {
  margin: 0;
  min-height: 42px;
  opacity: 0.82;
  font-size: 0.92rem;
}

.payments__price {
  font-size: 1.5rem;
  font-weight: 700;
}

.payments__qr {
  width: clamp(140px, 45vw, 180px);
  height: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  margin: 0 auto;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

.payments__caption {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.payments__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 999px;
  background: linear-gradient(90deg, #0070ba, #00a6ff);
  color: #f5f7fb;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.payments__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 112, 186, 0.35);
}

.support {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.12);
  color: #0b111a;
}

.support__body {
  display: grid;
  gap: 10px;
}

.support__body h3 {
  margin: 0;
  font-size: 1.3rem;
}

.support__body p {
  margin: 0;
  opacity: 0.85;
}

.support__price {
  font-size: 1.2rem;
  font-weight: 600;
}

.support__media {
  display: grid;
  justify-items: center;
  gap: 12px;
}

.support__qr {
  width: clamp(140px, 45vw, 180px);
  height: auto;
  border-radius: 12px;
  border: 2px solid rgba(11, 17, 26, 0.35);
  box-shadow: 0 10px 24px rgba(11, 17, 26, 0.3);
}

.support__button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #1a1c24;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 12px 30px rgba(255, 215, 0, 0.35);
  transition: transform 0.2s ease;
}

.support__button:hover {
  transform: translateY(-2px);
}

.notes {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  font-size: 0.9rem;
}

.notes li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: baseline;
}

.notes a {
  color: #ffd700;
  text-decoration: none;
}

.notes a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .payments {
    padding: 20px;
  }

  .payments__grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
