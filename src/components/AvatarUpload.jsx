// src/components/AvatarUpload.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const avatarStyles = [
  'adventurer',
  'avataaars',
  'big-smile',
  'bottts',
  'fun-emoji',
  'lorelei',
  'micah',
  'miniavs',
  'pixel-art'
]

const AvatarUpload = ({ avatar, onChange }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('avataaars')
  const [seed, setSeed] = useState(Date.now().toString())

  const handleGenerateAvatar = (style) => {
    const newSeed = Date.now().toString()
    setSeed(newSeed)
    setSelectedStyle(style)
    const newAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${newSeed}`
    if (onChange) {
      onChange(newAvatar)
    }
  }

  const handleRandomize = () => {
    handleGenerateAvatar(selectedStyle)
  }

  return (
    <div className="flex flex-col items-center mb-8">
      <motion.div 
        className="relative mb-4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
      >
        <motion.img
          src={avatar}
          alt="Avatar"
          className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.button
          onClick={() => setShowPicker(!showPicker)}
          type="button"
          className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 shadow-lg transition-colors"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-xl p-4 mb-4 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-blue-700 mb-3 text-center">Pilih Style Avatar</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {avatarStyles.map((style) => (
                <motion.button
                  key={style}
                  type="button"
                  onClick={() => handleGenerateAvatar(style)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedStyle === style
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=preview${style}`}
                    alt={style}
                    className="w-16 h-16 mx-auto rounded-full bg-white"
                  />
                  <p className="text-xs mt-1 text-center text-gray-600">{style}</p>
                </motion.button>
              ))}
            </div>

            <motion.button
              type="button"
              onClick={handleRandomize}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🎲 Randomize
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Selesai
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvatarUpload