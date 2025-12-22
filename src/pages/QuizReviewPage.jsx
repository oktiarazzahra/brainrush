// src/pages/QuizReviewPage.jsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'

const QuizReviewPage = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Data dummy quiz
  const quizData = {
    id: quizId,
    title: 'Kimia Dasar',
    totalQuestions: 5,
    score: 80,
    correctAnswers: 4
  }

  // Data soal
  const questions = [
    {
      id: 1,
      question: 'Apa lambang kimia untuk oksigen?',
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=300&fit=crop',
      options: ['O', 'O2', 'H2O', 'CO2'],
      correctAnswers: [0],
      userAnswers: [0],
      isCorrect: true,
      multipleCorrect: false,
      explanation: 'Lambang kimia untuk oksigen adalah O.'
    },
    {
      id: 2,
      question: 'Berapa nomor atom karbon?',
      image: null,
      options: ['4', '6', '8', '12'],
      correctAnswers: [1],
      userAnswers: [1],
      isCorrect: true,
      multipleCorrect: false,
      explanation: 'Nomor atom karbon adalah 6.'
    },
    {
      id: 3,
      question: 'Apa rumus kimia air?',
      image: 'https://images.unsplash.com/photo-1548256551-2370ea4c2149?w=600&h=300&fit=crop',
      options: ['H2O', 'CO2', 'O2', 'H2O2'],
      correctAnswers: [0],
      userAnswers: [0],
      isCorrect: true,
      multipleCorrect: false,
      explanation: 'Rumus kimia air adalah H2O.'
    },
    {
      id: 4,
      question: 'Unsur apa yang memiliki simbol Fe?',
      image: null,
      options: ['Fluorin', 'Besi', 'Fosfor', 'Ferrum'],
      correctAnswers: [1],
      userAnswers: [2],
      isCorrect: false,
      multipleCorrect: false,
      explanation: 'Fe adalah simbol untuk Besi (dari bahasa Latin: Ferrum).'
    },
    {
      id: 5,
      question: 'Manakah yang termasuk gas mulia?',
      image: null,
      options: ['Helium', 'Neon', 'Argon', 'Nitrogen'],
      correctAnswers: [0, 1, 2],
      userAnswers: [0, 1, 2],
      isCorrect: true,
      multipleCorrect: true,
      explanation: 'Gas mulia adalah Helium, Neon, dan Argon. Nitrogen bukan gas mulia.'
    }
  ]

  const currentQ = questions[currentQuestion]
  const colors = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200']

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-lg">{quizData.title}</h1>
            <p className="text-white text-xs sm:text-sm">Review Jawaban - Skor: {quizData.score}</p>
          </div>
          <button
            onClick={() => navigate('/schedule')}
            className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg transition font-semibold text-xs sm:text-base"
          >
            ← Kembali
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 pb-4 sm:pb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Question Number Tabs */}
                <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`min-w-[48px] sm:min-w-[60px] h-10 sm:h-12 rounded-lg font-bold text-base sm:text-lg transition shadow-md ${
                        currentQuestion === index
                          ? 'bg-blue-600 text-white scale-110'
                          : questions[index].isCorrect
                          ? 'bg-green-400 text-green-900 hover:bg-green-500'
                          : 'bg-red-300 text-red-900 hover:bg-red-400'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Status */}
                <div className={`inline-block px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold mb-3 sm:mb-5 text-xs sm:text-base ${
                  currentQ.isCorrect ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                }`}>
                  {currentQ.isCorrect ? '✓ Jawaban Benar' : '✗ Jawaban Salah'}
                </div>

                {/* Question Box - SAMA PERSIS DENGAN CREATE QUIZ */}
                <div className="mb-4 sm:mb-5">
                  <input
                    type="text"
                    className="w-full bg-gray-200 text-sm sm:text-base md:text-lg font-semibold px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow-md text-center pointer-events-none"
                    value={currentQ.question}
                    readOnly
                  />
                </div>

                {/* Image Box - SAMA PERSIS */}
                <div className="w-full flex justify-center mb-4 sm:mb-5">
                  <div className="bg-gray-100 h-[120px] sm:h-[150px] w-full max-w-[450px] flex items-center justify-center font-bold text-sm sm:text-base text-gray-600 rounded-xl shadow-md">
                    {currentQ.image ? (
                      <img 
                        src={currentQ.image} 
                        alt="Gambar Soal" 
                        className="h-[100px] sm:h-[120px] rounded-lg object-cover" 
                      />
                    ) : (
                      'Upload Gambar..'
                    )}
                  </div>
                </div>

                {/* Options Grid - SAMA PERSIS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-x-6 sm:gap-y-4 mb-6 sm:mb-8">
                  {currentQ.options.map((option, i) => {
                    const isCorrect = currentQ.correctAnswers.includes(i)
                    const isUserAnswer = currentQ.userAnswers.includes(i)
                    const isWrong = isUserAnswer && !isCorrect
                    
                    return (
                      <div 
                        key={i} 
                        className={`${colors[i]} p-4 sm:p-6 rounded-xl font-bold text-sm sm:text-base md:text-lg flex items-center relative shadow-md ${
                          isCorrect ? 'ring-4 ring-green-600' : 
                          isWrong ? 'ring-4 ring-red-600' : ''
                        }`}
                      >
                        <div className="bg-transparent w-full font-bold text-sm sm:text-base flex items-center justify-between">
                          <span className="break-words">{option}</span>
                          {isCorrect && <span className="text-green-700 text-xl sm:text-2xl ml-2">✓</span>}
                          {isWrong && <span className="text-red-700 text-xl sm:text-2xl ml-2">✗</span>}
                        </div>
                        <div
                          className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-2 flex items-center justify-center transition ${
                            currentQ.multipleCorrect ? 'rounded-md' : 'rounded-full'
                          } ${
                            isCorrect 
                              ? 'bg-green-600 border-green-600' 
                              : isWrong
                              ? 'bg-red-600 border-red-600'
                              : 'bg-white border-gray-600'
                          }`}
                        >
                          {(isCorrect || isWrong) && (
                            <span className="text-white font-bold text-sm sm:text-lg">
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Toggle Buttons - SAMA PERSIS */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
                  <button
                    type="button"
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-lg shadow-md border-2 border-gray-300 transition pointer-events-none ${
                      !currentQ.multipleCorrect ? 'bg-blue-800 text-white' : 'bg-white'
                    }`}
                  >
                    Satu jawaban benar
                  </button>
                  <button
                    type="button"
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold rounded-lg shadow-md border-2 border-gray-300 transition pointer-events-none ${
                      currentQ.multipleCorrect ? 'bg-blue-800 text-white' : 'bg-white'
                    }`}
                  >
                    Beberapa jawaban benar
                  </button>
                </div>

                {/* Explanation Box */}
                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
                  <h4 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">💡 Pembahasan:</h4>
                  <p className="text-gray-800 text-xs sm:text-sm md:text-base">{currentQ.explanation}</p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-2 pt-3 sm:pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="flex-shrink-0 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 text-gray-800 font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-lg transition shadow-md text-xs sm:text-base"
                  >
                    ← Sebelumnya
                  </button>

                  <span className="text-gray-700 font-semibold text-[11px] sm:text-sm text-center whitespace-nowrap flex-shrink-0">
                    Soal {currentQuestion + 1} dari {questions.length}
                  </span>

                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={() => navigate('/schedule')}
                      className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-lg transition shadow-lg text-xs sm:text-base"
                    >
                      Simpan soal
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-lg transition shadow-lg text-xs sm:text-base"
                    >
                      Selanjutnya →
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default QuizReviewPage
