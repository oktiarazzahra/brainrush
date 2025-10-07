import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/login')
  }

  return (
    <motion.header 
      className="flex justify-end p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogoClick}
      >
        <div className="w-10 h-10 bg-orange-300 rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">🧠</span>
        </div>
      </motion.div>
    </motion.header>
  )
}

export default Header
