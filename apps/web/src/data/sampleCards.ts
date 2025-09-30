import drOrb from './v2cards/dr-orb.json'
import ekaterina from './v2cards/ekaterina-menter.json'
import ladyMaholo from './v2cards/lady-maholo.json'
import missMadi from './v2cards/miss-madi.json'
import mammonManager from './v2cards/mammon-manager.json'
import teamOzanari from './v2cards/team-ozanari-dungeon.json'
import ekubo from './v2cards/ekubo.json'
import hanasoKawari from './v2cards/hanaso-kawari.json'

import drOrbAvatar from '../assets/v2cards/dr-orb.png'
import ekaterinaAvatar from '../assets/v2cards/ekaterina-menter.png'
import ladyMaholoAvatar from '../assets/v2cards/lady-maholo.png'
import missMadiAvatar from '../assets/v2cards/miss-madi.png'
import mammonManagerAvatar from '../assets/v2cards/mammon-manager.png'
import teamOzanariAvatar from '../assets/v2cards/team-ozanari-dungeon.png'
import ekuboAvatar from '../assets/v2cards/ekubo.png'
import hanasoKawariAvatar from '../assets/v2cards/hanaso-kawari.png'

export type SampleCard = {
  id: string
  name: string
  summary: string
  tags: string[]
  avatar: string
  raw: any
}

function createSampleCard(
  id: string,
  payload: any,
  avatar: string,
  tags: string[]
): SampleCard {
  const name: string = payload?.name ?? payload?.data?.name ?? id
  const description: string =
    payload?.description ?? payload?.data?.description ?? ''

  const summary = description
    .replace(/\r\n/g, ' ')
    .trim()
    .slice(0, 160)

  return {
    id,
    name,
    summary,
    tags,
    avatar,
    raw: payload,
  }
}

export const navigatorCards: SampleCard[] = [
  createSampleCard('dr-orb', drOrb, drOrbAvatar, ['管理者', 'ナビゲータ']),
  createSampleCard('ekaterina-menter', ekaterina, ekaterinaAvatar, ['管理者', '翻訳']),
  createSampleCard('lady-maholo', ladyMaholo, ladyMaholoAvatar, ['管理', 'コミュニティ']),
  createSampleCard('miss-madi', missMadi, missMadiAvatar, ['管理', 'サポート']),
  createSampleCard('mammon-manager', mammonManager, mammonManagerAvatar, ['経理', '管理者']),
  createSampleCard('team-ozanari-dungeon', teamOzanari, teamOzanariAvatar, ['チーム', 'ストーリー']),
  createSampleCard('ekubo', ekubo, ekuboAvatar, ['サンプル', 'ギャグ']),
  createSampleCard('hanaso-kawari', hanasoKawari, hanasoKawariAvatar, ['案内', '文化']),
]

export const primaryNavigatorId = 'dr-orb'

export function findNavigatorCard(id: string): SampleCard | undefined {
  return navigatorCards.find((card) => card.id === id)
}
