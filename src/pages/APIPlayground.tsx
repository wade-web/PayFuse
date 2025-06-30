import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Copy, Download, Zap, Code, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const APIPlayground = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('create-payment')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const endpoints = [
    {
      id: 'create-payment',
      name: 'Créer un Paiement',
      method: 'POST',
      path: '/api/v1/payments',
      description: 'Initie un nouveau paiement Mobile Money',
      example: {
        amount: 10000,
        currency: 'XOF',
        provider: 'orange_money',
        phone: '+221771234567',
        description: 'Achat produit #12345',
        webhook_url: 'https://yourapp.com/webhooks/payment'
      }
    },
    {
      id: 'get-payment',
      name: 'Statut Paiement',
      method: 'GET',
      path: '/api/v1/payments/{id}',
      description: 'Récupère le statut d\'un paiement',
      example: {}
    },
    {
      id: 'list-payments',
      name: 'Liste Paiements',
      method: 'GET',
      path: '/api/v1/payments',
      description: 'Liste tous les paiements avec pagination',
      example: {}
    },
    {
      id: 'webhook-verify',
      name: 'Vérifier Webhook',
      method: 'POST',
      path: '/api/v1/webhooks/verify',
      description: 'Vérifie la signature d\'un webhook',
      example: {
        signature: 'sha256=abc123...',
        payload: '{"event":"payment.completed","data":{...}}'
      }
    }
  ]

  const handleExecute = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResponse = {
        success: true,
        data: {
          id: 'pay_' + Math.random().toString(36).substr(2, 9),
          status: 'pending',
          amount: JSON.parse(requestBody || '{}').amount || 10000,
          currency: 'XOF',
          provider: 'orange_money',
          created_at: new Date().toISOString(),
          payment_url: 'https://sandbox.orange-money.com/pay/abc123'
        },
        message: 'Paiement créé avec succès'
      }
      
      setResponse(JSON.stringify(mockResponse, null, 2))
      toast.success('Requête exécutée avec succès!')
    } catch (error) {
      toast.error('Erreur lors de l\'exécution')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers!')
  }

  const generateCode = (language: string) => {
    const endpoint = endpoints.find(e => e.id === selectedEndpoint)
    if (!endpoint) return

    const examples = {
      javascript: `
// PayFuse API - ${endpoint.name}
const response = await fetch('${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${JSON.stringify(endpoint.example, null, 2)})
});

const data = await response.json();
console.log(data);`,
      
      python: `
# PayFuse API - ${endpoint.name}
import requests

response = requests.${endpoint.method.toLowerCase()}(
    '${endpoint.path}',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json=${JSON.stringify(endpoint.example, null, 2).replace(/"/g, "'")}
)

data = response.json()
print(data)`,
      
      php: `
<?php
// PayFuse API - ${endpoint.name}
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => '${endpoint.path}',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => '${endpoint.method}',
    CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(endpoint.example, null, 2)}),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_API_KEY',
        'Content-Type: application/json'
    ],
]);

$response = curl_exec($curl);
$data = json_decode($response, true);
curl_close($curl);

print_r($data);
?>`
    }

    copyToClipboard(examples[language as keyof typeof examples])
  }

  React.useEffect(() => {
    const endpoint = endpoints.find(e => e.id === selectedEndpoint)
    if (endpoint) {
      setRequestBody(JSON.stringify(endpoint.example, null, 2))
    }
  }, [selectedEndpoint])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Playground</h1>
        <p className="text-gray-600">Testez l'API PayFuse en temps réel avec des exemples interactifs</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-600" />
            Endpoints Disponibles
          </h2>
          
          <div className="space-y-2">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedEndpoint === endpoint.id
                    ? 'bg-blue-50 border-blue-200 border'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{endpoint.name}</span>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">{endpoint.path}</p>
                <p className="text-xs text-gray-600 mt-1">{endpoint.description}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Request Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-green-600" />
            Requête
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corps de la requête (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le JSON de votre requête..."
              />
            </div>

            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExecute}
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Exécuter
                  </>
                )}
              </motion.button>
              
              <button
                onClick={() => copyToClipboard(requestBody)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Response Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2 text-purple-600" />
            Réponse
          </h2>

          <div className="space-y-4">
            <div>
              <textarea
                value={response}
                readOnly
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                placeholder="La réponse de l'API apparaîtra ici..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(response)}
                disabled={!response}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([response], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'payfuse-response.json'
                  a.click()
                }}
                disabled={!response}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Code Generation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white rounded-lg shadow-sm border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Génération de Code</h2>
        <p className="text-gray-600 mb-4">Générez automatiquement le code pour intégrer cet endpoint dans votre application</p>
        
        <div className="flex space-x-2">
          {['javascript', 'python', 'php'].map((lang) => (
            <motion.button
              key={lang}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => generateCode(lang)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all capitalize"
            >
              {lang}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default APIPlayground