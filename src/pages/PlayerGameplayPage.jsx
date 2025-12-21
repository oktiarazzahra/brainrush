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
  const [showTimeUpAnimation, setShowTimeUpAnimation] = useState(false) // Show animation when time expires
  
  // Use ref to track if timer has been initialized for current question
  const timerInitialized = useRef(false)
  const autoSaveTimeoutRef = useRef(null) // For debouncing auto-save on text input
  const selectedAnswerRef = useRef(null) // Keep track of latest answer for timer expiration
  const hasAnsweredRef = useRef(false) // Keep track of latest hasAnswered value for timer
  const questionIndexRef = useRef(currentQuestionIndex) // Track current question to prevent stale timer triggers
  const isFirstLoadRef = useRef(true) // Track if this is the first load ever
  const timerModeRef = useRef('none') // Track timer mode to avoid stale closure in handleTimeExpire
  const gameDataRef = useRef(null) // Track gameData for access in handleTimeExpire

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
      // JANGAN reset timerInitialized - biar restore logic yang handle
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
          
          // Show time up animation first (always show for better UX)
          console.log('⏰ Showing time up animation for question', capturedQuestionIndex);
          setShowTimeUpAnimation(true);
          
          // Wait for animation, then handle expire
          setTimeout(() => {
            setShowTimeUpAnimation(false);
            // Always call handleTimeExpire untuk per-question auto-move
            handleTimeExpire();
          }, 1500) // 1.5 detik untuk animasi
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

  // Sync refs with state to avoid stale closures
  useEffect(() => {
    timerModeRef.current = timerMode
  }, [timerMode])

  useEffect(() => {
    gameDataRef.current = gameData
  }, [gameData])

  const loadGameData = async () => {
    try {
      console.log('🔄 loadGameData called for questionIndex:', currentQuestionIndex);
      
      // Use guest service if player is guest, otherwise use regular service
      const response = isGuest 
        ? await gameService.getGameAsGuest(gameId)
        : await gameService.getGame(gameId)
      
      const game = response.data.game
      setGameData(game)
      gameDataRef.current = game // Update ref for access in timer callbacks
      
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
        timerModeRef.current = mode // Update ref to avoid stale closure
        
        if (shouldInitTimer && !timerInitialized.current) {
          // Player hasn't submitted final answer - setup timer
          console.log('⏰ Initializing timer with mode:', mode, 'shouldInitTimer:', shouldInitTimer)
          const timerMode = mode
          
          if (timerMode === 'total-time') {
            // Total time mode: countdown from quiz total time
            // Gunakan joinedAt player (bukan game.startedAt) karena self-paced
            const totalTimeLimit = game.quiz.totalTime || 1800
            
            // PENTING: Cek localStorage dulu untuk restore timer (prevent reset on refresh)
            const localStorageKey = `timer_${gameId}_${playerName}`
            const savedTimerData = localStorage.getItem(localStorageKey)
            
            if (savedTimerData) {
              // Restore dari localStorage
              const { endTime } = JSON.parse(savedTimerData)
              const now = Date.now()
              const remaining = Math.ceil((endTime - now) / 1000)
              
              console.log('⏱️ Init Total-time (restore from localStorage):', { 
                totalTimeLimit, 
                remaining,
                endTime: new Date(endTime).toISOString()
              })
              
              if (remaining > 0) {
                setTimerEndTime(endTime)
                setTimeLeft(remaining)
                setTimerActive(true)
              } else {
                // Timer sudah habis
                console.log('⚠️ Timer expired from localStorage')
                localStorage.removeItem(localStorageKey)
                setTimerEndTime(null)
                setTimeLeft(0)
                setTimerActive(false)
              }
            } else if (me.joinedAt) {
              // Player sudah pernah join - restore timer dari joinedAt
              const startTime = new Date(me.joinedAt).getTime()
              const endTime = startTime + (totalTimeLimit * 1000)
              const now = Date.now()
              const remaining = Math.ceil((endTime - now) / 1000)
              
              console.log('⏱️ Init Total-time (restore from joinedAt):', { 
                totalTimeLimit, 
                remaining,
                joinedAt: me.joinedAt,
                endTime: new Date(endTime).toISOString()
              })
              
              // PENTING: Simpan ke localStorage untuk persist across refresh
              localStorage.setItem(localStorageKey, JSON.stringify({ endTime }))
              console.log('💾 Saved to localStorage:', localStorageKey)
              
              // Set all timer state at once to prevent flicker
              setTimerEndTime(endTime)
              setTimeLeft(Math.max(0, remaining))
              setTimerActive(remaining > 0)
            } else {
              // First time - should not happen karena joinedAt auto-set saat join
              const endTime = Date.now() + (totalTimeLimit * 1000)
              console.log('⏱️ Init Total-time (fresh start):', { totalTimeLimit, endTime: new Date(endTime).toISOString() })
              
              // PENTING: Simpan ke localStorage
              localStorage.setItem(localStorageKey, JSON.stringify({ endTime }))
              console.log('💾 Saved to localStorage:', localStorageKey)
              
              setTimerEndTime(endTime)
              setTimeLeft(totalTimeLimit)
              setTimerActive(true)
            }
            timerInitialized.current = true
          } else if (timerMode === 'per-question') {
            // Per-question mode: use question time limit
            const questionTimeLimit = currentQ?.timeLimit
            
            if (questionTimeLimit) {
              // Check if player pernah start timer untuk question ini
              const playerAnswer = me.answers?.find(ans => 
                ans.questionId?.toString() === currentQ?._id?.toString()
              )
              
              // PENTING: Cek localStorage dulu untuk restore timer (prevent reset on refresh)
              const localStorageKey = `timer_${gameId}_${playerName}_q${questionIndexToUse}`
              const savedTimerData = localStorage.getItem(localStorageKey)
              
              if (savedTimerData) {
                // Restore dari localStorage
                const { endTime } = JSON.parse(savedTimerData)
                const now = Date.now()
                const remaining = Math.ceil((endTime - now) / 1000)
                
                console.log('⏱️ Init Per-question (restore from localStorage):', { 
                  questionTimeLimit, 
                  remaining,
                  questionIndex: questionIndexToUse,
                  endTime: new Date(endTime).toISOString()
                })
                
                if (remaining > 0) {
                  setTimerEndTime(endTime)
                  setTimeLeft(remaining)
                  setTimerActive(true)
                } else {
                  // Timer sudah habis
                  console.log('⚠️ Timer expired from localStorage, triggering expire...')
                  localStorage.removeItem(localStorageKey)
                  setTimerEndTime(null)
                  setTimeLeft(0)
                  setTimerActive(false)
                  
                  // Show animation before handling expire
                  if (!hasAnsweredRef.current) {
                    setShowTimeUpAnimation(true);
                    setTimeout(() => {
                      setShowTimeUpAnimation(false);
                      handleTimeExpire();
                    }, 1500);
                  }
                }
              } else if (me.questionStartedAt && !playerAnswer?.answeredAt) {
                // Restore dari questionStartedAt (backend timestamp)
                const startTime = new Date(me.questionStartedAt).getTime()
                const endTime = startTime + (questionTimeLimit * 1000)
                const now = Date.now()
                const remaining = Math.ceil((endTime - now) / 1000)
                
                console.log('⏱️ Init Per-question (restore from questionStartedAt):', { 
                  questionTimeLimit, 
                  remaining, 
                  questionIndex: questionIndexToUse,
                  playerStartedAt: me.questionStartedAt,
                  hasAnswer: !!playerAnswer,
                  endTime: new Date(endTime).toISOString()
                })
                
                // PENTING: Simpan ke localStorage untuk persist across refresh
                localStorage.setItem(localStorageKey, JSON.stringify({ endTime }))
                console.log('💾 Saved to localStorage:', localStorageKey)
                
                // Jika timer masih ada sisa, restore
                if (remaining > 0) {
                  setTimerEndTime(endTime)
                  setTimeLeft(remaining)
                  setTimerActive(true)
                } else {
                  // Timer sudah habis tapi belum di-handle - trigger expire
                  console.log('⚠️ Timer sudah habis saat restore, triggering expire...')
                  setTimerEndTime(null)
                  setTimeLeft(0)
                  setTimerActive(false)
                  
                  // Show animation before handling expire
                  if (!hasAnsweredRef.current) {
                    setShowTimeUpAnimation(true);
                    setTimeout(() => {
                      setShowTimeUpAnimation(false);
                      handleTimeExpire();
                    }, 1500);
                  }
                }
              } else {
                // Fresh start - belum pernah start timer untuk question ini
                const endTime = Date.now() + (questionTimeLimit * 1000)
                console.log('⏱️ Init Per-question (fresh start):', { 
                  questionTimeLimit, 
                  questionIndex: questionIndexToUse,
                  endTime: new Date(endTime).toISOString()
                })
                
                // PENTING: Simpan ke localStorage untuk persist across refresh
                localStorage.setItem(localStorageKey, JSON.stringify({ endTime }))
                console.log('💾 Saved to localStorage:', localStorageKey)
                
                setTimerEndTime(endTime)
                setTimeLeft(questionTimeLimit)
                setTimerActive(true)
              }
              timerInitialized.current = true
            } else {
              // No time limit for this question
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

  // For text input - Auto-save dengan debounce
  const handleTextAnswerChange = (value) => {
    setSelectedAnswer(value)
    selectedAnswerRef.current = value // Update ref
    
    // Auto-save dengan debounce untuk isian
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveAnswer(value)
    }, 1000) // Auto-save setelah 1 detik tidak mengetik
  }

  // Called when timer expires - submit whatever answer was auto-saved
  const handleTimeExpire = async () => {
    // PENTING: Untuk per-question mode, tetap perlu pindah soal meskipun sudah dijawab
    // Jadi jangan skip kalau sudah answered - hanya skip submit, tapi tetap auto-move
    const alreadyAnswered = hasAnsweredRef.current;
    
    if (alreadyAnswered) {
      console.log('⏰ Timer expired and already answered - will auto-move to next question');
      
      // Skip submit, langsung ke auto-move logic
      // Auto pindah ke soal berikutnya - HANYA untuk per-question mode
      if (timerModeRef.current === 'per-question') {
        const totalQuestions = gameDataRef.current?.quiz?.questions?.length || 0
        const currentIdx = questionIndexRef.current
        
        console.log('🔍 Checking auto-move conditions:', {
          timerMode: timerModeRef.current,
          currentIdx,
          totalQuestions,
          shouldMove: currentIdx < totalQuestions - 1
        });
        
        if (currentIdx < totalQuestions - 1) {
          // Ada soal berikutnya - pindah otomatis
          console.log('⏭️ Moving to next question after time expire (already answered)');
          
          // Clear localStorage untuk soal sekarang
          const localStorageKey = `timer_${gameId}_${playerName}_q${currentIdx}`;
          localStorage.removeItem(localStorageKey);
          console.log('🗑️ Cleared localStorage timer for completed question:', localStorageKey);
          
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
          }, 500);
        } else {
          // Soal terakhir - tampilkan quiz selesai
          console.log('🏁 Last question (already answered), showing completion screen');
          
          // Clear localStorage untuk soal terakhir
          const localStorageKey = `timer_${gameId}_${playerName}_q${currentIdx}`;
          localStorage.removeItem(localStorageKey);
          console.log('🗑️ Cleared localStorage timer for last question:', localStorageKey);
          
          setTimeout(() => {
            setQuizCompleted(true);
          }, 1000);
        }
      }
      
      return; // Exit early since already submitted
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
      // Use ref to avoid stale closure issue
      if (timerModeRef.current === 'per-question') {
        const totalQuestions = gameDataRef.current?.quiz?.questions?.length || 0
        const currentIdx = questionIndexRef.current
        
        console.log('🔍 Checking auto-move conditions:', {
          timerMode: timerModeRef.current,
          currentIdx,
          totalQuestions,
          shouldMove: currentIdx < totalQuestions - 1
        });
        
        if (currentIdx < totalQuestions - 1) {
          // Ada soal berikutnya - pindah otomatis dengan delay kecil untuk smooth transition
          console.log('⏭️ Moving to next question after time expire (per-question mode)');
          
          // Clear localStorage untuk soal sekarang
          const localStorageKey = `timer_${gameId}_${playerName}_q${currentIdx}`;
          localStorage.removeItem(localStorageKey);
          console.log('🗑️ Cleared localStorage timer for completed question:', localStorageKey);
          
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
          }, 500); // Small delay untuk smooth transition
        } else {
          // Soal terakhir - tampilkan quiz selesai
          console.log('🏁 Last question, showing completion screen');
          
          // Clear localStorage untuk soal terakhir
          const localStorageKey = `timer_${gameId}_${playerName}_q${currentIdx}`;
          localStorage.removeItem(localStorageKey);
          console.log('🗑️ Cleared localStorage timer for last question:', localStorageKey);
          
          setTimeout(() => {
            setQuizCompleted(true);
          }, 1000);
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
    
    // JANGAN clear localStorage di sini - biarkan timer tetap jalan
    // localStorage hanya di-clear saat pindah soal atau quiz selesai
    console.log('✅ Answer submitted, timer will continue until time expires or next question')

    try{
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
        <div className="text-white text-2xl">Memuat soal...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-sky-200">
      {/* Time Up Animation Overlay */}
      <AnimatePresence>
        {showTimeUpAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-3xl p-12 shadow-2xl text-center"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-8xl mb-4"
              >
                ⏰
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-red-600 mb-2"
              >
                Waktu Habis!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600 text-xl"
              >
                Melanjutkan ke soal berikutnya...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-2xl sm:text-3xl">
              {typeof avatar === 'object' && avatar?.emoji ? avatar.emoji : (avatar || '👤')}
            </div>
            <div className="text-white">
              <div className="font-bold text-base sm:text-lg">{playerName}</div>
              {pinExpiresAt && (
                <div className="text-xs opacity-80 hidden sm:block">
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

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-white">
              <span className="text-xs sm:text-sm opacity-80">Soal: </span>
              <span className="font-bold text-sm sm:text-lg">
                {currentQuestionIndex + 1}/{gameData?.quiz?.questions?.length || 0}
              </span>
            </div>

            {/* Timer Display - Same condition as host for stability */}
            {timerMode !== 'none' && (
              <div className={`backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-lg sm:text-xl transition-all ${
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
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key="question"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8"
          >
            {quizCompleted ? (
              /* Quiz Completed - Show completion modal */
              <div className="text-center py-8 sm:py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-6xl sm:text-8xl mb-4 sm:mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Kuis Selesai!
                </h2>
                <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-6">
                  Anda telah menyelesaikan semua soal
                </p>
                <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-2">
                    {myScore}
                  </div>
                  <div className="text-base sm:text-lg text-gray-700">
                    Skor Akhir Anda
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Terima kasih telah mengikuti kuis ini!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(isGuest ? '/' : '/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isGuest ? 'Kembali ke Beranda' : 'Kembali ke Dashboard'}
                </motion.button>
              </div>
            ) : (
              <>
              {/* Question */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                    {(() => {
                      const type = currentQuestion?.questionType;
                      if (type === 'multiple-answer') return 'Multiple Answer';
                      if (type === 'multiple-choice' || type === 'Pilihan Ganda') return 'Multiple Choice';
                      if (type === 'true-false' || type === 'Benar Salah') return 'True/False';
                      if (type === 'short-answer' || type === 'Isian') return 'Fill in the Blank';
                      return type || 'Multiple Choice';
                    })()}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {currentQuestion?.points || 1} poin
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
                  {currentQuestion?.question}
                </h2>

                {/* Question Image */}
                {currentQuestion?.imageData && (
                  <div className="mb-4 sm:mb-6">
                    <img
                      src={currentQuestion.imageData}
                      alt="Question"
                      className="max-w-full h-auto rounded-xl shadow-lg max-h-96 mx-auto"
                    />
                  </div>
                )}
              </div>

              {/* Answer Options - Always show, just disable when answered */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
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
                    
                    // Warna untuk pilihan ganda
                    const COLORS = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200'];
                    const bgColor = COLORS[index % COLORS.length];
                    
                    return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                    whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={hasAnswered}
                    className={`w-full p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md transition-all text-left ${bgColor} ${
                      isSelected
                        ? 'ring-4 ring-blue-500'
                        : 'hover:shadow-lg'
                    } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <span className="text-gray-800 font-bold text-sm sm:text-base md:text-lg break-words">{option}</span>
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-600'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
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
                      className={`w-full p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                        selectedAnswer === 'True'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-green-300'
                      } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg ${
                            selectedAnswer === 'True'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          ✓
                        </div>
                        <span className="text-gray-800 font-medium text-sm sm:text-base md:text-lg">Benar</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                      whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                      onClick={() => handleAnswerSelect('False')}
                      disabled={hasAnswered}
                      className={`w-full p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 transition-all text-left ${
                        selectedAnswer === 'False'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50 hover:border-red-300'
                      } ${hasAnswered ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg ${
                            selectedAnswer === 'False'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          ✗
                        </div>
                        <span className="text-gray-800 font-medium text-sm sm:text-base md:text-lg">Salah</span>
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
                      placeholder="Ketik jawaban Anda..."
                      className={`w-full p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 transition-all text-base sm:text-lg ${
                        selectedAnswer
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      } ${hasAnswered ? 'cursor-not-allowed opacity-60' : ''}`}
                    />
                  </div>
                )}
              </div>

              {/* Info untuk player: jawaban auto-save */}
              {timerMode === 'per-question' && !hasAnswered && selectedAnswer && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
                    <span className="text-lg">✓</span>
                    <span className="font-medium">Jawaban tersimpan! Tunggu waktu habis untuk lanjut...</span>
                  </div>
                </div>
              )}

              {/* Navigation Buttons HANYA untuk Total Time dan None Mode */}
              {(timerMode === 'total-time' || timerMode === 'none') && !quizCompleted && (
                <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
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
                    className={`flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all ${
                      currentQuestionIndex > 0
                        ? 'bg-gray-500 hover:bg-gray-600 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ← Kembali
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
                    className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all"
                  >
                    {currentQuestionIndex < (gameData?.quiz?.questions?.length || 0) - 1 
                      ? 'Lanjut →' 
                      : 'Selesai 🎉'}
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
