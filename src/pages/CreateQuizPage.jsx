import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizService } from '../services/quizService'

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
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('Bahasa')
  const [quizType, setQuizType] = useState('schedule') // 'live' or 'schedule'
  const [timerMode, setTimerMode] = useState('per-question')
  const [totalTime, setTotalTime] = useState(30)
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
      alert('Pilihan Ganda harus memiliki 4 pilihan!')
      return
    }
    
    if (currentQuestion.options.length <= 2) {
      alert('Minimal harus ada 2 pilihan!')
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
      alert('Error: ' + error.message)
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
      alert('Minimal harus ada 1 soal!')
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
      alert('Minimal harus ada 1 jawaban!')
      return
    }
    const arr = [...questions]
    arr[idx].acceptedAnswers.splice(i, 1)
    setQuestions(arr)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!quizTitle.trim()) {
      alert('Judul kuis harus diisi!')
      return
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        alert(`Soal ${i + 1}: Pertanyaan harus diisi!`)
        return
      }

      if (q.type === 'Pilihan Ganda') {
        const emptyOptions = q.options.filter((opt) => !opt.trim())
        if (emptyOptions.length > 0) {
          alert(`Soal ${i + 1}: Semua pilihan jawaban harus diisi!`)
          return
        }
        const hasCorrect = q.correct.some((c) => c)
        if (!hasCorrect) {
          alert(`Soal ${i + 1}: Pilih minimal satu jawaban yang benar!`)
          return
        }
      } else if (q.type === 'Isian') {
        const hasAccepted = q.acceptedAnswers && q.acceptedAnswers.length > 0 && q.acceptedAnswers.some((a) => a.trim())
        if (!hasAccepted) {
          alert(`Soal ${i + 1}: Tambahkan minimal satu jawaban!`)
          return
        }
      } else if (q.type === 'Benar Salah') {
        if (q.trueFalseAnswer === null) {
          alert(`Soal ${i + 1}: Pilih jawaban Benar atau Salah!`)
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
            : q.type === 'Isian' ? 'short-answer' : 'true-false'
        }

        if (q.type === 'Pilihan Ganda') {
          questionData.options = q.options
          questionData.correctAnswer = q.multi
            ? q.correct.map((c, idx) => (c ? idx : -1)).filter((idx) => idx !== -1)
            : q.correct.findIndex((c) => c)
        } else if (q.type === 'Isian') {
          questionData.acceptedAnswers = q.acceptedAnswers.filter((a) => a.trim())
        } else if (q.type === 'Benar Salah') {
          questionData.correctAnswer = q.trueFalseAnswer ? 'true' : 'false'
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
        quizType: quizType, // 'live' or 'schedule'
        timerMode: quizType === 'live' ? 'per-question' : timerMode, // Force per-question for live
        totalTime: timerMode === 'total-time' ? totalTime * 60 : null,
        questions: formattedQuestions
      }

      console.log('📤 Creating quiz with data:', {
        timerMode: quizData.timerMode,
        totalTime: quizData.totalTime,
        questionCount: quizData.questions.length
      })

      await quizService.createQuiz(quizData)
      alert('Quiz berhasil disimpan! 🎉')
      navigate('/my-quizzes')
    } catch (err) {
      console.error('Error:', err)
      alert('Gagal menyimpan quiz. Coba lagi.\n' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  const q = questions[activeIdx]

  return (
    <div className="min-h-screen bg-blue-200 flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 drop-shadow-lg">Buat Kuis Baru</h1>
            <p className="text-blue-800 text-sm">Rancang pertanyaan yang menarik untuk peserta didik</p>
          </div>
          <button
            onClick={() => navigate('/my-quizzes')}
            className="bg-white/40 hover:bg-white/60 text-blue-900 px-5 py-2 rounded-lg transition font-semibold"
          >
            ← Kembali
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
            {/* JUDUL & KATEGORI INPUT */}
            <div className="grid grid-cols-3 gap-4 mb-6">
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Kuis</label>
                <select
                  value={quizType}
                  onChange={(e) => {
                    const newType = e.target.value
                    setQuizType(newType)
                    // Live Quiz HARUS menggunakan timer per-question
                    if (newType === 'live') {
                      setTimerMode('per-question')
                      setQuestions(prev => prev.map(q => ({ ...q, useTime: true, duration: q.duration || 30 })))
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="schedule">📚 Jadwal/Belajar Mandiri</option>
                  <option value="live">🎮 Live Quiz</option>
                </select>
              </div>
            </div>

            {/* TIMER SETTINGS */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-xl">⏱️</span> Pengaturan Waktu
                {quizType === 'live' && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">Live Quiz = Timer Per Soal</span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-4">
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
                    disabled={quizType === 'live'}
                    className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 ${
                      quizType === 'live' ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
                    }`}
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
                {quizType === 'live' && '🎮 Live Quiz hanya menggunakan Timer Per Soal untuk pengalaman kompetitif yang adil'}
                {quizType !== 'live' && timerMode === 'none' && '✓ Siswa dapat mengerjakan tanpa batasan waktu'}
                {quizType !== 'live' && timerMode === 'per-question' && '✓ Setiap soal memiliki timer terpisah sesuai durasi yang ditentukan'}
                {quizType !== 'live' && timerMode === 'total-time' && '✓ Siswa memiliki waktu total untuk mengerjakan semua soal'}
              </p>
            </div>

            {/* Question Number Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIdx(index)}
                  className={`min-w-[60px] h-12 rounded-lg font-bold text-lg transition shadow-md ${
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
                className="min-w-[60px] h-12 rounded-lg font-bold text-lg bg-green-500 text-white hover:bg-green-600 transition shadow-md"
              >
                +
              </button>
            </div>

            {/* Time & Type Controls */}
            <div className="flex gap-4 mb-6">
              {timerMode === 'per-question' && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Durasi Soal:</span>
                    </label>
                  </div>

                  <select
                    value={q.duration}
                    onChange={(e) => updateQuestion('duration', parseInt(e.target.value))}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 font-semibold"
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
                className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 font-semibold flex-1"
              >
                <option>Pilihan Ganda</option>
                <option>Benar Salah</option>
                <option>Isian</option>
              </select>
            </div>

            {/* Question Box */}
            <div className="mb-6">
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion('question', e.target.value)}
                placeholder="Masukkan pertanyaan..."
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-semibold text-center text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Image Box */}
            <div className="w-full flex justify-center mb-6">
              <div className="bg-gray-100 h-[150px] w-full max-w-[450px] flex items-center justify-center font-bold text-base text-gray-600 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition">
                <label className="h-full w-full flex items-center justify-center cursor-pointer">
                  <div>
                    <div>📸 Upload Gambar..</div>
                    {q.imagePreview && (
                      <img src={q.imagePreview} alt="Preview" className="max-h-[120px] mx-auto mt-2" />
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
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  onClick={() => removeImage()}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
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

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`${COLORS[i]} p-6 rounded-xl font-bold text-lg flex items-center relative shadow-md cursor-pointer hover:shadow-lg transition group`}
                      onClick={() => toggleCorrect(i)}
                    >
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          e.stopPropagation()
                          updateOption(i, e.target.value)
                        }}
                        placeholder={`Pilihan ${i + 1}`}
                        className="w-full bg-transparent text-gray-800 font-bold text-base placeholder-gray-500 focus:outline-none"
                      />
                      <div
                        className={`absolute top-4 right-4 w-8 h-8 border-2 flex items-center justify-center transition rounded-full ${
                          q.correct[i]
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-600'
                        }`}
                      >
                        {q.correct[i] && <span className="text-white font-bold text-lg">✓</span>}
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
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div
                  className="bg-green-400 p-6 rounded-2xl border-4 border-green-600 cursor-pointer transition hover:shadow-lg"
                  onClick={() => setTrueFalse(true)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xl text-white">Benar</span>
                    {q.trueFalseAnswer === true ? (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </div>

                <div
                  className="bg-red-400 p-6 rounded-2xl border-4 border-red-600 cursor-pointer transition hover:shadow-lg"
                  onClick={() => setTrueFalse(false)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xl text-white">Salah</span>
                    {q.trueFalseAnswer === false ? (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">✓</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Isian */}
            {q.type === 'Isian' && (
              <div className="space-y-3 mb-6">
                {q.acceptedAnswers.map((ans, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => updateAcceptedAnswer(i, e.target.value)}
                      placeholder={`Jawaban ${i + 1}`}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
                    />
                    {q.acceptedAnswers.length > 1 && (
                      <button
                        onClick={() => removeAcceptedAnswer(i)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addAcceptedAnswer}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  + Tambah Jawaban
                </button>
              </div>
            )}

            {/* Delete Question Button */}
            <div className="mb-6 flex gap-6 justify-center">
              <button
                type="button"
                onClick={() => deleteQuestion(activeIdx)}
                disabled={questions.length === 1}
                className={`px-6 py-2.5 text-base font-bold rounded-lg shadow-md border-2 border-gray-300 transition ${
                  questions.length === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Hapus Soal
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-800 font-bold px-8 py-3 rounded-xl transition shadow-md"
              >
                ← Sebelumnya
              </button>

              <span className="text-gray-700 font-bold">
                Soal {activeIdx + 1} dari {questions.length}
              </span>

              {activeIdx === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Kuis'}
                </button>
              ) : (
                <button
                  onClick={() => setActiveIdx(Math.min(questions.length - 1, activeIdx + 1))}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg"
                >
                  Selanjutnya →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateQuizPage
