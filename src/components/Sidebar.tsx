import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Settings, 
  FileText, 
  Brain,
  Activity,
  TestTube,
  Code,
  Webhook,
  Shield,
  LogOut,
  Zap
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuthStore()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/' },
    { icon: CreditCard, label: 'Paiements', path: '/payments' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Code, label: 'API Playground', path: '/playground' },
    { icon: Webhook, label: 'Webhooks', path: '/webhooks' },
    { icon: Brain, label: 'Assistant IA', path: '/ai-assistant' },
    { icon: Activity, label: 'Monitoring', path: '/monitoring' },
    { icon: TestTube, label: 'Tests', path: '/testing' },
    { icon: Shield, label: 'Sécurité', path: '/security' },
    { icon: FileText, label: 'Documentation', path: '/docs' },
    { icon: Settings, label: 'Paramètres', path: '/settings' }
  ]

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PayFuse
            </h1>
            <p className="text-xs text-gray-500">Mobile Money Gateway</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">PF</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">PayFuse Dev</p>
            <p className="text-sm text-gray-500">admin@payfuse.dev</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Sidebar