import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCircle, AlertTriangle, Info, DollarSign } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'payment'
  title: string
  message: string
  timestamp: string
  read: boolean
}

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'payment',
      title: 'Nouveau Paiement',
      message: 'Paiement de 25,000 XOF reçu via Orange Money',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Webhook Livré',
      message: 'Webhook payment.completed livré avec succès',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Limite API Atteinte',
      message: 'Vous avez atteint 80% de votre limite mensuelle',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'payment' : 'success',
          title: Math.random() > 0.5 ? 'Nouveau Paiement' : 'Transaction Complétée',
          message: `Paiement de ${Math.floor(Math.random() * 50000 + 5000)} XOF`,
          timestamp: new Date().toISOString(),
          read: false
        }
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)])
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'payment': return <DollarSign className="w-5 h-5 text-blue-600" />
      default: return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  return (
    <>
      {/* Notification Bell - Repositionné */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 bg-white rounded-full p-3 shadow-lg border z-30"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-20 z-25"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-35 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Tout marquer lu
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">
                                {notification.title}
                              </p>
                              <p className="text-gray-600 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-gray-400 text-xs mt-2">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default NotificationCenter