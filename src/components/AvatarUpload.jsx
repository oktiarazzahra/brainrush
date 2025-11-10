// src/components/AvatarUpload.jsx
import { motion } from 'framer-motion'

const AvatarUpload = ({ avatar, onAvatarChange }) => {
  const handleAvatarClick = () => {
    console.log('Change avatar clicked')
    if (onAvatarChange) {
      onAvatarChange()
    }
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
          onClick={handleAvatarClick}
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
    </div>
  )
}

export default AvatarUpload