import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import { supportService } from '../services/supportService'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([])
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })

  useEffect(() => {
    fetchTickets()
  }, [filterStatus, filterCategory])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (filterStatus !== 'all') filters.status = filterStatus
      if (filterCategory !== 'all') filters.category = filterCategory
      
      const response = await supportService.getAllTickets(filters)
      setTickets(response.data.tickets)
      
      // Calculate stats
      calculateStats(response.data.tickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
      showError('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ticketList) => {
    setStats({
      total: ticketList.length,
      open: ticketList.filter(t => t.status === 'open').length,
      inProgress: ticketList.filter(t => t.status === 'in-progress').length,
      resolved: ticketList.filter(t => t.status === 'resolved').length,
      closed: ticketList.filter(t => t.status === 'closed').length
    })
  }

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await supportService.updateTicket(ticketId, { status: newStatus })
      showSuccess('Status laporan berhasil diupdate!')
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      showError('Gagal update status laporan')
    }
  }

  const handleUpdatePriority = async (ticketId, newPriority) => {
    try {
      await supportService.updateTicket(ticketId, { priority: newPriority })
      showSuccess('Priority laporan berhasil diupdate!')
      fetchTickets()
    } catch (error) {
      console.error('Error updating priority:', error)
      showError('Gagal update priority')
    }
  }

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setSelectedTicket(null)
    setShowDetailModal(false)
  }

  const openReplyModal = (ticket) => {
    setSelectedTicket(ticket)
    setReplySubject(`Re: ${ticket.subject}`)
    setReplyMessage('')
    setShowReplyModal(true)
  }

  const closeReplyModal = () => {
    setShowReplyModal(false)
    setReplyMessage('')
    setReplySubject('')
    setSendingReply(false)
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      showWarning('Pesan balasan tidak boleh kosong!')
      return
    }

    try {
      setSendingReply(true)
      await supportService.replyTicket(selectedTicket._id, {
        subject: replySubject,
        message: replyMessage
      })
      
      // Reset sending state dulu sebelum close modal
      setSendingReply(false)
      
      showSuccess('✅ Balasan berhasil dikirim via email!')
      closeReplyModal()
      closeDetailModal()
    } catch (error) {
      console.error('Error sending reply:', error)
      setSendingReply(false)
      showError('❌ Gagal mengirim balasan: ' + (error.response?.data?.message || error.message))
    }
  }

  const categoryNames = {
    bug: '🐛 Bug/Error',
    feature: '💡 Fitur',
    ui: '🎨 UI/UX',
    performance: '⚡ Performa',
    security: '🔒 Keamanan',
    other: '❓ Lainnya'
  }

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
    resolved: 'bg-green-100 text-green-800 border-green-300',
    closed: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const statusNames = {
    open: 'Open',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }

  return (
    <AdminLayout>
      <div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="text-4xl">📋</span>
            Laporan Pengguna
          </h1>
          <p className="text-gray-600">Kelola semua laporan masalah dan feedback dari pengguna</p>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <p className="text-sm text-gray-600 font-semibold mb-1">Total Laporan</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <p className="text-sm text-gray-600 font-semibold mb-1">Open</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <p className="text-sm text-gray-600 font-semibold mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <p className="text-sm text-gray-600 font-semibold mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <p className="text-sm text-gray-600 font-semibold mb-1">Closed</p>
              <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="bug">Bug/Error</option>
                  <option value="feature">Permintaan Fitur</option>
                  <option value="ui">UI/UX</option>
                  <option value="performance">Performa</option>
                  <option value="security">Keamanan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                <p className="text-gray-700 text-lg font-semibold">Memuat laporan...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ada laporan</h3>
              <p className="text-gray-600">Belum ada laporan yang sesuai dengan filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => openTicketDetail(ticket)}
                  className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[ticket.status]}`}>
                          {statusNames[ticket.status]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {categoryNames[ticket.category]}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📧 {ticket.email}</span>
                        <span>🕐 {new Date(ticket.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        <span>ID: {ticket._id.slice(-6)}</span>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-col gap-2">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(ticket._id, e.target.value)
                        }}
                        className="px-3 py-1 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${statusColors[selectedTicket.status]}`}>
                      {statusNames[selectedTicket.status]}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedTicket.subject}
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID Laporan: {selectedTicket._id}
                  </p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Kategori</p>
                  <p className="text-sm font-bold">{categoryNames[selectedTicket.category]}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Email</p>
                  <p className="text-sm font-bold">{selectedTicket.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Dibuat</p>
                  <p className="text-sm font-bold">
                    {new Date(selectedTicket.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-1">User Agent</p>
                  <p className="text-xs">{selectedTicket.userAgent || 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Deskripsi Masalah</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedTicket.adminNotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Catatan Admin</h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedTicket.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => openReplyModal(selectedTicket)}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>📨</span>
                  Kirim Balasan Email
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal - Nodemailer */}
      <AnimatePresence>
        {showReplyModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={closeReplyModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    📨 Kirim Balasan via Nodemailer
                  </h2>
                  <p className="text-sm text-gray-600">
                    Ke: <span className="font-semibold">{selectedTicket.email}</span>
                  </p>
                </div>
                <button
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Original Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-gray-400">
                <p className="text-xs text-gray-600 font-semibold mb-1">Laporan Original:</p>
                <p className="text-sm font-bold text-gray-800 mb-2">{selectedTicket.subject}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{selectedTicket.description}</p>
              </div>

              {/* Reply Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Email
                  </label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Re: ..."
                    disabled={sendingReply}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pesan Balasan
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Tulis balasan untuk user..."
                    rows={10}
                    disabled={sendingReply}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {replyMessage.length} karakter
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-lg">ℹ️</span>
                    <div className="text-xs text-blue-800">
                      <p className="font-semibold mb-1">Email akan dikirim via Nodemailer</p>
                      <p>Pastikan konfigurasi SMTP sudah benar di backend (.env file)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {sendingReply ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <span>📨</span>
                      Kirim Email
                    </>
                  )}
                </button>
                <button
                  onClick={closeReplyModal}
                  disabled={sendingReply}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-bold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toast {...toast} onClose={hideToast} />
    </AdminLayout>
  )
}

export default AdminSupportPage
