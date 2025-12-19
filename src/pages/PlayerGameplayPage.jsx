import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../services/gameService'
import socketService from '../services/socketService'

const PlayerGameplayPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, pin, playerName, avatar, isGuest, pinExpiresAt } = location.state || {}

  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [myScore, setMyScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [gameData, setGameData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerMode, setTimerMode] = useState('none') // 'none', 'per-question', 'total-time'
  const [timerActive, setTimerActive] = useState(false)
  const [timerEndTime, setTimerEndTime] = useState(null) // Absolute end time for accuracy
  const [quizCompleted, setQuizCompleted] = useState(false) // Track if player finished all questions
  
  // Use ref to track if timer has been initialized for current question
  const timerInitialized = useRef(false)
  const autoSaveTimeoutRef = useRef(null) // For debouncing auto-save on text input
  const selectedAnswerRef = useRef(null) // Keep track of latest answer for timer expiration
  const hasAnsweredRef = useRef(false) // Keep track of latest hasAnswered value for timer
  const questionIndexRef = useRef(currentQuestionIndex) // Track current question to prevent stale timer triggers
  const isFirstLoadRef = useRef(true) // Track if this is the first load ever

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
      console.log(`➡️ Socket: Moving to question ${questionIndex}`)
      
      // Update ref immediately untuk stop old timer
      questionIndexRef.current = questionIndex
      
      // Delay update ke soal baru untuk memberi waktu player process submit
      setTimeout(() => {
        setCurrentQuestionIndex(prevIndex => {
          if (prevIndex !== questionIndex) {
            console.log(`🔄 Changing question from ${prevIndex} to ${questionIndex}`)
            // Moving to new question - reset all state including timer
            setHasAnswered(false)
            hasAnsweredRef.current = false
            setSelectedAnswer(null)
            selectedAnswerRef.current = null
            setIsCorrect(null)
            setFeedback('')
            setTimerActive(false)
            setTimerEndTime(null)
            // Reset draft state so player bisa lanjut jawab
            timerInitialized.current = false // IMPORTANT: Reset timer flag
          }
          return questionIndex
        })
      }, 500) // Delay untuk buffer proses submit player
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

    // Jangan polling - bisa menyebabkan race condition
    // Socket event + auto-check di loadGameData sudah cukup

    return () => {
      clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [gameId, pin, playerName, navigate])

  // Load question when currentQuestionIndex changes
  useEffect(() => {
    if (gameId) {
      // Reset timer flag saat pindah soal agar timer bisa di-init ulang
      timerInitialized.current = false
      questionIndexRef.current = currentQuestionIndex // Update ref
      loadGameData()
    }
  }, [currentQuestionIndex, gameId]) // ✅ Added gameId to dependencies

  // Timer countdown with system time for accuracy
  useEffect(() => {
    // Jangan jalankan timer saat loading atau timer tidak aktif
    if (loading || !timerActive || !timerEndTime) return

    let hasTriggered = false // Prevent double trigger
    const capturedQuestionIndex = currentQuestionIndex // Capture current question index

    const timer = setInterval(() => {
      // PENTING: Cek apakah masih di soal yang sama
      if (questionIndexRef.current !== capturedQuestionIndex) {
        console.log('⚠️ Question changed, stopping timer for old question');
        clearInterval(timer);
        return;
      }

      const now = Date.now()
      const remainingMs = timerEndTime - now
      const remainingSec = Math.ceil(remainingMs / 1000)

      if (remainingSec <= 0 && !hasTriggered) {
        hasTriggered = true
        console.log('⏰ Timer reached 0 for question', capturedQuestionIndex);
        
        // Double check masih di soal yang sama sebelum submit
        if (questionIndexRef.current === capturedQuestionIndex) {
          setTimeLeft(0);
          setTimerActive(false);
          clearInterval(timer);
          // Time's up - auto submit after small delay to ensure UI ready
          if (!hasAnsweredRef.current) {
            console.log('⏰ Calling handleTimeExpire for question', capturedQuestionIndex, 'with 300ms delay');
            setTimeout(() => {
              handleTimeExpire();
            }, 300) // Delay agar soal benar-benar siap, match dengan host delay
          } else {
            console.log('⏰ Already answered, not calling handleTimeExpire');
          }
        } else {
          console.log('⚠️ Question changed before timer expire, skipping handleTimeExpire');
        }
      } else if (remainingSec > 0) {
        setTimeLeft(remainingSec);
      }
    }, 100) // Update every 100ms for smooth display

    return () => {
      clearInterval(timer)
    }
  }, [loading, timerActive, timerEndTime, currentQuestionIndex]) // Tambah dependencies agar timer reset saat pindah soal

  const loadGameData = async () => {
    try {
      console.log('🔄 loadGameData called for questionIndex:', currentQuestionIndex);
      
      // Use guest service if player is guest, otherwise use regular service
      const response = isGuest 
        ? await gameService.getGameAsGuest(gameId)
        : await gameService.getGame(gameId)
      
      const game = response.data.game
      setGameData(game)
      
      // Untuk total-time dan none mode: gunakan currentQuestionIndex lokal (manual navigation)
      // Untuk per-question: sync ke backend (auto-move)
      const timerMode = game.quiz.timerMode || 'per-question'
      let questionIndexToUse = currentQuestionIndex

      if (timerMode === 'per-question') {
        // Per-question: sync ke backend (auto-move)
        const backendIndex = game.currentQuestion || 0
        questionIndexToUse = backendIndex

        if (backendIndex !== currentQuestionIndex) {
          setCurrentQuestionIndex(backendIndex)
        }

        if (isFirstLoadRef.current) {
          console.log('📍 First load: syncing to backend question:', backendIndex)
          isFirstLoadRef.current = false
        } else {
          console.log('📍 Sync question index to backend:', backendIndex)
        }
      } else {
        // Total-time atau none: gunakan index lokal (manual navigation dengan Next/Back)
        if (isFirstLoadRef.current) {
          console.log('📍 First load (total-time/none): starting at question:', currentQuestionIndex)
          isFirstLoadRef.current = false
        } else {
          console.log('📍 Total-time/none mode: using local index:', currentQuestionIndex)
        }
      }

      const currentQ = game.quiz.questions[questionIndexToUse]
      setCurrentQuestion(currentQ)
      
      // 🔍 DEBUG: Log quiz timer settings
      console.log('🎮 Quiz Timer Settings:', {
        timerMode: game.quiz.timerMode,
        totalTime: game.quiz.totalTime,
        currentQuestionTimeLimit: currentQ?.timeLimit,
        questionIndex: questionIndexToUse
      })
      
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
          
          // Check if it's a final submission or just auto-saved
          if (savedAnswer?.answeredAt && !savedAnswer?.autoSaved) {
            // Final submission - jawaban sudah di-submit, jangan tampilkan benar/salah
            setHasAnswered(true)
            hasAnsweredRef.current = true
            setIsCorrect(null) // Jangan set hasil
            setTimerActive(false)
          } else {
            // Just auto-saved, timer should still be running
            setHasAnswered(false)
            hasAnsweredRef.current = false
            setIsCorrect(null)
            // Timer will be initialized below
          }
        } else {
          // Player hasn't answered - reset state
          // Keep answer unlocked
        }
        
        // Setup timer if not yet answered (final submission)
        const shouldInitTimer = !alreadyAnswered || (alreadyAnswered && !me.answers.find(ans => 
          ans.questionId?.toString() === currentQuestionId
        )?.answeredAt)
        
        // Set timer mode from quiz settings
        const mode = game.quiz.timerMode || 'per-question'
        console.log('🔧 Setting timerMode to:', mode, 'from quiz.timerMode:', game.quiz.timerMode)
        setTimerMode(mode) // Always update to match quiz settings
        
        if (shouldInitTimer && !timerInitialized.current) {
          // Player hasn't submitted final answer - setup timer
          console.log('⏰ Initializing timer with mode:', mode, 'shouldInitTimer:', shouldInitTimer)
          const timerMode = mode
          
          if (timerMode === 'total-time') {
            // Total time mode: countdown from quiz total time
            // Gunakan joinedAt player (bukan game.startedAt) karena self-paced
            const totalTimeLimit = game.quiz.totalTime || 1800
            
            if (me.joinedAt) {
              // Player sudah pernah join - restore timer dari joinedAt
              const startTime = new Date(me.joinedAt).getTime()
              const endTime = startTime + (totalTimeLimit * 1000)
              const now = Date.now()
              const remaining = Math.ceil((endTime - now) / 1000)
              
              console.log('⏱️ Init Total-time (restore from joinedAt):', { 
                totalTimeLimit, 
                remaining,
                joinedAt: me.joinedAt 
              })
              
              // Set all timer state at once to prevent flicker
              setTimerEndTime(endTime)
              setTimeLeft(Math.max(0, remaining))
              setTimerActive(remaining > 0)
            } else {
              // First time - should not happen karena joinedAt auto-set saat join
              const endTime = Date.now() + (totalTimeLimit * 1000)
              console.log('⏱️ Init Total-time (fresh start):', { totalTimeLimit })
              setTimerEndTime(endTime)
              setTimeLeft(totalTimeLimit)
              setTimerActive(true)
            }
            timerInitialized.current = true
          } else if (timerMode === 'per-question') {
            // Per-question mode: use question time limit
            const questionTimeLimit = currentQ?.timeLimit
            
            // Gunakan questionStartedAt dari player (bukan global game) untuk restore saat refresh
            if (questionTimeLimit && me.questionStartedAt) {
              const startTime = new Date(me.questionStartedAt).getTime()
              const endTime = startTime + (questionTimeLimit * 1000)
              const now = Date.now()
              const remaining = Math.ceil((endTime - now) / 1000)
              
              console.log('⏱️ Init Per-question (restore from player timer):', { 
                questionTimeLimit, 
                remaining, 
                questionIndex: questionIndexToUse,
                playerStartedAt: me.questionStartedAt
              })
              
              // Set all timer state at once to prevent flicker
              setTimerEndTime(endTime)
              setTimeLeft(Math.max(0, remaining))
              setTimerActive(remaining > 0)
              timerInitialized.current = true
            } else if (questionTimeLimit) {
              // Belum ada questionStartedAt untuk player ini - berarti fresh start
              const endTime = Date.now() + (questionTimeLimit * 1000)
              console.log('⏱️ Init Per-question (fresh start):', { questionTimeLimit, questionIndex: questionIndexToUse })
              setTimerEndTime(endTime)
              setTimeLeft(questionTimeLimit)
              setTimerActive(true)
              timerInitialized.current = true
            } else {
              setTimeLeft(0)
              setTimerActive(false)
              setTimerEndTime(null)
              timerInitialized.current = true
            }
          } else {
            // No timer mode
            setTimeLeft(0)
            setTimerActive(false)
            setTimerEndTime(null)
            timerInitialized.current = true
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
    if (hasAnswered) return // Jangan kunci hanya karena auto-save, hanya setelah final submit
    
    // Check if this is a multiple-answer question
    // Check both questionType and correctAnswer structure for robustness
    const isMultipleAnswer = currentQuestion?.questionType === 'multiple-answer' || 
                             (currentQuestion?.questionType === 'Pilihan Ganda' && 
                              Array.isArray(currentQuestion?.correctAnswer));
    
    console.log('🔍 handleAnswerSelect:', {
      answer,
      questionType: currentQuestion?.questionType,
      correctAnswerType: typeof currentQuestion?.correctAnswer,
      isArray: Array.isArray(currentQuestion?.correctAnswer),
      isMultipleAnswer,
      currentSelectedAnswer: selectedAnswer
    });
    
    if (isMultipleAnswer) {
      // Toggle selection for multiple answers - AUTO-SAVE
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
      // Single selection (multiple choice / true-false) - AUTO-SAVE
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
      // Use guest service if player is guest
      if (isGuest) {
        await gameService.saveAnswerAsGuest(gameId, {
          questionId: currentQuestion._id,
          answer: answerToSave,
          playerName
        });
      } else {
        await gameService.saveAnswer(gameId, {
          questionId: currentQuestion._id,
          answer: answerToSave,
          playerName
        });
      }
      
      console.log('✅ Answer auto-saved successfully');
    } catch (error) {
      console.error('❌ Error auto-saving answer:', error);
    }
  }

  // For text input - JANGAN auto-save, tunggu submit
  const handleTextAnswerChange = (value) => {
    setSelectedAnswer(value)
    selectedAnswerRef.current = value // Update ref
    // TIDAK ada auto-save untuk isian
  }
  
  // Submit manual untuk soal isian
  const handleSubmitShortAnswer = () => {
    if (hasAnswered) return
    
    // Save answer saat submit
    autoSaveAnswer(selectedAnswer || '')
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

      // Use guest service if player is guest
      const response = isGuest
        ? await gameService.submitAnswerAsGuest(gameId, {
            questionId: currentQuestion._id,
            answer,
            playerName,
            timeSpent: currentQuestion.timeLimit || 0
          })
        : await gameService.submitAnswer(gameId, {
            questionId: currentQuestion._id,
            answer,
            playerName,
            timeSpent: currentQuestion.timeLimit || 0
          });

      console.log('✅ Backend response:', response.data);

      const result = response.data;
      setMyScore(result.currentScore);
      setIsCorrect(result.isCorrect);
      
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
      
      // Auto pindah ke soal berikutnya setelah waktu habis - HANYA untuk per-question mode
      if (timerMode === 'per-question') {
        const totalQuestions = gameData?.quiz?.questions?.length || 0
        if (currentQuestionIndex < totalQuestions - 1) {
          // Ada soal berikutnya - pindah otomatis setelah 2 detik
          console.log('⏭️ Moving to next question after time expire (per-question mode)');
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setHasAnswered(false);
            hasAnsweredRef.current = false;
            setSelectedAnswer(null);
            selectedAnswerRef.current = null;
            setIsCorrect(null);
            setFeedback('');
            setTimerActive(false);
            setTimerEndTime(null);
            timerInitialized.current = false;
          }, 2000);
        } else {
          // Soal terakhir - tampilkan quiz selesai
          console.log('🏁 Last question, showing completion screen');
          setTimeout(() => {
            setQuizCompleted(true);
          }, 2000);
        }
      }
      
      // Jangan tampilkan feedback benar/salah
    } catch (error) {
      console.error('❌ Error submitting answer on time expire:', error);
      console.error('Error details:', error.response?.data || error.message);
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
      // Use guest service if player is guest
      const response = isGuest
        ? await gameService.submitAnswerAsGuest(gameId, {
            questionId: currentQuestion._id,
            answer: selectedAnswer !== null ? selectedAnswer : '',
            playerName,
            timeSpent: timeSpentValue
          })
        : await gameService.submitAnswer(gameId, {
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

      // Auto pindah ke soal berikutnya HANYA untuk mode per-question
      // Untuk total-time dan none, player navigasi manual dengan tombol Next/Back
      if (timerMode === 'per-question') {
        const totalQuestions = gameData?.quiz?.questions?.length || 0
        if (currentQuestionIndex < totalQuestions - 1) {
          // Ada soal berikutnya - pindah otomatis setelah 1 detik
          console.log('⏭️ Moving to next question after submit (per-question mode)');
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setHasAnswered(false);
            hasAnsweredRef.current = false;
            setSelectedAnswer(null);
            selectedAnswerRef.current = null;
            setIsCorrect(null);
            setFeedback('');
            setTimerActive(false);
            setTimerEndTime(null);
            timerInitialized.current = false;
          }, 1000);
        } else {
          // Soal terakhir - tampilkan quiz selesai
          console.log('🏁 Last question, showing completion screen');
          setTimeout(() => {
            setQuizCompleted(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      const errorMessage = error.response?.data?.message || '❌ Error submitting answer'
      setFeedback(errorMessage)
      
      // Auto pindah meski error (jangan stuck) - HANYA untuk per-question mode
      if (timerMode === 'per-question') {
        const totalQuestions = gameData?.quiz?.questions?.length || 0
        if (currentQuestionIndex < totalQuestions - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setHasAnswered(false);
            hasAnsweredRef.current = false;
            setSelectedAnswer(null);
            selectedAnswerRef.current = null;
            setIsCorrect(null);
            setFeedback('');
            timerInitialized.current = false;
          }, 1500);
        } else {
          setTimeout(() => {
            setQuizCompleted(true);
          }, 2000);
        }
      }
    }
  }

  // Format time (seconds to MM:SS) - Same as host
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
              {pinExpiresAt && (
                <div className="text-xs opacity-80">
                  Berakhir: {new Date(pinExpiresAt).toLocaleString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
              <span className="text-sm opacity-80">Question: </span>
              <span className="font-bold text-lg">
                {currentQuestionIndex + 1} / {gameData?.quiz?.questions?.length || 0}
              </span>
            </div>

            {/* Timer Display - Same condition as host for stability */}
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
              /* Quiz Completed - Show completion modal */
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
                <p className="text-gray-600 mb-6">
                  Terima kasih telah mengikuti quiz ini!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(isGuest ? '/' : '/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isGuest ? 'Kembali ke Beranda' : 'Kembali ke Dashboard'}
                </motion.button>
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

              {/* Answer Options - Always show, just disable when answered */}
              <div className="space-y-4 mb-8">
                {/* Multiple Choice Options */}
                {(currentQuestion?.questionType === 'Multiple Choice' || 
                  currentQuestion?.questionType === 'Pilihan Ganda' || 
                  currentQuestion?.questionType === 'multiple-choice' ||
                  currentQuestion?.questionType === 'multiple-answer') && 
                  currentQuestion?.options && currentQuestion.options.map((option, index) => {
                    // Check if this is a multiple-answer question
                    // Check both questionType and correctAnswer structure for robustness
                    const isMultipleAnswer = currentQuestion?.questionType === 'multiple-answer' ||
                                             (currentQuestion?.questionType === 'Pilihan Ganda' && 
                                              Array.isArray(currentQuestion?.correctAnswer));
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
                      disabled={hasAnswered}
                      placeholder="Type your answer here..."
                      className={`w-full p-6 rounded-xl border-2 transition-all text-lg ${
                        selectedAnswer
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      } ${hasAnswered ? 'cursor-not-allowed opacity-60' : ''}`}
                    />
                    {!hasAnswered && (
                      <div className="mt-4">
                        <button
                          onClick={handleSubmitShortAnswer}
                          disabled={!selectedAnswer || selectedAnswer.trim() === ''}
                          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                            selectedAnswer && selectedAnswer.trim() !== ''
                              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Submit Answer ✓
                        </button>
                        <p className="text-sm text-gray-500 text-center mt-2">
                          💡 Type your answer, then click Submit
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Buttons untuk Total Time dan None Mode */}
              {(timerMode === 'total-time' || timerMode === 'none') && !quizCompleted && (
                <div className="mt-6 flex gap-3">
                  {/* Back Button */}
                  <motion.button
                    whileHover={{ scale: currentQuestionIndex > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: currentQuestionIndex > 0 ? 0.98 : 1 }}
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(prev => prev - 1)
                        setHasAnswered(false)
                        hasAnsweredRef.current = false
                        setSelectedAnswer(null)
                        selectedAnswerRef.current = null
                        setIsCorrect(null)
                        setFeedback('')
                        timerInitialized.current = false
                      }
                    }}
                    disabled={currentQuestionIndex === 0}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                      currentQuestionIndex > 0
                        ? 'bg-gray-500 hover:bg-gray-600 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ← Back
                  </motion.button>

                  {/* Next/Finish Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const totalQuestions = gameData?.quiz?.questions?.length || 0
                      if (currentQuestionIndex < totalQuestions - 1) {
                        // Pindah ke soal berikutnya
                        setCurrentQuestionIndex(prev => prev + 1)
                        setHasAnswered(false)
                        hasAnsweredRef.current = false
                        setSelectedAnswer(null)
                        selectedAnswerRef.current = null
                        setIsCorrect(null)
                        setFeedback('')
                        timerInitialized.current = false
                      } else {
                        // Soal terakhir - tampilkan selesai
                        setQuizCompleted(true)
                      }
                    }}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all"
                  >
                    {currentQuestionIndex < (gameData?.quiz?.questions?.length || 0) - 1 
                      ? 'Next →' 
                      : 'Finish 🎉'}
                  </motion.button>
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
