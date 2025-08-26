import { motion } from 'framer-motion'
import { Play as PlayIcon } from 'lucide-react'

const Play = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8 text-center"
      >
        <PlayIcon size={64} className="mx-auto mb-4 text-yellow-300" />
        <h1 className="text-4xl font-bold mb-4">🎮 V2カード遊び場</h1>
        <p className="text-lg mb-8">
          既存のV2カード（Dr. Orb、Miss Madi、ekubo等）を使った対話型アドベンチャー。
          <br />
          AIチャットボットと一緒に物語を進めます。
        </p>
        
        <div className="bg-white bg-opacity-10 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🚧 開発中</h2>
          <p className="text-lg">
            この機能は現在開発中です。
            <br />
            もうしばらくお待ちください。
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Play
