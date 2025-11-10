import { useState } from 'react'
import { motion } from 'framer-motion'

const NameInput = ({ value, onChange, placeholder = "Enter your name", maxLength = 20 }) => {
  const [isNameFocused, setIsNameFocused] = useState(false)

  const handleNameChange = (e) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      onChange(newValue)
    }
  }

  return (
    <div className="relative">
      <motion.input
        type="text"
        value={value}
        onChange={handleNameChange}
        onFocus={() => setIsNameFocused(true)}
        onBlur={() => setIsNameFocused(false)}
        placeholder={placeholder}
        className={`w-full bg-blue-500/30 backdrop-blur-sm text-white text-xl font-medium py-4 px-6 rounded-2xl border-2 transition-all duration-300 text-center placeholder-white/50 focus:outline-none ${
          isNameFocused 
            ? 'border-white/50 bg-blue-500/40 shadow-lg shadow-white/10' 
            : 'border-blue-400/30 hover:border-blue-400/50'
        }`}
        maxLength={maxLength}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 pointer-events-none"
        animate={{
          opacity: isNameFocused ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      {value && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, type: 'spring' }}
        >
          <span className="text-white text-xs">âœ“</span>
        </motion.div>
      )}
      
      {/* Character Counter */}
      <motion.p 
        className="text-white/50 text-sm mt-2 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: value ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {value.length}/{maxLength}
      </motion.p>
    </div>
  )
}

export default NameInput