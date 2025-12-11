import { useState } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    duration: 3000
  })

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({
      isOpen: true,
      message,
      type,
      duration
    })
  }

  const showSuccess = (message, duration = 3000) => {
    showToast(message, 'success', duration)
  }

  const showError = (message, duration = 5000) => {
    showToast(message, 'error', duration)
  }

  const showWarning = (message, duration = 4000) => {
    showToast(message, 'warning', duration)
  }

  const showInfo = (message, duration = 3000) => {
    showToast(message, 'info', duration)
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }))
  }

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast
  }
}
