export interface V2Draft {
  name: string
  role: string
  summary: string
  first_mes: string
  behavior: string
  links: string[]
  assets: {
    image: string
    preview: string | null
  }
  slots: Record<'alpha' | 'beta' | 'gamma', string>
}

export interface MetacaptureEventPayload {
  draft: V2Draft
  json: string
  qrImage: string
  qrEmbedded: string
}
