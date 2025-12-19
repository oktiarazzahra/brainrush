import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
  { name: 'Riwayat Bermain', icon: (
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)
    setSidebarOpen(false) // Close sidebar after navigation on mobile
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 overflow-hidden">
      {/* Hamburger Button - Mobile Only */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-blue-200"
      >
        <svg 
          width="24" 
          height="24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2.5} 
          viewBox="0 0 24 24"
          className="text-blue-600"
        >
          {sidebarOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </motion.button>

      {/* Backdrop - Mobile Only */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Hidden on mobile by default, slide in when open */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : '-100%'
          }}
          className={`
            fixed lg:relative
            w-64 lg:w-24 
            h-screen 
            bg-white/95 lg:bg-white/90 
            backdrop-blur-md
            border-r border-blue-200 
            flex flex-col items-center 
            pt-20 lg:pt-5
            shadow-xl lg:shadow-lg 
            z-40 lg:z-10
            transition-transform duration-300 ease-in-out
            lg:translate-x-0
          `}
        >
          {menuItems.map(item => (
            <motion.button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className={`
                mb-5 lg:mb-7 
                flex flex-row lg:flex-col 
                items-center 
                rounded-xl 
                py-3 lg:py-3 
                px-6 lg:px-0
                w-56 lg:w-20 
                transition border
                ${location.pathname.startsWith(item.path)
                  ? 'bg-blue-100 border-blue-400 text-blue-600 drop-shadow font-bold'
                  : 'border-transparent text-blue-400 hover:bg-blue-50'}`
              }
              style={{ outline: 'none' }}
            >
              <div className="flex items-center justify-center lg:mb-1">{item.icon}</div>
              <span className="text-base lg:text-xs text-center ml-4 lg:ml-0 lg:pt-0.5">{item.name}</span>
            </motion.button>
          ))}
        </motion.aside>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
