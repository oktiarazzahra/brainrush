import { motion } from 'framer-motion'

const QuizCard = ({ quiz, index }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group cursor-pointer"
    >
      <div
        className={`bg-gradient-to-br ${quiz.bgColor} rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 h-full">
          {/* Quiz Image */}
          <img
            src={quiz.image}
            alt={quiz.title}
            className="w-full h-32 object-cover rounded-xl mb-4"
          />

          {/* Quiz Info */}
          <div className="space-y-2">
            <h3
              className={`font-bold text-sm ${quiz.textColor} line-clamp-2 group-hover:text-blue-700 transition-colors`}
            >
              {quiz.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{quiz.author}</span>
              <div className="flex items-center space-x-2">
                {quiz.questions && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {quiz.questions} Soal
                  </span>
                )}
                {quiz.modules && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {quiz.modules} modul
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default QuizCard
