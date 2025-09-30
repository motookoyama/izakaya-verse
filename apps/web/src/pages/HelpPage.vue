<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HelpContent, KnowledgeContent, AccountContent } from '../types/home'
import helpIcon from '../assets/icons/help-qr.png'
import { navigatorCards } from '../data/sampleCards'
import { navigateTo } from '../constants/navigation'

const { tm } = useI18n({ useScope: 'global' })

const page = computed(() => tm('pages.help') as { title: string; lead: string[]; workflowTitle: string; workflow: string[]; notesTitle: string; notes: string[] })
const help = computed(() => tm('home.help') as HelpContent)
const policy = computed(() => (tm('home.account') as AccountContent).policy)
const knowledge = computed(() => tm('home.knowledge') as KnowledgeContent)
const managementCopy = computed(() => {
  const raw = tm('pages.help.management') as { title?: string; intro?: string; note?: string; cta?: string } | undefined
  return {
    title: raw?.title ?? 'Management chat',
    intro: raw?.intro ?? '',
    note: raw?.note ?? '',
    cta: raw?.cta ?? 'Open admin console',
  }
})
const managementCards = computed(() => navigatorCards.filter((card) => card.tags.some((tag) => /管理|管理者|翻訳|経理/.test(tag))))

function openAdmin() {
  navigateTo('admin')
}
</script>

<template>
  <div class="page">
    <header class="page__hero">
      <img class="page__icon" :src="helpIcon" alt="Help" />
      <h1>{{ page.title }}</h1>
      <p v-for="line in page.lead" :key="line">{{ line }}</p>
    </header>

    <section class="page__section">
      <h2>{{ page.workflowTitle }}</h2>
      <ol>
        <li v-for="step in page.workflow" :key="step">{{ step }}</li>
      </ol>
    </section>

    <section class="page__section">
      <h2>{{ help.title }}</h2>
      <div class="page__split">
        <div>
          <h3>FAQ</h3>
          <dl>
            <template v-for="item in help.faqs" :key="item.question">
              <dt>{{ item.question }}</dt>
              <dd>{{ item.answer }}</dd>
            </template>
          </dl>
        </div>
        <div>
          <h3>{{ policy.title }}</h3>
          <ul>
            <li v-for="item in policy.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="page__section">
      <h2>{{ page.notesTitle }}</h2>
      <ul>
        <li v-for="note in page.notes" :key="note">{{ note }}</li>
      </ul>
    </section>

    <section v-if="managementCards.length" class="page__section management">
      <header class="management__header">
        <h2>{{ managementCopy.title }}</h2>
        <p>{{ managementCopy.intro }}</p>
      </header>
      <ul class="management__list">
        <li v-for="card in managementCards" :key="card.id">
          <div class="management__title">
            <strong>{{ card.name }}</strong>
            <span>{{ card.tags.join(', ') }}</span>
          </div>
          <p>{{ card.summary }}</p>
        </li>
      </ul>
      <footer class="management__footer">
        <p>{{ managementCopy.note }}</p>
        <button type="button" @click="openAdmin">{{ managementCopy.cta }}</button>
      </footer>
    </section>

    <section class="page__section">
      <h2>{{ knowledge.title }}</h2>
      <div class="knowledge">
        <article v-for="topic in knowledge.topics" :key="topic.id">
          <h3>{{ topic.title }}</h3>
          <p v-for="line in topic.body" :key="line">{{ line }}</p>
        </article>
      </div>
      <div class="knowledge">
        <article v-for="item in knowledge.faq" :key="item.question">
          <h3>{{ item.question }}</h3>
          <p>{{ item.answer }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page__hero h1 {
  margin-bottom: 12px;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

.page__icon {
  width: clamp(52px, 7vw, 88px);
  height: auto;
  align-self: flex-end;
  justify-self: end;
}

.page__section {
  display: grid;
  gap: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: clamp(20px, 3vw, 32px);
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.95rem;
  opacity: 0.9;
}

.page__section ul,
.page__section ol {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 8px;
}

.page__split {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

dl {
  margin: 0;
  display: grid;
  gap: 10px;
}

.knowledge {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.knowledge article {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 16px;
  background: rgba(12, 18, 32, 0.35);
}

.management {
  gap: 12px;
}

.management__header p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.management__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.management__list li {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 14px;
  background: rgba(12, 18, 32, 0.35);
  display: grid;
  gap: 8px;
}

.management__title {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: baseline;
  font-size: 0.95rem;
}

.management__title span {
  font-size: 0.75rem;
  opacity: 0.7;
}

.management__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.management__footer button {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(12, 18, 32, 0.6);
  color: inherit;
  padding: 8px 14px;
  cursor: pointer;
}
</style>
