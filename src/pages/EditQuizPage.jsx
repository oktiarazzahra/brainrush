import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { quizService } from '../services/quizService'

// ← IMAGE COMPRESSION HELPER
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

const EditQuizPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('Bahasa')
  const [questions, setQuestions] = useState([
    {
      question: '',
      image: null,
      imagePreview: null,
      options: ['', '', '', ''],
      correct: [false, false, false, false],
      duration: 30,
      type: 'Pilihan Ganda',
      multi: false,
      answerText: '',
      trueFalseAnswer: null,
      acceptedAnswers: []
    }
  ])
  const [activeIdx, setActiveIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef(null)
  const questionRefs = useRef([])

  const categories = [
    'Bahasa',
    'Sains',
    'Matematika',
    'Biologi',
    'Sejarah',
    'Geografi',
    'Olahraga',
    'Umum'
  ]

  useEffect(() => {
    if (!id) {
      alert('Quiz ID tidak ditemukan!')
      navigate('/my-quizzes')
      return
    }

    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const quiz = await quizService.getQuizById(id)
        setQuizTitle(quiz.title || '')
        setQuizCategory(quiz.category || 'Bahasa')

        if (quiz.questions && quiz.questions.length > 0) {
          setQuestions(
            quiz.questions.map((q) => {
              let type = 'Pilihan Ganda'
              if (q.questionType === 'Benar Salah' || q.questionType === 'true-false') {
                type = 'Benar Salah'
              } else if (q.questionType === 'Isian' || q.questionType === 'short-answer') {
                type = 'Isian'
              }

              let options = []
              let correct = [false, false, false, false]
              let trueFalseAnswer = null
              let answerText = ''
              let acceptedAnswers = []
              let multi = false

              if (type === 'Pilihan Ganda') {
                if (Array.isArray(q.options)) {
                  options = q.options
                  correct = new Array(4).fill(false).slice(0, q.options.length)

                  if (Array.isArray(q.correctAnswer)) {
                    q.correctAnswer.forEach((idx) => {
                      if (correct[idx]) correct[idx] = true
                    })
                    multi = true
                  } else if (typeof q.correctAnswer === 'number') {
                    correct[q.correctAnswer] = true
                    multi = false
                  }
                }
              } else if (type === 'Benar Salah') {
                trueFalseAnswer = q.correctAnswer === 'true'
              } else if (type === 'Isian') {
                acceptedAnswers = Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : []
              }

              return {
                question: q.question || q.questionText || '',
                image: q.image || null,
                imagePreview: q.imageData || null,  // ← Load from database
                options: options,
                correct: correct,
                duration: q.timeLimit || 30,
                type: type,
                multi: multi,
                answerText: answerText,
                trueFalseAnswer: trueFalseAnswer,
                acceptedAnswers: acceptedAnswers
              }
            })
          )
        } else {
          setQuestions([
            {
              question: '',
              image: null,
              imagePreview: null,
              options: ['', '', '', ''],
              correct: [false, false, false, false],
              duration: 30,
              type: 'Pilihan Ganda',
              multi: false,
              answerText: '',
              trueFalseAnswer: null,
              acceptedAnswers: []
            }
          ])
        }

        setActiveIdx(0)
      } catch (err) {
        alert('Gagal memuat quiz: ' + (err.message || 'Unknown error'))
        navigate('/my-quizzes')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [id, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (questionRefs.current[activeIdx] && scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const element = questionRefs.current[activeIdx]
        const elementTop = element.offsetTop
        const containerTop = container.scrollTop
        const containerHeight = container.clientHeight
        const elementHeight = element.clientHeight

        if (
          elementTop < containerTop ||
          elementTop + elementHeight > containerTop + containerHeight
        ) {
          container.scrollTo({
            top: elementTop - containerHeight / 2 + elementHeight / 2,
            behavior: 'smooth'
          })
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [activeIdx, questions.length])

  const updateQuestion = (field, value, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx][field] = value
    setQuestions(arr)
  }

  const updateQuestionType = (newType, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].type = newType

    if (newType === 'Pilihan Ganda') {
      arr[idx].options = ['', '', '', '']
      arr[idx].correct = [false, false, false, false]
      arr[idx].multi = false
      arr[idx].answerText = ''
      arr[idx].trueFalseAnswer = null
      arr[idx].acceptedAnswers = []
    } else if (newType === 'Isian') {
      arr[idx].options = []
      arr[idx].correct = []
      arr[idx].answerText = ''
      arr[idx].trueFalseAnswer = null
      arr[idx].acceptedAnswers = ['']
    } else if (newType === 'Benar Salah') {
      arr[idx].options = []
      arr[idx].correct = []
      arr[idx].answerText = ''
      arr[idx].trueFalseAnswer = null
      arr[idx].acceptedAnswers = []
    }

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
    setQuestions(arr)
  }

  const removeOption = (i, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    if (questions[idx].options.length <= 2) {
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

  // ← IMAGE UPLOAD WITH COMPRESSION
  const uploadImage = async (e, idx = activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Gambar > 2MB, akan dikompres...')
    }

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
        type: 'Pilihan Ganda',
        multi: false,
        answerText: '',
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
    arr[idx].trueFalseAnswer = value
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
        const hasAccepted =
          q.acceptedAnswers && q.acceptedAnswers.length > 0 && q.acceptedAnswers.some((a) => a.trim())
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

      // ← FIXED: Declare questionData INSIDE map
      const formattedQuestions = questions.map((q) => {
        let questionData = {
          question: q.question,
          timeLimit: q.duration,
          questionType: q.type === 'Pilihan Ganda'
            ? q.multi
              ? 'multiple-answer'
              : 'multiple-choice'
            : q.type === 'Isian'
            ? 'short-answer'
            : 'true-false'
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

        // ← ADD IMAGE DATA
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
        questions: formattedQuestions
      }

      await quizService.updateQuiz(id, quizData)
      alert('Quiz berhasil diupdate! 🎉')
      navigate('/my-quizzes')
    } catch (err) {
      console.error('Error:', err)
      alert('Gagal menyimpan quiz. Coba lagi.\n' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat quiz...</p>
      </div>
    )
  }

  const q = questions[activeIdx]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Kuis</h1>
          <p className="text-gray-600">Ubah pertanyaan kuis Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Quiz Header */}
          <div className="mb-8 pb-8 border-b-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul Kuis
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Masukkan judul kuis..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Questions List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Soal ({questions.length})</h2>
              <div
                ref={scrollContainerRef}
                className="space-y-2 max-h-96 overflow-y-auto pr-2"
              >
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (questionRefs.current[idx] = el)}
                    onClick={() => setActiveIdx(idx)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      activeIdx === idx
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">Soal {idx + 1}</div>
                    <div className="text-xs opacity-75 mt-1">{_.type}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full mt-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
              >
                + Tambah Soal
              </button>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                {/* Question Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipe Soal
                  </label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestionType(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option>Pilihan Ganda</option>
                    <option>Benar Salah</option>
                    <option>Isian</option>
                  </select>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pertanyaan
                  </label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion('question', e.target.value)}
                    placeholder="Masukkan pertanyaan..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Image Upload WITH LARGER PREVIEW */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Gambar (Opsional)
                  </label>
                  <div className="space-y-4">
                    {/* Upload Input */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadImage(e)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                      />
                    </div>

                    {/* Image Preview - LARGER */}
                    {q.imagePreview && (
                      <div className="w-full max-w-lg">
                        <p className="text-xs text-gray-600 mb-2">📸 Preview Gambar:</p>
                        <div className="w-full h-64 rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center shadow-md hover:shadow-lg transition">
                          <img
                            src={q.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    {q.image && (
                      <button
                        type="button"
                        onClick={() => removeImage()}
                        className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                      >
                        ✕ Hapus Gambar
                      </button>
                    )}
                  </div>
                </div>

                {/* Pilihan Ganda */}
                {q.type === 'Pilihan Ganda' && (
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q.multi}
                          onChange={(e) => setMulti(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">Multiple Answer (Multiple Jawaban)</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                          <input
                            type={q.multi ? 'checkbox' : 'radio'}
                            name="answer"
                            checked={q.multi ? q.correct[i] : q.correct[i]}
                            onChange={() => toggleCorrect(i)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(i, e.target.value)}
                            placeholder={`Pilihan ${i + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(i)}
                              className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      + Tambah Pilihan
                    </button>
                  </div>
                )}

                {/* Benar Salah */}
                {q.type === 'Benar Salah' && (
                  <div className="mb-6 space-y-3">
                    <div>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          name="trueFalse"
                          checked={q.trueFalseAnswer === true}
                          onChange={() => setTrueFalse(true)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold text-gray-700">Benar</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-300 cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          name="trueFalse"
                          checked={q.trueFalseAnswer === false}
                          onChange={() => setTrueFalse(false)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold text-gray-700">Salah</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Isian */}
                {q.type === 'Isian' && (
                  <div className="mb-6 space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Masukkan semua variasi jawaban yang benar (bisa ada lebih dari satu)
                    </p>
                    {q.acceptedAnswers.map((ans, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={ans}
                          onChange={(e) => updateAcceptedAnswer(i, e.target.value)}
                          placeholder={`Jawaban ${i + 1}`}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        {q.acceptedAnswers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAcceptedAnswer(i)}
                            className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAcceptedAnswer}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      + Tambah Jawaban
                    </button>
                  </div>
                )}

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Waktu (detik)
                  </label>
                  <input
                    type="number"
                    value={q.duration}
                    onChange={(e) => updateQuestion('duration', parseInt(e.target.value))}
                    min="5"
                    max="300"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Delete Button */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteQuestion(activeIdx)}
                    className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                  >
                    Hapus Soal Ini
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-center mt-8 pt-8 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/my-quizzes')}
              className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}

export default EditQuizPage