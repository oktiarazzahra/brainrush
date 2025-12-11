import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../services/gameService'
import socketService from '../services/socketService'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import ConfirmDialog from '../components/ConfirmDialog'
import useConfirm from '../hooks/useConfirm'
import LiveLeaderboard from '../components/LiveLeaderboard'

const LiveGameplayPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, showError, hideToast } = useToast()
  const { confirmDialog, showConfirm, hideConfirm } = useConfirm()

  const { gameId, PIN, quiz } = location.state || {}

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [players, setPlayers] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameEnded, setGameEnded] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  
  // Timer states kept only for data sync; host tidak pakai auto-advance/auto-end
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerMode, setTimerMode] = useState('none') // 'none', 'per-question', 'total-time'
  const [timerEndTime, setTimerEndTime] = useState(null)
  const [gameStartTime, setGameStartTime] = useState(null)

  useEffect(() => {
    if (!gameId || !quiz) {
      navigate('/my-quizzes')
      return
    }

    // Load game data
    loadGameData()

    // Setup socket listeners
    socketService.connect()
    socketService.joinGame(gameId, 'Host', 'host')

    socketService.onAnswerSubmitted(({ playerName, questionId, isCorrect, score, timeSpent }) => {
      console.log(`✅ ${playerName} answered ${isCorrect ? 'correctly' : 'incorrectly'}`)
      
      // Add to answered players list
      // Update leaderboard
      loadGameData()
    })

    socketService.onPlayerLeft(({ playerName }) => {
      console.log(`👋 ${playerName} left the game`)
      loadGameData()
    })

    return () => {
      socketService.leaveGame(gameId, 'Host')
      socketService.removeAllListeners()
    }
  }, [gameId, navigate])

  // Timer countdown effect dengan auto-advance sesuai mode (per-question auto next, total-time auto end)
  useEffect(() => {
    if (loading || gameEnded || timerMode === 'none' || !timerEndTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const remainingMs = timerEndTime - now
      const remainingSec = Math.ceil(remainingMs / 1000)

      if (remainingSec <= 0) {
        setTimeLeft(0)
        clearInterval(timer)

        if (!isAdvancing) {
          setIsAdvancing(true)
          // Auto actions based on timer mode
          if (timerMode === 'total-time') {
            handleEndGame()
          } else if (timerMode === 'per-question') {
            handleNextQuestion({ auto: true })
          } else {
            setIsAdvancing(false)
          }
        }
      } else {
        setTimeLeft(remainingSec)
      }
    }, 200)

    return () => clearInterval(timer)
  }, [loading, gameEnded, timerMode, timerEndTime, currentQuestionIndex, isAdvancing])

  const loadGameData = async () => {
    try {
      const response = await gameService.getGame(gameId)
      const gameData = response.data.game

      setQuestions(gameData.quiz.questions || [])
      setPlayers(gameData.players || [])
      
      // Restore game state from backend
      const savedQuestionIndex = gameData.currentQuestion || 0
      const savedGameStatus = gameData.gameStatus || 'running'
      
      console.log('🔄 Restoring game state:', {
        currentQuestion: savedQuestionIndex,
        gameStatus: savedGameStatus,
        localQuestionIndex: currentQuestionIndex
      })
      
      // Selalu sinkron dengan backend supaya host tidak tertinggal
      if (savedQuestionIndex !== currentQuestionIndex) {
        setCurrentQuestionIndex(savedQuestionIndex)
      }
      
      // Check if game already ended
      if (savedGameStatus === 'ended' && !gameEnded) {
        console.log('🏁 Game already ended - redirecting to results')
        setGameEnded(true)
        // Could redirect to results page here
      }
      
      // Setup timer based on quiz settings
      if (!timerMode || timerMode === 'none') {
        const mode = gameData.quiz.timerMode || 'none'
        setTimerMode(mode)
        
        if (mode === 'total-time' && gameData.startedAt) {
          // Total time mode
          const totalTime = gameData.quiz.totalTime || 0
          const startTime = new Date(gameData.startedAt).getTime()
          setGameStartTime(startTime)
          const endTime = startTime + (totalTime * 1000)
          setTimerEndTime(endTime)
          
          const now = Date.now()
          const remaining = Math.ceil((endTime - now) / 1000)
          setTimeLeft(Math.max(0, remaining))
          
          console.log('⏱️ Total-time mode:', { totalTime, remaining })
        } else if (mode === 'per-question' && gameData.questionStartedAt) {
          // Per-question mode - use actual current question index
          const currentQ = gameData.quiz.questions[savedQuestionIndex]
          const questionTime = currentQ?.timeLimit || 30
          const questionStart = new Date(gameData.questionStartedAt).getTime()
          const endTime = questionStart + (questionTime * 1000)
          setTimerEndTime(endTime)
          
          const now = Date.now()
          const remaining = Math.ceil((endTime - now) / 1000)
          setTimeLeft(Math.max(0, remaining))
          
          console.log('⏱️ Per-question mode:', { questionTime, remaining, questionIndex: savedQuestionIndex })
        }
      }
      
      // Update leaderboard
      const sortedPlayers = [...(gameData.players || [])]
        .sort((a, b) => b.score - a.score)
        .map((player, index) => {
          // Handle avatar as object or string
          const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
            ? player.avatar.emoji 
            : (player.avatar || '👤')
          
          return {
            rank: index + 1,
            playerName: player.playerName,
            avatar: avatarDisplay,
            score: player.score || 0
          }
        })
      
      setLeaderboard(sortedPlayers)
      if (gameId) {
        socketService.updateLeaderboard(gameId, sortedPlayers)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading game data:', error)
      setLoading(false)
    }
  }

  const handleNextQuestion = async ({ auto = false } = {}) => {
    try {
      const response = await gameService.nextQuestion(gameId)
      const payload = response?.data || response || {}
      const resultData = payload.data || {}

      if (resultData.gameEnded) {
        // Game finished
        setGameEnded(true)
        socketService.endGame(gameId, resultData.results)
        
        setTimeout(() => {
          navigate('/quiz-results/' + gameId, {
            state: {
              results: resultData.results,
              quiz: quiz,
              isHost: true
            }
          })
        }, 2000)
      } else {
        // Move to next question
        const backendIndex = typeof resultData.currentQuestion === 'number'
          ? resultData.currentQuestion
          : undefined
        const nextIndex = backendIndex !== undefined ? backendIndex : currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        socketService.nextQuestion(gameId, nextIndex)
        
        // Reset timer for per-question mode
        if (timerMode === 'per-question' && questions[nextIndex]) {
          const questionTime = questions[nextIndex].timeLimit || 30
          const endTime = Date.now() + (questionTime * 1000)
          setTimerEndTime(endTime)
          setTimeLeft(questionTime)
          console.log('⏱️ Next question timer reset:', questionTime, 'seconds')
        }
        // For total-time mode, timer continues counting down
      }
      setIsAdvancing(false)
    } catch (error) {
      console.error('Error moving to next question:', error)
      if (!auto) {
        showError('Gagal pindah ke soal berikutnya')
      }
      setIsAdvancing(false)
    }
  }

  const handleEndGame = async () => {
    showConfirm({
      title: 'Akhiri game sekarang?',
      message: 'Hasil akan disimpan.',
      confirmText: 'Akhiri',
      cancelText: 'Batal',
      confirmColor: 'red',
      onConfirm: async () => {
        try {
          const response = await gameService.endGame(gameId)
          setGameEnded(true)
          socketService.endGame(gameId, response.data.results)
          setIsAdvancing(false)
          
          setTimeout(() => {
            navigate('/quiz-results/' + gameId, {
              state: {
                results: response.data.results,
                quiz: quiz,
                isHost: true
              }
            })
          }, 500)
        } catch (err) {
          console.error('Error ending game:', err)
          showError('Gagal mengakhiri game!')
          setIsAdvancing(false)
        }
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    )
  }

  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-12 text-center"
        >
          <div className="text-6xl mb-4">🏁</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Ended!</h1>
          <p className="text-gray-600">Redirecting to results...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <span className="text-white font-bold">PIN: {PIN}</span>
            </div>
            <div className="text-white">
              <div className="text-sm opacity-80">Question</div>
              <div className="text-xl font-bold">{currentQuestionIndex + 1} / {questions.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
              <span className="text-sm opacity-80">Players: </span>
              <span className="font-bold text-lg">{players.length}</span>
            </div>
            <button
              onClick={handleEndGame}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition shadow-lg"
            >
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Fokus leaderboard untuk host */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard utama */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Live Leaderboard</p>
                  <h2 className="text-3xl font-bold text-gray-800">Top Players</h2>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-semibold">
                  {players.length} pemain
                </div>
              </div>
              <LiveLeaderboard players={leaderboard} />
            </motion.div>
          </div>

          {/* Kontrol host */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Pertanyaan aktif</p>
                <div className="text-2xl font-bold text-gray-800">{currentQuestionIndex + 1} / {questions.length}</div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-lg"
                  disabled={gameEnded || isAdvancing}
                >
                  Next Question ➡️
                </button>
                <button
                  onClick={handleEndGame}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-lg"
                >
                  End Game 🏁
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Players</h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {players.map((player, index) => {
                    const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
                      ? player.avatar.emoji 
                      : (player.avatar || '👤')
                    const correctAnswersCount = (player.answers || []).filter(ans => ans.isCorrect).length
                    return (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="text-2xl">{avatarDisplay}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{player.playerName}</div>
                          <div className="text-sm text-gray-500">{correctAnswersCount} correct</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
      <ConfirmDialog {...confirmDialog} onClose={hideConfirm} />
    </div>
  )
}

export default LiveGameplayPage
