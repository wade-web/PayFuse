import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Key, AlertTriangle, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const SecurityCenter = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production API Key',
      key: 'pk_live_abc123...',
      permissions: ['read', 'write'],
      lastUsed: '2025-01-16T10:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'pk_test_def456...',
      permissions: ['read', 'write', 'admin'],
      lastUsed: '2025-01-16T09:15:00Z',
      status: 'active'
    }
  ])

  const [securityLogs, setSecurityLogs] = useState([
    {
      id: '1',
      type: 'login',
      message: 'Connexion réussie depuis 192.168.1.100',
      timestamp: '2025-01-16T10:30:00Z',
      severity: 'info'
    },
    {
      id: '2',
      type: 'api_key_used',
      message: 'Clé API utilisée pour créer un paiement',
      timestamp: '2025-01-16T10:25:00Z',
      severity: 'info'
    },
    {
      id: '3',
      type: 'failed_webhook',
      message: 'Échec de livraison webhook - Tentative 3/3',
      timestamp: '2025-01-16T10:20:00Z',
      severity: 'warning'
    },
    {
      id: '4',
      type: 'suspicious_activity',
      message: 'Tentative de connexion depuis une IP inconnue',
      timestamp: '2025-01-16T09:45:00Z',
      severity: 'error'
    }
  ])

  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([])
  const [visibleKeys, setVisibleKeys] = useState<string[]>([])

  const generateApiKey = () => {
    if (!newKeyName || newKeyPermissions.length === 0) {
      toast.error('Nom et permissions requis')
      return
    }

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substr(2, 20)}`,
      permissions: newKeyPermissions,
      lastUsed: new Date().toISOString(),
      status: 'active' as const
    }

    setApiKeys(prev => [...prev, newKey])
    setNewKeyName('')
    setNewKeyPermissions([])
    setShowNewKeyModal(false)
    toast.success('Nouvelle clé API générée!')
  }

  const revokeApiKey = (id: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, status: 'revoked' } : key
    ))
    toast.success('Clé API révoquée')
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => 
      prev.includes(id) 
        ? prev.filter(keyId => keyId !== id)
        : [...prev, id]
    )
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('Clé API copiée!')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'info': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <CheckCircle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre de Sécurité</h1>
        <p className="text-gray-600">Gérez vos clés API et surveillez l'activité de sécurité</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* API Keys Management */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              Clés API
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewKeyModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Nouvelle Clé
            </motion.button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">{apiKey.name}</h3>
                    <div className="flex items-center mt-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded mr-2">
                        {visibleKeys.includes(apiKey.id) ? apiKey.key : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {visibleKeys.includes(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyApiKey(apiKey.key)}
                        className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {apiKey.status === 'active' ? 'Active' : 'Révoquée'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {apiKey.permissions.map(permission => (
                    <span key={permission} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                      {permission}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Dernière utilisation: {new Date(apiKey.lastUsed).toLocaleString()}</span>
                  {apiKey.status === 'active' && (
                    <button
                      onClick={() => revokeApiKey(apiKey.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Révoquer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Logs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Journaux de Sécurité
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {securityLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border-l-4 ${
                  log.severity === 'error' ? 'border-red-500 bg-red-50' :
                  log.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-1 rounded ${getSeverityColor(log.severity)} mr-3`}>
                    {getSeverityIcon(log.severity)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{log.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Security Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Clés API Actives', value: apiKeys.filter(k => k.status === 'active').length, color: 'text-green-600' },
          { label: 'Connexions Aujourd\'hui', value: 24, color: 'text-blue-600' },
          { label: 'Tentatives Échouées', value: 3, color: 'text-red-600' },
          { label: 'Webhooks Sécurisés', value: '100%', color: 'text-purple-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-4 text-center"
          >
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
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
            <h2 className="text-xl font-semibold mb-4">Nouvelle Clé API</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la clé
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Production API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['read', 'write', 'admin'].map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyPermissions(prev => [...prev, permission])
                          } else {
                            setNewKeyPermissions(prev => prev.filter(p => p !== permission))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateApiKey}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Générer
              </motion.button>
              <button
                onClick={() => setShowNewKeyModal(false)}
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

export default SecurityCenter