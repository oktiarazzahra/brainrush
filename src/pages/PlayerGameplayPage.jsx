import { useState, useEffect, useRef } from 'react'
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
  const [quizCompleted, setQuizCompleted] = useState(false) // Track if player finished all questions
  const [answerSaved, setAnswerSaved] = useState(false) // Track if answer is auto-saved
  
  // Use ref to track if timer has been initialized for current question
  const timerInitialized = useRef(false)
  const autoSaveTimeoutRef = useRef(null) // For debouncing auto-save on text input
  const selectedAnswerRef = useRef(null) // Keep track of latest answer for timer expiration
  const hasAnsweredRef = useRef(false) // Keep track of latest hasAnswered value for timer

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
      
      // Only reset state if actually moving to a different question
      setCurrentQuestionIndex(prevIndex => {
        if (prevIndex !== questionIndex) {
          // Moving to new question - reset all state including timer
          setHasAnswered(false)
          hasAnsweredRef.current = false
          setSelectedAnswer(null)
          selectedAnswerRef.current = null // Reset ref
          setIsCorrect(null)
          setFeedback('')
          setWaitingForNext(false)
          setShowLeaderboard(false)
          setTimerActive(false)
          setTimerEndTime(null) // Reset timer for new question
          setAnswerSaved(false) // Reset auto-save flag
          timerInitialized.current = false // Allow timer to be initialized for new question
        }
        // If same question (resync), don't reset - loadGameData will restore answered state
        return questionIndex
      })
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

    // Listen for leaderboard updates (disabled - only show at end)
    // socketService.onLeaderboardUpdated(({ leaderboard }) => {
    //   setLeaderboard(leaderboard)
    //   setShowLeaderboard(true)
    //   setTimeout(() => {
    //     setShowLeaderboard(false)
    //   }, 5000)
    // })

    return () => {
      socketService.leaveGame(gameId, playerName)
      socketService.removeAllListeners()
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [gameId, pin, playerName, navigate])

  // Load question when currentQuestionIndex changes
  useEffect(() => {
    if (gameId) {
      loadGameData()
    }
  }, [currentQuestionIndex, gameId]) // ✅ Added gameId to dependencies

  // Timer countdown with system time for accuracy
  useEffect(() => {
    if (!timerActive || !timerEndTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const remainingMs = timerEndTime - now
      const remainingSec = Math.ceil(remainingMs / 1000)

      if (remainingSec <= 0) {
        console.log('⏰ Timer reached 0, stopping timer');
        setTimeLeft(0);
        setTimerActive(false);
        clearInterval(timer);
        // Time's up - auto submit and show feedback
        if (!hasAnsweredRef.current) {
          console.log('⏰ Calling handleTimeExpire...');
          handleTimeExpire();
        } else {
          console.log('⏰ Already answered, not calling handleTimeExpire');
        }
      } else {
        setTimeLeft(remainingSec);
      }
    }, 100) // Update every 100ms for smooth display

    return () => clearInterval(timer)
  }, [timerActive, timerEndTime])

  const loadGameData = async () => {
    try {
      console.log('🔄 loadGameData called for questionIndex:', currentQuestionIndex);
      
      const response = await gameService.getGame(gameId)
      const game = response.data.game
      setGameData(game)

      const currentQ = game.quiz.questions[currentQuestionIndex]
      setCurrentQuestion(currentQ)
      
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
            isCorrect: savedAnswer?.isCorrect,
            autoSaved: savedAnswer?.autoSaved
          })
          
          // Restore the saved answer and state
          setSelectedAnswer(savedAnswer?.answer)
          selectedAnswerRef.current = savedAnswer?.answer // Update ref
          setAnswerSaved(true)
          
          // Check if it's a final submission or just auto-saved
          if (savedAnswer?.answeredAt && !savedAnswer?.autoSaved) {
            // Final submission - show results
            setHasAnswered(true)
            hasAnsweredRef.current = true
            setIsCorrect(savedAnswer?.isCorrect)
            setWaitingForNext(true)
            setTimerActive(false)
            setFeedback(savedAnswer?.isCorrect ? 'Benar! 🎉' : 'Salah 😢')
          } else {
            // Just auto-saved, timer should still be running
            setHasAnswered(false)
            hasAnsweredRef.current = false
            setIsCorrect(null)
            setWaitingForNext(false)
            // Timer will be initialized below
          }
        } else {
          // Player hasn't answered - reset state
          setAnswerSaved(false)
        }
        
        // Setup timer if not yet answered (final submission)
        if (!alreadyAnswered || (alreadyAnswered && !me.answers.find(ans => 
          ans.questionId?.toString() === currentQuestionId
        )?.answeredAt)) {
          // Player hasn't submitted final answer - setup timer only once per question
          if (!timerInitialized.current) {
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
              timerInitialized.current = true
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
                timerInitialized.current = true
              } else if (questionTimeLimit) {
                const endTime = Date.now() + (questionTimeLimit * 1000)
                setTimerEndTime(endTime)
                setTimeLeft(questionTimeLimit)
                setTimerActive(true)
                timerInitialized.current = true
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
          }
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading game data:', error)
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer) => {
    if (hasAnswered) return // Don't allow changing answer after time's up
    
    // Check if this is a multiple-answer question - ONLY check questionType
    const isMultipleAnswer = currentQuestion?.questionType === 'multiple-answer';
    
    console.log('🔍 handleAnswerSelect:', {
      answer,
      questionType: currentQuestion?.questionType,
      isMultipleAnswer,
      currentSelectedAnswer: selectedAnswer
    });
    
    if (isMultipleAnswer) {
      // Toggle selection for multiple answers
      setSelectedAnswer(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        console.log('📝 Toggle multiple-answer:', { prevArray, answer });
        if (prevArray.includes(answer)) {
          const newAnswer = prevArray.filter(a => a !== answer);
          console.log('➖ Removing:', answer, '→', newAnswer);
          selectedAnswerRef.current = newAnswer; // Update ref
          autoSaveAnswer(newAnswer); // Auto-save setiap perubahan
          return newAnswer;
        } else {
          const newAnswer = [...prevArray, answer];
          console.log('➕ Adding:', answer, '→', newAnswer);
          selectedAnswerRef.current = newAnswer; // Update ref
          autoSaveAnswer(newAnswer); // Auto-save setiap perubahan
          return newAnswer;
        }
      });
    } else {
      // Single selection
      console.log('📌 Single selection:', answer);
      setSelectedAnswer(answer);
      selectedAnswerRef.current = answer; // Update ref
      autoSaveAnswer(answer); // Auto-save langsung
    }
  }

  // Auto-save answer tanpa submit final (untuk isian, gunakan debounce)
  const autoSaveAnswer = async (answer) => {
    if (!currentQuestion) return;
    
    try {
      const answerToSave = answer !== null && answer !== undefined ? answer : '';
      console.log('💾 Auto-saving answer:', { answer: answerToSave, questionId: currentQuestion._id });
      
      // Simpan answer ke backend tapi belum hitung score
      await gameService.saveAnswer(gameId, {
        questionId: currentQuestion._id,
        answer: answerToSave,
        playerName
      });
      
      setAnswerSaved(true);
      console.log('✅ Answer auto-saved successfully');
    } catch (error) {
      console.error('❌ Error auto-saving answer:', error);
    }
  }

  // For text input with debounce
  const handleTextAnswerChange = (value) => {
    setSelectedAnswer(value);
    selectedAnswerRef.current = value; // Update ref
    
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (500ms debounce)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveAnswer(value);
    }, 500);
  }

  // Called when timer expires - submit whatever answer was auto-saved
  const handleTimeExpire = async () => {
    if (hasAnsweredRef.current) {
      console.log('⏰ Timer expired but already answered, skipping');
      return;
    }
    
    // Use ref value to get the latest answer (avoid stale closure)
    const latestAnswer = selectedAnswerRef.current;
    
    console.log('⏰ TIME EXPIRED! Submitting answer:', {
      selectedAnswer: latestAnswer,
      selectedAnswerState: selectedAnswer, // For comparison
      hasAnswered: hasAnsweredRef.current,
      questionId: currentQuestion._id
    });
    
    setHasAnswered(true);
    hasAnsweredRef.current = true;
    setTimerActive(false);

    try {
      let answer = latestAnswer;
      if (answer === null || answer === undefined) {
        answer = ''; // Submit empty answer if no selection
        console.log('⚠️ No answer selected, submitting empty');
      }

      console.log('📤 Submitting to backend:', {
        gameId,
        questionId: currentQuestion._id,
        answer,
        playerName
      });

      const response = await gameService.submitAnswer(gameId, {
        questionId: currentQuestion._id,
        answer,
        playerName,
        timeSpent: currentQuestion.timeLimit || 0
      });

      console.log('✅ Backend response:', response.data);

      const result = response.data;
      setMyScore(result.currentScore);
      setIsCorrect(result.isCorrect);
      setWaitingForNext(true);
      
      console.log('📡 Emitting socket event:', {
        isCorrect: result.isCorrect,
        currentScore: result.currentScore
      });
      
      // Emit socket event
      socketService.submitAnswer(
        gameId,
        playerName,
        currentQuestion._id,
        result.isCorrect,
        result.currentScore,
        result.timeSpent || 0
      );
      
      // Show feedback
      if (result.isCorrect) {
        setFeedback(`🎉 Correct! +${result.points} points`);
      } else {
        setFeedback('Time\'s up! ⏰');
      }
    } catch (error) {
      console.error('❌ Error submitting answer on time expire:', error);
      console.error('Error details:', error.response?.data || error.message);
      setWaitingForNext(true);
    }
  };

  const handleSubmitAnswer = async () => {
    if (hasAnswered) return

    setHasAnswered(true)
    hasAnsweredRef.current = true
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

      // Show feedback SETELAH waktu habis
      if (result.isCorrect) {
        setFeedback(`🎉 Correct! +${result.points} points`)
      } else {
        // Format correct answer untuk display
        let correctAnswerDisplay = 'N/A';
        const correctAns = currentQuestion?.correctAnswer;
        const options = currentQuestion?.options;
        
        if (Array.isArray(correctAns)) {
          // If array of indices, convert to option text
          const answerTexts = correctAns.map(ans => {
            if (typeof ans === 'number' && options && options[ans]) {
              return options[ans];
            }
            return ans;
          });
          correctAnswerDisplay = answerTexts.join(', ');
        } else if (typeof correctAns === 'number' && options && options[correctAns]) {
          // If single index, convert to option text
          correctAnswerDisplay = options[correctAns];
        } else {
          correctAnswerDisplay = String(correctAns || 'N/A');
        }
        
        setFeedback(`❌ Wrong! The correct answer is: ${correctAnswerDisplay}`)
      }

      setWaitingForNext(true)
      
      // Check if this is the last question
      const totalQuestions = gameData?.quiz?.questions?.length || 0
      if (currentQuestionIndex === totalQuestions - 1) {
        // Delay showing "Quiz Selesai" to let user see the feedback first
        setTimeout(() => {
          setQuizCompleted(true)
        }, 3000) // 3 second delay to show feedback
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      const errorMessage = error.response?.data?.message || '❌ Error submitting answer'
      setFeedback(errorMessage)
      setWaitingForNext(true)
      
      // Check if this is the last question even on error
      const totalQuestions = gameData?.quiz?.questions?.length || 0
      if (currentQuestionIndex === totalQuestions - 1) {
        // Delay showing "Quiz Selesai" even on error
        setTimeout(() => {
          setQuizCompleted(true)
        }, 3000)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200 flex items-center justify-center">
        <div className="text-white text-2xl">Loading question...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200">
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

            {/* Timer - Show while timer is active, regardless of whether answer is selected */}
            {timerActive && (
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
          <motion.div
            key="question"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            {quizCompleted ? (
              /* Quiz Completed - Waiting for game to end */
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-8xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  Quiz Selesai!
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Anda telah menyelesaikan semua soal
                </p>
                <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-6 mb-6">
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {myScore}
                  </div>
                  <div className="text-lg text-gray-700">
                    Skor Akhir Anda
                  </div>
                </div>
                <div className="text-gray-500 mb-4">
                  Menunggu pemain lain menyelesaikan quiz...
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"
                />
              </div>
            ) : (
              <>
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
                      // Check if this is a multiple-answer question - ONLY check questionType
                      const isMultipleAnswer = currentQuestion?.questionType === 'multiple-answer';
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
                        onChange={(e) => handleTextAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className={`w-full p-6 rounded-xl border-2 transition-all text-lg ${
                          selectedAnswer
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-500">
                          💡 Hint: Type your answer exactly as it appears
                        </p>
                        {answerSaved && !hasAnswered && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <span>✓</span> Auto-saved
                          </p>
                        )}
                      </div>
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

              {/* Auto-save indicator - No submit button needed */}
              {!hasAnswered && answerSaved && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-medium flex items-center justify-center gap-2">
                    <span className="text-2xl">💾</span>
                    <span>Your answer has been saved! Wait for the timer to complete.</span>
                  </p>
                </div>
              )}
              
              {/* Waiting indicator when no answer selected */}
              {!hasAnswered && !answerSaved && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center">
                  <p className="text-blue-700 font-medium">
                    Select or type your answer - it will be saved automatically
                  </p>
                </div>
              )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PlayerGameplayPage
