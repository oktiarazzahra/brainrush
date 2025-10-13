// src/pages/LeaderboardPage.jsx
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'

const LeaderboardPage = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()

  // Data dummy leaderboard
  const leaderboardData = [
    {
      rank: 1,
      name: 'Ahmad Rizki',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ahmad',
      score: 98,
      correctAnswers: 19,
      totalQuestions: 20,
      time: '2:45'
    },
    {
      rank: 2,
      name: 'Siti Nurhaliza',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=siti',
      score: 95,
      correctAnswers: 18,
      totalQuestions: 20,
      time: '3:12'
    },
    {
      rank: 3,
      name: 'Budi Santoso',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=budi',
      score: 92,
      correctAnswers: 17,
      totalQuestions: 20,
      time: '3:30'
    },
    {
      rank: 4,
      name: 'Dewi Lestari',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dewi',
      score: 88,
      correctAnswers: 16,
      totalQuestions: 20,
      time: '4:05'
    },
    {
      rank: 5,
      name: 'Eko Prasetyo',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=eko',
      score: 85,
      correctAnswers: 15,
      totalQuestions: 20,
      time: '4:20'
    },
    {
      rank: 6,
      name: 'Fitri Handayani',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=fitri',
      score: 82,
      correctAnswers: 15,
      totalQuestions: 20,
      time: '4:45'
    },
    {
      rank: 7,
      name: 'Gunawan Putra',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=gunawan',
      score: 78,
      correctAnswers: 14,
      totalQuestions: 20,
      time: '5:10'
    },
    {
      rank: 8,
      name: 'Hani Permata',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=hani',
      score: 75,
      correctAnswers: 13,
      totalQuestions: 20,
      time: '5:25'
    }
  ]

  const quizTitle = 'Quiz Sejarah Indonesia'

  const getPodiumColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-gray-300 to-gray-500'
    if (rank === 3) return 'from-orange-400 to-orange-600'
    return 'from-blue-400 to-blue-600'
  }

  const getPodiumHeight = (rank) => {
    if (rank === 1) return 'h-64'
    if (rank === 2) return 'h-52'
    if (rank === 3) return 'h-44'
    return 'h-40'
  }

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  const top3 = leaderboardData.slice(0, 3)
  const others = leaderboardData.slice(3)

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">Leaderboard</h1>
            <p className="text-white text-sm mt-1">{quizTitle}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
          >
            ← Kembali
          </button>
        </div>

        <main className="flex-1 bg-blue-900 mx-8 rounded-tl-lg p-8 mb-8 overflow-y-auto">
          {/* Podium Top 3 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">🏆 Top 3 Winners 🏆</h2>
            
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* Rank 2 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <img
                    src={top3[1]?.avatar}
                    alt={top3[1]?.name}
                    className="w-24 h-24 rounded-full border-4 border-gray-400 shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 text-4xl">🥈</div>
                </div>
                <p className="text-white font-bold text-lg mb-1">{top3[1]?.name}</p>
                <p className="text-white/80 text-sm mb-2">Skor: {top3[1]?.score}</p>
                <div className={`${getPodiumHeight(2)} w-32 bg-gradient-to-b ${getPodiumColor(2)} rounded-t-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-4xl">2</span>
                </div>
              </motion.div>

              {/* Rank 1 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <img
                    src={top3[0]?.avatar}
                    alt={top3[0]?.name}
                    className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-200"
                  />
                  <div className="absolute -top-4 -right-4 text-5xl animate-bounce">🥇</div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="text-4xl">👑</span>
                  </div>
                </div>
                <p className="text-yellow-300 font-bold text-xl mb-1">{top3[0]?.name}</p>
                <p className="text-white text-lg mb-2">Skor: {top3[0]?.score}</p>
                <div className={`${getPodiumHeight(1)} w-36 bg-gradient-to-b ${getPodiumColor(1)} rounded-t-xl flex items-center justify-center shadow-2xl`}>
                  <span className="text-white font-bold text-5xl">1</span>
                </div>
              </motion.div>

              {/* Rank 3 */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-4">
                  <img
                    src={top3[2]?.avatar}
                    alt={top3[2]?.name}
                    className="w-24 h-24 rounded-full border-4 border-orange-400 shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 text-4xl">🥉</div>
                </div>
                <p className="text-white font-bold text-lg mb-1">{top3[2]?.name}</p>
                <p className="text-white/80 text-sm mb-2">Skor: {top3[2]?.score}</p>
                <div className={`${getPodiumHeight(3)} w-32 bg-gradient-to-b ${getPodiumColor(3)} rounded-t-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-4xl">3</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* List Rank 4 and Below */}
          {others.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Peringkat Lainnya</h3>
              <div className="space-y-3">
                {others.map((player, idx) => (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {player.rank}
                    </div>

                    {/* Avatar */}
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-300"
                    />

                    {/* Player Info */}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.correctAnswers}/{player.totalQuestions} benar • {player.time}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{player.score}</p>
                      <p className="text-xs text-gray-500">poin</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                alert('Leaderboard berhasil dicopy untuk dibagikan!')
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition"
            >
              📤 Share Leaderboard
            </button>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}

export default LeaderboardPage
