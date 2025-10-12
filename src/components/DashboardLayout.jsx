// src/components/DashboardLayout.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      name: 'Beranda',
      icon: '🏠',
      path: '/dashboard'
    },
    {
      name: 'Buat',
      icon: '➕',
      path: '/my-quizzes'
    },
    {
      name: 'Belajar Mandiri',
      icon: '🕐',
      path: '/schedule'
    },
    {
      name: 'History',
      icon: '📋',
      path: '/history'
    },
    {
      name: 'Bantuan',
      icon: '❓',
      path: '/help'
    }
  ]

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600">
      {/* Sidebar */}
      <div className="w-24 bg-white flex flex-col items-center py-6 shadow-xl">
        {menuItems.map((item) => (
          <motion.button
            key={item.name}
            onClick={() => navigate(item.path)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`mb-6 flex flex-col items-center ${
              location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'
            } hover:text-blue-600 transition`}
          >
            <div className={`text-4xl mb-2 ${
              location.pathname === item.path ? 'bg-blue-100' : 'bg-gray-100'
            } w-14 h-14 rounded-xl flex items-center justify-center`}>
              {item.icon}
            </div>
            <span className="text-xs font-medium text-center">{item.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
