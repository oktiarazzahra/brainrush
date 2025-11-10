// src/pages/TakeQuizPage.jsx
import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const TakeQuizPage = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const location = useLocation()
  const quizData = location.state?.quiz

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [score, setScore] = useState(0)

  // Dummy questions
  const questions = [
    {
      id: 1,
      question: 'Apa lambang kimia untuk oksigen?',
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=300&fit=crop',
      type: 'Pilihan Ganda',
      options: ['O', 'O2', 'H2O', 'CO2'],
      correctAnswer: [0],
      multi: false
    },
    {
      id: 2,
      question: 'Pilih semua yang termasuk gas mulia:',
      image: null,
      type: 'Multiple Choice',
      options: ['Helium', 'Oksigen', 'Neon', 'Nitrogen'],
      correctAnswer: [0, 2],
      multi: true
    },
    {
      id: 3,
      question: 'Air adalah senyawa',
      image: null,
      type: 'Benar/Salah',
      correctAnswer: true
    },
    {
      id: 4,
      question: 'Sebutkan 3 unsur dalam tabel periodik!',
      image: null,
      type: 'Essay'
    },
    {
      id: 5,
      question: 'Apa fungsi katalis?',
      image: null,
      type: 'Pilihan Ganda',
      options: ['Mempercepat reaksi', 'Memperlambat reaksi', 'Menghasilkan energi', 'Menyerap panas'],
      correctAnswer: [0],
      multi: false
    }
  ]

  const currentQ = questions[currentQuestion]
  const currentAnswer = answers[currentQuestion]

  const optionColors = [
    'bg-pink-200',
    'bg-green-200',
    'bg-yellow-200',
    'bg-blue-200'
  ]

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
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizFinished(true)
      setScore(85)
    }
  }

  // Result screen - FULLSCREEN BIRU
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Quiz Selesai!</h1>
          <div className="text-6xl font-black text-blue-600 mb-4">{score}</div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz screen - FULLSCREEN BIRU TANPA SIDEBAR
  return (
    <div className="min-h-screen bg-blue-600 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header dengan Back button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{quizData?.title || 'Quiz'}</h1>
            <p className="text-white/80 text-sm">Soal {currentQuestion + 1} dari {questions.length}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2 rounded-lg transition font-semibold flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          
          {/* Question Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`min-w-[50px] h-12 rounded-lg font-bold text-lg transition shadow ${
                  currentQuestion === index
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-400 text-green-900'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Question Box */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 text-lg font-semibold px-5 py-4 rounded-lg shadow text-center">
              {currentQ.question}
            </div>
          </div>

          {/* Image Box - HANYA TAMPIL KALAU ADA GAMBAR */}
          {currentQ.image && (
            <div className="w-full flex justify-center mb-4">
              <div className="bg-gray-100 rounded-xl p-4 shadow">
                <img 
                  src={currentQ.image} 
                  alt="Gambar Soal" 
                  className="max-h-48 rounded-lg object-cover" 
                />
              </div>
            </div>
          )}

          {/* Options Grid */}
          {(currentQ.type === 'Pilihan Ganda' || currentQ.type === 'Multiple Choice') && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentQ.options.map((option, index) => {
                const isSelected = Array.isArray(currentAnswer) && currentAnswer.includes(index)
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`${optionColors[index]} px-6 py-4 rounded-xl font-bold text-base text-gray-800 flex items-center justify-between transition hover:opacity-90 shadow`}
                  >
                    <span>{option}</span>
                    <div className={`w-8 h-8 rounded-full border-4 ${
                      isSelected ? 'border-gray-800 bg-white' : 'border-gray-800 bg-white'
                    } flex items-center justify-center`}>
                      {isSelected && <span className="text-gray-800 text-lg font-bold">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* True/False */}
          {currentQ.type === 'Benar/Salah' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setAnswers({ ...answers, [currentQuestion]: true })}
                className={`bg-green-200 rounded-xl px-6 py-5 font-bold text-xl transition shadow ${
                  currentAnswer === true ? 'ring-4 ring-green-600' : ''
                }`}
              >
                ✅ BENAR
              </button>
              <button
                onClick={() => setAnswers({ ...answers, [currentQuestion]: false })}
                className={`bg-pink-200 rounded-xl px-6 py-5 font-bold text-xl transition shadow ${
                  currentAnswer === false ? 'ring-4 ring-red-600' : ''
                }`}
              >
                ❌ SALAH
              </button>
            </div>
          )}

          {/* Essay */}
          {currentQ.type === 'Essay' && (
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
              placeholder="Tulis jawaban kamu di sini..."
              className="w-full h-40 p-4 border-4 border-gray-300 rounded-xl text-base focus:outline-none focus:border-blue-500 mb-4 shadow"
            />
          )}

          {/* Button Next */}
          {currentAnswer !== undefined && (
            <div className="flex justify-end gap-3">
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow"
              >
                {currentQuestion < questions.length - 1 ? 'Selanjutnya →' : 'Selesai'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TakeQuizPage
