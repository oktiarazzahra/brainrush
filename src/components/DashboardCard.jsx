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
  onClick,
  isContinue
}) => (
  <motion.div
    onClick={onClick}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    whileHover={{ scale: 1.045, y: -6 }}
    className={`group cursor-pointer ${isContinue ? 'ring-4 ring-yellow-300 scale-[1.03]' : ''}`}
    style={{ width: 370, minHeight: 260, margin: '0 12px' }}
  >
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className={`h-36 bg-gradient-to-r ${bgColor} flex items-center justify-center overflow-hidden relative`}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
        {isContinue && (
          <div className="absolute bottom-2 right-2 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-md text-xs shadow">
            Lanjutkan
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-semibold text-base text-gray-700 mb-1 line-clamp-2">{title}</h2>
        <p className="text-xs text-gray-500 mb-1 font-medium">{author}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold space-x-3">
          <span>{questions} Soal</span>
          {modules > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
)

export default DashboardCard
