import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'

const BelajarMandiriPage = () => {
  const navigate = useNavigate()
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const scheduledQuizzes = [
    {
      id: 1,
      title: 'Kimia Dasar',
      category: 'Sains',
      questions: 10,
      score: 85,
      date: '10 Okt 2025',
      image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=250&fit=crop',
      bgColor: 'from-blue-200 to-blue-400',
      difficulty: 'Sedang',
      timeSpent: '15 menit'
    },
    {
      id: 2,
      title: 'Logika Matematika',
      category: 'Matematika',
      questions: 8,
      score: 95,
      date: '11 Okt 2025',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop',
      bgColor: 'from-green-200 to-green-400',
      difficulty: 'Mudah',
      timeSpent: '10 menit'
    },
    {
      id: 3,
      title: 'Bahasa Inggris',
      category: 'Bahasa',
      questions: 15,
      score: 70,
      date: '9 Okt 2025',
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop',
      bgColor: 'from-purple-200 to-purple-400',
      difficulty: 'Sulit',
      timeSpent: '20 menit'
    }
  ]

  const quizQuestions = [
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
      explanation: 'Gas mulia adalah Helium, Neon, dan Argon.'
    }
  ]
  
  const colors = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200']
  const currentQ = selectedQuiz ? quizQuestions[currentQuestion] : null
  const totalQuiz = scheduledQuizzes.length
  const totalScore = scheduledQuizzes.reduce((sum, q) => sum + q.score, 0)
  const avgScore = Math.round(totalScore / totalQuiz)
  const collectCategory = [...new Set(scheduledQuizzes.map(q => q.category))]

  const handleOpenReview = (quiz) => { setSelectedQuiz(quiz); setCurrentQuestion(0) }
  const handleCloseReview = () => { setSelectedQuiz(null); setCurrentQuestion(0) }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 mx-4 rounded-2xl p-8 mb-8 mt-8 overflow-y-auto min-h-[70vh]">
          
          {/* Stats Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📈 Statistik Belajar
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
              >
                <p className="text-gray-600 text-xs font-semibold mb-1">Total Kuis</p>
                <p className="text-3xl font-bold text-blue-600">{totalQuiz}</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
              >
                <p className="text-gray-600 text-xs font-semibold mb-1">Rata-rata Skor</p>
                <p className="text-3xl font-bold text-yellow-600">{avgScore}</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
              >
                <p className="text-gray-600 text-xs font-semibold mb-1">Kategori</p>
                <p className="text-3xl font-bold text-green-600">{collectCategory.length}</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
              >
                <p className="text-gray-600 text-xs font-semibold mb-1">Total Soal</p>
                <p className="text-3xl font-bold text-purple-600">{scheduledQuizzes.reduce((sum, q) => sum + q.questions, 0)}</p>
              </motion.div>
            </div>
          </div>

          {/* Quiz Cards Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📚 Quiz Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleOpenReview(quiz)}
                >
                  {/* Image Header */}
                  <div className={`h-40 bg-gradient-to-r ${quiz.bgColor} flex items-center justify-center overflow-hidden relative`}>
                    <img 
                      src={quiz.image} 
                      alt={quiz.title} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <span className="bg-white/95 rounded-full px-3 py-1 text-xs font-bold text-gray-700">
                        {quiz.category}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                        quiz.difficulty === 'Mudah' ? 'bg-green-500' :
                        quiz.difficulty === 'Sedang' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 group-hover:text-blue-600 transition">{quiz.title}</h3>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600">Soal</p>
                        <p className="font-bold text-blue-600">{quiz.questions}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600">Skor</p>
                        <p className="font-bold text-green-600">{quiz.score}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2 text-center col-span-2">
                        <p className="text-xs text-gray-600">⏱️ Waktu</p>
                        <p className="font-bold text-purple-600">{quiz.timeSpent}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">{quiz.date}</p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-xs font-bold transition"
                      >
                        Review →
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* Modal Review - TETAP SAMA */}
      <AnimatePresence>
        {selectedQuiz && currentQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-900 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-between px-8 pt-6 pb-4 bg-blue-900">
              <div>
                <h1 className="text-3xl font-bold text-yellow-300">{selectedQuiz.title}</h1>
                <p className="text-white text-sm">Review Jawaban - Skor: {selectedQuiz.score}</p>
              </div>
              <button
                onClick={handleCloseReview}
                className="bg-white/20 hover:bg-white/30 text-white px-5 py-2 rounded-lg transition font-semibold"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="px-8 pb-8">
              <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Tab Soal */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      {quizQuestions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestion(index)}
                          className={`min-w-[60px] h-12 rounded-lg font-bold text-lg transition shadow-md ${
                            currentQuestion === index
                              ? 'bg-blue-600 text-white scale-110'
                              : quizQuestions[index].isCorrect
                              ? 'bg-green-400 text-green-900'
                              : 'bg-red-300 text-red-900'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    {/* Status */}
                    <div className={`inline-block px-5 py-2 rounded-full font-bold mb-5 ${
                      currentQ.isCorrect ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                    }`}>
                      {currentQ.isCorrect ? '✓ Jawaban Benar' : '✗ Jawaban Salah'}
                    </div>
                    {/* Question Box */}
                    <div className="mb-5">
                      <input
                        type="text"
                        className="w-full bg-gray-200 text-lg font-semibold px-5 py-3 rounded-lg shadow-md text-center"
                        value={currentQ.question}
                        readOnly
                      />
                    </div>
                    {/* Image Box */}
                    <div className="w-full flex justify-center mb-5">
                      <div className="bg-gray-100 h-[150px] w-full max-w-[450px] flex items-center justify-center font-bold text-base text-gray-600 rounded-xl shadow-md">
                        {currentQ.image ? (
                          <img src={currentQ.image} alt="Gambar Soal" className="h-[120px] rounded-lg object-cover" />
                        ) : (
                          'Upload Gambar..'
                        )}
                      </div>
                    </div>
                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
                      {currentQ.options.map((option, i) => {
                        const isCorrect = currentQ.correctAnswers.includes(i)
                        const isUserAnswer = currentQ.userAnswers.includes(i)
                        const isWrong = isUserAnswer && !isCorrect
                        return (
                          <div 
                            key={i} 
                            className={`${colors[i]} p-6 rounded-xl font-bold text-lg flex items-center relative shadow-md ${
                              isCorrect ? 'ring-4 ring-green-600' : isWrong ? 'ring-4 ring-red-600' : ''
                            }`}
                          >
                            <div className="w-full flex items-center justify-between">
                              <span>{option}</span>
                              {isCorrect && <span className="text-green-700 text-2xl">✓</span>}
                              {isWrong && <span className="text-red-700 text-2xl">✗</span>}
                            </div>
                            <div
                              className={`absolute top-4 right-4 w-8 h-8 border-2 flex items-center justify-center ${
                                currentQ.multipleCorrect ? 'rounded-md' : 'rounded-full'
                              } ${
                                isCorrect ? 'bg-green-600 border-green-600' : 
                                isWrong ? 'bg-red-600 border-red-600' : 'bg-white border-gray-600'
                              }`}
                            >
                              {(isCorrect || isWrong) && (
                                <span className="text-white text-lg">{isCorrect ? '✓' : '✗'}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* Toggle */}
                    <div className="mb-6 flex gap-6 justify-center">
                      <button className={`px-6 py-2.5 font-bold rounded-lg shadow-md border-2 border-gray-300 ${
                        !currentQ.multipleCorrect ? 'bg-blue-800 text-white' : 'bg-white'
                      }`}>
                        Satu jawaban benar
                      </button>
                      <button className={`px-6 py-2.5 font-bold rounded-lg shadow-md border-2 border-gray-300 ${
                        currentQ.multipleCorrect ? 'bg-blue-800 text-white' : 'bg-white'
                      }`}>
                        Beberapa jawaban benar
                      </button>
                    </div>
                    {/* Explanation */}
                    <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-5 mb-6">
                      <h4 className="font-bold text-blue-900 mb-2">💡 Pembahasan:</h4>
                      <p className="text-gray-800">{currentQ.explanation}</p>
                    </div>
                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                      <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-bold px-8 py-3 rounded-xl"
                      >
                        ← Sebelumnya
                      </button>
                      <span className="text-gray-700 font-bold">
                        Soal {currentQuestion + 1} dari {quizQuestions.length}
                      </span>
                      <button
                        onClick={() => {
                          if (currentQuestion < quizQuestions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1)
                          } else {
                            handleCloseReview()
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl"
                      >
                        {currentQuestion < quizQuestions.length - 1 ? 'Selanjutnya →' : 'Selesai'}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default BelajarMandiriPage
