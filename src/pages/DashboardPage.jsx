// src/pages/DashboardPage.jsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '../components/DashboardCard'

const DashboardPage = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Bahasa')
  const [searchQuery, setSearchQuery] = useState('')
  const [pinInput, setPinInput] = useState('')

  const categories = ['Bahasa', 'Sains', 'Matematika', 'Biologi']

  const quizzes = [
    {
      id: 1,
      title: 'Ketahui Jenis Jenis Bakteri',
      category: 'Bahasa',
      questions: 20,
      modules: 0,
      image: 'https://placeimg.com/320/180/nature',
      bgColor: 'from-blue-400 to-purple-500',
      textColor: 'text-blue-900',
      author: 'Brain_Rush'
    },
    {
      id: 2,
      title: 'Belajar Pembagian dan Perkalian',
      category: 'Matematika',
      questions: 25,
      modules: 0,
      image: 'https://placeimg.com/320/180/arch',
      bgColor: 'from-green-400 to-blue-500',
      textColor: 'text-green-900',
      author: 'Brain_Rush'
    },
    {
      id: 3,
      title: 'Belajar Dasar HTML dan CSS',
      category: 'Sains',
      questions: 15,
      modules: 5,
      image: 'https://placeimg.com/320/180/tech',
      bgColor: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-900',
      author: 'Brain_Rush'
    },
    {
      id: 4,
      title: 'Belajar Fisika Dasar',
      category: 'Sains',
      questions: 20,
      modules: 0,
      image: 'https://placeimg.com/320/180/people',
      bgColor: 'from-gray-400 to-blue-400',
      textColor: 'text-gray-900',
      author: 'Brain_Rush'
    },
    {
      id: 5,
      title: 'Belajar Bahasa Asing',
      category: 'Bahasa',
      questions: 10,
      modules: 0,
      image: 'https://placeimg.com/320/180/animals',
      bgColor: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-900',
      author: 'Brain_Rush'
    },
    {
      id: 6,
      title: 'Apa Pentingnya Toleransi Antar Agama',
      category: 'Biologi',
      questions: 8,
      modules: 2,
      image: 'https://placeimg.com/320/180/nature',
      bgColor: 'from-teal-400 to-blue-500',
      textColor: 'text-teal-900',
      author: 'Brain_Rush'
    }
  ]

  const filteredQuizzes = quizzes.filter(
    (quiz) => quiz.category === activeCategory
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari konten"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 pl-12 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 w-80"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">
                🔍
              </div>
            </div>

            {/* PIN Input */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Insert PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 w-48"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-full shadow-lg"
              >
                JOIN
              </motion.button>
            </div>
          </div>

          {/* Logo & Profile */}
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-yellow-400 stroke-text">
              Brain Rush
            </div>
            <motion.div
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-3 cursor-pointer border border-white/20"
            >
              <div className="text-white font-semibold">Dashboard Saya</div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="flex-1 p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-4 mb-6"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all duration-300
                ${activeCategory === category
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }
              `}
            >
              {category}
            </motion.button>
          ))}
          <div className="text-white/60 flex items-center ml-4 cursor-pointer">
            More
          </div>
        </motion.div>

        {/* Quiz Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz, index) => (
            <DashboardCard
              key={quiz.id}
              title={quiz.title}
              author={quiz.author}
              questions={quiz.questions}
              modules={quiz.modules}
              image={quiz.image}
              bgColor={quiz.bgColor}
              textColor={quiz.textColor}
            />
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
