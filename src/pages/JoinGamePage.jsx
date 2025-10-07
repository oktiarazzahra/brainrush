import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'
import AvatarSelector from '../components/AvatarSelector'
import NameInput from '../components/NameInput'
import Button from '../components/Button'

const JoinGamePage = ({ onBack, onJoinNow }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [playerName, setPlayerName] = useState('')

  // Avatar options dengan emoji dan warna
  const avatars = [
    { emoji: '🍓', color: 'bg-pink-500', name: 'Strawberry' },
    { emoji: '🤖', color: 'bg-blue-500', name: 'Robot' },
    { emoji: '👾', color: 'bg-purple-500', name: 'Alien' },
    { emoji: '🤖', color: 'bg-yellow-500', name: 'Bot' },
    { emoji: '🐺', color: 'bg-gray-700', name: 'Wolf' },
    { emoji: '🐸', color: 'bg-green-500', name: 'Frog' }
  ]

  const handleJoinNow = () => {
    if (playerName.trim()) {
      onJoinNow && onJoinNow({
        avatar: avatars[selectedAvatar],
        name: playerName
      })
    } else {
      alert('Please enter your name!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Title */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Join Game
          </h1>
          <motion.p 
            className="text-xl text-white/80 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Choose your avatar and enter your name
          </motion.p>
        </motion.div>

        {/* Avatar Selection Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <AvatarSelector
            avatars={avatars}
            selectedAvatar={selectedAvatar}
            onAvatarSelect={setSelectedAvatar}
          />
        </motion.div>

        {/* Name Input Component */}
        <motion.div
          className="mb-8 w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <NameInput
            value={playerName}
            onChange={setPlayerName}
            placeholder="Enter your name"
            maxLength={20}
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          
          <Button
            onClick={handleJoinNow}
            disabled={!playerName.trim()}
            variant="primary"
            className="flex-1"
          >
            Join Now
          </Button>
        </motion.div>

        {/* Helper Text */}
        <motion.p 
          className="text-white/60 text-sm mt-6 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          Choose an avatar that represents you and enter a fun name to join the quiz!
        </motion.p>
      </main>

      <Footer />
    </div>
  )
}

export default JoinGamePage