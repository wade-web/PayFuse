import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TestTube, Play, CheckCircle, XCircle, Clock, Code } from 'lucide-react'
import toast from 'react-hot-toast'

const Testing = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const testSuites = [
    {
      id: 'api-endpoints',
      name: 'Tests API Endpoints',
      description: 'Vérification de tous les endpoints de l\'API PayFuse',
      tests: [
        { id: 'create-payment', name: 'Créer un paiement', endpoint: 'POST /api/v1/payments' },
        { id: 'get-payment', name: 'Récupérer un paiement', endpoint: 'GET /api/v1/payments/{id}' },
        { id: 'list-payments', name: 'Lister les paiements', endpoint: 'GET /api/v1/payments' },
        { id: 'webhook-verify', name: 'Vérifier webhook', endpoint: 'POST /api/v1/webhooks/verify' }
      ]
    },
    {
      id: 'providers',
      name: 'Tests Providers',
      description: 'Tests d\'intégration avec les providers Mobile Money',
      tests: [
        { id: 'orange-money', name: 'Orange Money Sandbox', endpoint: 'Orange Money API' },
        { id: 'wave', name: 'Wave Test Environment', endpoint: 'Wave API' },
        { id: 'mtn-momo', name: 'MTN MoMo Sandbox', endpoint: 'MTN MoMo API' }
      ]
    },
    {
      id: 'security',
      name: 'Tests de Sécurité',
      description: 'Vérification des mesures de sécurité et authentification',
      tests: [
        { id: 'auth-jwt', name: 'Authentification JWT', endpoint: 'JWT Validation' },
        { id: 'webhook-signature', name: 'Signature Webhook', endpoint: 'Webhook Security' },
        { id: 'rate-limiting', name: 'Rate Limiting', endpoint: 'Rate Limiter' },
        { id: 'input-validation', name: 'Validation des Entrées', endpoint: 'Input Sanitization' }
      ]
    }
  ]

  const runTest = async (suiteId: string, testId: string) => {
    const testKey = `${suiteId}-${testId}`
    setActiveTest(testKey)
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    
    const success = Math.random() > 0.2 // 80% success rate
    const result = {
      status: success ? 'passed' : 'failed',
      duration: Math.floor(Math.random() * 2000) + 500,
      details: success 
        ? 'Test exécuté avec succès'
        : 'Échec du test - Vérifier la configuration',
      timestamp: new Date().toISOString()
    }
    
    setTestResults(prev => ({ ...prev, [testKey]: result }))
    setActiveTest(null)
    
    if (success) {
      toast.success(`Test ${testId} réussi!`)
    } else {
      toast.error(`Test ${testId} échoué!`)
    }
  }

  const runAllTests = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite) return

    for (const test of suite.tests) {
      await runTest(suiteId, test.id)
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between tests
    }
    
    toast.success(`Suite de tests ${suite.name} terminée!`)
  }

  const getTestStatus = (suiteId: string, testId: string) => {
    const testKey = `${suiteId}-${testId}`
    const result = testResults[testKey]
    
    if (activeTest === testKey) return 'running'
    if (!result) return 'pending'
    return result.status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />
      default: return <TestTube className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-50 border-green-200'
      case 'failed': return 'bg-red-50 border-red-200'
      case 'running': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre de Tests</h1>
        <p className="text-gray-600">Testez et validez vos intégrations PayFuse</p>
      </motion.div>

      {/* Test Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {[
          { label: 'Tests Réussis', value: Object.values(testResults).filter(r => r.status === 'passed').length, color: 'text-green-600' },
          { label: 'Tests Échoués', value: Object.values(testResults).filter(r => r.status === 'failed').length, color: 'text-red-600' },
          { label: 'Tests Totaux', value: testSuites.reduce((acc, suite) => acc + suite.tests.length, 0), color: 'text-blue-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6 text-center"
          >
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Test Suites */}
      <div className="space-y-6">
        {testSuites.map((suite, suiteIndex) => (
          <motion.div
            key={suite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + suiteIndex * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <TestTube className="w-5 h-5 mr-2 text-blue-600" />
                  {suite.name}
                </h2>
                <p className="text-gray-600 mt-1">{suite.description}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => runAllTests(suite.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Tout Tester
              </motion.button>
            </div>

            <div className="grid gap-3">
              {suite.tests.map((test) => {
                const status = getTestStatus(suite.id, test.id)
                const result = testResults[`${suite.id}-${test.id}`]
                
                return (
                  <div
                    key={test.id}
                    className={`border rounded-lg p-4 transition-all ${getStatusColor(status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status)}
                        <div>
                          <h3 className="font-medium">{test.name}</h3>
                          <p className="text-sm text-gray-600">{test.endpoint}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {result && (
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {result.duration}ms
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => runTest(suite.id, test.id)}
                          disabled={status === 'running'}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          {status === 'running' ? 'En cours...' : 'Tester'}
                        </motion.button>
                      </div>
                    </div>
                    
                    {result && result.details && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">{result.details}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Test Code Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-white rounded-lg shadow-sm border p-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Code className="w-5 h-5 mr-2 text-purple-600" />
          Exemples de Tests
        </h2>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{`// Exemple de test unitaire PayFuse
import { PayFuse } from '@payfuse/sdk'

describe('PayFuse API Tests', () => {
  const payfuse = new PayFuse({
    apiKey: 'test_key',
    environment: 'sandbox'
  })

  test('should create payment successfully', async () => {
    const payment = await payfuse.payments.create({
      amount: 10000,
      currency: 'XOF',
      provider: 'orange_money',
      phone: '+221771234567'
    })
    
    expect(payment.id).toBeDefined()
    expect(payment.status).toBe('pending')
    expect(payment.amount).toBe(10000)
  })

  test('should verify webhook signature', () => {
    const payload = '{"event":"payment.completed"}'
    const signature = 'sha256=abc123...'
    const secret = 'webhook_secret'
    
    const isValid = payfuse.webhooks.verify(payload, signature, secret)
    expect(isValid).toBe(true)
  })
})`}</code>
          </pre>
        </div>
      </motion.div>
    </div>
  )
}

export default Testing