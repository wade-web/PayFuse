import React from 'react'
import { motion } from 'framer-motion'

interface BoltBadgeProps {
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