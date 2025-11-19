import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../components/AdminLayout'
import { supportService } from '../services/supportService'

const AdminSupportPage = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
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
      alert('Gagal memuat data tickets')
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
      alert('Status ticket berhasil diupdate!')
      fetchTickets()
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      alert('Gagal update status ticket')
    }
  }

  const handleUpdatePriority = async (ticketId, newPriority) => {
    try {
      await supportService.updateTicket(ticketId, { priority: newPriority })
      alert('Priority ticket berhasil diupdate!')
      fetchTickets()
    } catch (error) {
      console.error('Error updating priority:', error)
      alert('Gagal update priority')
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
            <span className="text-4xl">🎫</span>
            Support Tickets
          </h1>
          <p className="text-gray-600">Kelola semua laporan dan support tickets dari pengguna</p>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <p className="text-sm text-gray-600 font-semibold mb-1">Total Tickets</p>
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
                <p className="text-gray-700 text-lg font-semibold">Loading tickets...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ada tickets</h3>
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
                    Ticket ID: {selectedTicket._id}
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
                <a
                  href={`mailto:${selectedTicket.email}?subject=Re: ${selectedTicket.subject}`}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-center"
                >
                  📧 Balas via Email
                </a>
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
    </AdminLayout>
  )
}

export default AdminSupportPage
