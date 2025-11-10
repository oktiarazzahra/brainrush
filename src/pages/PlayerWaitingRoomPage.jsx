import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const PlayerWaitingRoomPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { pin, playerName, avatar, fromDashboard } = location.state || {}

  // Simulasi daftar pemain yang join (termasuk diri sendiri)
  const [players, setPlayers] = useState([
    { id: 1, name: playerName || 'Kamu', avatar: avatar?.emoji || '👽', color: avatar?.color || 'bg-blue-500' }
  ])

  // Simulasi: dalam 2 detik, 2 player lain join
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayers(prev => [
        ...prev,
        { id: 2, name: 'Ani', avatar: '🐸', color: 'bg-green-500' },
        { id: 3, name: 'Budi', avatar: '🍓', color: 'bg-pink-500' }
      ])
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Simulasi perubahan status: setelah 10 detik quiz dimulai
  const [quizStarted, setQuizStarted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setQuizStarted(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (quizStarted) {
      navigate('/play', { state: { pin, playerName, avatar } })
    }
  }, [quizStarted, navigate, pin, playerName, avatar])

  // Tombol keluar dinamis
  const handleExit = () => {
    if (fromDashboard) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 flex flex-col">
      {/* HEADER */}
      <div className="bg-white/10 backdrop-blur-md p-6 border-b border-white/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Waiting Room</h1>
            <p className="text-white/80 text-lg">PIN: <span className="font-mono font-bold">{pin || '------'}</span></p>
          </div>
          <button
            onClick={handleExit}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg transition"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
              {quizStarted ? 'Quiz Dimulai!' : 'Menunggu Host Memulai Quiz...'}
            </h2>
            {!quizStarted && (
              <div className="flex justify-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Players ({players.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-100 rounded-xl p-4 flex flex-col items-center"
                  >
                    <div className={`${player.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg`}>
                      {player.avatar}
                    </div>
                    <p className="font-bold text-gray-800">{player.name}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center text-gray-600">
              {quizStarted ? (
                <p className="text-lg font-semibold">Quiz sedang dimulai ...</p>
              ) : (
                <>
                  <p className="text-lg">Tunggu host untuk memulai quiz...</p>
                  <p className="text-sm mt-2">Peserta lain dapat join dengan PIN yang sama</p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PlayerWaitingRoomPage
