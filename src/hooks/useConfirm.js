import { useState } from 'react';

export default function useConfirm() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'OK',
    cancelText: 'Cancel',
    confirmColor: 'blue'
  });

  const showConfirm = ({ 
    title, 
    message, 
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    confirmColor = 'blue'
  }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm?.();
        hideConfirm();
      },
      confirmText,
      cancelText,
      confirmColor
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  return {
    confirmDialog,
    showConfirm,
    hideConfirm
  };
}
