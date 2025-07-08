import React from 'react'
import { motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import VoiceAssistant from './VoiceAssistant'
import NotificationCenter from './NotificationCenter'
import BoltBadge from './BoltBadge'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
      <VoiceAssistant />
      <NotificationCenter />
      <BoltBadge variant="dark" position="bottom-right" />
    </div>
  )
}

export default Layout