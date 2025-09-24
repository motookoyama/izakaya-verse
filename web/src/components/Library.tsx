import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Library as LibraryIcon, Download, Eye, Tag, Satellite, Plus, Link } from 'lucide-react'
import GeminiGenerator from './GeminiGenerator'
import MetaCapture from './MetaCapture'

interface V2Card {
  id: string
  title: string
  description: string
  image_url?: string
  character_data?: any
  tags: string[]
  created_at: string
}

const Library = () => {
  const [cards, setCards] = useState<V2Card[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<V2Card | null>(null)
  const [filter, setFilter] = useState<'all' | 'local' | 'satellite'>('all')
  const [showGeminiGenerator, setShowGeminiGenerator] = useState(false)
  const [showMetaCapture, setShowMetaCapture] = useState(false)

  // カード一覧取得
  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v2cards')
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error)
    } finally {
      setLoading(false)
    }
  }

  // 衛星アプリ結果取得
  const fetchSatelliteCards = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/satellite/metacapture')
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards || [])
      }
    } catch (error) {
      console.error('Failed to fetch satellite cards:', error)
    }
  }

  // フィルター適用
  const filteredCards = cards.filter(card => {
    if (filter === 'all') return true
    if (filter === 'satellite') return card.tags.includes('satellite')
    if (filter === 'local') return !card.tags.includes('satellite')
    return true
  })

  // カード詳細表示
  const showCardDetail = (card: V2Card) => {
    setSelectedCard(card)
  }

  // カードダウンロード
  const downloadCard = (card: V2Card, format: 'json' | 'sAtd') => {
    let content = ''
    let filename = `${card.title}.${format}`
    
    if (format === 'json') {
      content = JSON.stringify(card.character_data || card, null, 2)
    } else {
      content = `name: ${card.title}\n`
      content += `description: ${card.description}\n`
      if (card.character_data) {
        content += `personality: ${card.character_data.personality || ''}\n`
        content += `first_mes: ${card.character_data.first_mes || ''}\n`
      }
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Gemini生成完了時のコールバック
  const handleCardGenerated = () => {
    setShowGeminiGenerator(false)
    fetchCards() // カード一覧を更新
  }

  // MetaCapture完了時のコールバック
  const handleCardCaptured = () => {
    setShowMetaCapture(false)
    fetchCards() // カード一覧を更新
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* ヘッダー */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <LibraryIcon size={32} className="text-yellow-300" />
            <h1 className="text-3xl font-bold">📚 カードライブラリ</h1>
          </div>
          
          <p className="text-lg mb-6">
            V2カードの一覧表示。ローカル生成と衛星アプリ（Gemini）からの結果を管理します。
          </p>

          {/* フィルター */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-600' : 'bg-white bg-opacity-20'
              }`}
            >
              すべて ({cards.length})
            </button>
            <button
              onClick={() => setFilter('local')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'local' ? 'bg-blue-600' : 'bg-white bg-opacity-20'
              }`}
            >
              ローカル ({cards.filter(c => !c.tags.includes('satellite')).length})
            </button>
            <button
              onClick={() => setFilter('satellite')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'satellite' ? 'bg-blue-600' : 'bg-white bg-opacity-20'
              }`}
            >
              <Satellite size={16} className="inline mr-2" />
              衛星アプリ ({cards.filter(c => c.tags.includes('satellite')).length})
            </button>
          </div>

          {/* 更新ボタン */}
          <div className="flex gap-2">
            <button
              onClick={fetchCards}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              カード一覧更新
            </button>
            <button
              onClick={fetchSatelliteCards}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              衛星結果取得
            </button>
            <button
              onClick={() => setShowGeminiGenerator(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              AI生成
            </button>
            <button
              onClick={() => setShowMetaCapture(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Link size={16} />
              MetaCapture
            </button>
          </div>
        </div>

        {/* Gemini Generator */}
        {showGeminiGenerator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <GeminiGenerator onCardGenerated={handleCardGenerated} />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowGeminiGenerator(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        )}

        {/* MetaCapture */}
        {showMetaCapture && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <MetaCapture onCardCaptured={handleCardCaptured} />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowMetaCapture(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        )}

        {/* カード一覧 */}
        {loading ? (
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>カードを読み込み中...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <LibraryIcon size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">カードがありません</h2>
            <p className="text-gray-400">
              V2カードを作成するか、衛星アプリから結果を取得してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 hover:bg-white hover:bg-opacity-10 transition-colors cursor-pointer"
                onClick={() => showCardDetail(card)}
              >
                {/* カード画像 */}
                <div className="relative mb-4">
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <LibraryIcon size={48} className="text-white" />
                    </div>
                  )}
                  
                  {/* 衛星アプリバッジ */}
                  {card.tags.includes('satellite') && (
                    <div className="absolute top-2 right-2 bg-purple-600 px-2 py-1 rounded-full text-xs">
                      <Satellite size={12} className="inline mr-1" />
                      衛星
                    </div>
                  )}
                </div>

                {/* カード情報 */}
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {card.description}
                </p>

                {/* タグ */}
                {card.tags && card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-600 text-xs rounded-full">
                        +{card.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadCard(card, 'json')
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                  >
                    <Download size={14} className="inline mr-1" />
                    JSON
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadCard(card, 'sAtd')
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                  >
                    <Download size={14} className="inline mr-1" />
                    sAtd
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(card.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* カード詳細モーダル */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedCard.title}</h2>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedCard.image_url && (
                <img
                  src={selectedCard.image_url}
                  alt={selectedCard.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              <p className="text-gray-300 mb-4">{selectedCard.description}</p>

              {selectedCard.character_data && (
                <div className="space-y-3 mb-4">
                  <div>
                    <h3 className="font-bold">性格</h3>
                    <p className="text-sm text-gray-300">{selectedCard.character_data.personality}</p>
                  </div>
                  <div>
                    <h3 className="font-bold">最初のメッセージ</h3>
                    <p className="text-sm text-gray-300">{selectedCard.character_data.first_mes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => downloadCard(selectedCard, 'json')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  JSONダウンロード
                </button>
                <button
                  onClick={() => downloadCard(selectedCard, 'sAtd')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  sAtdダウンロード
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Library
