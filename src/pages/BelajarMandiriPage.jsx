// src/pages/BelajarMandiriPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'

const BelajarMandiriPage = () => {
  const navigate = useNavigate()
  const [selectedQuiz, setSelectedQuiz] = useState(null)

  const completedQuizzes = [
    {
      id: 11,
      title: 'Kimia Dasar',
      questions: 10,
      score: 85,
      date: '10 Okt 2025',
      bgColor: 'from-blue-200 to-blue-300',
      answered: 10,
      correct: 8,
      wrong: 2,
      timeSpent: '15 menit',
      category: 'Sains'
    },
    {
      id: 12,
      title: 'Logika Matematika',
      questions: 8,
      score: 95,
      date: '11 Okt 2025',
      bgColor: 'from-green-200 to-green-300',
      answered: 8,
      correct: 7,
      wrong: 1,
      timeSpent: '12 menit',
      category: 'Matematika'
    },
    {
      id: 13,
      title: 'Bahasa Inggris',
      questions: 15,
      score: 70,
      date: '9 Okt 2025',
      bgColor: 'from-purple-200 to-purple-300',
      answered: 15,
      correct: 10,
      wrong: 5,
      timeSpent: '20 menit',
      category: 'Bahasa'
    }
  ]

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">Belajar Mandiri</h1>
          <div className="flex items-center gap-3">
            <span className="bg-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow">
              {completedQuizzes.length} Quiz Selesai
            </span>
          </div>
        </div>
        
        <main className="flex-1 bg-blue-900 mx-8 rounded-tl-lg p-8 mb-8 overflow-y-auto">
          <div className="mb-6 inline-block bg-sky-400 text-white font-bold px-4 py-1 rounded-full text-sm">
            {completedQuizzes.length} Kuis Dikerjakan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map((quiz, idx) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className={`h-36 bg-gradient-to-r ${quiz.bgColor} flex items-center justify-center relative`}>
                  <p className="text-2xl font-bold text-gray-700">{quiz.title}</p>
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1">
                    <span className="text-xs font-bold text-gray-700">{quiz.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{quiz.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 font-semibold">{quiz.questions} Soal</p>
                    <span className="text-xs bg-green-200 text-green-800 rounded-full px-3 py-1 font-bold">
                      Score: {quiz.score}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600">{quiz.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal Detail Quiz */}
      <AnimatePresence>
        {selectedQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedQuiz(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{selectedQuiz.title}</h2>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Skor Besar */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-6 text-center">
                <p className="text-white text-sm mb-2">Skor Akhir</p>
                <p className="text-white text-6xl font-bold">{selectedQuiz.score}</p>
                <p className="text-white/80 text-sm mt-2">dari 100</p>
              </div>

              {/* Statistik Detail */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-green-600 font-bold text-3xl">{selectedQuiz.correct}</p>
                  <p className="text-gray-600 text-sm">Benar</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-red-600 font-bold text-3xl">{selectedQuiz.wrong}</p>
                  <p className="text-gray-600 text-sm">Salah</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-600 font-bold text-2xl">{selectedQuiz.questions}</p>
                  <p className="text-gray-600 text-sm">Total Soal</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-purple-600 font-bold text-2xl">{selectedQuiz.timeSpent}</p>
                  <p className="text-gray-600 text-sm">Waktu</p>
                </div>
              </div>

              {/* Info Tambahan */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-semibold text-gray-800">{selectedQuiz.category}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-semibold text-gray-800">{selectedQuiz.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Akurasi:</span>
                  <span className="font-semibold text-gray-800">
                    {Math.round((selectedQuiz.correct / selectedQuiz.questions) * 100)}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    alert('Fitur Review Jawaban akan segera hadir!')
                    setSelectedQuiz(null)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Review Jawaban
                </button>
                <button
                  onClick={() => {
                    alert('Mengerjakan ulang quiz...')
                    setSelectedQuiz(null)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Kerjakan Ulang
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default BelajarMandiriPage
