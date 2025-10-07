// src/components/DashboardLayout.jsx

import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const sidebarItems = [
    { icon: '🏠', label: 'Beranda', path: '/dashboard' },
    { icon: '➕', label: 'Buat', path: '/create-quiz' },
    { icon: '🎯', label: 'Library', path: '/library' },
    { icon: '📋', label: 'History', path: '/history' },
    { icon: '❓', label: 'Questions', path: '/questions' },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-24 bg-white rounded-tr-2xl rounded-br-2xl shadow-lg flex flex-col items-center py-8 space-y-6"
      >
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div
                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl transition-colors
                  ${isActive
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-gray-100 hover:bg-gray-200'}
                `}
              >
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="text-xs mt-1 font-medium text-gray-700">
                {item.label}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}

export default DashboardLayout
