<script setup lang="ts">
import { toRefs } from 'vue'
import type { GuideContent, HelpContent, AuthorContent } from '../types/home'

const props = defineProps<{
  guide: GuideContent
  help?: HelpContent
  author: AuthorContent
}>()

const { guide, help, author } = toRefs(props)
</script>

<template>
  <section class="info-grid">
    <article class="card">
      <h2>{{ guide.title }}</h2>
      <ol>
        <li v-for="(step, index) in guide.steps" :key="index">{{ step }}</li>
      </ol>
    </article>

    <article v-if="help" class="card">
      <h2>{{ help.title }}</h2>
      <dl class="faq">
        <template v-for="item in help.faqs" :key="item.question">
          <dt>{{ item.question }}</dt>
          <dd>{{ item.answer }}</dd>
        </template>
      </dl>
      <ul class="disclaimer">
        <li v-for="line in help.disclaimer" :key="line">{{ line }}</li>
      </ul>
    </article>

    <article class="card">
      <h2>{{ author.title }}</h2>
      <p class="author-name">{{ author.name }}</p>
      <p v-for="line in author.body" :key="line">{{ line }}</p>
    </article>
  </section>
</template>

<style scoped>
.info-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.card {
  display: grid;
  gap: 16px;
  padding: clamp(18px, 3vw, 28px);
  border-radius: 20px;
  border: 1px solid var(--line, rgba(255, 255, 255, 0.12));
  background: linear-gradient(180deg, rgba(12, 18, 32, 0.7), rgba(12, 18, 32, 0.45));
  box-shadow: var(--shadow, 0 14px 40px rgba(0, 0, 0, 0.22));
}

.card h2 {
  margin: 0;
  font-size: 1.1rem;
}

.card ol {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 8px;
}

.faq {
  margin: 0;
  display: grid;
  gap: 10px;
}

.faq dt {
  font-weight: 600;
}

.faq dd {
  margin: 0;
  opacity: 0.85;
}

.disclaimer {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
}

.author-name {
  font-weight: 600;
}
</style>
