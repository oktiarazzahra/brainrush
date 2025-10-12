import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'

const kuisDikerjakan = [
  {
    id: 11,
    title: 'Kimia Dasar',
    soal: 10,
    score: 80,
    tanggal: '10 Oktober 2025',
    author: 'Brain_Rush',
    image: 'https://placeimg.com/320/180/tech',
    bgColor: 'from-blue-200 to-blue-300',
  },
  {
    id: 12,
    title: 'Logika Matematika',
    soal: 8,
    score: 95,
    tanggal: '11 Oktober 2025',
    author: 'Brain_Rush',
    image: 'https://placeimg.com/320/180/nature',
    bgColor: 'from-green-200 to-green-300',
  },
]

const BelajarMandiriPage = () => {
  const navigate = useNavigate()
  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">Belajar Mandiri</h1>
        </div>
        <main className="flex-1 bg-blue-900 mx-8 rounded-tl-lg p-8 mb-8 overflow-y-auto">
          {/* Count */}
          <div className="mb-6 inline-block bg-sky-400 text-white font-bold px-4 py-1 rounded-full text-sm">
            {kuisDikerjakan.length} Kuis Dikerjakan
          </div>

          {/* Daftar kartu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kuisDikerjakan.map((quiz, idx) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer relative"
                onClick={() => navigate(`/quiz-results/${quiz.id}`)}
              >
                <div className={`h-36 bg-gradient-to-r ${quiz.bgColor} flex items-center justify-center overflow-hidden`}>
                  <img src={quiz.image} alt={quiz.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{quiz.author}</p>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
                    <p className="text-sm text-gray-500 font-semibold">{quiz.soal} Soal</p>
                    <span className="text-xs bg-green-200 text-green-800 rounded-full px-2 py-0.5 font-bold mr-2">Score: {quiz.score}</span>
                    <span className="text-xs text-blue-800 font-medium">{quiz.tanggal}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {kuisDikerjakan.length === 0 && (
            <div className="text-center text-white mt-32">
              <div className="mb-4">
                <svg className="w-24 h-24 mx-auto text-blue-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path>
                </svg>
              </div>
              <p className="text-2xl font-bold mb-2">Belum ada kuis yang kamu kerjakan</p>
              <p className="text-lg text-blue-200 mb-6">Mulai kerjakan quiz mandiri sekarang!</p>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}

export default BelajarMandiriPage
