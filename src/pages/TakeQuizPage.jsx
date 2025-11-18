import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { quizService } from '../services/quizService'

const TakeQuizPage = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const location = useLocation()
  const quizData = location.state?.quiz

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizFinished, setQuizFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])

  // Fetch quiz data from API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        console.log('Fetching quiz with ID:', quizId)
        const response = await quizService.getQuizById(quizId)
        console.log('Quiz response:', response)
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
        setLoading(false)
      } catch (err) {
        console.error('Error fetching quiz:', err)
        setError('Gagal memuat quiz. Silakan coba lagi.')
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

  const COLORS = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200']
  const currentQ = questions[currentQuestion]
  const currentAnswer = answers[currentQuestion]

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
          <p className="text-white text-2xl font-bold">Loading Quiz...</p>
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

  // Calculate score
  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      const userAnswer = answers[index]

      if (q.type === 'Pilihan Ganda' && q.multi) {
        // Multiple choice - harus exact match
        const correctArr = Array.isArray(q.correctAnswer) 
          ? q.correctAnswer.sort() 
          : [q.correctAnswer].sort()
        const userArr = Array.isArray(userAnswer) ? userAnswer.sort() : []
        if (JSON.stringify(correctArr) === JSON.stringify(userArr)) {
          correct++
        }
      } else if (q.type === 'Pilihan Ganda' && !q.multi) {
        // Single choice
        const correctIndex = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer
        const userIndex = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
        if (userIndex === correctIndex) {
          correct++
        }
      } else if (q.type === 'Benar Salah') {
        // True/False
        if (userAnswer === q.correctAnswer) {
          correct++
        }
      } else if (q.type === 'Isian') {
        // Short answer - case insensitive
        if (userAnswer && q.acceptedAnswers && q.acceptedAnswers.length > 0) {
          const isCorrect = q.acceptedAnswers.some(
            ans => ans.toLowerCase() === userAnswer.toLowerCase().trim()
          )
          if (isCorrect) {
            correct++
          }
        }
      }
    })
    return Math.round((correct / questions.length) * 100)
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
  }

  // Handle true/false
  const handleTrueFalse = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    })
  }

  // Handle next
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const finalScore = calculateScore()
      setScore(finalScore)
      setQuizFinished(true)
    }
  }

  // Result screen
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-blue-200 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl p-12 max-w-2xl w-full shadow-2xl text-center">
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
                {Math.round((score / 100) * questions.length)} dari {questions.length} soal benar
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-xl transition shadow-md"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md"
              >
                Coba Lagi
              </button>
            </div>
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
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/40 hover:bg-white/60 text-blue-900 px-5 py-2 rounded-lg transition font-semibold"
          >
            ← Kembali
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
            {/* Question Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`min-w-[60px] h-12 rounded-lg font-bold text-lg transition shadow-md ${
                    currentQuestion === index
                      ? 'bg-blue-600 text-white scale-110'
                      : answers[index] !== undefined
                      ? 'bg-green-400 text-green-900'
                      : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Question Box */}
            <div className="mb-6">
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
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion]: e.target.value })}
                  placeholder="Ketik jawaban kamu..."
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-blue-500 shadow-md"
                />
                {currentQ.acceptedAnswers && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Jawaban yang diterima: {currentQ.acceptedAnswers.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-800 font-bold px-8 py-3 rounded-xl transition shadow-md"
              >
                ← Sebelumnya
              </button>

              <span className="text-gray-700 font-bold">
                Soal {currentQuestion + 1} dari {questions.length}
              </span>

              {currentAnswer !== undefined ? (
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
                  {currentQuestion < questions.length - 1 ? 'Selanjutnya →' : 'Selesai'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuizPage
