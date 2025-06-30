import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Documentation from './pages/Documentation'
import AIAssistant from './pages/AIAssistant'
import Monitoring from './pages/Monitoring'
import Testing from './pages/Testing'
import APIPlayground from './pages/APIPlayground'
import WebhookManager from './pages/WebhookManager'
import SecurityCenter from './pages/SecurityCenter'
import AssistantInterface from './components/AssistantInterface'
import NotificationCenter from './components/NotificationCenter'
import BoltBadge from './components/BoltBadge'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/testing" element={<Testing />} />
              <Route path="/playground" element={<APIPlayground />} />
              <Route path="/webhooks" element={<WebhookManager />} />
              <Route path="/security" element={<SecurityCenter />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Interface d'assistance organisée */}
      <AssistantInterface />
      <NotificationCenter />
      
      {/* Badge Bolt.new en bas à droite avec assistant vocal */}
      <div className="fixed bottom-6 right-24 z-40">
        <BoltBadge variant="dark" position="bottom-right" size="md" />
      </div>
    </div>
  )
}

export default App
