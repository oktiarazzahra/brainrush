import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

const Toast = ({ isOpen, onClose, message, type = 'info', duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: '✅',
      border: 'border-green-600'
    },
    error: {
      bg: 'bg-red-500',
      icon: '❌',
      border: 'border-red-600'
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: '⚠️',
      border: 'border-yellow-600'
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'ℹ️',
      border: 'border-blue-600'
    }
  }

  const style = typeStyles[type] || typeStyles.info

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '50%' }}
          animate={{ opacity: 1, y: 0, x: '50%' }}
          exit={{ opacity: 0, y: -50, x: '50%' }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto"
        >
          <div className={`${style.bg} ${style.border} border-2 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] max-w-[500px]`}>
            <span className="text-3xl">{style.icon}</span>
            <p className="text-white font-semibold flex-1 whitespace-pre-line">{message}</p>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
