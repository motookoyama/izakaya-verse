<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FeatureContent } from '../types/home'
import { navigateTo } from '../constants/navigation'

const props = defineProps<{
  title: string
  items: FeatureContent[]
}>()

const { title, items } = toRefs(props)
const { t } = useI18n({ useScope: 'global' })

function handleNavigate(path: string) {
  navigateTo(path)
}
</script>

<template>
  <section class="features">
    <h2>{{ title }}</h2>
    <div class="features-grid">
      <article v-for="feature in items" :key="feature.id" class="feature-card">
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
        <ul>
          <li v-for="point in feature.bullets" :key="point">{{ point }}</li>
        </ul>
        <a
          v-if="feature.linkPath"
          class="feature-link"
          :href="feature.linkPath"
          @click.prevent="handleNavigate(feature.linkPath)"
        >
          {{ t('ui.detailsLink') }}
        </a>
      </article>
    </div>
  </section>
</template>

<style scoped>
.features {
  display: grid;
  gap: 20px;
}

.features h2 {
  margin: 0;
  font-size: 1.2rem;
}

.features-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.feature-card {
  display: grid;
  gap: 12px;
  padding: clamp(18px, 3vw, 26px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
}

.feature-card h3 {
  margin: 0;
  font-size: 1.05rem;
}

.feature-card ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 6px;
}

.feature-link {
  justify-self: flex-start;
  font-weight: 600;
  color: var(--brand-2, #58cff5);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.feature-link:hover {
  border-color: currentColor;
}
</style>
