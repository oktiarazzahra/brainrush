import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { quizService } from '../services/quizService'

const defaultQuestion = () => ({
  question: '',
  image: null,
  options: ['', '', '', ''],
  correct: [false, false, false, false],
  duration: 30,
  type: 'Pilihan Ganda',
  multi: false,
  answerText: '',
  trueFalseAnswer: null
})

const EditQuizPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('Bahasa')
  const [questions, setQuestions] = useState([defaultQuestion()])
  const [activeIdx, setActiveIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const scrollContainerRef = useRef(null)
  const questionRefs = useRef([])

  const categories = [
    'Bahasa', 'Sains', 'Matematika', 'Biologi', 'Sejarah', 'Geografi', 'Olahraga', 'Umum'
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
          setQuestions(quiz.questions.map(q => {
            const questionType = q.type === 'text' ? 'Isian' : q.type === 'boolean' ? 'Benar Salah' : 'Pilihan Ganda'
            
            let options = []
            if (questionType === 'Pilihan Ganda' && Array.isArray(q.options)) {
              options = q.options
            }
            
            let correct = []
            if (questionType === 'Pilihan Ganda') {
              if (Array.isArray(q.correctAnswers)) {
                correct = [0, 1, 2, 3].map(i => q.correctAnswers.includes(i))
              } else if (typeof q.correctAnswer === 'number') {
                correct = [0, 1, 2, 3].map(i => i === q.correctAnswer)
              }
            }
            
            return {
              question: q.question || '',
              image: q.image || null,
              options: options,
              correct: correct,
              duration: q.timeLimit || 30,
              type: questionType,
              multi: Array.isArray(q.correctAnswers),
              answerText: questionType === 'Isian' ? (q.correctAnswer || '') : '',
              trueFalseAnswer: questionType === 'Benar Salah' 
                ? (typeof q.correctAnswer === 'boolean' ? q.correctAnswer : q.correctAnswer === 1) 
                : null
            }
          }))
        } else {
          setQuestions([defaultQuestion()])
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
        if (elementTop < containerTop || elementTop + elementHeight > containerTop + containerHeight) {
          container.scrollTo({
            top: elementTop - (containerHeight / 2) + (elementHeight / 2),
            behavior: 'smooth'
          })
        }
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [activeIdx, questions.length])

  const updateQuestion = (field, value, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx][field] = value
    setQuestions(arr)
  }

  const updateQuestionType = (newType, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].type = newType
    
    if (newType === 'Pilihan Ganda') {
      arr[idx].options = ['', '', '', '']
      arr[idx].correct = [false, false, false, false]
      arr[idx].multi = false
      arr[idx].answerText = ''
      arr[idx].trueFalseAnswer = null
    } else if (newType === 'Isian') {
      arr[idx].options = []
      arr[idx].correct = []
      arr[idx].answerText = ''
      arr[idx].trueFalseAnswer = null
    } else if (newType === 'Benar Salah') {
      arr[idx].options = []
      arr[idx].correct = []
      arr[idx].answerText = ''
      arr[idx].trueFalseAnswer = null
    }
    
    setQuestions(arr)
  }

  const updateOption = (i, value, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].options[i] = value
    setQuestions(arr)
  }

  const toggleCorrect = (i, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    if (arr[idx].multi) arr[idx].correct[i] = !arr[idx].correct[i]
    else arr[idx].correct = arr[idx].correct.map((_, idx2) => idx2 === i)
    setQuestions(arr)
  }

  const uploadImage = (e, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].image = e.target.files[0]
    setQuestions(arr)
  }

  const addQuestion = () => {
    setQuestions([...questions, defaultQuestion()])
    setActiveIdx(questions.length)
  }

  const deleteQuestion = idx => {
    if (questions.length === 1) {
      alert('Minimal harus ada 1 soal!')
      return
    }
    const arr = questions.filter((_, i) => i !== idx)
    setQuestions(arr)
    setActiveIdx(Math.max(0, idx - 1))
  }

  const setMulti = (value, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].multi = value
    if (!value) arr[idx].correct = arr[idx].correct.map((v, idx2) => idx2 === arr[idx].correct.findIndex(v => v))
    setQuestions(arr)
  }

  const setTrueFalse = (value, idx=activeIdx) => {
    if (idx < 0 || idx >= questions.length) return
    const arr = [...questions]
    arr[idx].trueFalseAnswer = value
    setQuestions(arr)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!quizTitle.trim()) {
      alert('Judul kuis harus diisi!')
      return
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) return alert(`Soal ${i + 1}: Pertanyaan harus diisi!`)
      if (q.type === 'Pilihan Ganda') {
        const emptyOptions = q.options.filter(opt => !opt.trim())
        if (emptyOptions.length > 0) return alert(`Soal ${i + 1}: Semua pilihan jawaban harus diisi!`)
        const hasCorrect = q.correct.some(c => c)
        if (!hasCorrect) return alert(`Soal ${i + 1}: Pilih minimal satu jawaban yang benar!`)
      } else if (q.type === 'Isian') {
        if (!q.answerText.trim()) return alert(`Soal ${i + 1}: Jawaban harus diisi!`)
      } else if (q.type === 'Benar Salah') {
        if (q.trueFalseAnswer === null) return alert(`Soal ${i + 1}: Pilih jawaban Benar atau Salah!`)
      }
    }
    try {
      setSaving(true)
      const formattedQuestions = questions.map(q => {
        let questionData = { question: q.question, timeLimit: q.duration }
        if (q.type === 'Pilihan Ganda') {
          questionData.options = q.options
          questionData.correctAnswer = q.correct.findIndex(c => c)
          if (q.multi) {
            questionData.correctAnswers = q.correct.map((c, idx) => c ? idx : -1).filter(idx => idx !== -1)
          }
        } else if (q.type === 'Isian') {
          questionData.correctAnswer = q.answerText
          questionData.type = 'text'
        } else if (q.type === 'Benar Salah') {
          questionData.correctAnswer = q.trueFalseAnswer ? 1 : 0
          questionData.type = 'boolean'
        }
        return questionData
      })
      const quizData = {
        id,
        title: quizTitle,
        description: `Kategori: ${quizCategory}`,
        category: quizCategory,
        questions: formattedQuestions
      }
      await quizService.updateQuiz(quizData)
      alert('Quiz berhasil diupdate! 🎉')
      navigate('/my-quizzes')
    } catch (err) {
      alert('Gagal menyimpan quiz. Coba lagi.\n' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <p className="text-white text-xl">Memuat quiz...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-4">
      <form
        className="flex bg-white w-full rounded-xl overflow-hidden shadow-2xl mx-auto"
        style={{ maxWidth: '1400px', minHeight: 650, maxHeight: '88vh' }}
        onSubmit={handleSubmit}
      >
        <div className="bg-blue-900 w-[190px] flex flex-col pt-4 pb-4">
          <button
            type="button"
            className="bg-white font-bold text-sm px-3 py-2 rounded-xl w-[130px] mx-auto mb-5 shadow-lg hover:bg-gray-100 transition"
            onClick={() => navigate('/my-quizzes')}
          >Kembali</button>

          <div className="px-4 w-full mb-4">
            <input
              type="text"
              className="w-full bg-gray-100 text-base font-bold rounded-xl px-3 py-2 mb-2 shadow focus:outline-blue-600"
              placeholder="Judul Kuis"
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              required
            />
            <select
              className="w-full bg-gray-100 text-base rounded-xl px-3 py-2 font-semibold shadow"
              value={quizCategory}
              onChange={e => setQuizCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 space-y-2 scroll-smooth">
            {questions.map((_, idx) => (
              <div key={idx} ref={el => questionRefs.current[idx] = el} className="relative group">
                <button
                  type="button"
                  className={`w-full py-2 text-sm rounded-xl font-bold transition ${activeIdx === idx ? 'bg-gray-200 text-blue-900 shadow-lg' : 'bg-gray-300 text-gray-800 hover:bg-gray-200'}`}
                  onClick={() => setActiveIdx(idx)}
                >Soal {idx + 1}</button>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); deleteQuestion(idx); }}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-xs"
                    title="Hapus soal">×</button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="w-full py-2 rounded-xl font-bold text-gray-800 bg-gray-300 hover:bg-gray-200 flex items-center justify-center gap-1 transition text-sm"
              onClick={addQuestion}
            >
              <span className="text-xl">+</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-4 gap-3 mb-5">
              <select
                className="bg-gray-200 text-gray-800 text-base px-4 py-2.5 rounded-lg font-semibold shadow-md"
                value={questions[activeIdx].duration}
                onChange={e => updateQuestion('duration', parseInt(e.target.value))}
              >
                <option value={30}>Durasi</option>
                <option value={10}>10 detik</option>
                <option value={20}>20 detik</option>
                <option value={30}>30 detik</option>
                <option value={60}>60 detik</option>
              </select>
              <select
                className="bg-gray-200 text-gray-800 text-base px-4 py-2.5 rounded-lg font-semibold shadow-md"
                value={questions[activeIdx].type}
                onChange={e => updateQuestionType(e.target.value)}
              >
                <option>Pilihan Ganda</option>
                <option>Isian</option>
                <option>Benar Salah</option>
              </select>
              <div className="col-span-2"></div>
            </div>

            <div className="mb-5">
              <input
                type="text"
                className="w-full bg-gray-200 text-lg font-semibold px-5 py-3 rounded-lg shadow-md text-center"
                placeholder="Tulis Pertanyaan Anda Disini.."
                value={questions[activeIdx].question}
                onChange={e => updateQuestion('question', e.target.value)}
                required
              />
            </div>

            <div className="w-full flex justify-center mb-5">
              <label htmlFor="upload-gambar" className="bg-gray-100 h-[150px] w-full max-w-[450px] flex items-center justify-center font-bold text-base text-gray-600 rounded-xl shadow-md cursor-pointer hover:bg-gray-200 transition">
                {questions[activeIdx].image ? (
                  <span className="flex flex-col items-center">
                    <img 
                      src={typeof questions[activeIdx].image === 'string' 
                        ? `http://localhost:5000${questions[activeIdx].image}` 
                        : URL.createObjectURL(questions[activeIdx].image)
                      } 
                      alt="Gambar Soal" 
                      className="h-[120px] mb-2 rounded-lg" 
                    />
                    <span className="text-sm">Ganti Gambar</span>
                  </span>
                ) : 'Upload Gambar..'}
                <input id="upload-gambar" type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </div>

            {questions[activeIdx].type === 'Benar Salah' ? (
              <div className="grid grid-cols-2 gap-6 mb-8">
                <button
                  type="button"
                  className={`bg-red-500 hover:bg-red-600 p-12 rounded-2xl font-bold text-2xl flex items-center justify-center shadow-xl transition ${questions[activeIdx].trueFalseAnswer === false ? 'ring-4 ring-blue-600' : ''}`}
                  onClick={() => setTrueFalse(false)}
                >Salah</button>
                <button
                  type="button"
                  className={`bg-green-500 hover:bg-green-600 p-12 rounded-2xl font-bold text-2xl flex items-center justify-center shadow-xl transition ${questions[activeIdx].trueFalseAnswer === true ? 'ring-4 ring-blue-600' : ''}`}
                  onClick={() => setTrueFalse(true)}
                >Benar</button>
              </div>
            ) : questions[activeIdx].type === 'Isian' ? (
              <div className="mb-8">
                <input
                  type="text"
                  className="w-full bg-sky-300 text-lg font-bold px-5 py-5 rounded-xl shadow-lg border-2 border-sky-400 text-center"
                  placeholder="Tulis jawaban yang benar disini.."
                  value={questions[activeIdx].answerText}
                  onChange={e => updateQuestion('answerText', e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
                  {questions[activeIdx].options.map((opt, i) => {
                    const warna = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200'][i]
                    return (
                      <div key={i} className={`${warna} p-6 rounded-xl font-bold text-lg flex items-center relative shadow-md`}>
                        <input
                          type="text"
                          className="bg-transparent w-full outline-none font-bold text-base"
                          placeholder="Tulis Jawaban"
                          value={questions[activeIdx].options[i]}
                          onChange={e => updateOption(i, e.target.value)}
                          required
                        />
                        <input
                          type="checkbox"
                          checked={!!questions[activeIdx].correct[i]}
                          className={`absolute top-4 right-4 w-8 h-8 border-2 border-gray-600 focus:ring-2 focus:ring-blue-500 bg-white appearance-none checked:bg-blue-600 checked:border-blue-600 transition duration-150 cursor-pointer ${questions[activeIdx].multi ? 'rounded-md' : 'rounded-full'}`}
                          onChange={() => toggleCorrect(i)}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mb-6 flex gap-6 justify-center">
                  <button
                    type="button"
                    className={`px-6 py-2.5 text-base font-bold rounded-lg shadow-md border-2 border-gray-300 transition ${!questions[activeIdx].multi ? 'bg-blue-800 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => setMulti(false)}
                  >Satu jawaban benar</button>
                  <button
                    type="button"
                    className={`px-6 py-2.5 text-base font-bold rounded-lg shadow-md border-2 border-gray-300 transition ${questions[activeIdx].multi ? 'bg-blue-800 text-white' : 'bg-white hover:bg-gray-100'}`}
                    onClick={() => setMulti(true)}
                  >Beberapa jawaban benar</button>
                </div>
              </>
            )}

            {activeIdx === questions.length - 1 && (
              <div className="flex justify-end mb-5">
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-blue-800 text-white font-bold text-base px-10 py-3 rounded-xl shadow-lg transition ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-900'}`}
                >{saving ? 'Menyimpan...' : 'Update Quiz'}</button>
              </div>
            )}
          </div>
        </div>
      </form>
      <Footer />
    </div>
  )
}

export default EditQuizPage
