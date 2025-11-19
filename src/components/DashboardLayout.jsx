import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const menuItems = [
  { name: 'Beranda', icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v11h5v-4h4v4h5V10"/></svg>
    ), path: '/dashboard'
  },
  { name: 'Buat', icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    ), path: '/my-quizzes'
  },
  { name: 'Belajar Mandiri', icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    ), path: '/schedule'
  },
  { name: 'History', icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 2.15-7.75"/></svg>
    ), path: '/history'
  },
  { name: 'Bantuan', icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.91 1c0 2-2 3-2 3"/><path d="M12 17h.01"/></svg>
    ), path: '/help'
  }
]

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="h-screen flex bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-24 h-screen bg-white/90 border-r border-blue-200 flex flex-col items-center pt-5 shadow-lg z-10 flex-shrink-0">
        {menuItems.map(item => (
          <motion.button
            key={item.name}
            onClick={() => navigate(item.path)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className={`
              mb-7 flex flex-col items-center rounded-xl py-3 w-20 transition border
              ${location.pathname.startsWith(item.path)
                ? 'bg-blue-100 border-blue-400 text-blue-600 drop-shadow font-bold'
                : 'border-transparent text-blue-400 hover:bg-blue-50'}`
            }
            style={{ outline: 'none' }}
          >
            <div className="flex items-center justify-center mb-1">{item.icon}</div>
            <span className="text-xs text-center pt-0.5">{item.name}</span>
          </motion.button>
        ))}
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
