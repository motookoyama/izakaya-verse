<script setup lang="ts">
import { toRefs } from 'vue'
import type { KnowledgeContent } from '../types/home'

const props = defineProps<{
  content: KnowledgeContent
  currentThemeName: string
}>()

const { content, currentThemeName } = toRefs(props)
</script>

<template>
  <section class="knowledge card">
    <header class="knowledge__header">
      <span class="badge">{{ currentThemeName }}</span>
      <div>
        <h2>{{ content.title }}</h2>
        <p class="knowledge__updated">{{ content.updated }}</p>
      </div>
    </header>
    <div class="knowledge__topics">
      <article v-for="topic in content.topics" :key="topic.id">
        <h3>{{ topic.title }}</h3>
        <p v-for="line in topic.body" :key="line">{{ line }}</p>
      </article>
    </div>
    <div class="knowledge__faq">
      <h3>FAQ</h3>
      <dl>
        <template v-for="item in content.faq" :key="item.question">
          <dt>{{ item.question }}</dt>
          <dd>{{ item.answer }}</dd>
        </template>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.card {
  display: grid;
  gap: 24px;
  padding: 20px clamp(16px, 2.5vw, 28px);
  border-radius: 20px;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.12));
  background: linear-gradient(180deg, rgba(12, 18, 32, 0.7), rgba(12, 18, 32, 0.45));
  box-shadow: var(--shadow, 0 14px 40px rgba(0, 0, 0, 0.25));
}

.knowledge__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, var(--brand, #e87b25), var(--brand-2, #58cff5));
  color: #0b0f14;
  text-transform: uppercase;
}

.knowledge__updated {
  margin: 0;
  opacity: 0.7;
  font-size: 0.85rem;
}

.knowledge__topics {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.knowledge__topics article {
  display: grid;
  gap: 8px;
}

.knowledge__topics h3 {
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-2, #58cff5);
}

.knowledge__faq {
  display: grid;
  gap: 12px;
}

.knowledge__faq h3 {
  margin: 0;
  font-size: 1rem;
}

.knowledge__faq dl {
  margin: 0;
  display: grid;
  gap: 10px;
}

@media (max-width: 768px) {
  .knowledge__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
