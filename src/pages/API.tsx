import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Copy, Play, Book, Key, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const API: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedEndpoint, setSelectedEndpoint] = useState('payments')

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Book },
    { id: 'endpoints', label: 'Endpoints', icon: Code },
    { id: 'authentication', label: 'Authentification', icon: Key },
    { id: 'playground', label: 'Playground', icon: Play }
  ]

  const endpoints = {
    payments: {
      title: 'Paiements',
      description: 'Créer et gérer les paiements Mobile Money',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/payments',
          description: 'Créer un nouveau paiement',
          example: `{
  "amount": 10000,
  "currency": "XOF",
  "provider": "orange_money",
  "phone": "+221771234567",
  "description": "Achat produit #12345",
  "webhook_url": "https://yourapp.com/webhooks"
}`
        },
        {
          method: 'GET',
          path: '/api/v1/payments/{id}',
          description: 'Récupérer un paiement par ID',
          example: null
        },
        {
          method: 'GET',
          path: '/api/v1/payments',
          description: 'Lister tous les paiements',
          example: null
        }
      ]
    },
    webhooks: {
      title: 'Webhooks',
      description: 'Configurer les notifications en temps réel',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/webhooks',
          description: 'Créer un webhook',
          example: `{
  "url": "https://yourapp.com/payfuse-webhook",
  "events": ["payment.completed", "payment.failed"],
  "secret": "your_webhook_secret"
}`
        },
        {
          method: 'GET',
          path: '/api/v1/webhooks',
          description: 'Lister les webhooks',
          example: null
        }
      ]
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers!')
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API PayFuse</h2>
        <p className="text-gray-600 mb-6">
          L'API PayFuse vous permet d'intégrer facilement les paiements Mobile Money 
          dans vos applications avec une interface unifiée pour tous les providers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Base URL</h3>
          <code className="text-sm bg-blue-100 px-2 py-1 rounded">
            https://api.payfuse.dev/v1
          </code>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Format</h3>
          <p className="text-sm text-green-800">JSON uniquement</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">Providers Supportés</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {['Orange Money', 'Wave', 'MTN MoMo', 'Airtel Money'].map(provider => (
            <span key={provider} className="bg-yellow-100 text-yellow-800 px-2 py-1 text-sm rounded">
              {provider}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">Exemple d'utilisation rapide</h3>
        <pre className="text-sm text-gray-300 overflow-x-auto">
          <code>{`// Installation
npm install @payfuse/sdk

// Utilisation
import PayFuse from '@payfuse/sdk'

const payfuse = new PayFuse({
  apiKey: 'your_api_key',
  environment: 'sandbox'
})

const payment = await payfuse.payments.create({
  amount: 10000,
  provider: 'orange_money',
  phone: '+221771234567'
})`}</code>
        </pre>
      </div>
    </div>
  )

  const renderEndpoints = () => (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        {Object.entries(endpoints).map(([key, endpoint]) => (
          <button
            key={key}
            onClick={() => setSelectedEndpoint(key)}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              selectedEndpoint === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {endpoint.title}
          </button>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          {endpoints[selectedEndpoint as keyof typeof endpoints].title}
        </h3>
        <p className="text-gray-600 mb-6">
          {endpoints[selectedEndpoint as keyof typeof endpoints].description}
        </p>

        <div className="space-y-4">
          {endpoints[selectedEndpoint as keyof typeof endpoints].methods.map((method, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className={`px-2 py-1 text-xs rounded font-medium mr-3 ${
                  method.method === 'GET' ? 'bg-green-100 text-green-800' :
                  method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {method.method}
                </span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {method.path}
                </code>
              </div>
              <p className="text-gray-600 mb-3">{method.description}</p>
              
              {method.example && (
                <div className="bg-gray-900 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">Exemple de requête</span>
                    <button
                      onClick={() => copyToClipboard(method.example!)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{method.example}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAuthentication = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentification</h2>
        <p className="text-gray-600 mb-6">
          PayFuse utilise des clés API pour authentifier les requêtes. 
          Incluez votre clé API dans l'en-tête Authorization de chaque requête.
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">En-tête d'authentification</h3>
        <pre className="text-sm text-gray-300">
          <code>Authorization: Bearer your_api_key</code>
        </pre>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-red-900 mb-2">⚠️ Sécurité</h3>
        <ul className="text-sm text-red-800 space-y-1">
          <li>• Ne jamais exposer vos clés API côté client</li>
          <li>• Utilisez HTTPS pour toutes les requêtes</li>
          <li>• Régénérez vos clés en cas de compromission</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Clés de Test</h3>
          <p className="text-sm text-blue-800">
            Commencent par <code>pk_test_</code>
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Clés de Production</h3>
          <p className="text-sm text-green-800">
            Commencent par <code>pk_live_</code>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation API</h1>
        <p className="text-gray-600">Guide complet pour intégrer PayFuse</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-4"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'endpoints' && renderEndpoints()}
            {activeTab === 'authentication' && renderAuthentication()}
            {activeTab === 'playground' && (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Playground API</h3>
                <p className="text-gray-600 mb-4">
                  Testez l'API directement depuis l'interface
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Aller au Playground
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default API