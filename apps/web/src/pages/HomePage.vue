<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccount } from '../composables/useAccount'
import AccountPanel from '../components/AccountPanel.vue'
import InfoGrid from '../components/InfoGrid.vue'
import FeatureGrid from '../components/FeatureGrid.vue'
import PaymentGrid from '../components/PaymentGrid.vue'
import homeEmblem from '../assets/icons/home-emblem.png'
import chatIcon from '../assets/icons/chat-frame.png'
import metaIcon from '../assets/icons/metacapture.png'
import libraryIcon from '../assets/icons/library.png'
import helpIcon from '../assets/icons/help-qr.png'
import paypal1000 from '../assets/payments/paypal-1000p.png'
import paypal5000 from '../assets/payments/paypal-5000p.png'
import paypal1000En from '../assets/payments/paypal-1000p-en.png'
import paypal5000En from '../assets/payments/paypal-5000p-en.png'
import paypalSupport from '../assets/payments/paypal-support.png'
import { resolvePathForNav, navigateTo } from '../constants/navigation'
import type {
  HeroContent,
  GuideContent,
  AuthorContent,
  FeatureContent,
  AccountContent,
  AccountAction,
  PaymentOption,
  PaymentSupport,
  PaymentNote,
} from '../types/home'

const { t, tm } = useI18n({ useScope: 'global' })

const hero = computed<HeroContent>(() => {
  const value = tm('home.hero') as HeroContent
  return {
    ...value,
    navLinks: value.navLinks.map((link) => ({
      ...link,
      path: resolvePathForNav(link.id),
    })),
  }
})

const navIcons: Record<string, string | undefined> = {
  chat: chatIcon,
  metacapture: metaIcon,
  library: libraryIcon,
  help: helpIcon,
}

const guide = computed<GuideContent>(() => {
  const value = tm('home.guide') as Record<string, unknown>
  return {
    title: value.title as string,
    steps: Array.isArray(value.steps) ? (value.steps as string[]) : [],
  }
})

const author = computed<AuthorContent>(() => tm('home.author') as AuthorContent)
const accountContent = computed<AccountContent>(() => tm('home.account') as AccountContent)
const accountActions = computed<AccountAction[]>(() => accountContent.value.actions?.items ?? [])
const features = computed<FeatureContent[]>(() => {
  const value = tm('home.features') as FeatureContent[]
  return value.map((feature) => ({
    ...feature,
    linkPath: resolvePathForNav(feature.id),
  }))
})
const paymentSection = computed(() => {
  const value = tm('home.payments') as Record<string, any>
  const buyLabel = (value.buyButton as string) ?? t('home.payments.buyButton', 'Pay with PayPal')
  const supportButton = (value.supportButton as string) ?? buyLabel
  const optionDefs: Array<{ key: string; image: string; localeTag?: string }> = [
    { key: 'jp1000', image: paypal1000, localeTag: 'JPY' },
    { key: 'jp5000', image: paypal5000, localeTag: 'JPY' },
    { key: 'usd1000', image: paypal1000En, localeTag: 'USD' },
    { key: 'usd5000', image: paypal5000En, localeTag: 'USD' },
  ]

  const optionsContent = (value.options ?? {}) as Record<string, any>
  const options: PaymentOption[] = optionDefs.reduce((acc, def) => {
    const entry = optionsContent[def.key]
    if (!entry?.paypalLink) return acc
    acc.push({
      id: def.key,
      title: entry.title ?? def.key,
      description: entry.description ?? '',
      price: entry.price ?? '',
      qrImage: def.image,
      paypalLink: entry.paypalLink as string,
      buttonLabel: entry.buttonLabel ?? buyLabel,
      caption: entry.caption,
      localeTag: entry.localeTag ?? def.localeTag,
    })
    return acc
  }, [] as PaymentOption[])

  let support: PaymentSupport | undefined
  if (value.support?.paypalLink) {
    support = {
      title: value.support.title ?? 'Support',
      description: value.support.description ?? '',
      price: value.support.price ?? '',
      qrImage: paypalSupport,
      paypalLink: value.support.paypalLink as string,
      buttonLabel: value.support.buttonLabel ?? supportButton,
    }
  }

  const notes = Array.isArray(value.notes)
    ? (value.notes as PaymentNote[])
    : []

  return {
    title: value.title as string,
    description: value.description as string,
    options,
    support,
    notes,
  }
})
const {
  state: accountState,
  formattedPoints,
  lastLogin,
  addPoints,
  cyclePersona,
  fetchAccount,
  loading: accountLoading,
  error: accountError,
  apiOnline,
} = useAccount()

const recentActivities = computed(() => accountState.recentActivities.slice(0, 4))
const activeActionId = ref<string | null>(null)
const feedback = ref<string | null>(null)

watch(accountError, (value) => {
  if (value) {
    feedback.value = apiOnline.value
      ? value
      : 'バックエンドに接続できませんでした。オフラインモードで継続します。'
  }
})

