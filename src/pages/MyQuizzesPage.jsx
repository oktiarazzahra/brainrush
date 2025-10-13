// src/pages/MyQuizzesPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'

const MyQuizzesPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Draft')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showLiveModal, setShowLiveModal] = useState(false)
  const [liveCode, setLiveCode] = useState('')
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [selectedQuizAccess, setSelectedQuizAccess] = useState('public')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // DRAFT - Quiz yang baru dibuat atau belum dipublish
  const draftQuizzes = [
    {
      id: 3,
      title: 'Belajar Matematika Dasar',
      questions: 5,
      author: 'Brain_Rush',
      image: 'https://placeimg.com/320/180/tech',
      bgColor: 'from-blue-200 to-blue-300',
      access: 'private',
      isDraft: true
    },
    {
      id: 6,
      title: 'Fisika Kuantum',
      questions: 8,
      author: 'Brain_Rush',
      image: 'https://placeimg.com/320/180/nature',
      bgColor: 'from-green-200 to-green-300',
      access: 'private',
      isDraft: true
    }
  ]

  // MY QUIZ - Quiz yang sudah dipublish dan siap dimainkan
  const myQuizzes = [
    {
      id: 1,
      title: 'Ketahui Jenis Jenis Bakteri',
      questions: 20,
      author: 'Brain_Rush',
      image: 'https://placeimg.com/320/180/nature',
      bgColor: 'from-purple-200 to-purple-300',
      access: 'public',
      isPublished: true
    },
    {
      id: 2,
      title: 'Belajar Bahasa Asing',
      questions: 10,
      author: 'Brain_Rush',
      image: 'https://placeimg.com/320/180/animals',
      bgColor: 'from-yellow-200 to-orange-300',
      access: 'public',
      isPublished: true
    }
  ]

  // HISTORY - Quiz yang sudah pernah dimainkan live
  const historyQuizzes = [
    {
      id: 4,
      title: 'Quiz Sejarah Indonesia',
      questions: 15,
      author: 'Brain_Rush',
      image: 'https://placeimg.com/320/180/arch',
      bgColor: 'from-green-200 to-green-300',
      played: '2 hari lalu',
      totalPlayers: 45,
      access: 'public',
      hasHistory: true
    },
    {
      id: 5,
      title: 'Matematika Kelas 10',
      questions: 20,
      author: 'Brain_Rush',
      image: 'https://placeimg.com/320/180/tech',
      bgColor: 'from-blue-200 to-blue-300',
      played: '5 hari lalu',
      totalPlayers: 32,
      access: 'public',
      hasHistory: true
    }
  ]

  const getQuizzesByTab = () => {
    if (activeTab === 'Draft') return draftQuizzes
    if (activeTab === 'My Quiz') return myQuizzes
    if (activeTab === 'History') return historyQuizzes
    return []
  }

  // Generate random 6-digit code
  const generateLiveCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Handler functions
  const handleEdit = (quizId) => {
    console.log('Edit quiz:', quizId)
    navigate(`/edit-quiz/${quizId}`)
    setOpenMenuId(null)
  }

  const handleBuatLive = (quizId) => {
    const code = generateLiveCode()
    setLiveCode(code)
    setShowLiveModal(true)
    setOpenMenuId(null)
  }

  const handleAkses = (quizId, currentAccess) => {
    setSelectedQuizAccess(currentAccess)
    setShowAccessModal(true)
    setOpenMenuId(null)
  }

  const handleDuplikat = (quizId, quizTitle) => {
    const confirmDuplikat = window.confirm(`Duplikat quiz "${quizTitle}"?\n\nQuiz baru akan masuk ke Draft.`)
    if (confirmDuplikat) {
      console.log('Duplikat quiz:', quizId)
      alert('Quiz berhasil diduplikat dan masuk ke Draft!')
    }
    setOpenMenuId(null)
  }

  const handleDelete = (quizId, quizTitle) => {
    const confirmDelete = window.confirm(`Yakin ingin menghapus quiz "${quizTitle}"?\n\nQuiz yang dihapus tidak bisa dikembalikan.`)
    if (confirmDelete) {
      console.log('Deleting quiz:', quizId)
      alert('Quiz berhasil dihapus!')
    }
    setOpenMenuId(null)
  }

  // Handler untuk Draft
  const handlePublish = (quizId, quizTitle) => {
    const confirmPublish = window.confirm(`Publish quiz "${quizTitle}"?\n\nQuiz akan dipindahkan ke "My Quiz" dan siap untuk dimainkan live.`)
    if (confirmPublish) {
      console.log('Publishing quiz:', quizId)
      alert('Quiz berhasil dipublish!\nQuiz sekarang ada di tab "My Quiz".')
    }
    setOpenMenuId(null)
  }

  // Handler untuk My Quiz
  const handleUnpublish = (quizId, quizTitle) => {
    const confirmUnpublish = window.confirm(`Unpublish quiz "${quizTitle}"?\n\nQuiz akan dikembalikan ke Draft.`)
    if (confirmUnpublish) {
      console.log('Unpublish quiz:', quizId)
      alert('Quiz dikembalikan ke Draft!')
    }
    setOpenMenuId(null)
  }

  // Handler untuk History
  const handleLihatHasil = (quizId) => {
    console.log('Lihat hasil quiz:', quizId)
    navigate(`/quiz-results/${quizId}`)
    setOpenMenuId(null)
  }

  const handleShare = (quizId) => {
    const link = `https://brainrush.com/results/${quizId}`
    setShareLink(link)
    setShowShareModal(true)
    setOpenMenuId(null)
  }

  const handleMainLagi = (quizId) => {
    const code = generateLiveCode()
    setLiveCode(code)
    setShowLiveModal(true)
    setOpenMenuId(null)
  }

  const handleArsipkan = (quizId, quizTitle) => {
    const confirmArsip = window.confirm(`Arsipkan "${quizTitle}" dari history?`)
    if (confirmArsip) {
      console.log('Arsipkan history:', quizId)
      alert('Quiz history berhasil diarsipkan!')
    }
    setOpenMenuId(null)
  }

  const toggleMenu = (quizId) => {
    setOpenMenuId(openMenuId === quizId ? null : quizId)
  }

  // Render menu berdasarkan tab aktif
  const renderMenuItems = (quiz) => {
    if (activeTab === 'Draft') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(quiz.id)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePublish(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-green-50 transition flex items-center gap-3 text-green-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Publish
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDuplikat(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplikat
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-red-50 transition flex items-center gap-3 text-red-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </>
      )
    } else if (activeTab === 'My Quiz') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(quiz.id)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleBuatLive(quiz.id)
            }}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center gap-3 text-blue-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Buat Live
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAkses(quiz.id, quiz.access)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Akses
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDuplikat(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplikat
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleUnpublish(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-orange-50 transition flex items-center gap-3 text-orange-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Unpublish
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-red-50 transition flex items-center gap-3 text-red-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </>
      )
    } else if (activeTab === 'History') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLihatHasil(quiz.id)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Lihat Hasil
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleShare(quiz.id)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMainLagi(quiz.id)
            }}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition flex items-center gap-3 text-blue-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Main Lagi
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleArsipkan(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Arsipkan
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(quiz.id, quiz.title)
            }}
            className="w-full px-4 py-3 text-left hover:bg-red-50 transition flex items-center gap-3 text-red-600 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </>
      )
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-3xl font-bold text-yellow-300 drop-shadow-lg">Brain Rush</h1>
          <div className="flex items-center gap-3">
            <span className="bg-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow">Dashboard saya</span>
            <img 
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=sunflower99" 
              alt="Profile" 
              className="h-11 w-11 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>

        <div className="flex gap-0 px-8 mt-6">
          <button
            onClick={() => setActiveTab('Draft')}
            className={`font-semibold text-lg px-10 py-3 rounded-t-lg border-r border-gray-400 shadow-md transition ${
              activeTab === 'Draft' ? 'bg-gray-100 text-blue-900' : 'bg-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setActiveTab('My Quiz')}
            className={`font-bold text-lg px-10 py-3 rounded-t-lg border-r border-gray-400 shadow-md transition ${
              activeTab === 'My Quiz' ? 'bg-gray-100 text-blue-900' : 'bg-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Quiz
          </button>
          <button
            onClick={() => setActiveTab('History')}
            className={`font-semibold text-lg px-10 py-3 rounded-t-lg shadow-md transition ${
              activeTab === 'History' ? 'bg-gray-100 text-blue-900' : 'bg-gray-300 text-gray-600 hover:bg-gray-200'
            }`}
          >
            History
          </button>
        </div>

        <main className="flex-1 bg-blue-900 mx-8 rounded-tl-lg p-8 mb-8 overflow-y-auto">
          {getQuizzesByTab().length > 0 && (
            <div className="mb-6 inline-block bg-sky-400 text-white font-bold px-4 py-1 rounded-full text-sm">
              {getQuizzesByTab().length} Quiz
            </div>
          )}

          {activeTab === 'Draft' && (
            <div className="mb-8">
              <button
                onClick={() => navigate('/create-quiz')}
                className="bg-sky-400 hover:bg-sky-500 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span className="text-2xl">+</span>
                Buat Kuis Baru
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getQuizzesByTab().map((quiz, index) => (
              <motion.div
                key={quiz.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Badge Draft/Published */}
                {quiz.isDraft && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    DRAFT
                  </div>
                )}
                {quiz.isPublished && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    PUBLISHED
                  </div>
                )}

                {/* Three Dots Menu Button - DIPERKECIL */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMenu(quiz.id)
                  }}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md z-10 transition"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openMenuId === quiz.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-14 right-3 bg-white rounded-lg shadow-xl z-20 overflow-hidden"
                      style={{ minWidth: '180px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderMenuItems(quiz)}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div 
                  className={`h-36 bg-gradient-to-r ${quiz.bgColor} flex items-center justify-center overflow-hidden`}
                  onClick={() => activeTab === 'History' ? handleLihatHasil(quiz.id) : navigate(`/edit-quiz/${quiz.id}`)}
                >
                  <img src={quiz.image} alt={quiz.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{quiz.author}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-semibold">{quiz.questions} Soal</p>
                    {quiz.played && <p className="text-xs text-gray-400">{quiz.played}</p>}
                    {quiz.totalPlayers && <p className="text-xs text-blue-600 font-semibold">{quiz.totalPlayers} pemain</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {getQuizzesByTab().length === 0 && (
            <div className="text-center text-white mt-32">
              <div className="mb-4">
                <svg className="w-24 h-24 mx-auto text-blue-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path>
                </svg>
              </div>
              <p className="text-2xl font-bold mb-2">Belum ada quiz di {activeTab}</p>
              <p className="text-lg text-blue-200 mb-6">
                {activeTab === 'Draft' && 'Quiz yang baru dibuat akan otomatis masuk ke Draft'}
                {activeTab === 'My Quiz' && 'Publish quiz dari Draft untuk mulai main live'}
                {activeTab === 'History' && 'History quiz yang pernah dimainkan akan muncul di sini'}
              </p>
              {activeTab === 'Draft' && (
                <button
                  onClick={() => navigate('/create-quiz')}
                  className="bg-sky-400 hover:bg-sky-500 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg transition"
                >
                  + Buat Kuis Pertama
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal Live Code */}
      <AnimatePresence>
        {showLiveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Quiz Live Code</h2>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-6">
                <p className="text-white text-center text-5xl font-bold tracking-wider">{liveCode}</p>
              </div>
              <p className="text-gray-600 text-center mb-6">
                Bagikan kode ini kepada peserta untuk join quiz live!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(liveCode)
                    alert('Kode berhasil dicopy!')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Copy Kode
                </button>
                <button
                  onClick={() => setShowLiveModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Akses */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pengaturan Akses Quiz</h2>
              
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => setSelectedQuizAccess('public')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                    selectedQuizAccess === 'public' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedQuizAccess === 'public' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedQuizAccess === 'public' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-800">Public</p>
                    <p className="text-sm text-gray-600">Semua orang bisa mengakses quiz ini</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedQuizAccess('private')}
                  className={`w-full p-4 rounded-xl border-2 transition flex items-center gap-4 ${
                    selectedQuizAccess === 'private' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedQuizAccess === 'private' ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedQuizAccess === 'private' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-gray-800">Private</p>
                    <p className="text-sm text-gray-600">Hanya kamu yang bisa mengakses quiz ini</p>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log('Akses diubah ke:', selectedQuizAccess)
                    alert(`Akses quiz berhasil diubah ke ${selectedQuizAccess}!`)
                    setShowAccessModal(false)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Share */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Share Hasil Quiz</h2>
              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-gray-700 text-sm break-all">{shareLink}</p>
              </div>
              <p className="text-gray-600 text-center mb-6">
                Bagikan link ini untuk melihat hasil quiz!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink)
                    alert('Link berhasil dicopy!')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default MyQuizzesPage
