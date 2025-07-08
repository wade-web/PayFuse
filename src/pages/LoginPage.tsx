import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Brain, Mic, QrCode } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
<<<<<<< HEAD
import toast from 'react-hot-toast'
import BoltBadge from '../components/BoltBadge'
=======
import BoltBadge from '../components/BoltBadge'
import toast from 'react-hot-toast'
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (credentials.email && credentials.password) {
        login({
          id: '1',
          email: credentials.email,
          name: 'PayFuse Developer',
          role: 'admin'
        })
        toast.success('Connexion réussie ! Bienvenue sur PayFuse 🚀')
      } else {
        throw new Error('Identifiants requis')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Shield, title: 'Sécurité Avancée', desc: 'JWT + RBAC + Webhooks signés' },
    { icon: Zap, title: 'API Unifiée', desc: 'REST + GraphQL pour tous les providers' },
    { icon: Globe, title: 'Multi-Provider', desc: 'Orange Money, Wave, MTN MoMo' },
    { icon: Brain, title: 'Assistant IA', desc: 'Génération de code et documentation' },
    { icon: Mic, title: 'Commandes Vocales', desc: 'Interface vocale avec ElevenLabs' },
    { icon: QrCode, title: 'QR Payments', desc: 'Paiements instantanés par QR Code' }
  ]

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
         <BoltBadge />
=======
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative">
      {/* Badge Bolt.new en haut à droite */}
      <BoltBadge variant="light" position="top-right" size="md" />
      
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white space-y-8"
        >
          <div>
            <motion.h1 
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              PayFuse
            </motion.h1>
<<<<<<< HEAD

=======
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Passerelle intelligente Mobile Money avec assistant IA intégré
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              >
                <feature.icon className="w-8 h-8 text-blue-400 mb-2" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
<<<<<<< HEAD
       
=======
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre tableau de bord PayFuse</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="admin@payfuse.dev"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Démo Hackathon - Utilisez n'importe quels identifiants</p>
              <div className="flex justify-center space-x-4 text-xs">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ API Unifiée</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">✓ Assistant IA</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">✓ Temps Réel</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

<<<<<<< HEAD
export default LoginPage
=======
export default LoginPage
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
