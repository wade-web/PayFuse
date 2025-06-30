import React from 'react'
import { motion } from 'framer-motion'
import { DivideIcon as LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color?: string
  delay?: number
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color = 'text-blue-600',
  delay = 0
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center">
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()} {change}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs période précédente</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gray-50`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard
