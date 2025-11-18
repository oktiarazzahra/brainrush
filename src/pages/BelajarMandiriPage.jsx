import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import { learningService } from '../services/learningService'

const BelajarMandiriPage = () => {
  const navigate = useNavigate()
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scheduledQuizzes, setScheduledQuizzes] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  // Fetch learning history on mount
  useEffect(() => {
    fetchLearningHistory()
  }, [])

  const fetchLearningHistory = async () => {
    try {
      setLoading(true)
      const [historyResponse, statsResponse] = await Promise.all([
        learningService.getLearningHistory(),
        learningService.getLearningStats()
      ])

      // Format history data for UI
      const formattedQuizzes = historyResponse.data.history.map((item, index) => {
        const bgColors = ['from-blue-200 to-blue-400', 'from-green-200 to-green-400', 'from-purple-200 to-purple-400', 'from-pink-200 to-pink-400']
        const difficulties = ['Mudah', 'Sedang', 'Sulit']
        
        return {
          id: item.id,
          title: item.quizTitle,
          category: item.category,
          questions: 0, // Will be populated when viewing details
          score: item.percentage,
          date: new Date(item.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          image: null,
          bgColor: bgColors[index % bgColors.length],
          difficulty: difficulties[Math.floor(item.percentage / 34)], // 0-33: Sulit, 34-66: Sedang, 67-100: Mudah
          timeSpent: '-'
        }
      })

      setScheduledQuizzes(formattedQuizzes)
      setStats(statsResponse.data.stats)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching learning history:', err)
      setError('Gagal memuat riwayat belajar')
      setLoading(false)
    }
  }

  const fetchQuizDetails = async (scoreId) => {
    try {
      const response = await learningService.getLearningResult(scoreId)
      const result = response.data.result

      // Format questions for review modal
      const formattedQuestions = result.answers.map((answer) => {
        const isMultiple = Array.isArray(answer.correctAnswer)
        
        return {
          id: answer.questionNumber,
          question: answer.questionText,
          image: null,
          options: answer.options || [],
          correctAnswers: Array.isArray(answer.correctAnswer) ? answer.correctAnswer : [answer.correctAnswer],
          userAnswers: Array.isArray(answer.userAnswer) ? answer.userAnswer : [answer.userAnswer],
          isCorrect: answer.isCorrect,
          multipleCorrect: isMultiple,
          explanation: answer.explanation || 'Tidak ada penjelasan tersedia.'
        }
      })

      setQuizQuestions(formattedQuestions)
    } catch (err) {
      console.error('Error fetching quiz details:', err)
      alert('Gagal memuat detail quiz')
    }
  }
  
  const colors = ['bg-pink-200', 'bg-green-200', 'bg-yellow-100', 'bg-blue-200']
  const currentQ = selectedQuiz ? quizQuestions[currentQuestion] : null
  const totalQuiz = scheduledQuizzes.length
  const avgScore = stats?.averagePercentage || 0
  const collectCategory = [...new Set(scheduledQuizzes.map(q => q.category))]
  const totalQuestions = scheduledQuizzes.reduce((sum, q) => sum + (q.questions || 0), 0)

  const handleOpenReview = async (quiz) => { 
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    await fetchQuizDetails(quiz.id)
  }
  
  const handleCloseReview = () => { 
    setSelectedQuiz(null)
    setCurrentQuestion(0)
    setQuizQuestions([])
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
            <p className="text-gray-700 text-xl font-bold">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchLearningHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 mx-4 rounded-2xl p-8 mb-8 mt-8 overflow-y-auto min-h-[70vh]">
          
          {/* Empty State */}
          {scheduledQuizzes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Riwayat</h2>
                <p className="text-gray-600 mb-6">Mulai belajar dengan mengerjakan quiz!</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Cari Quiz
                </button>
              </div>
            </div>
          ) : (
            <>
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
                <p className="text-gray-600 text-xs font-semibold mb-1">Skor Tertinggi</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.bestQuizPercentage || 0}</p>
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
                    {quiz.image ? (
                      <>
                        <img 
                          src={quiz.image} 
                          alt={quiz.title} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                      </>
                    ) : (
                      <div className="text-6xl opacity-50">📚</div>
                    )}
                    
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
                      <div className="bg-green-50 rounded-lg p-2 text-center col-span-2">
                        <p className="text-xs text-gray-600">Skor</p>
                        <p className="font-bold text-green-600">{quiz.score}%</p>
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
          </>
          )}

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
