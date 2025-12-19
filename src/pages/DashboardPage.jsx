import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '../components/DashboardCard'
import { quizService } from '../services/quizService'
import { authService } from '../services/authService'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import useConfirm from '../hooks/useConfirm'
import ConfirmDialog from '../components/ConfirmDialog'


const DashboardPage = () => {
  const navigate = useNavigate()
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast()
  const { confirmDialog, showConfirm, hideConfirm } = useConfirm()

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [quizzesData, profileData] = await Promise.all([
        quizService.getPublishedQuizzes(),
        authService.getProfile()
      ])
      setQuizzes(quizzesData.quizzes || [])
      setUserData(profileData.data.user)
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.message.includes('401')) {
        authService.logout()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from quizzes + predefined categories
  const predefinedCategories = ['Bahasa', 'Sains', 'Matematika', 'Biologi', 'Sejarah', 'Geografi', 'Olahraga', 'Umum']
  const quizCategories = [...new Set(quizzes.map(q => q.category).filter(Boolean))]
  const allCategories = [...new Set([...predefinedCategories, ...quizCategories])]
  const categories = ['All', ...allCategories.sort()]

  // Filter quizzes by category and search
  const filteredQuizzes = quizzes.filter(quiz => {
    const quizCategory = quiz.category || 'Umum'
    const matchCategory = activeCategory === 'All' || quizCategory === activeCategory
    const matchSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  // Get avatar emoji from stored avatar
  const getAvatarEmoji = () => {
    if (!userData || !userData.avatar) return '🤖'
    const avatars = ['🍓', '🤖', '👽', '🦄', '🦁', '🐸', '🐺', '🐬', '🦉', '🌟']
    const match = userData.avatar.match(/avatar-(\d+)/)
    if (match) {
      const index = parseInt(match[1])
      return avatars[index] || '🤖'
    }
    return '🤖'
  }

  // Color gradients for quiz cards
  const colorGradients = [
    'from-blue-400 to-purple-500',
    'from-green-400 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
    'from-teal-400 to-blue-500',
    'from-indigo-400 to-purple-500',
    'from-pink-400 to-rose-500'
  ]

  const textColors = [
    'text-blue-900',
    'text-green-900',
    'text-purple-900',
    'text-yellow-900',
    'text-red-900',
    'text-teal-900',
    'text-indigo-900',
    'text-pink-900'
  ]

  // Handle join langsung ke waiting room dari dashboard dengan PIN
  const handleJoinWithPIN = () => {
    if (!pinInput.trim()) {
      showWarning("Masukkan PIN yang valid!")
      return
    }
    // Navigate to join page untuk pilih avatar dan nama
    navigate('/join', {
      state: {
        pin: pinInput.trim(),
        fromDashboard: true
      }
    })
  }


  // Handle klik quiz card untuk masuk ke take quiz
  const handleQuizClick = (quiz) => {
    showConfirm({
      title: 'Mulai Quiz?',
      message: `Apakah Anda siap mengerjakan "${quiz.title}"?\n\nKategori: ${quiz.category}\nJumlah Soal: ${quiz.questions?.length || 0}`,
      confirmText: 'Mulai',
      cancelText: 'Batal',
      confirmColor: 'blue',
      onConfirm: () => {
        navigate(`/take-quiz/${quiz._id}`, { state: { quiz } })
      }
    })
  }


  return (
    <DashboardLayout>
      {/* Header section */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md border-b border-white/20 p-3 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Mobile: Logo and Profile di atas */}
          <div className="flex items-center justify-between w-full lg:hidden">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400 stroke-text">Brain Rush</div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 p-0.5 cursor-pointer shadow-lg transition"
              onClick={() => navigate('/profile')}
            >
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl">
                {loading ? '⏳' : getAvatarEmoji()}
              </div>
            </motion.div>
          </div>

          {/* Search and PIN Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari konten"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border-2 border-blue-300 rounded-full px-6 py-2 sm:py-3 pl-10 sm:pl-12 text-gray-800 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-64 lg:w-80 shadow-md text-sm sm:text-base"
              />
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg sm:text-xl">
                🔍
              </div>
            </div>

            {/* PIN Input and Join Button */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="PIN"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="bg-white border-2 border-blue-300 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-gray-800 placeholder-gray-500 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 sm:w-32 lg:w-48 shadow-md text-sm sm:text-base"
                maxLength={6}
              />
              <motion.button
                onClick={handleJoinWithPIN}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg text-sm sm:text-base whitespace-nowrap"
              >
                GABUNG
              </motion.button>
            </div>
          </div>

          {/* Desktop: Logo and Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="text-3xl font-bold text-yellow-400 stroke-text">Brain Rush</div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 p-0.5 cursor-pointer shadow-lg transition"
              onClick={() => navigate('/profile')}
            >
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl">
                {loading ? '⏳' : getAvatarEmoji()}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>


      {/* Category buttons */}
      <div className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
              <p className="text-white text-xl font-semibold">Memuat kuis...</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap text-sm sm:text-base ${
                    activeCategory === category ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>


            {/* Quizzes grid */}
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-white text-xl font-semibold">Tidak ada kuis ditemukan</p>
                <p className="text-white/70 mt-2">Coba pilih kategori lain atau buat kuis sendiri!</p>
              </div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
              >
                {filteredQuizzes.map((quiz, index) => (
                  <DashboardCard
                    key={quiz._id}
                    title={quiz.title}
                    author={quiz.createdBy?.name || 'Anonymous'}
                    questions={quiz.questions?.length || 0}
                    modules={0}
                    image={quiz.coverImage || `https://images.pexels.com/photos/${256262 + index}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=400`}
                    bgColor={colorGradients[index % colorGradients.length]}
                    textColor={textColors[index % textColors.length]}
                    onClick={() => handleQuizClick(quiz)}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={hideConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmColor={confirmDialog.confirmColor}
      />
      <Toast {...toast} onClose={hideToast} />
    </DashboardLayout>
  )
}


export default DashboardPage
