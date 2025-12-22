import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigate = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex w-24 h-screen bg-white/90 border-r border-blue-200 flex-col items-center pt-5 shadow-lg z-10 flex-shrink-0">
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

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-white/90 rounded-lg flex flex-col items-center justify-center gap-1.5 shadow-lg"
      >
        <motion.span 
          animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          className="w-6 h-0.5 bg-blue-600 rounded-full"
        />
        <motion.span 
          animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
          className="w-6 h-0.5 bg-blue-600 rounded-full"
        />
        <motion.span 
          animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          className="w-6 h-0.5 bg-blue-600 rounded-full"
        />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur-lg shadow-2xl z-40 flex flex-col pt-20 px-4"
            >
              {menuItems.map(item => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    mb-3 flex items-center gap-4 rounded-xl py-3 px-4 transition border text-left
                    ${location.pathname.startsWith(item.path)
                      ? 'bg-blue-100 border-blue-400 text-blue-600 font-bold'
                      : 'border-transparent text-blue-600 hover:bg-blue-50'}`
                  }
                >
                  <div className="flex items-center justify-center">{item.icon}</div>
                  <span className="text-base">{item.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
