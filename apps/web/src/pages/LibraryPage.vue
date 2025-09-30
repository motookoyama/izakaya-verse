<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FeatureContent, KnowledgeContent } from '../types/home'
import libraryIcon from '../assets/icons/library.png'
import { navigatorCards } from '../data/sampleCards'

const { tm } = useI18n({ useScope: 'global' })

const page = computed(() => tm('pages.library') as { title: string; lead: string[]; workflowTitle: string; workflow: string[]; notesTitle: string; notes: string[] })
const features = computed(() => tm('home.features') as FeatureContent[])
const feature = computed(() => features.value.find((item) => item.id === 'library'))
const knowledgeTopics = computed(() => {
  const content = tm('home.knowledge') as KnowledgeContent
  return content.topics.filter((topic) => topic.id === 'tavern' || topic.id === 'v2card')
})

type LibraryItem = {
  id: string
  title: string
  summary: string
  updated?: string
  tags: string[]
}

const cardItems = computed<LibraryItem[]>(() => {
  const featureCards = features.value.map((item) => ({
    id: `feature-${item.id}`,
    title: item.title,
    summary: item.description,
    tags: item.bullets.slice(0, 2),
  }))
  const knowledgeCards = knowledgeTopics.value.map((topic) => ({
    id: `knowledge-${topic.id}`,
    title: topic.title,
    summary: topic.body.join(' '),
    tags: topic.body.slice(0, 2),
  }))
  const navigatorEntries = navigatorCards.map((card) => ({
    id: `navigator-${card.id}`,
    title: card.name,
    summary: card.summary,
    tags: card.tags,
  }))
  return [...navigatorEntries, ...featureCards, ...knowledgeCards]
})

const searchQuery = ref('')
const sizePreset = ref<'large' | 'medium' | 'compact'>('medium')
const sortKey = ref<'title' | 'recent'>('title')

const filteredItems = computed(() => {
  const text = searchQuery.value.trim().toLowerCase()
  let items = cardItems.value.filter((item) => {
    if (!text) return true
    return [item.title, item.summary, ...item.tags].some((fragment) => fragment.toLowerCase().includes(text))
  })

  if (sortKey.value === 'title') {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title))
  } else {
    items = [...items].reverse()
  }

  return items
})

const sizeOptions: Array<{ id: typeof sizePreset.value; label: string }> = [
  { id: 'large', label: 'L' },
  { id: 'medium', label: 'M' },
  { id: 'compact', label: 'S' },
]
</script>

<template>
  <div class="library">
    <header class="library__hero">
      <img class="library__icon" :src="libraryIcon" alt="Library" />
      <h1>{{ page.title }}</h1>
      <p v-for="line in page.lead" :key="line">{{ line }}</p>
    </header>

    <section class="controls">
      <div class="controls__search">
        <label>
          <span>Search</span>
          <input v-model="searchQuery" type="search" :placeholder="$t('pages.library.search', 'キーワード検索')" />
        </label>
      </div>
      <div class="controls__sort">
        <label>
          <span>Sort</span>
          <select v-model="sortKey">
            <option value="title">{{ $t('pages.library.sortTitle', 'タイトル順') }}</option>
            <option value="recent">{{ $t('pages.library.sortRecent', '最近追加') }}</option>
          </select>
        </label>
      </div>
      <div class="controls__size">
        <span>View</span>
        <button
          v-for="opt in sizeOptions"
          :key="opt.id"
          type="button"
          :class="['size-btn', { active: sizePreset === opt.id }]"
          @click="sizePreset = opt.id"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <section class="showcase" :class="`showcase--${sizePreset}`">
      <article v-for="item in filteredItems" :key="item.id" class="showcase__card">
        <header>
          <h3>{{ item.title }}</h3>
          <span v-if="item.updated" class="showcase__updated">{{ item.updated }}</span>
        </header>
        <p>{{ item.summary }}</p>
        <ul class="showcase__tags">
          <li v-for="tag in item.tags" :key="tag">{{ tag }}</li>
        </ul>
        <footer>
          <button type="button">{{ $t('pages.library.open', '開く') }}</button>
          <button type="button" class="secondary">{{ $t('pages.library.save', '保存') }}</button>
        </footer>
      </article>
    </section>

    <section class="library__details" v-if="feature">
      <div class="detail-block">
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.description }}</p>
        <ul>
          <li v-for="bullet in feature.bullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </div>
      <aside class="detail-block">
        <h3>{{ page.workflowTitle }}</h3>
        <ol>
          <li v-for="step in page.workflow" :key="step">{{ step }}</li>
        </ol>
      </aside>
      <aside class="detail-block">
        <h3>{{ page.notesTitle }}</h3>
        <ul>
          <li v-for="note in page.notes" :key="note">{{ note }}</li>
        </ul>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.library {
  display: grid;
  gap: 32px;
}

.library__hero {
  display: grid;
  gap: 12px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(24px, 4vw, 40px);
  position: relative;
}

.library__hero h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
}

.library__icon {
  position: absolute;
  top: clamp(12px, 2vw, 24px);
  right: clamp(12px, 3vw, 32px);
  width: clamp(60px, 7vw, 92px);
  height: auto;
}

.controls {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: end;
}

.controls label {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  opacity: 0.75;
}

.controls input,
.controls select {
  width: 100%;
}

.controls__size {
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
  align-items: center;
}

.controls__size span {
  opacity: 0.75;
  font-size: 0.9rem;
}

.size-btn {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.4em 0.9em;
  background: rgba(12, 18, 32, 0.45);
}

.size-btn.active {
  border-color: var(--brand-2, #58cff5);
  background: rgba(88, 207, 245, 0.15);
}

.showcase {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.showcase--large {
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
}

.showcase--compact {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.showcase__card {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: 24px;
  display: grid;
  gap: 12px;
  position: relative;
}

.showcase__card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.showcase__card h3 {
  margin: 0;
  font-size: 1.1rem;
}

.showcase__updated {
  font-size: 0.75rem;
  opacity: 0.6;
}

.showcase__card p {
  margin: 0;
  opacity: 0.85;
  font-size: 0.95rem;
}

.showcase__tags {
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  font-size: 0.8rem;
}

.showcase__tags li {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
}

.showcase__card footer {
  display: flex;
  gap: 12px;
}

.showcase__card footer .secondary {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.18);
}

.library__details {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.detail-block {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: clamp(20px, 3vw, 28px);
  display: grid;
  gap: 10px;
  font-size: 0.9rem;
  opacity: 0.85;
}

.detail-block ul,
.detail-block ol {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 8px;
}

@media (max-width: 640px) {
  .controls {
    grid-template-columns: 1fr;
  }

  .showcase__card footer {
    flex-direction: column;
  }
}
</style>
