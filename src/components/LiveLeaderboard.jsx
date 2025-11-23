import { motion } from 'framer-motion'

const LiveLeaderboard = ({ players, currentPlayerName = null, compact = false }) => {
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  if (compact) {
    // Compact version - show top 5
    return (
      <div className="space-y-2">
        {sortedPlayers.slice(0, 5).map((player, index) => {
          // Handle avatar as object or string
          const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
            ? player.avatar.emoji 
            : (player.avatar || '👤')
          
          return (
          <motion.div
            key={player.playerName || index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              player.playerName === currentPlayerName
                ? 'bg-blue-100 border-2 border-blue-400'
                : 'bg-gray-50'
            }`}
          >
            <div className="text-lg font-bold w-8 text-center text-gray-700">
              {index + 1}
            </div>
            <div className="text-xl">{avatarDisplay}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">
                {player.playerName}
                {player.playerName === currentPlayerName && (
                  <span className="ml-1 text-blue-600 text-xs">(You)</span>
                )}
              </div>
            </div>
            <div className="text-lg font-bold text-blue-600">{player.score || 0}</div>
          </motion.div>
          )
        })}
        {sortedPlayers.length > 5 && (
          <div className="text-center text-gray-500 text-sm py-2">
            +{sortedPlayers.length - 5} more players
          </div>
        )}
      </div>
    )
  }

  // Full version - show all players
  return (
    <div className="space-y-3">
      {sortedPlayers.map((player, index) => {
        // Handle avatar as object or string
        const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
          ? player.avatar.emoji 
          : (player.avatar || '👤')
        
        return (
        <motion.div
          key={player.playerName || index}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center gap-4 p-4 rounded-xl ${
            player.playerName === currentPlayerName
              ? 'bg-blue-100 border-2 border-blue-500 shadow-lg'
              : index === 0
              ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 shadow-lg'
              : index === 1
              ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400 shadow-md'
              : index === 2
              ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400 shadow-md'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="text-3xl font-bold w-12 text-center">
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
          </div>
          <div className="text-3xl">{avatarDisplay}</div>
          <div className="flex-1">
            <div className="font-bold text-lg text-gray-800">
              {player.playerName}
              {player.playerName === currentPlayerName && (
                <span className="ml-2 text-blue-600">(You)</span>
              )}
            </div>
            {player.answersCorrect !== undefined && (
              <div className="text-sm text-gray-500">
                {player.answersCorrect} correct answers
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{player.score || 0}</div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </motion.div>
        )
      })}
    </div>
  )
}

export default LiveLeaderboard
