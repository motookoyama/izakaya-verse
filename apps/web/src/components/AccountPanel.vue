<script setup lang="ts">
import { toRefs } from 'vue'
import type { AccountContent, AccountAction } from '../types/home'
import type { AccountState } from '../composables/useAccount'

const props = defineProps<{
  content: AccountContent
  state: AccountState
  formattedPoints: string
  lastLogin: string
  recentActivities: string[]
  actions: AccountAction[]
  feedback: string | null
}>()

const { content, state, formattedPoints, lastLogin, recentActivities, actions, feedback } = toRefs(props)

const emit = defineEmits<{
  (e: 'run-action', action: AccountAction): void
}>()
</script>

<template>
  <section class="account">
    <article class="card account__greeting">
      <h2>{{ content.greeting.title }}</h2>
      <p class="lead">{{ content.greeting.welcome }}</p>
      <p>{{ content.greeting.note }}</p>
    </article>

    <article class="card account__status">
      <header class="card__header">
        <h2>{{ content.status.title }}</h2>
      </header>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">{{ content.status.userLabel }}</span>
          <span class="value">{{ state.user.name }}</span>
          <span class="hint">last login: {{ lastLogin }}</span>
        </div>
        <div class="status-item">
          <span class="label">{{ content.status.pointsLabel }}</span>
          <span class="value">{{ formattedPoints }}</span>
          <span class="hint">{{ state.points.reserved }}{{ state.points.currency }} reserved</span>
        </div>
        <div class="status-item persona">
          <span class="label">{{ content.status.personaLabel }}</span>
          <div class="persona-preview">
            <img :src="state.user.personaUrl" alt="persona icon" />
            <span class="value">{{ state.user.tier }}</span>
          </div>
          <span class="hint">{{ content.status.personaTip }}</span>
        </div>
      </div>
      <ul class="activity-list">
        <li v-for="entry in recentActivities" :key="entry">{{ entry }}</li>
      </ul>
    </article>

    <article class="card account__actions" v-if="actions.length">
      <h2>{{ content.actions?.title }}</h2>
      <ul class="actions-list">
        <li v-for="action in actions" :key="action.id">
          <div class="actions-list__copy">
            <h3>{{ action.label }}</h3>
            <p>{{ action.description }}</p>
          </div>
          <button type="button" @click="emit('run-action', action)">{{ action.label }}</button>
        </li>
      </ul>
      <p v-if="feedback" class="actions-feedback">{{ feedback }}</p>
    </article>

    <article class="card account__policy">
      <h2>{{ content.policy.title }}</h2>
      <ul>
        <li v-for="item in content.policy.items" :key="item">{{ item }}</li>
      </ul>
    </article>

    <article class="card account__help">
      <h2>{{ content.help.title }}</h2>
      <div class="tips">
        <h3>Tips</h3>
        <ul>
          <li v-for="tip in content.help.tips" :key="tip">{{ tip }}</li>
        </ul>
      </div>
      <div class="disclaimer">
        <h3>Note</h3>
        <ul>
          <li v-for="line in content.help.disclaimer" :key="line">{{ line }}</li>
        </ul>
      </div>
    </article>
  </section>
</template>

<style scoped>
.account {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.account__greeting .lead {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.status-grid {
  display: grid;
  gap: 12px;
}

.status-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.25);
}

.status-item .label {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.7;
}

.status-item .value {
  font-size: 1.05rem;
  font-weight: 600;
}

.status-item.persona .hint {
  font-size: 0.75rem;
  opacity: 0.7;
}

.persona-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.persona-preview img {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  object-fit: cover;
}

.activity-list {
  margin: 16px 0 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  opacity: 0.85;
}

.actions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.actions-list li {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
}

.actions-list__copy {
  display: grid;
  gap: 4px;
}

.actions-list__copy h3 {
  margin: 0;
  font-size: 0.95rem;
}

.actions-list__copy p {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.75;
}

.actions-list button {
  padding: 10px 16px;
}

.actions-feedback {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--brand-2, #58cff5);
}

.account__policy ul,
.account__help ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 6px;
}

.account__help .tips,
.account__help .disclaimer {
  display: grid;
  gap: 6px;
}

.account__help h3 {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-2, #58cff5);
}

@media (max-width: 640px) {
  .account {
    grid-template-columns: 1fr;
  }
}
</style>
