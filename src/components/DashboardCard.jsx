// src/components/DashboardCard.jsx

import React from 'react'
import { motion } from 'framer-motion'

const DashboardCard = ({
  title,
  author,
  questions,
  modules,
  image,
  bgColor,
  textColor,
  onClick
}) => (
  <motion.div
    onClick={onClick}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="group cursor-pointer"
  >
    <div className={`bg-gradient-to-br ${bgColor} rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 h-full">
        <img
          src={image}
          alt={title}
          className="w-full h-32 object-cover rounded-xl mb-4"
        />
        <div className="flex justify-between items-start">
          <h2 className={`font-semibold text-lg ${textColor} line-clamp-2`}>
            {title}
          </h2>
          <span className="bg-white rounded-full px-3 py-1 text-sm">
            {questions} Soal
          </span>
        </div>
        {modules > 0 && (
          <div className="mt-1">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
              {modules} modul
            </span>
          </div>
        )}
        <p className="mt-2 text-gray-600">{author}</p>
      </div>
    </div>
  </motion.div>
)

export default DashboardCard
