import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Book, Search, Copy, ExternalLink, Code, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [searchTerm, setSearchTerm] = useState('')

  const sections = [
    {
      id: 'getting-started',
      title: 'Démarrage Rapide',
      icon: Zap,
      content: {
        title: 'Commencer avec PayFuse',
        description: 'Intégrez PayFuse en quelques minutes avec notre API unifiée.',
        code: `// Installation
npm install @payfuse/sdk

// Configuration
import PayFuse from '@payfuse/sdk'

const payfuse = new PayFuse({
  apiKey: 'your_api_key',
  environment: 'sandbox' // ou 'production'
})

// Créer un paiement
const payment = await payfuse.payments.create({
  amount: 10000,
  currency: 'XOF',
  provider: 'orange_money',
  phone: '+221771234567',
  description: 'Achat produit #12345'
})

console.log(payment.payment_url) // URL de paiement`
      }
    },
    {
      id: 'authentication',
      title: 'Authentification',
      icon: Code,
      content: {
        title: 'Authentification API',
        description: 'Sécurisez vos appels API avec nos clés d\'authentification.',
        code: `// Authentification avec Bearer Token
const headers = {
  'Authorization': 'Bearer your_api_key',
  'Content-Type': 'application/json'
}

// Exemple de requête
const response = await fetch('https://api.payfuse.dev/v1/payments', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    amount: 25000,
    provider: 'wave',
    phone: '+221781234567'
  })
})

const data = await response.json()`
      }
    },
    {
      id: 'payments',
      title: 'Paiements',
      icon: Book,
      content: {
        title: 'Gestion des Paiements',
        description: 'Créez, suivez et gérez vos paiements Mobile Money.',
        code: `// Créer un paiement
POST /api/v1/payments
{
  "amount": 10000,
  "currency": "XOF",
  "provider": "orange_money",
  "phone": "+221771234567",
  "description": "Achat produit",
  "webhook_url": "https://yourapp.com/webhook"
}

// Vérifier le statut
GET /api/v1/payments/{payment_id}

// Réponse
{
  "id": "pay_abc123",
  "status": "completed",
  "amount": 10000,
  "provider": "orange_money",
  "created_at": "2025-01-16T10:30:00Z"
}`
      }
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      icon: ExternalLink,
      content: {
        title: 'Notifications Webhooks',
        description: 'Recevez des notifications en temps réel sur vos transactions.',
        code: `// Configuration webhook
POST /api/v1/webhooks
{
  "url": "https://yourapp.com/payfuse-webhook",
  "events": ["payment.completed", "payment.failed"]
}

// Vérification de signature
const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === \`sha256=\${expectedSignature}\`
}

// Traitement du webhook
app.post('/payfuse-webhook', (req, res) => {
  const signature = req.headers['x-payfuse-signature']
  const payload = JSON.stringify(req.body)
  
  if (verifyWebhook(payload, signature, 'your_webhook_secret')) {
    // Traiter l'événement
    console.log('Paiement reçu:', req.body)
    res.status(200).send('OK')
  } else {
    res.status(400).send('Invalid signature')
  }
})`
      }
    }
  ]

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copié dans le presse-papiers!')
  }

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
        <p className="text-gray-600">Guide complet pour intégrer PayFuse dans vos applications</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher dans la documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-4"
        >
          <nav className="space-y-2">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Liens Utiles</h3>
            <div className="space-y-2">
              <a
                href="https://github.com/payfuse/payfuse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                GitHub Repository
              </a>
              <a
                href="https://status.payfuse.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Status Page
              </a>
              <a
                href="https://discord.gg/payfuse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Discord Community
              </a>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            {(() => {
              const section = sections.find(s => s.id === activeSection)
              if (!section) return null

              return (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {section.content.title}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {section.content.description}
                  </p>

                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <button
                      onClick={() => copyCode(section.content.code)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                      title="Copier le code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{section.content.code}</code>
                    </pre>
                  </div>

                  {activeSection === 'getting-started' && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Prochaines Étapes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Configurer les Webhooks</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Recevez des notifications en temps réel sur vos transactions.
                          </p>
                          <button
                            onClick={() => setActiveSection('webhooks')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Voir la documentation →
                          </button>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Tester l'API</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Utilisez notre playground pour tester vos intégrations.
                          </p>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Ouvrir le Playground →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'payments' && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Providers Supportés</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { name: 'Orange Money', color: 'bg-orange-100 text-orange-800' },
                          { name: 'Wave', color: 'bg-teal-100 text-teal-800' },
                          { name: 'MTN MoMo', color: 'bg-yellow-100 text-yellow-800' }
                        ].map((provider) => (
                          <div key={provider.name} className="text-center">
                            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${provider.color}`}>
                              {provider.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Documentation