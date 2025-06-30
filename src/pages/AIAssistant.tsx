import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Send, Code, Lightbulb, BookOpen, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour! Je suis l\'assistant IA de PayFuse. Comment puis-je vous aider aujourd\'hui?',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickActions = [
    {
      icon: Code,
      title: 'Générer du Code',
      description: 'Créer une intégration Orange Money',
      prompt: 'Comment créer un paiement Orange Money en JavaScript?'
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Expliquer les webhooks',
      prompt: 'Comment configurer et vérifier les webhooks PayFuse?'
    },
    {
      icon: Lightbulb,
      title: 'Résoudre un Problème',
      description: 'Déboguer une erreur API',
      prompt: 'Mon paiement reste en statut pending, que faire?'
    },
    {
      icon: Zap,
      title: 'Optimisation',
      description: 'Améliorer les performances',
      prompt: 'Comment optimiser mes intégrations PayFuse?'
    }
  ]

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim()
    if (!messageToSend) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: messageToSend,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        'Comment créer un paiement Orange Money en JavaScript?': `Voici comment créer un paiement Orange Money avec PayFuse:

\`\`\`javascript
// Installation du SDK
npm install @payfuse/sdk

// Configuration
import PayFuse from '@payfuse/sdk'

const payfuse = new PayFuse({
  apiKey: 'your_api_key',
  environment: 'sandbox'
})

// Créer un paiement Orange Money
const payment = await payfuse.payments.create({
  amount: 10000, // Montant en XOF
  currency: 'XOF',
  provider: 'orange_money',
  phone: '+221771234567',
  description: 'Achat produit #12345',
  webhook_url: 'https://yourapp.com/webhooks/payment'
})

console.log('URL de paiement:', payment.payment_url)
console.log('ID de transaction:', payment.id)
\`\`\`

Le client sera redirigé vers \`payment.payment_url\` pour finaliser le paiement. Vous recevrez une notification webhook une fois le paiement complété.`,

        'Comment configurer et vérifier les webhooks PayFuse?': `Configuration et vérification des webhooks PayFuse:

\`\`\`javascript
// 1. Configurer un webhook
const webhook = await payfuse.webhooks.create({
  url: 'https://yourapp.com/payfuse-webhook',
  events: ['payment.completed', 'payment.failed'],
  secret: 'your_webhook_secret'
})

// 2. Vérifier la signature du webhook
const crypto = require('crypto')

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  return signature === \`sha256=\${expectedSignature}\`
}

// 3. Traiter le webhook
app.post('/payfuse-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-payfuse-signature']
  const payload = req.body
  
  if (verifyWebhookSignature(payload, signature, 'your_webhook_secret')) {
    const event = JSON.parse(payload)
    
    switch(event.type) {
      case 'payment.completed':
        console.log('Paiement complété:', event.data)
        // Traiter le paiement réussi
        break
      case 'payment.failed':
        console.log('Paiement échoué:', event.data)
        // Traiter l'échec du paiement
        break
    }
    
    res.status(200).send('OK')
  } else {
    res.status(400).send('Invalid signature')
  }
})
\`\`\`

⚠️ **Important**: Toujours vérifier la signature pour sécuriser vos webhooks!`,

        'Mon paiement reste en statut pending, que faire?': `Si votre paiement reste en statut "pending", voici les étapes de diagnostic:

**1. Vérifier le statut via l'API:**
\`\`\`javascript
const payment = await payfuse.payments.retrieve('pay_abc123')
console.log('Statut actuel:', payment.status)
console.log('Dernière mise à jour:', payment.updated_at)
\`\`\`

**2. Causes possibles:**
- ⏱️ **Délai normal**: Les paiements Mobile Money peuvent prendre 1-5 minutes
- 📱 **Action utilisateur requise**: L'utilisateur doit confirmer sur son téléphone
- 💰 **Solde insuffisant**: Vérifier le solde du compte Mobile Money
- 🔒 **Limites de transaction**: Vérifier les limites quotidiennes/mensuelles

**3. Actions recommandées:**
\`\`\`javascript
// Vérifier après 5 minutes
setTimeout(async () => {
  const updatedPayment = await payfuse.payments.retrieve(payment.id)
  if (updatedPayment.status === 'pending') {
    // Contacter le support ou annuler
    console.log('Paiement toujours en attente après 5 minutes')
  }
}, 5 * 60 * 1000)
\`\`\`

**4. En cas de blocage prolongé:**
- Annuler le paiement après 10 minutes
- Proposer un autre moyen de paiement
- Vérifier les logs de votre webhook`,

        'Comment optimiser mes intégrations PayFuse?': `Voici les meilleures pratiques pour optimiser vos intégrations PayFuse:

**1. Gestion des erreurs robuste:**
\`\`\`javascript
try {
  const payment = await payfuse.payments.create(paymentData)
  return payment
} catch (error) {
  if (error.code === 'insufficient_funds') {
    // Gérer le cas de solde insuffisant
  } else if (error.code === 'invalid_phone') {
    // Gérer le numéro invalide
  }
  throw error
}
\`\`\`

**2. Mise en cache et retry:**
\`\`\`javascript
const retryPayment = async (paymentData, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await payfuse.payments.create(paymentData)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
\`\`\`

**3. Monitoring et alertes:**
- Surveiller le taux de réussite des paiements
- Configurer des alertes pour les échecs de webhook
- Logger toutes les transactions pour audit

**4. Performance:**
- Utiliser des connexions persistantes
- Implémenter un cache Redis pour les données fréquentes
- Optimiser les appels API avec la pagination

**5. Sécurité:**
- Toujours vérifier les signatures webhook
- Utiliser HTTPS pour tous les endpoints
- Stocker les clés API de manière sécurisée`
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: responses[messageToSend as keyof typeof responses] || 
          `Je comprends votre question sur "${messageToSend}". Voici une réponse personnalisée basée sur la documentation PayFuse et les meilleures pratiques. 

Pour des questions plus spécifiques, n'hésitez pas à consulter notre documentation complète ou à utiliser notre playground API pour tester vos intégrations.

Puis-je vous aider avec autre chose?`,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assistant IA PayFuse</h1>
        <p className="text-gray-600">Obtenez de l'aide instantanée pour vos intégrations et développements</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-4"
        >
          <h2 className="text-lg font-semibold mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSendMessage(action.prompt)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <action.icon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border flex flex-col h-[600px]"
          >
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.type === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <Brain className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-600">Assistant PayFuse</span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('```').map((part, index) => {
                        if (index % 2 === 1) {
                          // Code block
                          return (
                            <pre key={index} className="bg-gray-900 text-gray-100 p-3 rounded mt-2 mb-2 overflow-x-auto">
                              <code>{part}</code>
                            </pre>
                          )
                        } else {
                          // Regular text
                          return (
                            <div key={index} className="whitespace-pre-wrap">
                              {part}
                            </div>
                          )
                        }
                      })}
                    </div>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez votre question sur PayFuse..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant