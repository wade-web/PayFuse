import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Info, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const AssistantInterface = () => {
  const [activeView, setActiveView] = useState<'chat' | 'info' | null>(null)
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour! Je suis l\'assistant PayFuse. Comment puis-je vous aider avec vos paiements Mobile Money aujourd\'hui?',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  // Fermer la vue active
  const closeView = () => {
    setActiveView(null)
  }

  // Réponses intelligentes PayFuse
  const getPayFuseResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('paiement') || lowerMessage.includes('payment')) {
      return `Pour créer un paiement avec PayFuse :

**Via l'interface** : Cliquez sur "Nouveau Paiement" dans la section Paiements

**Via l'API** :
\`\`\`javascript
const payment = await payfuse.payments.create({
  amount: 10000,
  provider: 'orange_money',
  phone: '+221771234567'
})
\`\`\`

Providers supportés : Orange Money, Wave, MTN MoMo. Besoin d'aide ?`
    }
    
    if (lowerMessage.includes('webhook')) {
      return `Configuration des webhooks PayFuse :

**Étapes** :
1. URL de votre endpoint
2. Événements à écouter (payment.completed, payment.failed)
3. Secret pour sécuriser

**Vérification** :
\`\`\`javascript
const isValid = payfuse.webhooks.verify(payload, signature, secret)
\`\`\`

Voulez-vous que je vous aide à configurer un webhook ?`
    }

    if (lowerMessage.includes('supabase')) {
      return `Intégration Supabase avec PayFuse :

**Configuration** :
\`\`\`javascript
import { supabase } from './lib/supabase'

// Créer un paiement
const { data, error } = await supabase
  .from('payments')
  .insert([{
    amount: 10000,
    currency: 'XOF',
    provider: 'orange_money',
    phone: '+221771234567'
  }])
\`\`\`

Base de données temps réel configurée et fonctionnelle !`
    }

    if (lowerMessage.includes('algorand')) {
      return `Intégration Algorand avec PayFuse :

**Blockchain Payments** :
\`\`\`javascript
// Paiement Algorand
const algodClient = new algosdk.Algodv2(token, server, port)
const payment = await createAlgorandPayment({
  amount: 1000000, // microAlgos
  receiver: 'ALGORAND_ADDRESS',
  note: 'PayFuse payment'
})
\`\`\`

Paiements cross-border sécurisés via blockchain !`
    }

    if (lowerMessage.includes('revenuecat')) {
      return `Intégration RevenueCat avec PayFuse :

**Abonnements** :
\`\`\`javascript
import Purchases from 'react-native-purchases'

// Configurer RevenueCat
await Purchases.configure({
  apiKey: 'your_revenuecat_key'
})

// Acheter un abonnement
const purchaserInfo = await Purchases.purchasePackage(package)
\`\`\`

Gestion des abonnements et revenus récurrents !`
    }
    
    return `Je peux vous aider avec PayFuse sur :

🔧 **Intégration** : API, SDK, webhooks, Supabase
💳 **Providers** : Orange Money, Wave, MTN MoMo
📊 **Analytics** : Métriques, exports, rapports
🔒 **Sécurité** : Authentification, compliance
⛓️ **Blockchain** : Algorand, paiements cross-border
💰 **Abonnements** : RevenueCat, revenus récurrents

Que souhaitez-vous savoir ?`
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: getPayFuseResponse(inputMessage),
        timestamp: new Date().toISOString()
      }
      
      setChatMessages(prev => [...prev, assistantMessage])
    }, 1000)

    setInputMessage('')
  }

  return (
    <>
      {/* Boutons flottants alignés verticalement */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        {/* Assistant Saisie */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveView(activeView === 'chat' ? null : 'chat')}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            activeView === 'chat' 
              ? 'bg-purple-600 text-white' 
              : 'bg-white text-purple-600 hover:bg-purple-50'
          }`}
          title="Assistant Saisie"
        >
          <MessageCircle className="w-7 h-7" />
        </motion.button>

        {/* Badge Info */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveView(activeView === 'info' ? null : 'info')}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            activeView === 'info' 
              ? 'bg-green-600 text-white' 
              : 'bg-white text-green-600 hover:bg-green-50'
          }`}
          title="Badge Info"
        >
          <Info className="w-7 h-7" />
        </motion.button>
      </div>

      {/* Conteneurs d'affichage sous l'interface */}
      <AnimatePresence>
        {activeView && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-30"
            style={{ height: '400px' }}
          >
            {/* Header commun */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold">
                {activeView === 'chat' && 'Assistant Saisie PayFuse'}
                {activeView === 'info' && 'Informations PayFuse'}
              </h3>
              <button
                onClick={closeView}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu selon la vue active */}
            <div className="flex-1 overflow-hidden">
              {activeView === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.type === 'assistant' && (
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white text-xs font-bold">PF</span>
                              </div>
                              <span className="text-sm font-medium text-blue-600">PayFuse AI</span>
                            </div>
                          )}
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('```').map((part, index) => {
                              if (index % 2 === 1) {
                                return (
                                  <pre key={index} className="bg-gray-900 text-gray-100 p-2 rounded mt-2 mb-2 overflow-x-auto text-xs">
                                    <code>{part}</code>
                                  </pre>
                                )
                              } else {
                                return (
                                  <div key={index} className="whitespace-pre-wrap text-sm">
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
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Posez votre question PayFuse..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'info' && (
                <div className="h-full overflow-y-auto p-6 bg-white">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <img 
                        src="/black_circle_360x360.png" 
                        alt="Powered by Bolt.new" 
                        className="w-16 h-16 mx-auto mb-4"
                      />
                      <h4 className="text-xl font-semibold mb-2">PayFuse - Powered by Bolt.new</h4>
                      <p className="text-gray-600">
                        Plateforme intelligente de paiements Mobile Money pour l'Afrique de l'Ouest
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-2">🚀 Fonctionnalités</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• API unifiée multi-provider</li>
                          <li>• Assistant IA intégré</li>
                          <li>• Base de données Supabase</li>
                          <li>• Analytics temps réel</li>
                          <li>• Sécurité niveau bancaire</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 mb-2">💳 Providers</h5>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Orange Money (SN, CI, ML, BF)</li>
                          <li>• Wave (SN, CI)</li>
                          <li>• MTN MoMo (CI, GH, UG)</li>
                          <li>• Airtel Money (NE, TD, ML)</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-900 mb-2">🛠️ Technologies</h5>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• React 18 + TypeScript</li>
                          <li>• Supabase Backend</li>
                          <li>• Algorand Blockchain</li>
                          <li>• RevenueCat Subscriptions</li>
                          <li>• Tailwind CSS</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-900 mb-2">🏆 Hackathon 2025</h5>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• Innovation: Assistant IA + Blockchain</li>
                          <li>• Impact: Simplification paiements</li>
                          <li>• Technique: Architecture scalable</li>
                          <li>• UX: Interface premium</li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <a
                        href="https://bolt.new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <span className="mr-2">Built with</span>
                        <img 
                          src="/white_circle_360x360.png" 
                          alt="Bolt.new" 
                          className="w-5 h-5"
                        />
                        <span className="ml-2">Bolt.new</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AssistantInterface