import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { quizService } from '../services/quizService'
import { learningService } from '../services/learningService'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const TakeQuizPage = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const location = useLocation()
  const quizData = location.state?.quiz
  const { toast, showError, hideToast } = useToast()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [progressId, setProgressId] = useState(null)
  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false)
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(0) // Time left for current question
  const [totalTimeSpent, setTotalTimeSpent] = useState(0) // Total time spent on quiz
  const [questionStartTime, setQuestionStartTime] = useState(Date.now()) // When current question started
  const [timePerQuestion, setTimePerQuestion] = useState({}) // Track time spent per question
  const [timerMode, setTimerMode] = useState('per-question') // 'none', 'per-question', 'total-time'
  const [totalQuizTime, setTotalQuizTime] = useState(0) // Total time for entire quiz (if total-time mode)
  const [timerEndTime, setTimerEndTime] = useState(null) // Absolute end time based on system time

  // Fetch quiz data from API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        console.log('Fetching quiz with ID:', quizId)
        const response = await quizService.getQuizById(quizId)
        console.log('Quiz response:', response)
        console.log('📋 Full Quiz Data:', JSON.stringify(response, null, 2))
        const quizData = response
        setQuiz(quizData)

        // Format questions from database to UI format
        const formattedQuestions = quizData.questions.map((q, index) => {
          // Normalize question type
          let questionType = q.questionType
          if (questionType === 'multiple-choice') questionType = 'Pilihan Ganda'
          if (questionType === 'multiple-answer') questionType = 'Pilihan Ganda'
          if (questionType === 'true-false') questionType = 'Benar Salah'
          if (questionType === 'short-answer') questionType = 'Isian'

          // Determine if multiple answers are allowed
          const isMulti = Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1

          return {
            id: index + 1,
            _id: q._id, // Store MongoDB _id for submission
            question: q.question,
            image: q.imageData || null, // Use base64 image data
            type: questionType,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            acceptedAnswers: q.acceptedAnswers || [],
            multi: isMulti,
            timeLimit: q.timeLimit || 30
          }
        })

        console.log('Formatted questions:', formattedQuestions)
        setQuestions(formattedQuestions)
        
        // Determine timer mode and initialize
        const mode = quizData.timerMode || 'per-question'
        setTimerMode(mode)
        
        console.log('🎮 Quiz Timer Info:', {
          timerMode: mode,
          totalTime: quizData.totalTime,
          totalTimeType: typeof quizData.totalTime,
          questionCount: formattedQuestions.length
        })
        
        // Don't set timer yet - wait until we check for saved progress first
        let initialEndTime = null
        
        if (mode === 'total-time') {
          // Total time mode - calculate end time
          const totalTime = quizData.totalTime && quizData.totalTime > 0 
            ? quizData.totalTime 
            : (formattedQuestions.length * 30) // Default 30s per question
          console.log('⏱️ Total Time Mode - Setting timer to:', totalTime, 'seconds')
          setTotalQuizTime(totalTime)
          initialEndTime = Date.now() + (totalTime * 1000)
        } else if (formattedQuestions.length > 0) {
          // Per question mode - use first question's time limit
          const questionTime = formattedQuestions[0].timeLimit
          initialEndTime = Date.now() + (questionTime * 1000)
        }
        
        setQuestionStartTime(Date.now())
        
        // Check for saved progress
        try {
          console.log('🔍 Checking for saved progress for quiz:', quizId)
          const progressResponse = await learningService.getProgress(quizId)
          console.log('📡 Progress response:', progressResponse)
          
          if (progressResponse && progressResponse.data && progressResponse.data.progress) {
            const progress = progressResponse.data.progress
            console.log('📥 ✅ FOUND SAVED PROGRESS:', {
              currentQuestionIndex: progress.currentQuestionIndex,
              answersCount: progress.answers?.length,
              timeLeft: progress.timeLeft,
              timerMode: progress.timerMode
            })
            
            // Restore progress
            setProgressId(progress.id)
            
            // Restore answers - PENTING: Set dulu sebelum restore question
            const restoredAnswers = {}
            progress.answers.forEach((ans) => {
              const qIndex = formattedQuestions.findIndex(q => q._id === ans.questionId.toString())
              if (qIndex !== -1) {
                restoredAnswers[qIndex] = ans.userAnswer
                console.log(`✅ Restored answer for Q${qIndex + 1}:`, ans.userAnswer)
              }
            })
            
            console.log('📦 All restored answers:', restoredAnswers)
            setAnswers(restoredAnswers)
            
            // PENTING: Kembali ke soal yang terakhir dikerjakan (bukan soal 1)
            // Gunakan progress.currentQuestionIndex yang tersimpan
            const targetQuestion = progress.currentQuestionIndex
            const answeredQuestions = Object.keys(restoredAnswers).length
            
            console.log(`📌 ✨ RESTORED: Melanjutkan dari soal ${targetQuestion + 1} (${answeredQuestions} soal sudah dijawab dari ${formattedQuestions.length} total)`)
            
            // Set current question ke soal yang terakhir dikerjakan
            setCurrentQuestion(targetQuestion)
            
            // Restore timer state - IKUTI JAM LAPTOP (system time)
            if (progress.quizEndTime) {
              // Gunakan absolute end time yang tersimpan
              const endTime = new Date(progress.quizEndTime).getTime()
              const now = Date.now()
              const remainingMs = endTime - now
              const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
              
              setTimerEndTime(endTime)
              setTimeLeft(remainingSeconds)
              
              const startTime = new Date(progress.startedAt).getTime()
              const elapsedSeconds = Math.floor((now - startTime) / 1000)
              setTotalTimeSpent(elapsedSeconds)
              
              console.log('⏱️ Timer restored from absolute end time:', {
                endTime: new Date(endTime).toISOString(),
                now: new Date(now).toISOString(),
                remainingSeconds,
                mode
              })
            } else if (progress.startedAt && mode === 'total-time') {
              // FALLBACK: Hitung dari startedAt jika quizEndTime tidak ada
              const startTime = new Date(progress.startedAt).getTime()
              const now = Date.now()
              const totalTime = quizData.totalTime || (formattedQuestions.length * 30)
              const endTime = startTime + (totalTime * 1000)
              const remainingMs = endTime - now
              const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
              
              setTimerEndTime(endTime)
              setTimeLeft(remainingSeconds)
              setTotalTimeSpent(Math.floor((now - startTime) / 1000))
              
              console.log('⏱️ Timer calculated from startedAt:', {
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                remainingSeconds
              })
            } else if (mode === 'per-question') {
              // Per-question mode: gunakan timeLeft tersimpan atau set timer baru
              if (progress.timeLeft && targetQuestion === progress.currentQuestionIndex) {
                // Restore timer HANYA jika masih di soal yang sama
                setTimeLeft(progress.timeLeft)
                setTimerEndTime(Date.now() + (progress.timeLeft * 1000))
                console.log('⏱️ Per-question mode restored:', progress.timeLeft, 'seconds')
              } else {
                // Set timer baru untuk soal ini
                const questionTime = formattedQuestions[targetQuestion]?.timeLimit || 30
                const newEndTime = Date.now() + (questionTime * 1000)
                setTimeLeft(questionTime)
                setTimerEndTime(newEndTime)
                setHasUnsavedProgress(true)
                console.log('⏱️ New timer for question', targetQuestion + 1, ':', questionTime, 'seconds')
              }
              
              if (progress.totalTimeSpent) {
                setTotalTimeSpent(progress.totalTimeSpent)
              }
            }
            
            if (progress.totalTimeSpent) {
              setTotalTimeSpent(progress.totalTimeSpent)
            }
            
            // No notification - langsung lanjut otomatis
            console.log('✅ Progress restored - continuing from question', progress.currentQuestionIndex + 1, 'of', progress.totalQuestions)
          } else {
            // No saved progress - set initial timer and mark for save
            console.log('🆕 Starting NEW quiz - no saved progress found')
            if (initialEndTime) {
              setTimerEndTime(initialEndTime)
              const remainingSeconds = Math.ceil((initialEndTime - Date.now()) / 1000)
              setTimeLeft(remainingSeconds)
              console.log('⏱️ New quiz - timer set to', remainingSeconds, 'seconds, endTime:', new Date(initialEndTime).toISOString())
            }
            // Mark as unsaved to trigger first auto-save
            setHasUnsavedProgress(true)
            
            // FORCE SAVE untuk quiz baru - buat initial progress entry
            setTimeout(async () => {
              console.log('💾 FORCE SAVE: Creating initial progress entry')
              const answersArray = []
              const currentTimeLeft = initialEndTime ? Math.ceil((initialEndTime - Date.now()) / 1000) : 0
              console.log('💾 Saving with timeLeft:', currentTimeLeft, 'timerMode:', mode, 'endTime:', initialEndTime ? new Date(initialEndTime).toISOString() : null)
              const response = await learningService.saveProgress(
                quizId,
                0, // Start dari soal pertama
                answersArray,
                formattedQuestions.length,
                currentTimeLeft,
                mode,
                0, // totalTimeSpent starts at 0
                initialEndTime || null
              )
              if (response.data && response.data.progressId) {
                setProgressId(response.data.progressId)
                console.log('✅ Initial progress saved with ID:', response.data.progressId)
              }
            }, 1000) // Delay 1 detik untuk pastikan state sudah ter-set
          }
        } catch (err) {
          console.log('⚠️ No saved progress found or error loading:', err.message || err)
          // Set initial timer if no progress found
          if (initialEndTime) {
            setTimerEndTime(initialEndTime)
            const remainingSeconds = Math.ceil((initialEndTime - Date.now()) / 1000)
            setTimeLeft(remainingSeconds)
            console.log('⏱️ New quiz (error fallback) - timer set to', remainingSeconds, 'seconds, endTime:', new Date(initialEndTime).toISOString())
          }
          // Mark as unsaved to trigger first auto-save
          setHasUnsavedProgress(true)
          
          // FORCE SAVE untuk quiz baru - buat initial progress entry
          setTimeout(async () => {
            console.log('💾 FORCE SAVE (error fallback): Creating initial progress entry')
            const answersArray = []
            const currentTimeLeft = initialEndTime ? Math.ceil((initialEndTime - Date.now()) / 1000) : 0
            console.log('💾 Saving with timeLeft:', currentTimeLeft, 'timerMode:', mode, 'endTime:', initialEndTime ? new Date(initialEndTime).toISOString() : null)
            const response = await learningService.saveProgress(
              quizId,
              0, // Start dari soal pertama
              answersArray,
              formattedQuestions.length,
              currentTimeLeft,
              mode,
              0, // totalTimeSpent starts at 0
              initialEndTime || null
            )
            if (response.data && response.data.progressId) {
              setProgressId(response.data.progressId)
              console.log('✅ Initial progress saved with ID:', response.data.progressId)
            }
          }, 1000) // Delay 1 detik untuk pastikan state sudah ter-set
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching quiz:', err)
        setError('Gagal memuat kuis. Silakan coba lagi.')
        setLoading(false)
      }
    }

    if (quizId) {
      fetchQuiz()
    } else {
      console.error('No quizId provided')
      setError('Quiz ID tidak ditemukan')
      setLoading(false)
    }
  }, [quizId])

  // Timer countdown effect - using system time for accuracy
  useEffect(() => {
    if (loading || quizFinished || !questions.length) return
    
    // Skip timer if mode is 'none'
    if (timerMode === 'none') {
      // Still track total time without countdown
      const timer = setInterval(() => {
        setTotalTimeSpent((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }

    // Use system time to calculate remaining time accurately
    const timer = setInterval(() => {
      const now = Date.now()
      
      if (!timerEndTime) {
        console.warn('⚠️ timerEndTime not set')
        return
      }
      
      const remainingMs = timerEndTime - now
      const remainingSec = Math.ceil(remainingMs / 1000)
      
      if (remainingSec <= 0) {
        // Time's up - different handling based on mode
        setTimeLeft(0)
        clearInterval(timer)
        
        if (timerMode === 'total-time') {
          // Total time mode - auto submit immediately
          console.log('⏰ Total time expired - auto submitting')
          calculateScoreAndSubmit()
        } else {
          // Per question mode - auto advance
          console.log('⏰ Question time expired - auto advancing')
          handleTimeUp()
        }
      } else {
        setTimeLeft(remainingSec)
      }
      
      // Track total time
      setTotalTimeSpent((prev) => prev + 1)
    }, 100) // Update every 100ms for smoother display, calculate from system time

    return () => clearInterval(timer)
  }, [currentQuestion, loading, quizFinished, questions.length, timerMode, timerEndTime])

  // Auto-save when hasUnsavedProgress changes (instant save)
  useEffect(() => {
    if (loading || quizFinished || !questions.length) return
    if (!hasUnsavedProgress) return
    
    // Debounce save untuk avoid multiple calls terlalu cepat
    const saveTimeout = setTimeout(async () => {
      console.log('💾 Auto-save triggered (answer changed)')
      await saveCurrentProgress()
    }, 500) // Delay 500ms untuk debounce

    return () => clearTimeout(saveTimeout)
  }, [hasUnsavedProgress])

  // Save progress before page unload (browser close/reload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedProgress && !quizFinished) {
        // Simpan progress untuk semua mode
        console.log('🚪 Page unload - saving progress')
        // Use navigator.sendBeacon for reliable save on page unload
        saveCurrentProgress()
        // Note: Modern browsers may not allow async operations here
        // So we also rely on the instant auto-save when answers change
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedProgress, quizFinished])

  // Handle time up for current question (per-question mode only)
  const handleTimeUp = () => {
    // Save time spent on this question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    setTimePerQuestion(prev => ({
      ...prev,
      [currentQuestion]: timeSpent
    }))

    // PENTING: Jika belum dijawab, jangan set jawaban sama sekali
    // Biarkan undefined agar di kalkulasi skor dianggap salah
    if (answers[currentQuestion] === undefined) {
      console.log('⏰ Time up - Question', currentQuestion + 1, 'remains unanswered (undefined) - will be counted as wrong')
    }

    // Auto advance to next question or finish
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      const nextQuestionTime = questions[currentQuestion + 1].timeLimit
      const newEndTime = Date.now() + (nextQuestionTime * 1000)
      setTimeLeft(nextQuestionTime)
      setTimerEndTime(newEndTime)
      setHasUnsavedProgress(true) // Mark untuk trigger auto-save dengan endTime baru
      setQuestionStartTime(Date.now())
      console.log('⏰ Time up - moved to next question, newEndTime:', new Date(newEndTime).toISOString())
    } else {
      // Last question - auto submit
      calculateScoreAndSubmit()
    }
  }

  const COLORS = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200']
  const currentQ = questions[currentQuestion]
  const currentAnswer = answers[currentQuestion]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
          <p className="text-white text-2xl font-bold">Memuat kuis...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-blue-200 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full shadow-2xl text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // No questions found
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-blue-200 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full shadow-2xl text-center">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Kosong</h1>
          <p className="text-gray-600 mb-8">Quiz ini belum memiliki soal.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-md"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Calculate score and prepare submission data
  const calculateScoreAndSubmit = async () => {
    let correct = 0
    const submissionAnswers = []

    questions.forEach((q, index) => {
      const userAnswer = answers[index]
      let isCorrect = false
      let formattedAnswer = userAnswer

      console.log(`\n🔍 Question ${index + 1}:`, {
        type: q.type,
        multi: q.multi,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer
      })

      if (q.type === 'Pilihan Ganda' && q.multi) {
        // Multiple choice - harus exact match
        const correctArr = Array.isArray(q.correctAnswer) 
          ? q.correctAnswer.sort() 
          : [q.correctAnswer].sort()
        const userArr = Array.isArray(userAnswer) ? userAnswer.sort() : []
        isCorrect = JSON.stringify(correctArr) === JSON.stringify(userArr)
        formattedAnswer = userArr
        console.log('Multiple choice:', { correctArr, userArr, isCorrect })
      } else if (q.type === 'Pilihan Ganda' && !q.multi) {
        // Single choice
        const correctIndex = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer
        const userIndex = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
        isCorrect = userIndex === correctIndex
        formattedAnswer = userIndex
        console.log('Single choice:', { correctIndex, userIndex, isCorrect })
      } else if (q.type === 'Benar Salah') {
        // True/False - handle both string and boolean
        // PENTING: Jika tidak dijawab (null/undefined), otomatis salah
        if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
          isCorrect = false
          formattedAnswer = null
          console.log('True/False: Tidak dijawab - otomatis salah')
        } else {
          const correctBool = q.correctAnswer === true || q.correctAnswer === 'true' || q.correctAnswer === true
          const userBool = userAnswer === true || userAnswer === 'true' || userAnswer === 'Benar'
          isCorrect = correctBool === userBool
          formattedAnswer = userAnswer
          console.log('True/False:', { correct: q.correctAnswer, user: userAnswer, correctBool, userBool, isCorrect })
        }
      } else if (q.type === 'Isian') {
        // Short answer - case insensitive
        // PENTING: Jika tidak dijawab atau kosong, otomatis salah
        if (!userAnswer || typeof userAnswer !== 'string' || userAnswer.trim() === '') {
          isCorrect = false
          formattedAnswer = ''
          console.log('Short answer: Tidak dijawab atau kosong - otomatis salah')
        } else if (q.acceptedAnswers && q.acceptedAnswers.length > 0) {
          isCorrect = q.acceptedAnswers.some(
            ans => ans.toLowerCase() === userAnswer.toLowerCase().trim()
          )
          formattedAnswer = userAnswer.trim()
          console.log('Short answer:', { accepted: q.acceptedAnswers, user: userAnswer, isCorrect })
        } else {
          // Jika tidak ada acceptedAnswers, anggap salah
          isCorrect = false
          formattedAnswer = userAnswer.trim()
          console.log('Short answer: No accepted answers defined')
        }
      }

      console.log(`Result: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`)

      if (isCorrect) {
        correct++
      }

      // Get the question _id from formatted questions
      submissionAnswers.push({
        questionId: questions[index]._id,
        answer: formattedAnswer,
        timeSpent: 0 // Could track time per question if needed
      })
    })

    const percentage = Math.round((correct / questions.length) * 100)
    setScore(percentage)
    setCorrectCount(correct)

    console.log('📊 Submission data:', {
      quizId,
      totalQuestions: questions.length,
      correctAnswers: correct,
      percentage,
      answers: submissionAnswers
    })

    // Submit to backend
    try {
      setSubmitting(true)
      const response = await learningService.submitLearning(quizId, submissionAnswers, progressId)
      console.log('✅ Submission successful:', response)
      setSubmitting(false)
      setQuizFinished(true)
      setHasUnsavedProgress(false)
    } catch (error) {
      console.error('❌ Error submitting quiz:', error)
      setSubmitting(false)
      // Still show results even if submission fails
      setQuizFinished(true)
      showError('Gagal menyimpan hasil ke server, tapi hasil tetap ditampilkan.')
    }
  }

  // Auto-save progress
  const saveCurrentProgress = async () => {
    if (!quiz || questions.length === 0) return
    if (submitting) return // Don't save if quiz is being submitted
    
    try {
      // Convert answers to backend format
      const answersArray = Object.entries(answers).map(([index, answer]) => ({
        questionId: questions[parseInt(index)]._id,
        userAnswer: answer,
        isCorrect: false, // Will be calculated on submit
        timeSpent: 0
      }))
      
      // PENTING: Simpan index soal yang SEDANG dikerjakan
      // Gunakan currentQuestion karena itu yang sedang aktif
      const questionIndexToSave = currentQuestion
      
      console.log('💾 Saving progress with:', {
        quizId,
        currentQuestion: questionIndexToSave,
        processedCount: Object.keys(answers).length,
        totalQuestions: questions.length,
        timeLeft,
        timerMode,
        totalTimeSpent,
        timerEndTime: timerEndTime ? new Date(timerEndTime).toISOString() : null
      })
      
      const response = await learningService.saveProgress(
        quizId,
        questionIndexToSave, // Simpan index soal yang sedang dikerjakan
        answersArray,
        questions.length,
        timeLeft,
        timerMode,
        totalTimeSpent,
        timerEndTime // Kirim absolute end time ke backend
      )
      
      if (response.data && response.data.progressId) {
        setProgressId(response.data.progressId)
      }
      
      setHasUnsavedProgress(false)
      console.log('✅ Progress saved successfully - will restore to question', questionIndexToSave + 1)
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (currentQ.multi) {
      const current = answers[currentQuestion] || []
      if (current.includes(optionIndex)) {
        setAnswers({
          ...answers,
          [currentQuestion]: current.filter(i => i !== optionIndex)
        })
      } else {
        setAnswers({
          ...answers,
          [currentQuestion]: [...current, optionIndex]
        })
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion]: [optionIndex]
      })
    }
    
    // Trigger save after answer is set
    setHasUnsavedProgress(true)
  }

  // Handle true/false
  const handleTrueFalse = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    })
    
    // Trigger save after answer is set
    setHasUnsavedProgress(true)
  }

  // Handle next
  const handleNext = async () => {
    // Save time spent on current question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    setTimePerQuestion(prev => ({
      ...prev,
      [currentQuestion]: timeSpent
    }))

    if (currentQuestion < questions.length - 1) {
      const nextQuestionIndex = currentQuestion + 1
      
      console.log(`➡️ Moving from Q${currentQuestion + 1} to Q${nextQuestionIndex + 1}`)
      
      // PENTING: Pindah ke soal berikutnya DULU
      setCurrentQuestion(nextQuestionIndex)
      
      // Reset timer based on mode - PENTING: waktu soal sebelumnya HABIS, tidak bisa balik
      if (timerMode === 'per-question') {
        // Per-question mode: MULAI TIMER BARU untuk soal berikutnya
        const nextQuestionTime = questions[nextQuestionIndex].timeLimit
        const newEndTime = Date.now() + (nextQuestionTime * 1000)
        setTimeLeft(nextQuestionTime)
        setTimerEndTime(newEndTime)
        setHasUnsavedProgress(true) // Mark untuk trigger auto-save dengan endTime baru
        console.log('⏱️ Next question - TIMER BARU:', nextQuestionTime, 'seconds (soal sebelumnya sudah tidak bisa diakses)')
      } else if (timerMode === 'total-time') {
        // Total-time mode: timer keeps counting down (don't update timerEndTime)
        setHasUnsavedProgress(true) // Mark untuk auto-save
        console.log('⏱️ Total-time mode: continuing countdown')
      } else {
        // No timer mode
        setHasUnsavedProgress(true) // Mark untuk auto-save
      }
      
      setQuestionStartTime(Date.now())
      
      // Auto-save akan trigger dalam 3 detik dari useEffect
      // Atau manual save saat beforeunload
    } else {
      // Last question - calculate and submit
      console.log('🏁 Last question - submitting quiz')
      calculateScoreAndSubmit()
    }
  }

  // Format time display (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Result screen
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-blue-200 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl p-12 max-w-2xl w-full shadow-2xl text-center">
            {submitting ? (
              <>
                <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                <p className="text-gray-700 text-xl font-bold">Menyimpan hasil...</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">
                  {score >= 80 ? '🎉' : score >= 60 ? '😊' : '📚'}
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Selesai!</h1>
                <div className="text-7xl font-black text-blue-600 mb-2">{score}%</div>
                <p className="text-xl text-gray-600 mb-8">
                  {score >= 80 ? 'Luar biasa!' : score >= 60 ? 'Bagus!' : 'Terus belajar!'}
                </p>

                <div className="bg-blue-100 rounded-xl p-6 mb-8">
                  <p className="text-sm text-gray-600 mb-2">Hasil Anda</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {correctCount} dari {questions.length} soal benar
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Waktu: {formatTime(totalTimeSpent)}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/belajar-mandiri')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md"
                  >
                    📚 Lihat Review
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-xl transition shadow-md"
                  >
                    ← Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-blue-200 flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 drop-shadow-lg">
              {quiz?.title || 'Quiz'}
            </h1>
            <p className="text-blue-800 text-sm">Soal {currentQuestion + 1} dari {questions.length}</p>
          </div>
          
          {/* Right side - Timer & Actions */}
          <div className="flex items-center gap-3">
            {/* Timer Display */}
            {timerMode !== 'none' && (
              <div className={`px-6 py-3 rounded-xl font-bold text-xl shadow-lg transition-all ${
                timeLeft <= 5 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : timeLeft <= 10 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white text-blue-900'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{timeLeft <= 10 ? '⏰' : '⏱️'}</span>
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="text-xs text-center mt-1 opacity-70">
                  {timerMode === 'total-time' ? 'Total Waktu' : `Soal ${currentQuestion + 1}`}
                </div>
              </div>
            )}
            
            {/* Exit Button - Responsive with tooltip */}
            <button
              onClick={async () => {
                if (timerMode === 'none') {
                  // Tanpa timer: Simpan progress dan keluar
                  await saveCurrentProgress()
                  navigate('/belajar-mandiri')
                } else {
                  // Dengan timer: Tandai soal yang belum dijawab sebagai null, lalu submit
                  // Fill semua soal yang belum dijawab dengan null
                  const completeAnswers = { ...answers }
                  for (let i = 0; i < questions.length; i++) {
                    if (!(i in completeAnswers)) {
                      completeAnswers[i] = null // Soal belum dijawab
                    }
                  }
                  setAnswers(completeAnswers)
                  
                  // Tunggu state update, lalu submit
                  setTimeout(async () => {
                    await calculateScoreAndSubmit()
                    navigate('/belajar-mandiri')
                  }, 100)
                }
              }}
              className="group relative bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              title={timerMode === 'none' ? 'Simpan & Keluar' : 'Submit & Keluar'}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🚪</span>
                <span className="hidden sm:inline">Keluar</span>
              </div>
              {/* Tooltip */}
              <div className="absolute -bottom-14 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
                <div className="font-semibold mb-0.5">
                  {timerMode === 'none' ? '💾 Progress Tersimpan' : '📤 Quiz Disubmit'}
                </div>
                <div className="text-gray-300 text-[10px]">
                  {timerMode === 'none' ? 'Bisa dilanjutkan nanti' : 'Masuk ke riwayat'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
            {/* Question Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {questions.map((_, index) => {
                // Cek status soal
                const isProcessed = index in answers // Sudah dikerjakan (dijawab atau time up)
                const userAnswer = answers[index]
                const isAnswered = userAnswer !== null && userAnswer !== undefined // Dijawab dengan benar
                const isTimeUp = userAnswer === null // Waktu habis, tidak dijawab
                const isCurrent = currentQuestion === index
                const isPast = index < currentQuestion // Soal yang sudah lewat
                
                // LOCK LOGIC: Hanya untuk per-question mode
                const isLocked = timerMode === 'per-question' 
                  ? (!isProcessed && !isCurrent && index > currentQuestion) // Per-question: lock soal selanjutnya yang belum dikerjakan
                  : false // Total-time & none: semua soal bisa diklik
                
                const canClick = timerMode === 'per-question' 
                  ? false // Per-question: tidak bisa klik tab, harus Next
                  : !isLocked // Total-time & none: bisa klik semua soal
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (canClick && !isCurrent) {
                        setCurrentQuestion(index)
                        // Update timer untuk per-question mode (tidak perlu karena sudah disabled)
                        // Untuk total-time dan none, timer tetap jalan
                      }
                    }}
                    disabled={!canClick}
                    className={`min-w-[60px] h-12 rounded-lg font-bold text-lg transition shadow-md relative ${
                      canClick && !isCurrent ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                    } ${
                      isCurrent
                        ? 'bg-blue-600 text-white scale-110'
                        : isAnswered
                        ? 'bg-green-400 text-green-900 opacity-80 hover:opacity-100'
                        : isTimeUp
                        ? 'bg-red-400 text-red-900 opacity-60'
                        : isProcessed
                        ? 'bg-gray-400 text-gray-900 opacity-60'
                        : isLocked
                        ? 'bg-gray-200 text-gray-400 opacity-50'
                        : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                    }`}
                  >
                    {index + 1}
                    {isLocked && (
                      <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                    )}
                    {isAnswered && (
                      <span className="absolute -top-1 -right-1 text-xs">✓</span>
                    )}
                    {isTimeUp && (
                      <span className="absolute -top-1 -right-1 text-xs">✗</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Question Box */}
            <div className="mb-6">
              {/* Question Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {(() => {
                    const type = currentQ.type;
                    if (type === 'Pilihan Ganda' && currentQ.multi) return 'Multiple Answer';
                    if (type === 'Pilihan Ganda') return 'Multiple Choice';
                    if (type === 'Benar Salah') return 'True/False';
                    if (type === 'Isian') return 'Fill in the Blank';
                    return type;
                  })()}
                </span>
                <span className="text-gray-500 text-sm font-semibold">
                  Soal {currentQuestion + 1} dari {questions.length}
                </span>
              </div>
              
              <div className="bg-gray-100 text-center text-lg font-semibold px-6 py-4 rounded-xl shadow-md text-gray-800">
                {currentQ.question}
              </div>
            </div>

            {/* Image Box - HANYA TAMPIL KALAU ADA */}
            {currentQ.image && (
              <div className="w-full flex justify-center mb-6">
                <div className="bg-gray-100 rounded-xl p-4 shadow-md">
                  <img
                    src={currentQ.image}
                    alt="Gambar Soal"
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              </div>
            )}

            {/* Pilihan Ganda */}
            {currentQ.type === 'Pilihan Ganda' && (
              <div className="mb-6">
                {currentQ.multi && (
                  <p className="text-sm font-semibold text-gray-600 mb-3">💡 Bisa pilih lebih dari satu</p>
                )}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {currentQ.options.map((option, index) => {
                    const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(index)
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`${COLORS[index]} p-6 rounded-xl font-bold text-lg flex items-center justify-between relative shadow-md cursor-pointer hover:shadow-lg transition group`}
                      >
                        <span>{option}</span>
                        <div
                          className={`w-8 h-8 border-2 flex items-center justify-center rounded-full transition ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-600'
                          }`}
                        >
                          {isSelected && <span className="text-white font-bold text-lg">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Benar Salah */}
            {currentQ.type === 'Benar Salah' && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => handleTrueFalse(true)}
                  className={`bg-green-400 p-6 rounded-2xl border-4 cursor-pointer transition hover:shadow-lg ${
                    currentAnswer === true ? 'border-green-700 shadow-lg' : 'border-green-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xl text-white">Benar</span>
                    {currentAnswer === true ? (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleTrueFalse(false)}
                  className={`bg-red-400 p-6 rounded-2xl border-4 cursor-pointer transition hover:shadow-lg ${
                    currentAnswer === false ? 'border-red-700 shadow-lg' : 'border-red-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xl text-white">Salah</span>
                    {currentAnswer === false ? (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Isian */}
            {currentQ.type === 'Isian' && (
              <div className="mb-6">
                <input
                  type="text"
                  value={currentAnswer || ''}
                  onChange={(e) => {
                    setHasUnsavedProgress(true)
                    setAnswers({ ...answers, [currentQuestion]: e.target.value })
                  }}
                  placeholder="Ketik jawaban kamu..."
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-blue-500 shadow-md"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
              <div className="text-gray-500 text-sm font-semibold">
                Soal {currentQuestion + 1} dari {questions.length}
              </div>

              {(() => {
                // Validasi jawaban berdasarkan tipe soal
                let isAnswered = false
                
                if (currentQ.type === 'Pilihan Ganda') {
                  // Multiple choice: harus ada minimal 1 pilihan
                  isAnswered = Array.isArray(currentAnswer) && currentAnswer.length > 0
                } else if (currentQ.type === 'Benar Salah') {
                  // True/False: harus pilih true atau false (tidak boleh null/undefined)
                  isAnswered = currentAnswer === true || currentAnswer === false
                } else if (currentQ.type === 'Isian') {
                  // Short answer: harus isi text (tidak boleh kosong)
                  isAnswered = typeof currentAnswer === 'string' && currentAnswer.trim().length > 0
                }
                
                return isAnswered ? (
                  <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md"
                  >
                    {currentQuestion < questions.length - 1 ? 'Selanjutnya →' : 'Selesai'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-400 text-gray-600 font-bold px-8 py-3 rounded-xl cursor-not-allowed opacity-50"
                  >
                    {currentAnswer === null ? 'Tidak Dijawab (Waktu Habis)' : 'Jawab dulu untuk lanjut'}
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </div>
  )
}

export default TakeQuizPage
