import { motion } from 'framer-motion'

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  className = '',
  onHoverStart,
  onHoverEnd,
  ...props 
}) => {
  const baseClasses = "text-xl font-semibold py-4 px-8 rounded-full shadow-lg transition-all duration-300"
  
  const variantClasses = {
    primary: disabled 
      ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-800 cursor-pointer',
    secondary: disabled
      ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed opacity-50'
      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white cursor-pointer',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white/10'
  }

  const hoverAnimation = () => {
    if (disabled) return {}
    
    switch (variant) {
      case 'primary':
        return { 
          scale: 1.05, 
          boxShadow: '0 10px 30px rgba(255,193,7,0.4)' 
        }
      case 'secondary':
        return { 
          scale: 1.05, 
          boxShadow: '0 10px 30px rgba(34,197,94,0.3)' 
        }
      case 'outline':
        return { 
          scale: 1.05, 
          boxShadow: '0 10px 30px rgba(255,255,255,0.1)' 
        }
      default:
        return { scale: 1.05 }
    }
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={hoverAnimation()}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button