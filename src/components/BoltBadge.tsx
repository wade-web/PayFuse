import React from 'react'
import { motion } from 'framer-motion'

interface BoltBadgeProps {
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
