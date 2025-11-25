import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../services/gameService'
import socketService from '../services/socketService'

const LiveGameplayPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, PIN, quiz } = location.state || {}

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [players, setPlayers] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [answeredPlayers, setAnsweredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameEnded, setGameEnded] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  
  // Timer states
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
      setAnsweredPlayers(prev => {
        if (!prev.some(p => p.playerName === playerName)) {
          return [...prev, { playerName, isCorrect, score, timeSpent, answeredAt: Date.now() }]
        }
        return prev
      })

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

  // Timer countdown effect with auto-advance
  useEffect(() => {
    if (loading || gameEnded || timerMode === 'none' || !timerEndTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const remainingMs = timerEndTime - now
      const remainingSec = Math.ceil(remainingMs / 1000)

      if (remainingSec <= 0) {
        setTimeLeft(0)
        clearInterval(timer)

        // Auto-advance based on timer mode
        if (timerMode === 'total-time') {
          // Total time expired - end game immediately
          console.log('⏰ Total time expired - auto ending game')
          handleEndGame()
        } else if (timerMode === 'per-question') {
          // Question time expired - auto next question
          console.log('⏰ Question time expired - auto advancing')
          handleNextQuestion()
        }
      } else {
        setTimeLeft(remainingSec)
      }
    }, 100) // Update every 100ms for smooth display

    return () => clearInterval(timer)
  }, [loading, gameEnded, timerMode, timerEndTime, currentQuestionIndex])

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
      
      // Restore current question index if different (reconnection scenario)
      if (savedQuestionIndex !== currentQuestionIndex) {
        console.log('📍 Host reconnected - restoring to question:', savedQuestionIndex)
        setIsReconnecting(true)
        setCurrentQuestionIndex(savedQuestionIndex)
        setAnsweredPlayers([]) // Reset answered players for current question
        
        // Re-emit question changed event to sync all players
        setTimeout(() => {
          console.log('🔄 Re-syncing players to question:', savedQuestionIndex)
          socketService.nextQuestion(gameId, savedQuestionIndex)
          setIsReconnecting(false)
        }, 500) // Small delay to ensure socket connection is ready
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

  const handleNextQuestion = async () => {
    try {
      const response = await gameService.nextQuestion(gameId)
      
      if (response.data.gameEnded) {
        // Game finished
        setGameEnded(true)
        socketService.endGame(gameId, response.data.results)
        
        setTimeout(() => {
          navigate('/quiz-results/' + gameId, {
            state: {
              results: response.data.results,
              quiz: quiz,
              isHost: true
            }
          })
        }, 2000)
      } else {
        // Move to next question
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        setAnsweredPlayers([]) // Reset answered players
        socketService.nextQuestion(gameId, nextIndex)
        setShowLeaderboard(false)
        
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
    } catch (error) {
      console.error('Error moving to next question:', error)
      alert('Gagal pindah ke soal berikutnya')
    }
  }

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true)
  }

  const handleEndGame = async () => {
    if (!window.confirm('Akhiri game sekarang? Hasil akan disimpan.')) {
      return
    }

    try {
      const response = await gameService.endGame(gameId)
      setGameEnded(true)
      socketService.endGame(gameId, response.data.results)
      
      setTimeout(() => {
        navigate('/quiz-results/' + gameId, {
          state: {
            results: response.data.results,
            quiz: quiz,
            isHost: true
          }
        })
      }, 1500)
    } catch (error) {
      console.error('Error ending game:', error)
      alert('Gagal mengakhiri game')
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200">
      {/* Reconnection Banner */}
      {isReconnecting && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white py-3 px-6 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span className="font-semibold">Reconnecting... Syncing game state with players</span>
          </div>
        </motion.div>
      )}
      
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
            
            {/* Timer Display */}
            {timerMode !== 'none' && (
              <div className={`backdrop-blur-sm rounded-xl px-4 py-2 font-bold text-xl transition-all ${
                timeLeft <= 5 
                  ? 'bg-red-500/90 text-white animate-pulse' 
                  : timeLeft <= 10 
                  ? 'bg-yellow-500/90 text-white' 
                  : 'bg-white/20 text-white'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{timeLeft <= 10 ? '⏰' : '⏱️'}</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="text-xs text-center mt-1 opacity-80">
                  {timerMode === 'total-time' ? 'Total Time' : 'Question Time'}
                </div>
              </div>
            )}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Question Display - Left/Main */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!showLeaderboard ? (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="bg-white rounded-3xl shadow-2xl p-8"
                >
                  {/* Question */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                        {(() => {
                          const type = currentQuestion?.questionType;
                          if (type === 'multiple-answer') return 'Multiple Answer';
                          if (type === 'multiple-choice' || type === 'Pilihan Ganda') return 'Multiple Choice';
                          if (type === 'true-false' || type === 'Benar Salah') return 'True/False';
                          if (type === 'short-answer' || type === 'Isian') return 'Fill in the Blank';
                          return type || 'Multiple Choice';
                        })()}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {currentQuestion?.points || 1} points
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-6">
                      {currentQuestion?.question}
                    </h2>

                    {/* Question Image */}
                    {currentQuestion?.imageData && (
                      <div className="mb-6">
                        <img
                          src={currentQuestion.imageData}
                          alt="Question"
                          className="max-w-full h-auto rounded-xl shadow-lg max-h-96 mx-auto"
                        />
                      </div>
                    )}

                    {/* Options Display */}
                    {currentQuestion?.options && currentQuestion.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 rounded-xl p-4 border-2 border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="text-gray-800 font-medium">{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answer (Hidden from players, shown to host) */}
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-700 font-bold">✓ Correct Answer:</span>
                      </div>
                      <div className="text-green-800 font-semibold text-lg">
                        {(() => {
                          const correctAns = currentQuestion?.correctAnswer;
                          const options = currentQuestion?.options;
                          
                          // If correctAnswer is array of numbers/indices, convert to option text
                          if (Array.isArray(correctAns)) {
                            const answerTexts = correctAns.map(ans => {
                              // Check if ans is a number (index)
                              if (typeof ans === 'number' && options && options[ans]) {
                                return options[ans];
                              }
                              return ans;
                            });
                            return answerTexts.join(', ');
                          }
                          
                          // If correctAnswer is a number (index), convert to option text
                          if (typeof correctAns === 'number' && options && options[correctAns]) {
                            return options[correctAns];
                          }
                          
                          return correctAns || 'N/A';
                        })()}
                      </div>
                      {currentQuestion?.acceptedAnswers && currentQuestion.acceptedAnswers.length > 0 && (
                        <div className="mt-2 text-green-700 text-sm">
                          <span className="font-semibold">Also accepted:</span> {currentQuestion.acceptedAnswers.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answered Players Counter */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-semibold">
                        Players Answered: {answeredPlayers.length} / {players.length}
                      </span>
                      <div className="flex gap-2">
                        {answeredPlayers.slice(-5).map((player, index) => (
                          <div
                            key={index}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              player.isCorrect ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={player.playerName}
                          >
                            {player.isCorrect ? '✓' : '✗'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleShowLeaderboard}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg"
                    >
                      📊 Show Leaderboard
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg"
                      title={timerMode !== 'none' ? 'Auto-advance enabled, but you can click to skip' : ''}
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question ➡️
                          {timerMode !== 'none' && timeLeft > 0 && (
                            <span className="block text-sm opacity-80 mt-1">Auto in {timeLeft}s</span>
                          )}
                        </>
                      ) : (
                        <>
                          Finish Game 🏁
                          {timerMode !== 'none' && timeLeft > 0 && (
                            <span className="block text-sm opacity-80 mt-1">Auto in {timeLeft}s</span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-8"
                >
                  <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    🏆 Leaderboard
                  </h2>

                  <div className="space-y-3 mb-8">
                    {leaderboard.map((player, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          index === 0
                            ? 'bg-yellow-100 border-2 border-yellow-400'
                            : index === 1
                            ? 'bg-gray-100 border-2 border-gray-400'
                            : index === 2
                            ? 'bg-orange-100 border-2 border-orange-400'
                            : 'bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        <div className="text-3xl font-bold w-12 text-center">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${player.rank}`}
                        </div>
                        <div className="text-2xl">{player.avatar}</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-800">{player.playerName}</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{player.score}</div>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg"
                  >
                    Continue to Next Question
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Players List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Players ({players.length})
              </h3>

              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {players.map((player, index) => {
                  // Handle avatar as object or string
                  const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
                    ? player.avatar.emoji 
                    : (player.avatar || '👤')
                  
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="text-2xl">{avatarDisplay}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{player.playerName}</div>
                        <div className="text-sm text-gray-500">Score: {player.score || 0}</div>
                      </div>
                      {answeredPlayers.some(p => p.playerName === player.playerName) && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveGameplayPage
