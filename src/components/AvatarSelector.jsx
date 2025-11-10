// src/components/AvatarSelector.jsx
import { motion } from 'framer-motion'

const avatars = [
  { icon: '🍓', color: 'bg-pink-500', label: 'Strawberry Dream' },
  { icon: '🤖', color: 'bg-blue-500', label: 'Cyber Bot' },
  { icon: '👽', color: 'bg-purple-500', label: 'Galactic Alien' },
  { icon: '🦄', color: 'bg-indigo-400', label: 'Mystic Unicorn' },
  { icon: '🦁', color: 'bg-yellow-600', label: 'Golden Lion' },
  { icon: '🐸', color: 'bg-green-500', label: 'Emerald Frog' },
  { icon: '🐺', color: 'bg-gray-700', label: 'Silver Wolf' },
  { icon: '🐬', color: 'bg-teal-400', label: 'Ocean Dolphin' },
  { icon: '🦉', color: 'bg-amber-500', label: 'Night Owl' },
  { icon: '🌟', color: 'bg-yellow-300', label: 'Star Glow' },
]

const AvatarSelector = ({ selectedAvatar, onAvatarSelect }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
        {avatars.map((avatar, i) => (
          <motion.button
            key={i}
            onClick={() => onAvatarSelect(i)}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-lg transition-all duration-300 ${
              selectedAvatar === i
                ? `${avatar.color} ring-4 ring-yellow-300 scale-110`
                : 'bg-white hover:bg-gray-100'
            }`}
            whileHover={{ scale: selectedAvatar === i ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
          >
            {avatar.icon}
          </motion.button>
        ))}
      </div>

      {/* Selected avatar label */}
      <motion.div
        className="mt-4 p-2 bg-white/20 backdrop-blur rounded-xl inline-block"
        key={selectedAvatar}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-lg md:text-xl font-bold text-yellow-300 drop-shadow">
          {avatars[selectedAvatar].label}
        </span>
      </motion.div>
    </div>
  )
}

export default AvatarSelector
