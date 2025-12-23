import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizService } from '../services/quizService'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > 1200 || height > 1200) {
          const ratio = width > height ? 1200 / width : 1200 / height
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressed = canvas.toDataURL('image/jpeg', 0.7)
        resolve(compressed)
      }
      img.onerror = () => reject(new Error('Image error'))
    }
    reader.onerror = () => reject(new Error('File read error'))
  })
}

const COLORS = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200']

const CreateQuizPage = () => {
  const navigate = useNavigate()
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast()
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('Bahasa')
  // Removed quizType - all quizzes support all question types and timer modes
  const [timerMode, setTimerMode] = useState('per-question')
  const [totalTime, setTotalTime] = useState(30)
  const [creatorName, setCreatorName] = useState('Anonymous')
  const [questions, setQuestions] = useState([
    {
      question: '',
      image: null,
      imagePreview: null,
      options: ['', '', '', ''],
      correct: [false, false, false, false],
      duration: 30,
      useTime: true,
      type: 'Pilihan Ganda',
      multi: false,
      trueFalseAnswer: null,
      acceptedAnswers: []
    }
  ])
  const [activeIdx, setActiveIdx] = useState(0)
  const [saving, setSaving] = useState(false)

  const categories = ['Bahasa', 'Sains', 'Matematika', 'Biologi', 'Sejarah', 'Geografi', 'Olahraga', 'Umum']

  // Load creator name from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCreatorName(user.fullName || user.name || 'Anonymous')
      } catch (error) {
        console.error('Error parsing user:', error)
      }
    }
  }, [])

  const updateQuestion = (field, value, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx][field] = value
    setQuestions(arr)
  }

  const updateQuestionType = (newType, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]

    if (newType === 'Pilihan Ganda') {
      if (!arr[idx].options || arr[idx].options.length === 0) {
        arr[idx].options = ['', '', '', '']
        arr[idx].correct = [false, false, false, false]
      }
      arr[idx].multi = false
      arr[idx].trueFalseAnswer = null
      arr[idx].acceptedAnswers = []
    } else if (newType === 'Isian') {
      if (!arr[idx].acceptedAnswers || arr[idx].acceptedAnswers.length === 0) {
        arr[idx].acceptedAnswers = ['']
      }
      arr[idx].options = []
      arr[idx].correct = []
      arr[idx].trueFalseAnswer = null
    } else if (newType === 'Benar Salah') {
      if (arr[idx].trueFalseAnswer === null) {
        arr[idx].trueFalseAnswer = false
      }
      arr[idx].options = []
      arr[idx].correct = []
      arr[idx].acceptedAnswers = []
    }

    arr[idx].type = newType
    setQuestions(arr)
  }

  const updateOption = (i, value, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].options[i] = value
    setQuestions(arr)
  }

  const addOption = (idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].options.push('')
    arr[idx].correct.push(false)
    setQuestions(arr)
  }

  const removeOption = (i, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const currentQuestion = questions[idx]
    
    // Pilihan Ganda harus selalu 4 opsi
    if (currentQuestion.type === 'Pilihan Ganda' && currentQuestion.options.length <= 4) {
      showWarning('Pilihan Ganda harus memiliki 4 pilihan!')
      return
    }
    
    if (currentQuestion.options.length <= 2) {
      showWarning('Minimal harus ada 2 pilihan!')
      return
    }
    const arr = [...questions]
    arr[idx].options.splice(i, 1)
    arr[idx].correct.splice(i, 1)
    setQuestions(arr)
  }

  const toggleCorrect = (i, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    if (arr[idx].multi) {
      arr[idx].correct[i] = !arr[idx].correct[i]
    } else {
      arr[idx].correct = arr[idx].correct.map((_, idx2) => idx2 === i)
    }
    console.log('✅ Toggle correct:', {
      option: i,
      multi: arr[idx].multi,
      correctArray: arr[idx].correct
    });
    setQuestions(arr)
  }

  const uploadImage = async (e, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const file = e.target.files[0]
    if (!file) return

    try {
      const arr = [...questions]
      arr[idx].image = file
      const compressedBase64 = await compressImage(file)
      arr[idx].imagePreview = compressedBase64
      setQuestions([...arr])
    } catch (error) {
      showError('Error: ' + error.message)
    }
  }

  const removeImage = (idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].image = null
    arr[idx].imagePreview = null
    setQuestions(arr)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        image: null,
        imagePreview: null,
        options: ['', '', '', ''],
        correct: [false, false, false, false],
        duration: 30,
        useTime: true,
        type: 'Pilihan Ganda',
        multi: false,
        trueFalseAnswer: null,
        acceptedAnswers: []
      }
    ])
    setActiveIdx(questions.length)
  }

  const deleteQuestion = (idx) => {
    if (questions.length === 1) {
      showWarning('Minimal harus ada 1 soal!')
      return
    }
    const arr = questions.filter((_, i) => i !== idx)
    setQuestions(arr)
    setActiveIdx(Math.max(0, idx - 1))
  }

  const setMulti = (value, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].multi = value
    if (!value) {
      const correctIdx = arr[idx].correct.findIndex((v) => v)
      arr[idx].correct = arr[idx].correct.map((_, idx2) => idx2 === correctIdx)
    }
    setQuestions(arr)
  }

  const setTrueFalse = (value, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].trueFalseAnswer = value === true ? true : false
    setQuestions(arr)
  }

  const addAcceptedAnswer = (idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].acceptedAnswers.push('')
    setQuestions(arr)
  }

  const updateAcceptedAnswer = (i, value, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].acceptedAnswers[i] = value
    setQuestions(arr)
  }

  const removeAcceptedAnswer = (i, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    if (questions[idx].acceptedAnswers.length <= 1) {
      showWarning('Minimal harus ada 1 jawaban!')
      return
    }
    const arr = [...questions]
    arr[idx].acceptedAnswers.splice(i, 1)
    setQuestions(arr)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!quizTitle.trim()) {
      showWarning('Judul kuis harus diisi!')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        showWarning(`Soal ${i + 1}: Pertanyaan harus diisi!`)
        return
      }

      if (q.type === 'Pilihan Ganda') {
        const emptyOptions = q.options.filter((opt) => !opt.trim())
        if (emptyOptions.length > 0) {
          showWarning(`Soal ${i + 1}: Semua pilihan jawaban harus diisi!`)
          return
        }
        const hasCorrect = q.correct.some((c) => c)
        if (!hasCorrect) {
          showWarning(`Soal ${i + 1}: Pilih minimal satu jawaban yang benar!`)
          return
        }
      } else if (q.type === 'Isian') {
        const hasAccepted = q.acceptedAnswers && q.acceptedAnswers.length > 0 && q.acceptedAnswers.some((a) => a.trim())
        if (!hasAccepted) {
          showWarning(`Soal ${i + 1}: Tambahkan minimal satu jawaban!`)
          return
        }
      } else if (q.type === 'Benar Salah') {
        if (q.trueFalseAnswer === null) {
          showWarning(`Soal ${i + 1}: Pilih jawaban Benar atau Salah!`)
          return
        }
      }
    }

    try {
      setSaving(true)

      const formattedQuestions = questions.map((q) => {
        let questionData = {
          question: q.question,
          timeLimit: timerMode === 'per-question' ? q.duration : null,
          questionType: q.type === 'Pilihan Ganda'
            ? q.multi ? 'multiple-answer' : 'multiple-choice'
            : q.type === 'Isian' ? 'short-answer' : 'true-false',
          points: 1 // Default 1 point per question
        }

        if (q.type === 'Pilihan Ganda') {
          questionData.options = q.options
          
          // Get correct answer indices
          if (q.multi) {
            // Multiple answer - get all indices where correct is true
            const correctIndices = q.correct
              .map((c, idx) => (c ? idx : -1))
              .filter((idx) => idx !== -1)
            
            console.log('💾 Saving Multiple Answer:', {
              question: q.question?.substring(0, 30),
              multi: q.multi,
              correctArray: q.correct,
              correctIndices
            });
            
            questionData.correctAnswer = correctIndices
          } else {
            // Single answer - get index of the first true value
            const correctIndex = q.correct.findIndex((c) => c)
            
            console.log('💾 Saving Single Choice:', {
              question: q.question?.substring(0, 30),
              multi: q.multi,
              correctArray: q.correct,
              correctIndex
            });
            
            questionData.correctAnswer = correctIndex
          }
        } else if (q.type === 'Isian') {
          const filteredAnswers = q.acceptedAnswers.filter((a) => a.trim())
          questionData.acceptedAnswers = filteredAnswers
          // Set correctAnswer to first accepted answer
          questionData.correctAnswer = filteredAnswers.length > 0 ? filteredAnswers[0] : ''
        } else if (q.type === 'Benar Salah') {
          questionData.correctAnswer = q.trueFalseAnswer ? 'True' : 'False'
        }

        if (q.imagePreview) {
          questionData.imageData = q.imagePreview
          questionData.imageName = q.image?.name || 'image'
        }

        return questionData
      })

      const quizData = {
        title: quizTitle,
        description: `Kategori: ${quizCategory}`,
        category: quizCategory,
        timerMode: timerMode,
        totalTime: timerMode === 'total-time' ? totalTime * 60 : null,
        questions: formattedQuestions
      }

      console.log('📤 Creating quiz with data:', {
        timerMode: quizData.timerMode,
        totalTime: quizData.totalTime,
        questionCount: quizData.questions.length
      })

      await quizService.createQuiz(quizData)
      showSuccess('Quiz berhasil disimpan! 🎉')
      navigate('/my-quizzes')
    } catch (err) {
      console.error('Error:', err)
      showError('Gagal menyimpan quiz. Coba lagi.\n' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  const q = questions[activeIdx]

  return (
    <div className="min-h-screen bg-blue-200 flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 drop-shadow-lg">Buat Kuis Baru</h1>
            <p className="text-blue-800 text-xs sm:text-sm">Rancang pertanyaan yang menarik untuk peserta didik</p>
          </div>
          <button
            onClick={() => navigate('/my-quizzes')}
            className="bg-white/40 hover:bg-white/60 text-blue-900 px-4 sm:px-5 py-2 rounded-lg transition font-semibold text-sm sm:text-base"
          >
            ← Kembali
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 pb-4 sm:pb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto shadow-xl">
            {/* JUDUL & KATEGORI INPUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Kuis</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Masukkan judul kuis..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                <select
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 font-semibold focus:outline-none focus:border-blue-500"
                >
                  {['Bahasa', 'Sains', 'Matematika', 'Biologi', 'Sejarah', 'Geografi', 'Olahraga', 'Umum'].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pembuat</label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-blue-600">👤</span>
                  {creatorName}
                </div>
              </div>
            </div>

            {/* TIMER SETTINGS */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="font-bold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <span className="text-lg sm:text-xl">⏱️</span> Pengaturan Waktu
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mode Timer</label>
                  <select
                    value={timerMode}
                    onChange={(e) => {
                      const val = e.target.value
                      setTimerMode(val)
                      
                      // Auto-set useTime based on timer mode
                      if (val === 'per-question') {
                        // When switching to per-question, enable time for all questions
                        setQuestions(prev => prev.map(q => ({ ...q, useTime: true, duration: q.duration || 30 })))
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">Tanpa Batas Waktu</option>
                    <option value="per-question">Timer Per Soal</option>
                    <option value="total-time">Total Waktu Kuis</option>
                  </select>
                </div>
                {timerMode === 'total-time' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Waktu (Menit)</label>
                    <input
                      type="number"
                      value={totalTime}
                      onChange={(e) => setTotalTime(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-800 font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {timerMode === 'none' && '✓ Siswa dapat mengerjakan tanpa batasan waktu'}
                {timerMode === 'per-question' && '✓ Setiap soal memiliki timer terpisah sesuai durasi yang ditentukan'}
                {timerMode === 'total-time' && '✓ Siswa memiliki waktu total untuk mengerjakan semua soal'}
              </p>
            </div>

            {/* Question Number Tabs */}
            <div className="flex gap-2 mb-4 sm:mb-6 md:mb-8 overflow-x-auto pb-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIdx(index)}
                  className={`min-w-[48px] sm:min-w-[60px] h-10 sm:h-12 rounded-lg font-bold text-base sm:text-lg transition shadow-md ${
                    activeIdx === index
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={addQuestion}
                className="min-w-[48px] sm:min-w-[60px] h-10 sm:h-12 rounded-lg font-bold text-base sm:text-lg bg-green-500 text-white hover:bg-green-600 transition shadow-md"
              >
                +
              </button>
            </div>

            {/* Time & Type Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              {timerMode === 'per-question' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">Durasi Soal:</span>
                    </label>
                  </div>

                  <select
                    value={q.duration}
                    onChange={(e) => updateQuestion('duration', parseInt(e.target.value))}
                    className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 font-semibold text-sm sm:text-base"
                  >
                    {[5, 10, 15, 20, 30, 45, 60].map((t) => (
                      <option key={t} value={t}>
                        {t} detik
                      </option>
                    ))}
                  </select>
                </>
              )}

              <select
                value={q.type}
                onChange={(e) => updateQuestionType(e.target.value)}
                className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 font-semibold flex-1 text-sm sm:text-base"
              >
                <option>Pilihan Ganda</option>
                <option>Benar Salah</option>
                <option>Isian</option>
              </select>
            </div>

            {/* Question Box */}
            <div className="mb-4 sm:mb-6">
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion('question', e.target.value)}
                placeholder="Masukkan pertanyaan..."
                rows="3"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg text-base sm:text-lg font-semibold text-center text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Image Box */}
            <div className="w-full flex justify-center mb-4 sm:mb-6">
              <div className="bg-gray-100 h-[120px] sm:h-[150px] w-full max-w-[450px] flex items-center justify-center font-bold text-sm sm:text-base text-gray-600 rounded-lg sm:rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition">
                <label className="h-full w-full flex items-center justify-center cursor-pointer">
                  <div>
                    <div>📸 Upload Gambar..</div>
                    {q.imagePreview && (
                      <img src={q.imagePreview} alt="Preview" className="max-h-[100px] sm:max-h-[120px] mx-auto mt-2" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadImage(e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {q.image && (
              <div className="flex justify-center mb-4 sm:mb-6">
                <button
                  type="button"
                  onClick={() => removeImage()}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-semibold"
                >
                  ✕ Hapus Gambar
                </button>
              </div>
            )}

            {/* Pilihan Ganda */}
            {q.type === 'Pilihan Ganda' && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={q.multi}
                      onChange={(e) => setMulti(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-700">Beberapa jawaban benar</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-x-6 sm:gap-y-4">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`${COLORS[i]} p-4 sm:p-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg flex items-center relative shadow-md cursor-pointer hover:shadow-lg transition group`}
                      onClick={() => toggleCorrect(i)}
                    >
                      <input
                        type="text"
                        value={opt}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          updateOption(i, e.target.value)
                        }}
                        placeholder={`Pilihan ${i + 1}`}
                        className="w-full bg-transparent text-gray-800 font-bold text-sm sm:text-base placeholder-gray-500 focus:outline-none"
                      />
                      <div
                        className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 border-2 flex items-center justify-center transition rounded-full ${
                          q.correct[i]
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-600'
                        }`}
                      >
                        {q.correct[i] && <span className="text-white font-bold text-base sm:text-lg">✓</span>}
                      </div>
                      {q.type !== 'Pilihan Ganda' && q.options.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeOption(i)
                          }}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {q.type !== 'Pilihan Ganda' && q.options.length < 4 && (
                  <button
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm mt-4"
                  >
                    + Tambah Pilihan
                  </button>
                )}
              </div>
            )}

            {/* Benar Salah */}
            {q.type === 'Benar Salah' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div
                  className="bg-green-400 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-4 border-green-600 cursor-pointer transition hover:shadow-lg"
                  onClick={() => setTrueFalse(true)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl sm:text-2xl text-white">Benar</span>
                    {q.trueFalseAnswer === true ? (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-base sm:text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </div>

                <div
                  className="bg-red-400 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-4 border-red-600 cursor-pointer transition hover:shadow-lg"
                  onClick={() => setTrueFalse(false)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl sm:text-2xl text-white">Salah</span>
                    {q.trueFalseAnswer === false ? (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-base sm:text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Isian */}
            {q.type === 'Isian' && (
              <div className="space-y-3 mb-4 sm:mb-6">
                {q.acceptedAnswers.map((ans, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => updateAcceptedAnswer(i, e.target.value)}
                      placeholder={`Jawaban ${i + 1}`}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 text-sm sm:text-base"
                    />
                    {q.acceptedAnswers.length > 1 && (
                      <button
                        onClick={() => removeAcceptedAnswer(i)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm font-semibold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addAcceptedAnswer}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm"
                >
                  + Tambah Jawaban
                </button>
              </div>
            )}

            {/* Delete Question Button */}
            <div className="mb-4 sm:mb-6 flex gap-4 sm:gap-6 justify-center">
              <button
                type="button"
                onClick={() => deleteQuestion(activeIdx)}
                disabled={questions.length === 1}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-lg shadow-md border-2 border-gray-300 transition ${
                  questions.length === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Hapus Soal
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-gray-200 gap-2 sm:gap-4">
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-800 font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition shadow-md text-xs sm:text-sm md:text-base"
              >
                ← Sebelumnya
              </button>

              <span className="text-gray-700 font-bold text-xs sm:text-sm md:text-base">
                {activeIdx + 1}/{questions.length}
              </span>

              {activeIdx === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg text-xs sm:text-sm md:text-base"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Kuis'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveIdx(Math.min(questions.length - 1, activeIdx + 1))}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl transition shadow-lg text-xs sm:text-sm md:text-base"
                >
                  Selanjutnya →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toast {...toast} onClose={hideToast} />
    </div>
  )
}

export default CreateQuizPage
