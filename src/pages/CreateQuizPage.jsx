// src/pages/CreateQuizPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const CreateQuizPage = () => {
  const navigate = useNavigate()
  const [quizTitle, setQuizTitle] = useState('')
  const [quizCategory, setQuizCategory] = useState('Bahasa')
  const [questions, setQuestions] = useState([
    {
      question: '',
      image: null,
      options: ['', '', '', ''],
      correct: [false, false, false, false],
      duration: 30,
      type: 'Pilihan Ganda',
      multi: false,
      answerText: '',
      trueFalseAnswer: null
    }
  ])
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollContainerRef = useRef(null)
  const questionRefs = useRef([])

  const categories = ['Bahasa', 'Sains', 'Matematika', 'Biologi', 'Sejarah', 'Geografi', 'Olahraga', 'Umum']

  // Auto scroll ketika active index berubah
  useEffect(() => {
    // Tunggu sebentar agar DOM terupdate
    const timer = setTimeout(() => {
      if (questionRefs.current[activeIdx] && scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const element = questionRefs.current[activeIdx]
        
        // Scroll ke posisi element dengan smooth animation
        const elementTop = element.offsetTop
        const containerTop = container.scrollTop
        const containerHeight = container.clientHeight
        const elementHeight = element.clientHeight
        
        // Cek apakah element di luar viewport
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

  const updateQuestion = (field, value) => {
    const arr = [...questions]
    arr[activeIdx][field] = value
    setQuestions(arr)
  }
  const updateOption = (i, value) => {
    const arr = [...questions]
    arr[activeIdx].options[i] = value
    setQuestions(arr)
  }
  const toggleCorrect = (i) => {
    const arr = [...questions]
    if (arr[activeIdx].multi) {
      arr[activeIdx].correct[i] = !arr[activeIdx].correct[i]
    } else {
      arr[activeIdx].correct = arr[activeIdx].correct.map((_, idx) => idx === i)
    }
    setQuestions(arr)
  }
  const uploadImage = (e) => {
    const arr = [...questions]
    arr[activeIdx].image = e.target.files[0]
    setQuestions(arr)
  }
  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        question: '',
        image: null,
        options: ['', '', '', ''],
        correct: [false, false, false, false],
        duration: 30,
        type: 'Pilihan Ganda',
        multi: false,
        answerText: '',
        trueFalseAnswer: null
      }
    ]
    setQuestions(newQuestions)
    setActiveIdx(newQuestions.length - 1) // Set ke soal yang baru ditambahkan
  }
  
  const deleteQuestion = (idx) => {
    if (questions.length === 1) {
      alert('Minimal harus ada 1 soal!')
      return
    }
    const arr = questions.filter((_, i) => i !== idx)
    setQuestions(arr)
    if (activeIdx >= arr.length) {
      setActiveIdx(arr.length - 1)
    } else if (activeIdx > idx) {
      setActiveIdx(activeIdx - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({ quizTitle, quizCategory, questions })
    navigate('/my-quizzes')
  }
  const setMulti = (value) => {
    const arr = [...questions]
    arr[activeIdx].multi = value
    if (!value) {
      arr[activeIdx].correct = arr[activeIdx].correct.map((v, idx) => idx === arr[activeIdx].correct.findIndex(v => v))
    }
    setQuestions(arr)
  }
  const setTrueFalse = (value) => {
    const arr = [...questions]
    arr[activeIdx].trueFalseAnswer = value
    setQuestions(arr)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 p-4">
      <form
        className="flex bg-white w-full rounded-xl overflow-hidden shadow-2xl mx-auto"
        style={{ maxWidth: '1400px', minHeight: 650, maxHeight: '88vh' }}
        onSubmit={handleSubmit}
      >
        {/* Sidebar */}
        <div className="bg-blue-900 w-[160px] flex flex-col pt-5 pb-5">
          <button
            type="button"
            className="bg-white font-bold text-sm px-3 py-2 rounded-xl w-[130px] mx-auto mb-5 shadow-lg hover:bg-gray-100 transition"
            onClick={() => navigate('/my-quizzes')}
          >
            Kembali
          </button>
          
          {/* Scrollable question list */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-3 space-y-2 scroll-smooth"
          >
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                ref={el => questionRefs.current[idx] = el}
                className="relative group"
              >
                <button
                  type="button"
                  className={`w-full py-2 text-sm rounded-xl font-bold transition ${
                    activeIdx === idx 
                      ? 'bg-gray-200 text-blue-900 shadow-lg' 
                      : 'bg-gray-300 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveIdx(idx)}
                >
                  Soal {idx + 1}
                </button>
                
                {/* Tombol hapus */}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteQuestion(idx)
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-xs"
                    title="Hapus soal"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            {/* Add question button */}
            <button
              type="button"
              className="w-full py-2 rounded-xl font-bold text-gray-800 bg-gray-300 hover:bg-gray-200 flex items-center justify-center gap-1 transition text-sm"
              onClick={addQuestion}
            >
              <span className="text-xl">+</span>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-4 gap-3 mb-5">
              <input
                type="text"
                className="bg-white text-lg font-bold border-2 border-gray-400 rounded-lg px-4 py-2.5 shadow-md"
                placeholder="Judul Kuis"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                required
              />
              
              <select
                className="bg-gray-200 text-gray-800 text-base px-4 py-2.5 rounded-lg font-semibold shadow-md"
                value={quizCategory}
                onChange={e => setQuizCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
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
                onChange={e => updateQuestion('type', e.target.value)}
              >
                <option>Pilihan Ganda</option>
                <option>Isian</option>
                <option>Benar Salah</option>
              </select>
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
                    <img src={URL.createObjectURL(questions[activeIdx].image)} alt="Gambar Soal" className="h-[120px] mb-2 rounded-lg" />
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
                >
                  Salah
                </button>
                <button
                  type="button"
                  className={`bg-green-500 hover:bg-green-600 p-12 rounded-2xl font-bold text-2xl flex items-center justify-center shadow-xl transition ${questions[activeIdx].trueFalseAnswer === true ? 'ring-4 ring-blue-600' : ''}`}
                  onClick={() => setTrueFalse(true)}
                >
                  Benar
                </button>
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
                  {['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200'].map((warna, i) => (
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
                  ))}
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
            
            <div className="flex justify-end mb-5">
              <button type="submit" className="bg-blue-800 text-white font-bold text-base px-10 py-3 rounded-xl shadow-lg hover:bg-blue-900 transition">
                Simpan soal
              </button>
            </div>
          </div>
        </div>
      </form>
      <Footer />
    </div>
  )
}

export default CreateQuizPage
