import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

const PinInput = ({ pin, onPinChange, onJoin }) => {
  const [isPinFocused, setIsPinFocused] = useState(false)
  const [isJoinHovered, setIsJoinHovered] = useState(false)

  const handlePinChange = (e) => {
    // Hanya allow alphanumeric characters & uppercase
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= 6) {
      onPinChange(value)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      {/* PIN Input Field */}
      <motion.div 
        className="flex-1 relative"
        whileFocus={{ scale: 1.02 }}
      >
        <motion.input
          type="text"
          value={pin}
          onChange={handlePinChange}
          onFocus={() => setIsPinFocused(true)}
          onBlur={() => setIsPinFocused(false)}
          placeholder="Masukkan PIN"
          className={`w-full bg-slate-700 text-white text-xl font-semibold py-4 px-8 rounded-full shadow-lg border-2 transition-all duration-300 text-center tracking-wider placeholder-gray-400 focus:outline-none ${
            isPinFocused 
              ? 'border-yellow-400 bg-slate-600 shadow-yellow-400/20 shadow-2xl' 
              : 'border-slate-600 hover:border-slate-500'
          }`}
          maxLength={6}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 pointer-events-none"
          animate={{
            opacity: isPinFocused ? 1 : 0,
            scale: isPinFocused ? 1 : 0.95,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* HAPUS BADGE HIJAU/ICON CHECK SINI */}
        {/*
        {pin && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
        */}
        
      </motion.div>
      
      {/* JOIN Button */}
      <Button
        onClick={onJoin}
        disabled={!pin.trim()}
        variant="primary"
        className="flex-1"
        onHoverStart={() => setIsJoinHovered(true)}
        onHoverEnd={() => setIsJoinHovered(false)}
      >
        <motion.span
          animate={{ 
            color: isJoinHovered && pin.trim() ? '#1E293B' : pin.trim() ? '#334155' : '#9CA3AF',
            fontWeight: isJoinHovered && pin.trim() ? 'bold' : 'semibold'
          }}
          transition={{ duration: 0.2 }}
        >
          JOIN
        </motion.span>
      </Button>
    </div>
  )
}

export default PinInput
