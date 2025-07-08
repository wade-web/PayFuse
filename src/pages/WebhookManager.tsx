import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Webhook, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      url: 'https://myapp.com/webhooks/payment',
      events: ['payment.completed', 'payment.failed'],
      status: 'active',
      lastDelivery: '2025-01-16T10:30:00Z',
      deliveryCount: 1247,
      failureCount: 3
    },
    {
      id: '2',
      url: 'https://shop.example.com/api/payfuse-webhook',
      events: ['payment.completed'],
      status: 'inactive',
      lastDelivery: '2025-01-15T15:22:00Z',
      deliveryCount: 892,
      failureCount: 12
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
    secret: ''
  })

  const availableEvents = [
    'payment.created',
    'payment.completed',
    'payment.failed',
    'payment.cancelled',
    'refund.created',
    'refund.completed'
  ]

  const handleAddWebhook = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      toast.error('URL et événements requis')
      return
    }

    const webhook = {
      id: Date.now().toString(),
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active' as const,
      lastDelivery: new Date().toISOString(),
      deliveryCount: 0,
      failureCount: 0
    }

    setWebhooks(prev => [...prev, webhook])
    setNewWebhook({ url: '', events: [], secret: '' })
    setShowAddModal(false)
    toast.success('Webhook ajouté avec succès!')
  }

  const toggleWebhookStatus = (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
        : webhook
    ))
    toast.success('Statut du webhook mis à jour')
  }

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
    toast.success('Webhook supprimé')
  }

  const testWebhook = async (webhook: any) => {
    toast.loading('Test du webhook en cours...')
    
    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.dismiss()
    toast.success('Webhook testé avec succès!')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Webhooks</h1>
            <p className="text-gray-600">Configurez et surveillez vos endpoints de notification</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Webhook
          </motion.button>
        </div>
      </motion.div>

      {/* Webhooks List */}
      <div className="grid gap-6">
        {webhooks.map((webhook, index) => (
          <motion.div
            key={webhook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Webhook className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-lg">{webhook.url}</h3>
                  <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                    webhook.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {webhook.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {webhook.events.map(event => (
                    <span key={event} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                      {event}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Dernière livraison:</span>
                    <p>{new Date(webhook.lastDelivery).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Succès:</span>
                    <p className="text-green-600">{webhook.deliveryCount}</p>
                  </div>
                  <div>
                    <span className="font-medium">Échecs:</span>
                    <p className="text-red-600">{webhook.failureCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => testWebhook(webhook)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Tester le webhook"
                >
                  <Zap className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWebhookStatus(webhook.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    webhook.status === 'active'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={webhook.status === 'active' ? 'Désactiver' : 'Activer'}
                >
                  {webhook.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteWebhook(webhook.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Webhook Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Nouveau Webhook</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du Webhook
                </label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourapp.com/webhooks/payfuse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Événements à écouter
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableEvents.map(event => (
                    <label key={event} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook(prev => ({ ...prev, events: [...prev.events, event] }))
                          } else {
                            setNewWebhook(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret (optionnel)
                </label>
                <input
                  type="password"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Secret pour signer les webhooks"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddWebhook}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </motion.button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default WebhookManager