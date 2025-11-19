import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import { quizService } from '../services/quizService'


const MyQuizzesPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Draft')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [selectedQuizAccess, setSelectedQuizAccess] = useState('public')
  const [selectedQuizId, setSelectedQuizId] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [showCoverModal, setShowCoverModal] = useState(false)
  const [selectedQuizForCover, setSelectedQuizForCover] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [selectedCoverFile, setSelectedCoverFile] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    fetchMyQuizzes()
  }, [])


  const fetchMyQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await quizService.getMyQuizzes()
      console.log('✅ Quizzes loaded:', data.quizzes)
      setQuizzes(data.quizzes || [])
    } catch (err) {
      console.error('❌ Error loading quizzes:', err)
      setError('Gagal memuat quiz. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }


  const getQuizzesByTab = () => {
    if (!quizzes.length) return []
    if (activeTab === 'Draft') return quizzes.filter(q => q.isDraft || q.status === 'draft')
    if (activeTab === 'My Quiz') return quizzes.filter(q => q.isPublished || q.status === 'published')
    if (activeTab === 'History') return quizzes.filter(q => q.hasHistory || q.totalPlays > 0)
    return []
  }


  const generateLiveCode = () => Math.floor(100000 + Math.random() * 900000).toString()
  
  const handleEdit = quizId => { 
    navigate(`/edit-quiz/${quizId}`)
    setOpenMenuId(null)
  }
  
  const handleBuatLive = quizId => { 
    const code = generateLiveCode()
    const quiz = quizzes.find(q => (q.id || q._id) === quizId)
    if (quiz) navigate('/waiting-room', { state: { quiz, code, quizId } })
    setOpenMenuId(null)
  }
  
  const handleAkses = (quizId, isPublic) => { 
    setSelectedQuizId(quizId)
    setSelectedQuizAccess(isPublic ? 'public' : 'private')
    setShowAccessModal(true)
    setOpenMenuId(null)
  }
  
  const handleSaveAccess = async () => { 
    try {
      if (selectedQuizAccess === 'public') {
        await quizService.setPublic(selectedQuizId)
      } else {
        await quizService.setPrivate(selectedQuizId)
      }
      
      await fetchMyQuizzes()
      alert(`Akses quiz berhasil diubah ke ${selectedQuizAccess === 'public' ? 'Public' : 'Private'}!`)
      setShowAccessModal(false)
    } catch (error) {
      console.error('Error updating quiz access:', error)
      alert('Gagal mengubah akses quiz. Coba lagi.')
    }
  }
  
  const handleTambahCover = quizId => { 
    setSelectedQuizForCover(quizId)
    setShowCoverModal(true)
    setCoverPreview(null)
    setSelectedCoverFile(null)
    setOpenMenuId(null)
  }
  
  const handleCoverUpload = e => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan!')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!')
        return
      }
      
      console.log('📁 File selected:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB')
      setSelectedCoverFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log('👀 Preview generated')
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!')
        return
      }
      
      console.log('📁 File dropped:', file.name)
      setSelectedCoverFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      alert('Hanya file gambar yang diperbolehkan!')
    }
  }
  
  const handleSaveCover = async () => {
    if (!coverPreview) {
      alert('Pilih gambar dulu!');
      return;
    }

    try {
      console.log('⏳ Uploading cover as base64...', selectedQuizForCover)
      
      // Send base64 data via updateQuiz
      const quizData = { coverImage: coverPreview };
      await quizService.updateQuiz(selectedQuizForCover, quizData);

      alert('Cover berhasil disimpan!');
      await fetchMyQuizzes();
      setShowCoverModal(false);
      setCoverPreview(null);
      setSelectedCoverFile(null);
      setSelectedQuizForCover(null);
    } catch (error) {
      console.error('❌ Upload cover error:', error);
      alert('Gagal upload cover!');
    }
  }


  const handleDeleteCover = async () => {
    if (!selectedQuizForCover) return;
    
    if (window.confirm('Hapus cover quiz?\n\nCover akan dihapus dan background akan kembali ke warna default.')) {
      try {
        console.log('⏳ Deleting cover...', selectedQuizForCover)
        const quizData = { coverImage: null };
        await quizService.updateQuiz(selectedQuizForCover, quizData);
        alert('Cover berhasil dihapus!');
        await fetchMyQuizzes();
        setShowCoverModal(false);
        setCoverPreview(null);
        setSelectedCoverFile(null);
        setSelectedQuizForCover(null);
      } catch (error) {
        console.error('❌ Delete cover error:', error);
        alert('Gagal hapus cover!');
      }
    }
  }
  
  const handleDelete = async (quizId, quizTitle) => { 
    if (window.confirm(`Yakin ingin menghapus quiz "${quizTitle}"?\n\nQuiz yang dihapus tidak bisa dikembalikan.`)) { 
      try { 
        await quizService.deleteQuiz(quizId)
        alert('Quiz berhasil dihapus!')
        fetchMyQuizzes()
      } catch (err) { 
        alert('Gagal menghapus quiz!')
      }
    }
    setOpenMenuId(null)
  }
  
  const handlePublish = async (quizId, quizTitle) => { 
    if (window.confirm(`Publish quiz "${quizTitle}"?\n\nQuiz akan dipindahkan ke "My Quiz" dan siap untuk dimainkan live.`)) { 
      try { 
        await quizService.publishQuiz(quizId)
        alert('Quiz berhasil dipublish!\nQuiz sekarang ada di tab "My Quiz".')
        fetchMyQuizzes()
      } catch (err) { 
        alert('Gagal publish quiz!')
      }
    }
    setOpenMenuId(null)
  }
  
  const handleUnpublish = async (quizId, quizTitle) => { 
    if (window.confirm(`Unpublish quiz "${quizTitle}"?\n\nQuiz akan dikembalikan ke Draft.`)) { 
      try { 
        await quizService.unpublishQuiz(quizId)
        alert('Quiz dikembalikan ke Draft!')
        fetchMyQuizzes()
      } catch (err) { 
        alert('Gagal unpublish quiz!')
      }
    }
    setOpenMenuId(null)
  }
  
  const handleLihatHasil = quizId => { 
    navigate(`/quiz-results/${quizId}`)
    setOpenMenuId(null)
  }
  
  const handleShare = quizId => { 
    // Gunakan production URL jika sudah deploy, atau localhost untuk development
    // TODO: Ganti dengan URL production Anda setelah deploy (misalnya: https://brainrush.vercel.app atau https://yourdomain.com)
    const productionUrl = 'https://brainrush.vercel.app' // Ganti dengan URL production Anda
    const isDevelopment = window.location.hostname === 'localhost'
    const baseUrl = isDevelopment ? window.location.origin : productionUrl
    const link = `${baseUrl}/take-quiz/${quizId}`
    setShareLink(link)
    setSelectedQuizId(quizId)
    setShowShareModal(true)
    setOpenMenuId(null)
  }
  
  const handleCopyShareLink = () => { 
    navigator.clipboard.writeText(shareLink)
    alert('Link berhasil dicopy!')
  }
  
  const toggleMenu = quizId => { 
    setOpenMenuId(openMenuId === quizId ? null : quizId)
  }


  const renderMenuItems = quiz => {
    const quizId = quiz.id || quiz._id
    
    if (activeTab === 'Draft') return (
      <>
        <button onClick={e => { e.stopPropagation(); handleEdit(quizId) }} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition">Edit</button>
        <button onClick={e => { e.stopPropagation(); handlePublish(quizId, quiz.title) }} className="w-full px-3 py-2 text-left hover:bg-green-50 text-green-600">Publish</button>
        <button onClick={e => { e.stopPropagation(); handleTambahCover(quizId) }} className="w-full px-3 py-2 text-left hover:bg-purple-50 text-purple-600">Tambah Cover</button>
        <button onClick={e => { e.stopPropagation(); handleDelete(quizId, quiz.title) }} className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600">Delete</button>
      </>
    )
    
    if (activeTab === 'My Quiz') return (
      <>
        <button onClick={e => { e.stopPropagation(); handleBuatLive(quizId) }} className="w-full px-3 py-2 text-left hover:bg-blue-50 text-blue-600">Buat Live</button>
        <button onClick={e => { e.stopPropagation(); handleShare(quizId) }} className="w-full px-3 py-2 text-left hover:bg-green-50 text-green-600">Bagikan Quiz</button>
        <button onClick={e => { e.stopPropagation(); handleTambahCover(quizId) }} className="w-full px-3 py-2 text-left hover:bg-purple-50 text-purple-600">Tambah Cover</button>
        <button onClick={e => { e.stopPropagation(); handleUnpublish(quizId, quiz.title) }} className="w-full px-3 py-2 text-left hover:bg-orange-50 text-orange-600">Unpublish</button>
      </>
    )
    
    if (activeTab === 'History') return (
      <>
        <button onClick={e => { e.stopPropagation(); handleLihatHasil(quizId) }} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition">Lihat Hasil</button>
        <button onClick={e => { e.stopPropagation(); handleShare(quizId) }} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition">Share</button>
        <button onClick={e => { e.stopPropagation(); handleDelete(quizId, quiz.title) }} className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600">Delete</button>
      </>
    )
  }


  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="flex gap-0 px-8 mt-10">
          <button onClick={() => setActiveTab('Draft')} className={`font-semibold text-lg px-10 py-3 rounded-t-lg border-r border-gray-400 shadow-md transition ${activeTab === 'Draft' ? 'bg-gray-100 text-blue-900' : 'bg-gray-300 text-gray-600 hover:bg-gray-200'}`}>Draft</button>
          <button onClick={() => setActiveTab('My Quiz')} className={`font-bold text-lg px-10 py-3 rounded-t-lg border-r border-gray-400 shadow-md transition ${activeTab === 'My Quiz' ? 'bg-gray-100 text-blue-900' : 'bg-gray-300 text-gray-600 hover:bg-gray-200'}`}>My Quiz</button>
          <button onClick={() => setActiveTab('History')} className={`font-semibold text-lg px-10 py-3 rounded-t-lg shadow-md transition ${activeTab === 'History' ? 'bg-gray-100 text-blue-900' : 'bg-gray-300 text-gray-600 hover:bg-gray-200'}`}>History</button>
        </div>


        <main className="flex-1 bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 mx-8 rounded-2xl p-8 mb-8 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-lg text-blue-800">Memuat quiz...</p>
            </div>
          )}


          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              <button onClick={fetchMyQuizzes} className="ml-4 underline hover:no-underline">Coba lagi</button>
            </div>
          )}


          {!loading && !error && (
            <>
              <div className="flex items-center gap-3 mb-6">
                {getQuizzesByTab().length > 0 && (
                  <div className="inline-block bg-sky-400 text-white font-bold px-4 py-1 rounded-full text-sm">{getQuizzesByTab().length} Quiz</div>
                )}
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getQuizzesByTab().map((quiz, index) => {
                  const quizId = quiz.id || quiz._id
                  const isDraft = quiz.isDraft || quiz.status === 'draft'
                  
                  return (
                    <motion.div
                      key={quizId}
                      className={`bg-white rounded-xl shadow-lg overflow-hidden relative ${
                        isDraft && activeTab === 'Draft'
                          ? 'opacity-75' 
                          : 'cursor-pointer'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={
                        isDraft && activeTab === 'Draft'
                          ? {} 
                          : { scale: 1.05, y: -5 }
                      }
                    >
                      {isDraft && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">DRAFT</div>
                      )}
                      {(quiz.isPublished || quiz.status === 'published') && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">PUBLISHED</div>
                      )}
                      <button onClick={e => { e.stopPropagation(); toggleMenu(quizId) }} className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md z-10 transition">
                        <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {openMenuId === quizId && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: -10 }} 
                            transition={{ duration: 0.15 }} 
                            className="absolute top-14 right-3 bg-white rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto" 
                            style={{ minWidth: '200px' }} 
                            onClick={e => e.stopPropagation()}
                          >
                            {renderMenuItems(quiz)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div 
                        className={`h-36 flex items-center justify-center overflow-hidden ${
                          quiz.coverImage ? 'bg-gray-100' : 'bg-gradient-to-r from-blue-200 to-blue-300'
                        }`} 
                        onClick={() => {
                          if (isDraft && activeTab === 'Draft') {
                            return;
                          }
                          activeTab === 'History' ? handleLihatHasil(quizId) : handleEdit(quizId)
                        }}
                      >
                        {quiz.coverImage ? (
                          <img 
                            src={quiz.coverImage} 
                            alt={quiz.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('❌ Image load error:', quiz.coverImage)
                              e.target.parentElement.classList.add('bg-gradient-to-r', 'from-blue-200', 'to-blue-300')
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : null}
                      </div>


                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{quiz.author || quiz.creator?.name || 'Brain_Rush'}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 font-semibold">{quiz.questions?.length || quiz.questionCount || 0} Soal</p>
                          {quiz.played && <p className="text-xs text-gray-400">{quiz.played}</p>}
                          {quiz.totalPlayers && <p className="text-xs text-blue-600 font-semibold">{quiz.totalPlayers} pemain</p>}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {activeTab === 'Draft' && getQuizzesByTab().length > 0 && (
                  <motion.button
                    key="add-quiz"
                    onClick={() => navigate('/create-quiz')}
                    className="rounded-xl border-2 border-dashed border-sky-400 bg-sky-300/20 text-sky-600 cursor-pointer shadow-sm flex flex-col items-center justify-center hover:bg-sky-300 hover:text-white transition-colors duration-300"
                    style={{ minHeight: '264px' }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <span className="text-5xl font-extrabold leading-none">+</span>
                    <span className="mt-2 font-semibold text-lg">Tambah Kuis</span>
                    <span className="text-sm mt-1">Isi soal baru disini</span>
                  </motion.button>
                )}
              </div>


              {activeTab === 'Draft' && getQuizzesByTab().length === 0 && (
                <div className="flex flex-col items-center justify-center mt-24">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#38bdf8' }}
                    onClick={() => navigate('/create-quiz')}
                    className="flex flex-col items-center justify-center h-72 w-96 bg-sky-300/20 border-2 border-dashed border-sky-400 rounded-2xl shadow-lg transition cursor-pointer"
                  >
                    <span className="text-6xl font-extrabold mb-4 text-sky-600">+</span>
                    <span className="font-bold text-xl text-sky-700">Buat Kuis Pertama</span>
                    <span className="text-base text-sky-400 mt-2">Mulai dari quiz kosong</span>
                  </motion.button>
                </div>
              )}


              {activeTab !== 'Draft' && getQuizzesByTab().length === 0 && (
                <div className="flex flex-col items-center justify-center mt-24">
                  <span className="font-bold text-xl text-sky-600 mb-2">
                    {activeTab === 'My Quiz' ? 'Belum ada kuis yang dipublish.' : 'Belum ada history quiz.'}
                  </span>
                  <span className="text-base text-sky-400">
                    {activeTab === 'My Quiz'
                      ? 'Publish kuis dari Draft untuk muncul di sini'
                      : 'History quiz yang pernah dimainkan akan muncul di sini'}
                  </span>
                </div>
              )}
            </>
          )}
        </main>
      </div>


      {/* MODAL AKSES QUIZ */}
      <AnimatePresence>
        {showAccessModal && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
            onClick={() => setShowAccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Atur Akses Quiz</h2>
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition" onClick={() => setSelectedQuizAccess('public')}>
                  <input type="radio" name="access" value="public" checked={selectedQuizAccess === 'public'} onChange={() => setSelectedQuizAccess('public')} className="w-5 h-5 text-blue-600" />
                  <div className="ml-3">
                    <p className="font-bold text-gray-800">Public</p>
                    <p className="text-sm text-gray-600">Semua orang bisa mengakses quiz ini</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition" onClick={() => setSelectedQuizAccess('private')}>
                  <input type="radio" name="access" value="private" checked={selectedQuizAccess === 'private'} onChange={() => setSelectedQuizAccess('private')} className="w-5 h-5 text-purple-600" />
                  <div className="ml-3">
                    <p className="font-bold text-gray-800">Private</p>
                    <p className="text-sm text-gray-600">Hanya kamu yang bisa mengakses quiz ini</p>
                  </div>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAccessModal(false)} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition">Batal</button>
                <button onClick={handleSaveAccess} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* MODAL SHARE */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
            onClick={() => setShowShareModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bagikan Quiz</h2>
              <p className="text-sm text-gray-600 mb-4">Salin link di bawah ini dan bagikan ke teman-temanmu untuk mengerjakan quiz ini!</p>
              
              {/* Warning jika masih localhost */}
              {window.location.hostname === 'localhost' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-orange-800">
                    ⚠️ <span className="font-semibold">Perhatian:</span> Anda sedang di mode development. Link ini menggunakan URL production. Pastikan aplikasi sudah di-deploy dan update URL production di kode.
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">🔗 Link Quiz:</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={shareLink} readOnly className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-mono text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={handleCopyShareLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-sm shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                
                {/* QR Code section - optional */}
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <button 
                    onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink)}`, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Generate QR Code untuk link ini
                  </button>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-yellow-800">
                  💡 <span className="font-semibold">Tips:</span> Siapa pun yang memiliki link ini dapat mengakses dan mengerjakan quiz. Bagikan melalui WhatsApp, Email, atau media sosial!
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowShareModal(false)} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition">Tutup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* MODAL COVER */}
      <AnimatePresence>
        {showCoverModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
            onClick={() => setShowCoverModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" 
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {quizzes.find(q => (q.id || q._id) === selectedQuizForCover)?.coverImage 
                  ? 'Ubah atau Hapus Cover' 
                  : 'Tambah Cover Quiz'}
              </h2>
              
              {/* Preview Area */}
              <div 
                className="mb-6 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 hover:border-blue-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {coverPreview ? (
                  <div className="relative group">
                    <img src={coverPreview} alt="Preview" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-semibold">Preview Cover Baru</p>
                    </div>
                  </div>
                ) : quizzes.find(q => (q.id || q._id) === selectedQuizForCover)?.coverImage ? (
                  <div className="relative group">
                    <img 
                      src={quizzes.find(q => (q.id || q._id) === selectedQuizForCover)?.coverImage} 
                      alt="Current Cover" 
                      className="w-full h-64 object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-semibold">Cover Saat Ini</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 font-semibold mb-2">Drag & Drop gambar disini</p>
                    <p className="text-gray-500 text-sm mb-4">atau klik tombol di bawah untuk pilih file</p>
                    <p className="text-gray-400 text-xs">Format: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                )}
              </div>
              
              {/* File Input Button */}
              <label className="block mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverUpload} 
                  className="hidden"
                  id="cover-upload-input"
                />
                <div className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl text-center cursor-pointer transition-all shadow-lg hover:shadow-xl">
                  <svg className="w-5 h-5 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {coverPreview ? 'Pilih Gambar Lain' : 'Pilih Gambar'}
                </div>
              </label>
              
              {/* Selected File Info */}
              {selectedCoverFile && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">{selectedCoverFile.name}</p>
                        <p className="text-xs text-blue-600">{(selectedCoverFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCoverFile(null)
                        setCoverPreview(null)
                      }}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCoverModal(false)} 
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                
                {quizzes.find(q => (q.id || q._id) === selectedQuizForCover)?.coverImage && (
                  <button 
                    onClick={handleDeleteCover} 
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
                  >
                    Hapus Cover
                  </button>
                )}
                
                <button 
                  onClick={handleSaveCover} 
                  disabled={!coverPreview} 
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition"
                >
                  Simpan Cover
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
