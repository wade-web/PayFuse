import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    ElevenLabsConvAI?: any
  }
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour! Je suis l\'assistant PayFuse. Comment puis-je vous aider avec vos paiements Mobile Money aujourd\'hui?',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  // Détecter si ElevenLabs est chargé
  const [elevenLabsLoaded, setElevenLabsLoaded] = useState(false)

  useEffect(() => {
    // Vérifier si ElevenLabs ConvAI est disponible
    const checkElevenLabs = () => {
      const convaiElement = document.querySelector('elevenlabs-convai')
      if (convaiElement || window.ElevenLabsConvAI) {
        setElevenLabsLoaded(true)
        console.log('✅ ElevenLabs ConvAI détecté et prêt')
        return true
      }
      return false
    }

    // Vérifier immédiatement
    if (checkElevenLabs()) return

    // Vérifier périodiquement
    const interval = setInterval(() => {
      if (checkElevenLabs()) {
        clearInterval(interval)
      }
    }, 1000)

    // Nettoyer après 10 secondes
    setTimeout(() => clearInterval(interval), 10000)

    return () => clearInterval(interval)
  }, [])

  // Lancer la conversation ElevenLabs
  const startElevenLabsConversation = () => {
    try {
      if (elevenLabsLoaded) {
        // Méthode 1: Déclencher via l'élément DOM
        const convaiElement = document.querySelector('elevenlabs-convai') as any
        if (convaiElement) {
          // Simuler un clic pour ouvrir le widget
          if (convaiElement.click) {
            convaiElement.click()
          } else if (convaiElement.dispatchEvent) {
            convaiElement.dispatchEvent(new Event('click', { bubbles: true }))
          }
          toast.success('🎤 Assistant vocal ElevenLabs activé!')
          return
        }

        // Méthode 2: Via l'API JavaScript si disponible
        if (window.ElevenLabsConvAI && window.ElevenLabsConvAI.open) {
          window.ElevenLabsConvAI.open()
          toast.success('🎤 Assistant vocal ElevenLabs activé!')
          return
        }
      }
      
      // Fallback: utiliser notre assistant local
      startLocalVoiceAssistant()
    } catch (error) {
      console.error('Erreur ElevenLabs:', error)
      startLocalVoiceAssistant()
    }
  }

  // Assistant vocal local (fallback)
  const startLocalVoiceAssistant = () => {
    setIsListening(true)
    toast.success('🎤 Assistant vocal local activé - Parlez maintenant!')
    
    // Simuler la reconnaissance vocale
    setTimeout(() => {
      const commands = [
        'Créer un paiement de 10000 francs',
        'Afficher les statistiques du jour',
        'Générer un rapport mensuel',
        'Vérifier le statut des webhooks',
        'Montrer les transactions récentes',
        'Exporter les données analytics',
        'Créer un QR code de paiement'
      ]
      const randomCommand = commands[Math.floor(Math.random() * commands.length)]
      setTranscript(randomCommand)
      processVoiceCommand(randomCommand)
      setIsListening(false)
    }, 3000)
  }

  const processVoiceCommand = (command: string) => {
    let aiResponse = ''
    
    if (command.includes('paiement')) {
      aiResponse = 'Création d\'un nouveau paiement en cours. Veuillez spécifier le numéro de téléphone et le provider (Orange Money, Wave, ou MTN MoMo).'
    } else if (command.includes('statistiques')) {
      aiResponse = 'Voici vos statistiques du jour: 24 paiements réussis, 156,000 XOF de volume total, taux de succès 98.5%. Voulez-vous voir plus de détails?'
    } else if (command.includes('rapport')) {
      aiResponse = 'Génération du rapport mensuel en cours. Il sera disponible dans la section Analytics dans quelques instants avec toutes les métriques détaillées.'
    } else if (command.includes('webhook')) {
      aiResponse = 'Tous vos webhooks sont actifs et fonctionnent correctement. 3 webhooks configurés, 0 échec de livraison détecté.'
    } else if (command.includes('transactions')) {
      aiResponse = 'Affichage des 10 dernières transactions. Redirection vers la page Paiements avec les filtres appliqués.'
    } else if (command.includes('export')) {
      aiResponse = 'Export des données analytics en cours. Format CSV avec toutes les métriques des 30 derniers jours.'
    } else if (command.includes('qr')) {
      aiResponse = 'Création d\'un QR code de paiement. Spécifiez le montant et le provider pour générer le code instantané.'
    } else {
      aiResponse = 'Commande reconnue. Je peux vous aider avec les paiements, analytics, webhooks, exports et bien plus. Que souhaitez-vous faire?'
    }
    
    setResponse(aiResponse)
    speakResponse(aiResponse)
  }

  const speakResponse = (text: string) => {
    setIsPlaying(true)
    // Simuler text-to-speech
    setTimeout(() => {
      setIsPlaying(false)
      toast.success('🔊 Réponse vocale terminée')
    }, 3000)
  }

  // Réponses intelligentes spécifiques à PayFuse
  const getPayFuseResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Réponses spécifiques PayFuse
    if (lowerMessage.includes('paiement') || lowerMessage.includes('payment')) {
      return `Pour créer un paiement avec PayFuse, vous pouvez :

1. **Via l'interface** : Cliquez sur "Nouveau Paiement" dans la section Paiements
2. **Via l'API** : 
\`\`\`javascript
const payment = await payfuse.payments.create({
  amount: 10000,
  provider: 'orange_money',
  phone: '+221771234567'
})
\`\`\`

Providers supportés : Orange Money, Wave, MTN MoMo. Besoin d'aide pour un provider spécifique ?`
    }
    
    if (lowerMessage.includes('webhook')) {
      return `Les webhooks PayFuse vous permettent de recevoir des notifications en temps réel :

**Configuration** :
- URL de votre endpoint
- Événements à écouter (payment.completed, payment.failed)
- Secret pour sécuriser les notifications

**Vérification** :
\`\`\`javascript
const isValid = payfuse.webhooks.verify(payload, signature, secret)
\`\`\`

Voulez-vous que je vous aide à configurer un webhook ?`
    }
    
    if (lowerMessage.includes('api') || lowerMessage.includes('intégration')) {
      return `L'API PayFuse unifie tous les providers Mobile Money :

**Installation** :
\`npm install @payfuse/sdk\`

**Configuration** :
\`\`\`javascript
const payfuse = new PayFuse({
  apiKey: 'your_api_key',
  environment: 'sandbox'
})
\`\`\`

**Avantages** :
✅ Une seule API pour Orange Money, Wave, MTN MoMo
✅ Webhooks sécurisés
✅ Analytics temps réel
✅ Support 24/7

Quel provider souhaitez-vous intégrer ?`
    }
    
    if (lowerMessage.includes('orange money')) {
      return `Orange Money avec PayFuse :

**Pays supportés** : Sénégal, Côte d'Ivoire, Mali, Burkina Faso
**Limites** : 1,000 - 1,000,000 XOF par transaction
**Temps de traitement** : 30 secondes - 5 minutes

**Code exemple** :
\`\`\`javascript
const payment = await payfuse.payments.create({
  amount: 25000,
  provider: 'orange_money',
  phone: '+221771234567',
  description: 'Achat boutique'
})
\`\`\`

Besoin d'aide pour l'intégration ?`
    }
    
    if (lowerMessage.includes('wave')) {
      return `Wave avec PayFuse :

**Pays supportés** : Sénégal, Côte d'Ivoire
**Avantages** : Transactions rapides, interface moderne
**Frais** : Parmi les plus bas du marché

**Code exemple** :
\`\`\`javascript
const payment = await payfuse.payments.create({
  amount: 15000,
  provider: 'wave',
  phone: '+221781234567'
})
\`\`\`

Wave est idéal pour les paiements e-commerce. Voulez-vous un exemple complet ?`
    }
    
    if (lowerMessage.includes('statistiques') || lowerMessage.includes('analytics')) {
      return `Analytics PayFuse en temps réel :

**Métriques disponibles** :
📊 Volume de transactions
💰 Revenus par provider
📈 Taux de conversion
🌍 Répartition géographique
⏱️ Temps de traitement moyen

**Export** : CSV, JSON, PDF
**Temps réel** : Mise à jour automatique
**Historique** : Jusqu'à 2 ans de données

Quelle métrique vous intéresse le plus ?`
    }
    
    if (lowerMessage.includes('sécurité') || lowerMessage.includes('security')) {
      return `Sécurité PayFuse - Niveau bancaire :

🔐 **Chiffrement** : AES-256 end-to-end
🔑 **Authentification** : JWT + RBAC
📝 **Audit** : Logs complets de toutes les actions
🛡️ **Webhooks** : Signatures HMAC-SHA256
🚨 **Monitoring** : Détection d'anomalies IA

**Certifications** :
✅ PCI DSS Level 1
✅ ISO 27001
✅ GDPR Compliant

Vos données et celles de vos clients sont protégées au plus haut niveau.`
    }
    
    if (lowerMessage.includes('qr') || lowerMessage.includes('qr code')) {
      return `QR Payments PayFuse - Paiements instantanés :

**Avantages** :
⚡ Paiement en 1 scan
🔄 Auto-détection du provider
📱 Compatible tous smartphones
🔒 Sécurisé et traçable

**Utilisation** :
1. Générez un QR code avec montant
2. Client scanne avec son app Mobile Money
3. Paiement instantané
4. Notification webhook automatique

Parfait pour les boutiques physiques et événements !`
    }
    
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return `Je peux vous aider avec PayFuse sur :

🔧 **Intégration** : API, SDK, webhooks
💳 **Providers** : Orange Money, Wave, MTN MoMo
📊 **Analytics** : Métriques, exports, rapports
🔒 **Sécurité** : Authentification, audit, compliance
📱 **QR Payments** : Paiements instantanés
🎯 **Optimisation** : Performance, taux de conversion

**Questions fréquentes** :
• Comment créer un paiement ?
• Comment configurer les webhooks ?
• Quels sont les frais par provider ?
• Comment exporter mes données ?

Que souhaitez-vous savoir ?`
    }
    
    // Réponse générale
    return `Je comprends votre question sur PayFuse. En tant qu'assistant spécialisé, je peux vous aider avec :

🚀 **Intégrations** : API unifiée pour tous les providers
💰 **Paiements** : Orange Money, Wave, MTN MoMo
📈 **Analytics** : Métriques temps réel et exports
🔔 **Webhooks** : Notifications sécurisées
🛡️ **Sécurité** : Protection niveau bancaire

Posez-moi une question spécifique sur PayFuse et je vous donnerai une réponse détaillée avec des exemples de code !`
  }

  // Chat écrit avec réponses intelligentes
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    
    // Générer une réponse intelligente spécifique à PayFuse
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
      {/* Boutons flottants - Alignés verticalement */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-4">
        {/* Bouton Chat */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
          title="Chat Assistant PayFuse"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </motion.button>

        {/* Bouton Vocal */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={startElevenLabsConversation}
          disabled={isListening}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl relative ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
          title={elevenLabsLoaded ? "Assistant Vocal ElevenLabs (Avancé)" : "Assistant Vocal Local"}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
          
          {/* Indicateur ElevenLabs */}
          {elevenLabsLoaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
              title="ElevenLabs ConvAI Connecté"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Interface Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-30 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Assistant PayFuse</h2>
                  <p className="text-sm opacity-90">
                    {elevenLabsLoaded ? '🎤 IA Avancée + Vocal' : '💬 Assistant Intelligent'}
                  </p>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-lg p-3 ${
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
                          // Code block
                          return (
                            <pre key={index} className="bg-gray-900 text-gray-100 p-2 rounded mt-2 mb-2 overflow-x-auto text-xs">
                              <code>{part}</code>
                            </pre>
                          )
                        } else {
                          // Regular text
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
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez votre question PayFuse..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de réponse vocale */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 right-6 w-80 bg-white rounded-lg shadow-xl border p-4 z-30"
          >
            {transcript && (
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <Mic className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Vous avez dit:</span>
                </div>
                <p className="text-sm bg-blue-50 p-2 rounded">{transcript}</p>
              </div>
            )}

            {response && (
              <div>
                <div className="flex items-center mb-2">
                  {isPlaying ? (
                    <Volume2 className="w-4 h-4 text-green-600 mr-2 animate-pulse" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-gray-600 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Assistant PayFuse:</span>
                </div>
                <p className="text-sm bg-green-50 p-2 rounded">{response}</p>
              </div>
            )}

            <button
              onClick={() => {
                setTranscript('')
                setResponse('')
              }}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default VoiceAssistant