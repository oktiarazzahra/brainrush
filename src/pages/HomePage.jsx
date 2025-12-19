import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PinInput from '../components/PinInput'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const HomePage = ({ onJoin }) => {
  const [pin, setPin] = useState('')
  const navigate = useNavigate()
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast()


  const handleJoinClick = () => {
    if (pin.trim()) {
      console.log('PIN validated:', pin)
      navigate(`/join`, { state: { pin, fromDashboard: false } })
      if (onJoin) onJoin(pin)
    } else {
      showWarning('Masukkan PIN terlebih dahulu!')
    }
  }

  const handlePinChange = (value) => {
    setPin(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 text-center">
        {/* Title */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-yellow-300 mb-2 drop-shadow-lg stroke-text"
            animate={{ 
              textShadow: [
                "-3px -3px 0 #D97706, 3px -3px 0 #D97706, -3px 3px 0 #D97706, 3px 3px 0 #D97706, 0 0 15px rgba(0,0,0,0.4)",
                "-3px -3px 0 #B45309, 3px -3px 0 #B45309, -3px 3px 0 #B45309, 3px 3px 0 #B45309, 0 0 20px rgba(0,0,0,0.5)",
                "-3px -3px 0 #D97706, 3px -3px 0 #D97706, -3px 3px 0 #D97706, 3px 3px 0 #D97706, 0 0 15px rgba(0,0,0,0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            Brain Rush
          </motion.h1>
          <motion.p 
            className="text-xl sm:text-3xl md:text-4xl text-white font-medium drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Ayo bermain!
          </motion.p>
        </motion.div>

        {/* Quiz Status */}
        <motion.p 
          className="text-white text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Sudah Punya Kuis?
        </motion.p>

        {/* PIN Input Component */}
        <motion.div
          className="w-full max-w-md px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <PinInput 
            pin={pin}
            onPinChange={handlePinChange}
            onJoin={handleJoinClick}
          />
        </motion.div>

        {/* Helper Text */}
        <motion.p 
          className="text-white/60 text-xs sm:text-sm mt-4 max-w-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          Masukkan kode PIN 6 karakter untuk bergabung
        </motion.p>
      </main>

      <Footer />
      <Toast {...toast} onClose={hideToast} />
    </div>
  )
}

export default HomePage