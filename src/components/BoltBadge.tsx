import React from 'react'
import { motion } from 'framer-motion'

interface BoltBadgeProps {
<<<<<<< HEAD
  variant?: 'light' | 'dark' | 'text'
  position?: 'top-right' | 'bottom-right' | 'bottom-left'
  className?: string
}

const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  variant = 'dark', 
  position = 'bottom-right',
  className = '' 
}) => {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-20',
    'bottom-right': 'fixed bottom-6 right-24 z-20', // Décalé pour éviter les boutons
    'bottom-left': 'fixed bottom-4 left-4 z-20'
  }

  const getBadgeContent = () => {
    if (variant === 'text') {
      return (
        <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
          POWERED BY BOLT.NEW
        </div>
      )
    }

    // Utiliser les images uploadées
    const logoSrc = variant === 'light' 
      ? '/white_circle_360x360.png' 
      : '/black_circle_360x360.png'

    return (
      <img 
        src={logoSrc} 
        alt="Powered by Bolt.new" 
        className="w-12 h-12 hover:scale-110 transition-transform duration-200"
      />
    )
  }

  return (
    <motion.a
      href="https://bolt.new/"
      target="_blank"
      rel="noopener noreferrer"
      className={`${positionClasses[position]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Built with Bolt.new - The fastest way to build full-stack apps"
    >
      {getBadgeContent()}
    </motion.a>
  )
}

export default BoltBadge
=======
  variant?: 'light' | 'dark'
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const BoltBadge: React.FC<BoltBadgeProps> = ({
  variant = 'dark',
  position = 'bottom-right',
  size = 'md',
  className = ''
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4'
  }

  const sizeClasses = {
    'sm': 'w-12 h-12',
    'md': 'w-16 h-16',
    'lg': 'w-20 h-20'
  }

  const logoSrc = variant === 'dark' 
    ? '/black_circle_360x360.png' 
    : '/white_circle_360x360.png'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
    >
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className={`block ${sizeClasses[size]} rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}
        title="Powered by Bolt.new"
      >
        <img
          src={logoSrc}
          alt="Powered by Bolt.new"
          className="w-full h-full rounded-full"
        />
      </a>
    </motion.div>
  )
}

export default BoltBadge
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
