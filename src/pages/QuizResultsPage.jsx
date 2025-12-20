import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gameService } from '../services/gameService'

const QuizResultsPage = () => {
  const navigate = useNavigate()
  const { quizId } = useParams()
  const location = useLocation()
  const { results: stateResults, quiz: stateQuiz, isHost, playerName } = location.state || {}
  
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [activeTab, setActiveTab] = useState('ranking')
  const [playersData, setPlayersData] = useState([])
  const [quizInfo, setQuizInfo] = useState({
    title: 'Quiz Results',
    totalQuestions: 0,
    totalPlayers: 0,
    averageScore: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If no results in state, fetch from backend
    if (!stateResults && quizId) {
      fetchGameResults()
    } else if (stateResults) {
      processResults(stateResults, stateQuiz)
    }
  }, [quizId, stateResults, stateQuiz])

  const fetchGameResults = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching game results for:', quizId)
      
      const response = await gameService.getGameResults(quizId)
      console.log('✅ Game results:', response)
      
      const gameHistory = response.data.results
      processGameHistory(gameHistory)
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching game results:', err)
      setError('Gagal memuat hasil quiz')
      setLoading(false)
    }
  }

  // Helper function to format answer display (True/False → Benar/Salah)
  const formatAnswerDisplay = (answer) => {
    if (answer === 'True') return 'Benar'
    if (answer === 'False') return 'Salah'
    if (Array.isArray(answer)) {
      return answer.map(a => a === 'True' ? 'Benar' : a === 'False' ? 'Salah' : a).join(', ')
    }
    return answer || 'No answer'
  }

  const processGameHistory = (gameHistory) => {
    // Process data from GameHistory model
    const processedPlayers = (gameHistory.playerResults || []).map((player, index) => {
      const answers = player.answers || []
      const correctCount = answers.filter(a => a.isCorrect).length
      
      return {
        id: player.userId || index,
        name: player.playerName,
        avatar: player.avatar || '👤',
        score: player.score || 0,
        rank: player.rank || index + 1,
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        answers: answers.map((ans, i) => ({
          questionNum: i + 1,
          question: ans.question || `Question ${i + 1}`,
          userAnswer: Array.isArray(ans.userAnswer) 
            ? ans.userAnswer.map(a => formatAnswerDisplay(a)).join(', ')
            : formatAnswerDisplay(ans.userAnswer),
          correctAnswer: Array.isArray(ans.correctAnswer) 
            ? ans.correctAnswer.map(a => formatAnswerDisplay(a)).join(', ')
            : formatAnswerDisplay(ans.correctAnswer) || 'N/A',
          isCorrect: ans.isCorrect
        }))
      }
    })

    // Sort by rank or score
    const sortedPlayers = processedPlayers.sort((a, b) => a.rank - b.rank || b.score - a.score)
    
    setPlayersData(sortedPlayers)

    // Calculate quiz info
    const totalScore = sortedPlayers.reduce((sum, p) => sum + p.score, 0)
    setQuizInfo({
      title: gameHistory.quizId?.title || 'Quiz Results',
      totalQuestions: sortedPlayers[0]?.totalQuestions || 0,
      totalPlayers: gameHistory.totalPlayers || sortedPlayers.length,
      averageScore: sortedPlayers.length > 0 
        ? Math.round(totalScore / sortedPlayers.length) 
        : 0
    })
  }

  const processResults = (results, quiz) => {
    if (results && results.players) {
      // Process player data from results (live game end)
      const processedPlayers = results.players.map((player, index) => {
        const answers = player.answers || []
        const correctCount = answers.filter(a => a.isCorrect).length
        
        // Handle avatar as object or string
        const avatarDisplay = typeof player.avatar === 'object' && player.avatar?.emoji 
          ? player.avatar.emoji 
          : (player.avatar || '👤')
        
        return {
          id: player.userId || index,
          name: player.playerName,
          avatar: avatarDisplay,
          score: player.score || 0,
          rank: index + 1,
          totalQuestions: answers.length,
          correctAnswers: correctCount,
          answers: answers.map((ans, i) => ({
            questionNum: i + 1,
            question: ans.question || `Question ${i + 1}`,
            userAnswer: formatAnswerDisplay(ans.userAnswer || ans.answer),
            correctAnswer: Array.isArray(ans.correctAnswer) 
              ? ans.correctAnswer.map(a => formatAnswerDisplay(a)).join(', ')
              : formatAnswerDisplay(ans.correctAnswer),
            isCorrect: ans.isCorrect
          }))
        }
      })

      // Sort by score
      const sortedPlayers = processedPlayers.sort((a, b) => b.score - a.score)
      
      setPlayersData(sortedPlayers)

      // Calculate quiz info
      const totalScore = sortedPlayers.reduce((sum, p) => sum + p.score, 0)
      setQuizInfo({
        title: quiz?.title || results.quiz?.title || 'Quiz Results',
        totalQuestions: sortedPlayers[0]?.totalQuestions || 0,
        totalPlayers: sortedPlayers.length,
        averageScore: sortedPlayers.length > 0 
          ? Math.round(totalScore / sortedPlayers.length) 
          : 0
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || (!stateResults && !playersData.length && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <p className="text-gray-600 mb-4">{error || 'No results data available'}</p>
          <button
            onClick={() => navigate('/my-quizzes')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Back to My Quizzes
          </button>
        </div>
      </div>
    )
  }

  const sortedPlayers = [...playersData].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-200 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm flex items-center gap-2"
            >
              ← Kembali
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{quizInfo.title}</h1>
              <p className="text-gray-600 text-sm">📊 Hasil Quiz - {quizInfo.totalPlayers} Peserta</p>
            </div>
            <div className="w-24"></div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-md text-center"
          >
            <div className="text-3xl font-bold text-blue-600 mb-1">{quizInfo.totalPlayers}</div>
            <p className="text-gray-600 font-semibold text-sm">Total Peserta</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-md text-center"
          >
            <div className="text-3xl font-bold text-green-600 mb-1">{quizInfo.averageScore}</div>
            <p className="text-gray-600 font-semibold text-sm">Rata-rata Skor</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-md text-center"
          >
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {sortedPlayers.length > 0 ? sortedPlayers[0].score : 0}
            </div>
            <p className="text-gray-600 font-semibold text-sm">Skor Tertinggi</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-6 py-2 rounded-xl font-bold transition text-sm ${
              activeTab === 'ranking'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white/70 text-gray-700 hover:bg-white'
            }`}
          >
            🏆 Ranking
          </button>
          <button
            onClick={() => setActiveTab('answers')}
            className={`px-6 py-2 rounded-xl font-bold transition text-sm ${
              activeTab === 'answers'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white/70 text-gray-700 hover:bg-white'
            }`}
          >
            ✅ Jawaban
          </button>
        </div>

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-6 py-3 text-left font-bold text-sm">Peringkat</th>
                    <th className="px-6 py-3 text-left font-bold text-sm">Peserta</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Benar/Total</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, idx) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedPlayer(player)}
                      className="border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
                            {player.avatar}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-green-600 text-sm">
                        {player.correctAnswers}/{player.totalQuestions}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-3 py-1 rounded-lg text-sm inline-block">
                          {player.score}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Answers Tab */}
        {activeTab === 'answers' && (
          <div className="space-y-3">
            {playersData.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPlayer(player)}
                className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                      {player.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{player.name}</p>
                      <p className="text-xs text-gray-500">Skor: {player.score}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold">✓ {player.correctAnswers}</span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold">✗ {player.totalQuestions - player.correctAnswers}</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {player.answers.map((answer, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-center text-xs font-bold ${
                        answer.isCorrect 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      Q{answer.questionNum} {answer.isCorrect ? '✓' : '✗'}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedPlayer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              onClick={() => setSelectedPlayer(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl">
                      {selectedPlayer.avatar}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedPlayer.name}</h2>
                      <p className="text-gray-600 text-sm">Skor: {selectedPlayer.score}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedPlayer.answers.map((answer, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm ${
                        answer.isCorrect 
                          ? 'bg-green-50 border-l-4 border-green-500' 
                          : 'bg-red-50 border-l-4 border-red-500'
                      }`}
                    >
                      <p className="font-bold text-gray-800 mb-1">
                        <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {answer.isCorrect ? '✓' : '✗'}
                        </span>
                        {' '}Q{answer.questionNum}: {answer.question}
                      </p>
                      <p className="text-xs text-gray-700">
                        Jawaban: <span className="font-bold">{answer.userAnswer}</span>
                        {!answer.isCorrect && <span className="text-red-600 ml-2">| Benar: {answer.correctAnswer}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default QuizResultsPage