async function runAction(action: AccountAction) {
  if (accountLoading.value || activeActionId.value) {
    return
  }

  activeActionId.value = action.id
  feedback.value = apiOnline.value ? 'Processing...' : 'オフラインモード: ローカルで反映します。'

  try {
    switch (action.id) {
      case 'addPoints':
        await addPoints()
        feedback.value = apiOnline.value ? `${action.label} ✓` : 'ポイントを仮追加しました (オフライン)'
        break
      case 'managePersona':
        await cyclePersona()
        feedback.value = apiOnline.value ? action.description : 'ペルソナをローカルで切り替えました'
        break
      case 'viewHistory':
        await fetchAccount()
        feedback.value = apiOnline.value
          ? accountState.recentActivities[0] ?? action.description
          : '最新履歴はオフラインモードでは保存のみ行います'
        break
      default:
        feedback.value = action.description
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    feedback.value = message || 'Operation failed'
  } finally {
    activeActionId.value = null
  }
}

function goTo(path?: string, fallbackId?: string) {
  const target = path ?? fallbackId ?? 'home'
  navigateTo(target)
}

watch(apiOnline, (online) => {
  if (!online) {
    feedback.value = '現在はオフラインモードです。操作はこの画面上だけで反映されます。'
  }
})
</script>

<template>
  <div class="home">
    <section class="hero">
      <img class="hero__icon" :src="homeEmblem" alt="IZAKAYA verse emblem" />
      <div class="hero__visual">
        <p class="hero__phase">{{ hero.phase }}</p>
        <h1 class="hero__title">{{ hero.title }}</h1>
        <p class="hero__welcome">{{ hero.welcome }}</p>
      </div>
      <div class="hero__copy">
        <p v-for="line in hero.slogans" :key="line" class="hero__slogan">{{ line }}</p>
        <p v-for="line in hero.description" :key="line" class="hero__description">{{ line }}</p>
      </div>
    </section>

    <section class="nav-panels">
      <a
        v-for="link in hero.navLinks"
        :key="link.id"
        class="nav-panels__item"
        :href="link.path || '#/'"
        @click.prevent="goTo(link.path, link.id)"
      >
        <img
          v-if="navIcons[link.id]"
          class="nav-panels__icon"
          :src="navIcons[link.id]"
          :alt="link.label"
        />
        <span class="nav-panels__label">{{ link.label }}</span>
      </a>
    </section>

    <section class="cta-strip">
      <div class="cta-strip__text">
        <h2>{{ hero.cta }}</h2>
        <p>{{ guide.steps[0] }}</p>
      </div>
      <a
        class="cta-strip__button"
        :href="hero.navLinks[0]?.path || '#/chat'"
        @click.prevent="goTo(hero.navLinks[0]?.path, hero.navLinks[0]?.id ?? 'chat')"
      >
        {{ $t('home.chat.quickStart', 'チャットを始める') }}
      </a>
    </section>

    <section class="account-hub">
      <AccountPanel
        :content="accountContent"
        :state="accountState"
        :formatted-points="formattedPoints"
        :last-login="lastLogin"
        :recent-activities="recentActivities"
        :actions="accountActions"
        :feedback="feedback"
        @run-action="runAction"
      />
    </section>

    <PaymentGrid
      id="payments"
      :title="paymentSection.title"
      :description="paymentSection.description"
      :options="paymentSection.options"
      :support="paymentSection.support"
      :notes="paymentSection.notes"
    />

    <section class="features">
      <FeatureGrid :title="$t('ui.featuresTitle')" :items="features" />
    </section>

    <section class="info">
      <InfoGrid :guide="guide" :author="author" />
    </section>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  gap: 48px;
}

.hero {
  display: grid;
  gap: 28px;
  padding: clamp(32px, 6vw, 64px);
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(88, 207, 245, 0.18), rgba(233, 123, 37, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 32px 72px rgba(10, 15, 30, 0.5);
  place-items: center;
  text-align: center;
}

.hero__icon {
  width: clamp(320px, 62vw, 600px);
  height: auto;
  filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.4));
}

.hero__visual {
  display: grid;
  gap: 12px;
}

.hero__phase {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.hero__title {
  margin: 0;
  font-size: clamp(2.6rem, 6vw, 3.6rem);
  font-weight: 800;
}

.hero__welcome {
  margin: 0;
  font-size: 1.05rem;
  opacity: 0.85;
}

.hero__copy {
  display: grid;
  gap: 12px;
  max-width: 720px;
}

.hero__slogan {
  margin: 0;
  font-size: clamp(1.3rem, 3.5vw, 1.8rem);
  font-weight: 600;
}

.hero__description {
  margin: 0;
  opacity: 0.85;
}

.nav-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.nav-panels__item {
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  display: grid;
  place-items: center;
  gap: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-panels__item:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.nav-panels__icon {
  width: 48px;
  height: 48px;
}

.cta-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  padding: 28px 32px;
  border-radius: 24px;
  background: linear-gradient(90deg, rgba(232, 123, 37, 0.85), rgba(88, 207, 245, 0.7));
  color: #0b111a;
}

.cta-strip__text {
  display: grid;
  gap: 8px;
}

.cta-strip__text h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
}

.cta-strip__text p {
  margin: 0;
  opacity: 0.75;
}

.cta-strip__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 999px;
  background: #0b111a;
  color: #f5f7fb;
  font-weight: 700;
  letter-spacing: 0.04em;
  border: none;
}

.account-hub {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.features {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(12, 18, 32, 0.45);
  padding: 32px;
}

.info {
  display: grid;
  gap: 32px;
}

@media (max-width: 1024px) {
  .cta-strip {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .cta-strip__button {
    justify-self: center;
  }

  .account-hub {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .nav-panels {
    grid-template-columns: 1fr;
  }

  .features {
    padding: 20px;
  }
}
</style>
