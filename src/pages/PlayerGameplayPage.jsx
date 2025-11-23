import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../services/gameService'
import socketService from '../services/socketService'

const PlayerGameplayPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, pin, playerName, avatar } = location.state || {}

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [myScore, setMyScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [waitingForNext, setWaitingForNext] = useState(false)
  const [gameData, setGameData] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [timerEndTime, setTimerEndTime] = useState(null) // Absolute end time for accuracy

  useEffect(() => {
    if (!gameId || !pin || !playerName) {
      navigate('/')
      return
    }

    loadGameData()
    socketService.connect()
    
    // Join the game room
    socketService.joinGame(gameId, playerName, 'player')

    // Listen for question changes
    socketService.onQuestionChanged(({ questionIndex }) => {
      console.log(`➡️ Moving to question ${questionIndex}`)
      setCurrentQuestionIndex(questionIndex)
      setHasAnswered(false)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setFeedback('')
      setWaitingForNext(false)
      setShowLeaderboard(false)
      setTimerActive(false)
      // Load game data will be triggered by useEffect when currentQuestionIndex changes
    })

    // Listen for game ended
    socketService.onGameEnded(({ results }) => {
      console.log('🏁 Game ended!', results)
      setTimeout(() => {
        navigate('/quiz-results/' + gameId, {
          state: {
            results: results,
            playerName: playerName,
            isHost: false
          }
        })
      }, 2000)
    })

    // Listen for leaderboard updates
    socketService.onLeaderboardUpdated(({ leaderboard }) => {
      setLeaderboard(leaderboard)
      setShowLeaderboard(true)
      setTimeout(() => {
        setShowLeaderboard(false)
      }, 5000)
    })

    return () => {
      socketService.leaveGame(gameId, playerName)
      socketService.removeAllListeners()
    }
  }, [gameId, pin, playerName, navigate])

  // Load question when currentQuestionIndex changes
  useEffect(() => {
    if (gameId) {
      loadGameData()
    }
  }, [currentQuestionIndex])

  // Timer countdown with system time for accuracy
  useEffect(() => {
    if (!timerActive || hasAnswered || !timerEndTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const remainingMs = timerEndTime - now
      const remainingSec = Math.ceil(remainingMs / 1000)

      if (remainingSec <= 0) {
        setTimeLeft(0)
        clearInterval(timer)
        // Time's up - auto submit
        if (!hasAnswered) {
          handleSubmitAnswer()
        }
      } else {
        setTimeLeft(remainingSec)
      }
    }, 100) // Update every 100ms for smooth display

    return () => clearInterval(timer)
  }, [timerActive, hasAnswered, timerEndTime])

  const loadGameData = async () => {
    try {
      const response = await gameService.getGame(gameId)
      const game = response.data.game
      setGameData(game)

      const currentQ = game.quiz.questions[currentQuestionIndex]
      setCurrentQuestion(currentQ)
      
      // Handle different timer modes
      const timerMode = game.quiz.timerMode || 'per-question'
      
      if (timerMode === 'total-time') {
        // Total time mode: countdown from quiz total time
        const totalTimeLimit = game.quiz.totalTime || 1800 // Default 30 minutes
        
        if (game.startedAt) {
          const startTime = new Date(game.startedAt).getTime()
          const endTime = startTime + (totalTimeLimit * 1000)
          setTimerEndTime(endTime)
          
          const now = Date.now()
          const remaining = Math.ceil((endTime - now) / 1000)
          setTimeLeft(Math.max(0, remaining))
          setTimerActive(true)
          
          console.log('⏱️ Total-time mode:', { totalTimeLimit, remaining })
        } else {
          const endTime = Date.now() + (totalTimeLimit * 1000)
          setTimerEndTime(endTime)
          setTimeLeft(totalTimeLimit)
          setTimerActive(true)
        }
      } else if (timerMode === 'per-question') {
        // Per-question mode: use question time limit
        const questionTimeLimit = currentQ?.timeLimit
        
        if (questionTimeLimit && game.questionStartedAt) {
          const startTime = new Date(game.questionStartedAt).getTime()
          const endTime = startTime + (questionTimeLimit * 1000)
          setTimerEndTime(endTime)
          
          const now = Date.now()
          const remaining = Math.ceil((endTime - now) / 1000)
          setTimeLeft(Math.max(0, remaining))
          setTimerActive(true)
          
          console.log('⏱️ Per-question mode:', { questionTimeLimit, remaining })
        } else if (questionTimeLimit) {
          const endTime = Date.now() + (questionTimeLimit * 1000)
          setTimerEndTime(endTime)
          setTimeLeft(questionTimeLimit)
          setTimerActive(true)
        } else {
          setTimeLeft(0)
          setTimerActive(false)
          setTimerEndTime(null)
        }
      } else {
        // No timer mode
        setTimeLeft(0)
        setTimerActive(false)
        setTimerEndTime(null)
      }

      // Get my current score and check if already answered current question
      const me = game.players.find(p => p.playerName === playerName)
      if (me) {
        setMyScore(me.score || 0)
        
        // Check if player already answered the current question
        const currentQuestionId = currentQ?._id?.toString()
        const alreadyAnswered = me.answers?.some(ans => 
          ans.questionId?.toString() === currentQuestionId
        )
        
        if (alreadyAnswered) {
          const savedAnswer = me.answers.find(ans => 
            ans.questionId?.toString() === currentQuestionId
          )
          
          console.log('🔄 Player already answered this question:', {
            questionId: currentQuestionId,
            savedAnswer: savedAnswer?.answer,
            isCorrect: savedAnswer?.isCorrect
          })
          
          // Restore the saved answer and state
          setSelectedAnswer(savedAnswer?.answer)
          setHasAnswered(true)
          setIsCorrect(savedAnswer?.isCorrect)
          setWaitingForNext(true)
          setTimerActive(false)
          setFeedback(savedAnswer?.isCorrect ? 'Benar! 🎉' : 'Salah 😢')
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading game data:', error)
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer) => {
    if (!hasAnswered) {
      // Check if this is a multiple-answer question
      const isMultipleAnswer = currentQuestion?.questionType === 'multiple-answer' ||
                               Array.isArray(currentQuestion?.correctAnswer);
      
      if (isMultipleAnswer) {
        // Toggle selection for multiple answers
        setSelectedAnswer(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          if (prevArray.includes(answer)) {
            return prevArray.filter(a => a !== answer);
          } else {
            return [...prevArray, answer];
          }
        });
      } else {
        // Single selection
        setSelectedAnswer(answer);
      }
    }
  }

  const handleSubmitAnswer = async () => {
    if (hasAnswered) return

    setHasAnswered(true)
    setTimerActive(false)

    try {
      // Calculate time spent
      const questionTimeLimit = currentQuestion?.timeLimit || null
      const timeSpentValue = questionTimeLimit !== null
        ? Math.max(0, questionTimeLimit - timeLeft)
        : null
      
      // Submit to backend (let backend validate the answer)
      const response = await gameService.submitAnswer(gameId, {
        questionId: currentQuestion._id,
        answer: selectedAnswer !== null ? selectedAnswer : '',
        playerName,
        timeSpent: timeSpentValue
      })

      const result = response.data
      setIsCorrect(result.isCorrect)
      setMyScore(result.currentScore)

      // Emit socket event
      socketService.submitAnswer(
        gameId,
        playerName,
        currentQuestion._id,
        result.isCorrect,
        result.currentScore,
        result.timeSpent
      )

      // Show feedback
      if (result.isCorrect) {
        setFeedback(`🎉 Correct! +${result.points} points`)
      } else {
        const correctAnswerDisplay = Array.isArray(currentQuestion.correctAnswer)
          ? currentQuestion.correctAnswer.join(', ')
          : currentQuestion.correctAnswer
        setFeedback(`❌ Wrong! The correct answer is: ${correctAnswerDisplay}`)
      }

      setWaitingForNext(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
      const errorMessage = error.response?.data?.message || '❌ Error submitting answer'
      setFeedback(errorMessage)
      setWaitingForNext(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading question...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {typeof avatar === 'object' && avatar?.emoji ? avatar.emoji : (avatar || '👤')}
            </div>
            <div className="text-white">
              <div className="font-bold text-lg">{playerName}</div>
              <div className="text-sm opacity-80">Score: {myScore}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
              <span className="text-sm opacity-80">Question: </span>
              <span className="font-bold text-lg">
                {currentQuestionIndex + 1} / {gameData?.quiz?.questions?.length || 0}
              </span>
            </div>

            {/* Timer */}
            {timerActive && !hasAnswered && (
              <div
                className={`text-2xl font-bold px-4 py-2 rounded-xl ${
                  timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-white/20 backdrop-blur-sm'
                } text-white`}
              >
                ⏱️ {timeLeft}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {showLeaderboard ? (
            <motion.div
              key="leaderboard"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
                🏆 Leaderboard
              </h2>

              <div className="space-y-3">
                {leaderboard.map((player, index) => {
                  // Handle avatar as object or string
                  const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
                    ? player.avatar.emoji 
                    : (player.avatar || '👤')
                  
                  return (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      player.playerName === playerName
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : index === 0
                        ? 'bg-yellow-100 border-2 border-yellow-400'
                        : index === 1
                        ? 'bg-gray-100 border-2 border-gray-400'
                        : index === 2
                        ? 'bg-orange-100 border-2 border-orange-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl font-bold w-10 text-center">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="text-2xl">{avatarDisplay}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800">
                        {player.playerName}
                        {player.playerName === playerName && (
                          <span className="ml-2 text-blue-600">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{player.score}</div>
                  </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              {/* Question */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
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
              </div>

              {/* Answer Options */}
              {!waitingForNext ? (
                <div className="space-y-4 mb-8">
                  {/* Multiple Choice Options */}
                  {(currentQuestion?.questionType === 'Multiple Choice' || 
                    currentQuestion?.questionType === 'Pilihan Ganda' || 
                    currentQuestion?.questionType === 'multiple-choice' ||
                    currentQuestion?.questionType === 'multiple-answer') && 
                    currentQuestion?.options && currentQuestion.options.map((option, index) => {
                      // Check if this is a multiple-answer question
                      const isMultipleAnswer = currentQuestion?.questionType === 'multiple-answer' ||
                                               Array.isArray(currentQuestion?.correctAnswer);
                      const isSelected = isMultipleAnswer 
                        ? (Array.isArray(selectedAnswer) && selectedAnswer.includes(option))
                        : selectedAnswer === option;
                      
                      return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                      whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={hasAnswered}
                      className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                      } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isMultipleAnswer ? (isSelected ? '✓' : String.fromCharCode(65 + index)) : String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-800 font-medium text-lg">{option}</span>
                      </div>
                    </motion.button>
                      );
                    })}

                  {/* True/False Options */}
                  {(currentQuestion?.questionType === 'True/False' || 
                    currentQuestion?.questionType === 'Benar Salah' || 
                    currentQuestion?.questionType === 'true-false') && (
                    <>
                      <motion.button
                        whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                        whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                        onClick={() => handleAnswerSelect('True')}
                        disabled={hasAnswered}
                        className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                          selectedAnswer === 'True'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-green-300'
                        } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                              selectedAnswer === 'True'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            ✓
                          </div>
                          <span className="text-gray-800 font-medium text-lg">True</span>
                        </div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                        whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                        onClick={() => handleAnswerSelect('False')}
                        disabled={hasAnswered}
                        className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                          selectedAnswer === 'False'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-gray-50 hover:border-red-300'
                        } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                              selectedAnswer === 'False'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            ✗
                          </div>
                          <span className="text-gray-800 font-medium text-lg">False</span>
                        </div>
                      </motion.button>
                    </>
                  )}

                  {/* Fill in the Blank Input */}
                  {(currentQuestion?.questionType === 'Fill in the Blank' || 
                    currentQuestion?.questionType === 'Isian' || 
                    currentQuestion?.questionType === 'short-answer') && (
                    <div>
                      <input
                        type="text"
                        value={selectedAnswer || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        disabled={hasAnswered}
                        placeholder="Type your answer here..."
                        className={`w-full p-6 rounded-xl border-2 transition-all text-lg ${
                          selectedAnswer
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        } ${hasAnswered ? 'cursor-not-allowed opacity-60' : ''}`}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        💡 Hint: Type your answer exactly as it appears
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-8">
                  {/* Saved Answer Indicator (when reconnecting) */}
                  {hasAnswered && !waitingForNext && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mb-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-blue-700">
                        <span className="text-2xl">💾</span>
                        <div>
                          <div className="font-bold">Answer Restored</div>
                          <div className="text-sm">Your previous answer has been saved. Waiting for next question...</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Feedback */}
                  {waitingForNext && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-6 rounded-xl ${
                      isCorrect
                        ? 'bg-green-100 border-2 border-green-400'
                        : 'bg-red-100 border-2 border-red-400'
                    }`}
                  >
                    <div className="text-4xl mb-4 text-center">{isCorrect ? '🎉' : '😞'}</div>
                    <div
                      className={`text-xl font-bold mb-2 text-center ${
                        isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                    </div>
                    {!isCorrect && (
                      <div className="bg-white/50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-gray-600 mb-1">Correct answer:</p>
                        <p className="text-lg font-semibold text-gray-800">
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
                        </p>
                        {currentQuestion?.acceptedAnswers && currentQuestion.acceptedAnswers.length > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            Also accepted: {currentQuestion.acceptedAnswers.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    {isCorrect && (
                      <p className="text-green-600 font-medium mb-3">
                        +{myScore - (gameData?.players?.find(p => p.playerName === playerName)?.score || 0)} points
                      </p>
                    )}
                    <div className="text-gray-600 mt-4 text-center">
                      Waiting for next question...
                    </div>
                    <div className="flex justify-center mt-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full"
                      />
                    </div>
                  </motion.div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {!hasAnswered && (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                    (selectedAnswer && (!Array.isArray(selectedAnswer) || selectedAnswer.length > 0))
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {(selectedAnswer && (!Array.isArray(selectedAnswer) || selectedAnswer.length > 0)) 
                    ? `Submit Answer ✓${Array.isArray(selectedAnswer) ? ` (${selectedAnswer.length} selected)` : ''}` 
                    : 'Select an answer'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PlayerGameplayPage
