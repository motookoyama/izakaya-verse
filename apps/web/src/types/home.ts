export type HeroContent = {
  phase: string
  title: string
  slogans: string[]
  welcome: string
  description: string[]
  navLinks: { id: string; label: string; path?: string }[]
  cta: string
}

export type GuideContent = {
  title: string
  steps: string[]
}

export type HelpContent = {
  title: string
  faqs: { question: string; answer: string }[]
  disclaimer: string[]
}

export type AuthorContent = {
  title: string
  name: string
  body: string[]
}

export type FeatureContent = {
  id: string
  title: string
  description: string
  bullets: string[]
  linkPath?: string
}

export type KnowledgeContent = {
  title: string
  topics: { id: string; title: string; body: string[] }[]
  faq: { question: string; answer: string }[]
  updated: string
}

export type AccountAction = {
  id: string
  label: string
  description: string
}

export type AccountContent = {
  greeting: { title: string; welcome: string; note: string }
  policy: { title: string; items: string[] }
  status: {
    title: string
    userLabel: string
    pointsLabel: string
    personaLabel: string
    personaTip: string
    placeholder: { user: string; points: string; persona: string }
  }
  actions?: { title: string; items: AccountAction[] }
  help: { title: string; tips: string[]; disclaimer: string[] }
}

export type ChatComposerContent = {
  placeholder: string
  sendLabel: string
  attachLabel: string
  attachHint: string
  filesLabel: string
  removeFileLabel: string
  enterToSendHint: string
}

export type ChatMessageActionLabels = {
  rerun: string
  edit: string
  fork: string
  bookmark: string
}

export type V2CardMetaLabels = {
  persona: string
  scenario: string
  firstMessage: string
  tags: string
  notes?: string
}

export type ChatWallpaperContent = {
  label: string
  paletteLabel: string
  customLabel: string
  customPlaceholder: string
}

export type ChatContent = {
  title: string
  description: string[]
  composer: ChatComposerContent
  resetLabel: string
  loadingMessage: string
  empty: string
  assistantLabel: string
  userLabel: string
  systemPrompt: string
  actions: ChatMessageActionLabels
  cardMeta: V2CardMetaLabels
  wallpaper?: ChatWallpaperContent
}

export type PaymentOption = {
  id: string
  title: string
  description: string
  price: string
  qrImage: string
  paypalLink: string
  buttonLabel: string
  caption?: string
  localeTag?: string
}

export type PaymentSupport = {
  title: string
  description: string
  price: string
  qrImage: string
  paypalLink: string
  buttonLabel: string
}

export type PaymentNote = {
  text: string
  url?: string
  urlLabel?: string
}
