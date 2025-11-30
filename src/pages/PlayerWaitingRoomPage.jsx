import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameService } from '../services/gameService'
import socketService from '../services/socketService'


const PlayerWaitingRoomPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { gameId, pin, playerName, avatar, fromDashboard, isGuest } = location.state || {}

  const [players, setPlayers] = useState([])
  const [gameStatus, setGameStatus] = useState('waiting')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId || !pin) {
      navigate('/')
      return
    }
    
    // Initial load
    fetchGameData()
    
    // Connect to WebSocket
    socketService.connect()
    socketService.joinGame(gameId, playerName, 'player')
    
    // Listen for real-time events
    socketService.onPlayerJoined(({ playerName: newPlayer, totalPlayers }) => {
      console.log(`👤 ${newPlayer} joined! Total: ${totalPlayers}`)
      fetchGameData() // Refresh player list
    })
    
    socketService.onPlayerLeft(({ playerName: leftPlayer, totalPlayers }) => {
      console.log(`👋 ${leftPlayer} left! Total: ${totalPlayers}`)
      fetchGameData() // Refresh player list
    })
    
    socketService.onGameStarted(() => {
      console.log('🎮 Game started!')
      setGameStatus('running')
      
      // Navigate to player gameplay page
      navigate('/player-gameplay', { 
        state: { 
          gameId, 
          pin, 
          playerName, 
          avatar,
          isGuest 
        } 
      })
    })
    
    socketService.onHostDisconnected(() => {
      alert('Host terputus! Game dibatalkan.')
      handleExit()
    })
    
    return () => {
      socketService.leaveGame(gameId, playerName)
      socketService.removeAllListeners()
    }
  }, [gameId, pin, navigate])

  const fetchGameData = async () => {
    try {
      // Use guest service if player is guest, otherwise use regular service
      const response = isGuest 
        ? await gameService.getGameAsGuest(gameId)
        : await gameService.getGame(gameId)
      
      const gameData = response.data.game
      
      // Update players list
      const playersList = gameData.players.map(p => {
        const avatarEmoji = typeof p.avatar === 'object' && p.avatar?.emoji 
          ? p.avatar.emoji 
          : (p.avatar || '🤖')

        return {
          id: p._id || p.userId,
          name: p.playerName || p.name,
          avatar: avatarEmoji,
          color: 'bg-blue-500'
        }
      })
      setPlayers(playersList)
      
      // Update game status
      setGameStatus(gameData.gameStatus)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching game data:', error)
      setLoading(false)
    }
  }

  // Tombol keluar - kembali ke home atau dashboard
  const handleExit = () => {
    if (fromDashboard) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-cyan-100 to-sky-100 flex flex-col">
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md p-6 border-b border-blue-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Waiting Room</h1>
            <p className="text-gray-700 text-lg">PIN: <span className="font-mono font-bold text-blue-600">{pin || '------'}</span></p>
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
              {gameStatus === 'running' ? 'Quiz Dimulai!' : 'Menunggu Host Memulai Quiz...'}
            </h2>
            {gameStatus !== 'running' && (
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading players...</p>
                </div>
              ) : players.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-100 rounded-xl p-4 flex flex-col items-center"
                    >
                      <div className={`${player.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg`}>
                        {player.avatar}
                      </div>
                      <p className="font-bold text-gray-800 truncate max-w-full px-2">{player.name}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Waiting for players to join...</p>
                </div>
              )}
            </div>


            <div className="text-center text-gray-600">
              {gameStatus === 'running' ? (
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
