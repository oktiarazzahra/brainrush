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
      setQuizzes(data.quizzes || [])
    } catch (err) {
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
  const handleEdit = quizId => { navigate(`/edit-quiz/${quizId}`); setOpenMenuId(null) }
  const handleBuatLive = quizId => { const code = generateLiveCode(); const quiz = quizzes.find(q => (q.id || q._id) === quizId); if (quiz) navigate('/waiting-room', { state: { quiz, code, quizId } }); setOpenMenuId(null) }
  const handleAkses = (quizId, currentAccess) => { setSelectedQuizId(quizId); setSelectedQuizAccess(currentAccess || 'public'); setShowAccessModal(true); setOpenMenuId(null) }
  const handleSaveAccess = () => { alert(`Akses quiz berhasil diubah ke ${selectedQuizAccess}!`); setShowAccessModal(false) }
  const handleTambahCover = quizId => { setSelectedQuizForCover(quizId); setShowCoverModal(true); setCoverPreview(null); setOpenMenuId(null) }
  const handleCoverUpload = e => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setCoverPreview(reader.result); reader.readAsDataURL(file) } }
  const handleSaveCover = () => { alert('Cover berhasil disimpan!'); setShowCoverModal(false); setCoverPreview(null) }
  const handleDelete = async (quizId, quizTitle) => { if (window.confirm(`Yakin ingin menghapus quiz "${quizTitle}"?\n\nQuiz yang dihapus tidak bisa dikembalikan.`)) { try { await quizService.deleteQuiz(quizId); alert('Quiz berhasil dihapus!'); fetchMyQuizzes() } catch (err) { alert('Gagal menghapus quiz!') } }; setOpenMenuId(null) }
  const handlePublish = async (quizId, quizTitle) => { if (window.confirm(`Publish quiz "${quizTitle}"?\n\nQuiz akan dipindahkan ke "My Quiz" dan siap untuk dimainkan live.`)) { try { await quizService.publishQuiz(quizId); alert('Quiz berhasil dipublish!\nQuiz sekarang ada di tab "My Quiz".'); fetchMyQuizzes() } catch (err) { alert('Gagal publish quiz!') } }; setOpenMenuId(null) }
  const handleUnpublish = async (quizId, quizTitle) => { if (window.confirm(`Unpublish quiz "${quizTitle}"?\n\nQuiz akan dikembalikan ke Draft.`)) { try { await quizService.unpublishQuiz(quizId); alert('Quiz dikembalikan ke Draft!'); fetchMyQuizzes() } catch (err) { alert('Gagal unpublish quiz!') } }; setOpenMenuId(null) }
  const handleLihatHasil = quizId => { navigate(`/quiz-results/${quizId}`); setOpenMenuId(null) }
  const handleShare = quizId => { const link = `https://brainrush.com/results/${quizId}`; setShareLink(link); setShowShareModal(true); setOpenMenuId(null) }
  const handleCopyShareLink = () => { navigator.clipboard.writeText(shareLink); alert('Link berhasil dicopy!') }
  const toggleMenu = quizId => { setOpenMenuId(openMenuId === quizId ? null : quizId) }

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
        <button onClick={e => { e.stopPropagation(); handleEdit(quizId) }} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition">Edit</button>
        <button onClick={e => { e.stopPropagation(); handleBuatLive(quizId) }} className="w-full px-3 py-2 text-left hover:bg-blue-50 text-blue-600">Buat Live</button>
        <button onClick={e => { e.stopPropagation(); handleAkses(quizId, quiz.access) }} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition">Akses</button>
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
        {/* TABS */}
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
                  return (
                    <motion.div
                      key={quizId}
                      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      {(quiz.isDraft || quiz.status === 'draft') && (
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
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }} className="absolute top-14 right-3 bg-white rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto" style={{ minWidth: '200px' }} onClick={e => e.stopPropagation()}>
                            {renderMenuItems(quiz)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className={`h-36 bg-gradient-to-r ${quiz.bgColor || 'from-blue-200 to-blue-300'} flex items-center justify-center overflow-hidden`} onClick={() => activeTab === 'History' ? handleLihatHasil(quizId) : handleEdit(quizId)}>
                        {quiz.image && <img src={quiz.image} alt={quiz.title} className="h-full w-full object-cover" />}
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
                {/* Card Tambah Kuis hanya di Draft, jika sudah ada quiz */}
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
              {/* Empty State Draft: Card tombol buat quiz */}
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
              {/* Empty State My Quiz & History: hanya pesan */}
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAccessModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bagikan Quiz</h2>
              <div className="bg-gray-100 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-600 mb-2">Link Quiz:</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={shareLink} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <button onClick={handleCopyShareLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-sm">Copy</button>
                </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCoverModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tambah Cover Quiz</h2>
              {coverPreview ? (
                <div className="mb-6">
                  <img src={coverPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                </div>
              ) : (
                <div className="mb-6 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-gray-600 text-sm">Pilih gambar untuk cover</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500" />
              <div className="flex gap-3">
                <button onClick={() => setShowCoverModal(false)} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition">Batal</button>
                <button onClick={handleSaveCover} disabled={!coverPreview} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition">Simpan Cover</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}

export default MyQuizzesPage
