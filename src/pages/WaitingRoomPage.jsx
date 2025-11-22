import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameService } from '../services/gameService'
import socketService from '../services/socketService'

const WaitingRoomPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, PIN, quiz, quizTitle, totalQuestions } = location.state || {}

  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId || !PIN) {
      navigate('/my-quizzes')
      return
    }
    
    // Initial load
    fetchGameData()
    
    // Connect to WebSocket
    socketService.connect()
    socketService.joinGame(gameId, 'Host', 'host')
    
    // Listen for player joined events
    socketService.onPlayerJoined(({ playerName, totalPlayers }) => {
      console.log(`👤 ${playerName} joined! Total: ${totalPlayers}`)
      fetchGameData() // Refresh player list
    })
    
    // Listen for player left events
    socketService.onPlayerLeft(({ playerName, totalPlayers }) => {
      console.log(`👋 ${playerName} left! Total: ${totalPlayers}`)
      fetchGameData() // Refresh player list
    })
    
    return () => {
      socketService.leaveGame(gameId, 'Host')
      socketService.removeAllListeners()
    }
  }, [gameId, PIN, navigate])

  const fetchGameData = async () => {
    try {
      const response = await gameService.getGame(gameId)
      const gameData = response.data.game
      setPlayers(gameData.players || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching game data:', error)
      setLoading(false)
    }
  }

  const handleStartQuiz = async () => {
    if (players.length === 0) {
      alert('Tidak ada pemain yang join!')
      return
    }
    
    try {
      await gameService.startGame(gameId)
      
      // Emit WebSocket event to all players
      socketService.startGame(gameId)
      
      alert('Quiz dimulai! (Fitur gameplay akan dikembangkan)')
      // TODO: Navigate to actual game play page
      // navigate('/play-quiz', { state: { gameId, PIN } })
    } catch (error) {
      console.error('Error starting game:', error)
      alert('Gagal memulai quiz. Coba lagi.')
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PIN)
    alert('PIN berhasil dicopy!')
  }

  if (!gameId || !PIN) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6">
      <div className="max-w-6xl mx-auto">
        
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/my-quizzes')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl transition font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              ← Back
            </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{quizTitle || quiz?.title}</h1>
            <p className="text-white/80 text-sm font-medium">{totalQuestions || quiz?.questions?.length || 0} Soal • Brain Rush Live</p>
          </div>
            <div className="w-24"></div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="lg:col-span-1 space-y-4">
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50 hover:shadow-blue-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Kode Quiz</h2>
                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  LIVE
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-xl p-6 mb-4 overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                <p className="relative text-white text-center text-4xl font-black tracking-[0.3em]">{PIN}</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Kode
              </button>
              <p className="text-gray-500 text-xs text-center mt-2">
                Bagikan kode ini ke semua peserta
              </p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50"
            >
              <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Quiz
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                  <span className="text-gray-600 font-medium">Jumlah Soal</span>
                  <span className="font-bold text-gray-800 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">{totalQuestions || quiz?.questions?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                  <span className="text-gray-600 font-medium">Pembuat</span>
                  <span className="font-bold text-gray-800 text-xs">{quiz?.author || quiz?.createdBy?.name || 'Brain Rush'}</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-lg p-2.5">
                  <span className="text-green-700 font-medium">Status</span>
                  <span className="font-bold text-green-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStartQuiz}
              disabled={players.length === 0}
              className={`w-full font-bold py-4 rounded-xl shadow-2xl transition-all text-base ${
                players.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🚀</span>
                <span>Mulai Quiz ({players.length} Pemain)</span>
              </div>
            </motion.button>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50 min-h-[600px]"
            >
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Peserta ({players.length})
                </h2>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-semibold">Menunggu peserta...</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : players.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[520px] overflow-y-auto pr-2">
                  {players.map((player, index) => {
                    const avatarEmoji = player.avatar || '🤖'
                    const playerName = player.playerName || player.name || 'Player'
                    
                    return (
                      <motion.div
                        key={player._id || player.userId || index}
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring" }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-gradient-to-br from-blue-50 via-white to-blue-50 rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100"
                      >
                        <div className="relative inline-block mb-2">
                          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl shadow-lg">
                            {avatarEmoji}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <p className="font-bold text-gray-800 text-sm truncate">{playerName}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">Pemain #{index + 1}</p>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4 animate-bounce">🎮</div>
                  <p className="text-xl font-bold text-gray-800 mb-2">Belum ada peserta</p>
                  <p className="text-gray-600 text-sm">Bagikan PIN <span className="font-bold text-blue-600">{PIN}</span> untuk memulai</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingRoomPage
