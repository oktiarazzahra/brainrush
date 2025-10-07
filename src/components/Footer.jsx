import { motion } from 'framer-motion'

const Footer = ({ variant = 'dark' }) => {
  const footerClasses = variant === 'dark' 
    ? 'bg-slate-800 text-white' 
    : 'text-white bg-black/10 backdrop-blur-sm'

  const linkClasses = variant === 'dark'
    ? 'text-gray-300 hover:text-white'
    : 'text-white/70 hover:text-white'

  return (
    <motion.footer 
      className={`py-6 px-8 ${footerClasses}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-6 mb-4 md:mb-0 justify-center md:justify-start">
          <motion.a 
            href="#about" 
            className={`${linkClasses} transition-colors duration-300 text-sm md:text-base`}
            whileHover={{ scale: 1.05, color: variant === 'dark' ? '#FDE047' : '#FFFFFF' }}
            whileTap={{ scale: 0.95 }}
          >
            About
          </motion.a>
          <motion.a 
            href="#terms" 
            className={`${linkClasses} transition-colors duration-300 text-sm md:text-base`}
            whileHover={{ scale: 1.05, color: variant === 'dark' ? '#FDE047' : '#FFFFFF' }}
            whileTap={{ scale: 0.95 }}
          >
            Terms & Condition
          </motion.a>
          <motion.a 
            href="#contact" 
            className={`${linkClasses} transition-colors duration-300 text-sm md:text-base`}
            whileHover={{ scale: 1.05, color: variant === 'dark' ? '#FDE047' : '#FFFFFF' }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Us
          </motion.a>
          <motion.a 
            href="#help" 
            className={`${linkClasses} transition-colors duration-300 text-sm md:text-base`}
            whileHover={{ scale: 1.05, color: variant === 'dark' ? '#FDE047' : '#FFFFFF' }}
            whileTap={{ scale: 0.95 }}
          >
            Help Center
          </motion.a>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`${linkClasses} mr-2 text-sm`}>Follow us on</span>
          <motion.a 
            href="#facebook" 
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-300"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </motion.a>
          <motion.a 
            href="#google" 
            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors duration-300"
            whileHover={{ scale: 1.2, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </motion.a>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer