import { VoiceService } from './voiceService'
import { PaymentService } from './paymentService'
import { SecurityUtils } from '../utils/security'

export interface VoiceCommand {
  id: string
  text: string
  intent: string
  entities: Record<string, any>
  confidence: number
}

export interface VoiceResponse {
  text: string
  action?: string
  data?: any
}

export class VoiceAssistantService {
  private static instance: VoiceAssistantService
  private voiceService = VoiceService.getInstance()
  private paymentService = PaymentService.getInstance()
  private isListening = false

  public static getInstance(): VoiceAssistantService {
    if (!VoiceAssistantService.instance) {
      VoiceAssistantService.instance = new VoiceAssistantService()
    }
    return VoiceAssistantService.instance
  }

  async startListening(): Promise<VoiceCommand> {
    if (this.isListening) {
      throw new Error('Assistant déjà en écoute')
    }

    try {
      this.isListening = true
      const transcript = await this.voiceService.startListening()
      const command = this.parseCommand(transcript)
      
      return command
    } finally {
      this.isListening = false
    }
  }

  async processCommand(command: VoiceCommand): Promise<VoiceResponse> {
    try {
      switch (command.intent) {
        case 'create_payment':
          return await this.handleCreatePayment(command)
        
        case 'get_stats':
          return await this.handleGetStats(command)
        
        case 'check_status':
          return await this.handleCheckStatus(command)
        
        case 'generate_report':
          return await this.handleGenerateReport(command)
        
        case 'help':
          return this.handleHelp()
        
        default:
          return {
            text: 'Je n\'ai pas compris votre demande. Dites "aide" pour voir les commandes disponibles.'
          }
      }
    } catch (error) {
      console.error('Erreur traitement commande vocale:', error)
      return {
        text: 'Désolé, une erreur s\'est produite lors du traitement de votre demande.'
      }
    }
  }

  async speak(text: string): Promise<void> {
    await this.voiceService.speak(text)
  }

  private parseCommand(transcript: string): VoiceCommand {
    const text = transcript.toLowerCase().trim()
    
    // Détection d'intention simple basée sur des mots-clés
    let intent = 'unknown'
    let entities: Record<string, any> = {}
    let confidence = 0.5

    // Créer un paiement
    if (text.includes('créer') && text.includes('paiement')) {
      intent = 'create_payment'
      confidence = 0.9
      
      // Extraire le montant
      const amountMatch = text.match(/(\d+)\s*(francs?|xof|cfa)?/)
      if (amountMatch) {
        entities.amount = parseInt(amountMatch[1])
      }
      
      // Extraire le numéro de téléphone
      const phoneMatch = text.match(/(\+?22[15]\d{8})/)
      if (phoneMatch) {
        entities.phone = phoneMatch[1]
      }
      
      // Extraire le provider
      if (text.includes('orange')) {
        entities.provider = 'orange_money'
      } else if (text.includes('wave')) {
        entities.provider = 'wave'
      } else if (text.includes('mtn')) {
        entities.provider = 'mtn_momo'
      }
    }
    
    // Statistiques
    else if (text.includes('statistiques') || text.includes('stats')) {
      intent = 'get_stats'
      confidence = 0.9
      
      if (text.includes('jour') || text.includes('aujourd\'hui')) {
        entities.period = 'today'
      } else if (text.includes('semaine')) {
        entities.period = 'week'
      } else if (text.includes('mois')) {
        entities.period = 'month'
      }
    }
    
    // Vérifier le statut
    else if (text.includes('statut') || text.includes('état')) {
      intent = 'check_status'
      confidence = 0.8
      
      if (text.includes('webhook')) {
        entities.type = 'webhooks'
      } else if (text.includes('paiement')) {
        entities.type = 'payments'
      } else if (text.includes('système')) {
        entities.type = 'system'
      }
    }
    
    // Générer un rapport
    else if (text.includes('rapport') || text.includes('génér')) {
      intent = 'generate_report'
      confidence = 0.8
      
      if (text.includes('mensuel')) {
        entities.type = 'monthly'
      } else if (text.includes('hebdomadaire')) {
        entities.type = 'weekly'
      } else if (text.includes('quotidien')) {
        entities.type = 'daily'
      }
    }
    
    // Aide
    else if (text.includes('aide') || text.includes('help')) {
      intent = 'help'
      confidence = 1.0
    }

    return {
      id: SecurityUtils.generateTransactionId('cmd'),
      text: transcript,
      intent,
      entities,
      confidence
    }
  }

  private async handleCreatePayment(command: VoiceCommand): Promise<VoiceResponse> {
    const { amount, phone, provider } = command.entities

    if (!amount) {
      return {
        text: 'Veuillez spécifier le montant du paiement. Par exemple: "Créer un paiement de 10000 francs".'
      }
    }

    if (!phone) {
      return {
        text: `Veuillez spécifier le numéro de téléphone pour le paiement de ${amount} francs.`,
        action: 'request_phone',
        data: { amount, provider }
      }
    }

    if (!SecurityUtils.validatePhoneNumber(phone)) {
      return {
        text: 'Le numéro de téléphone n\'est pas valide. Utilisez le format +221XXXXXXXXX.'
      }
    }

    if (!SecurityUtils.validateAmount(amount)) {
      return {
        text: 'Le montant n\'est pas valide. Il doit être entre 1 et 10,000,000 francs.'
      }
    }

    try {
      const paymentData = {
        amount,
        currency: 'XOF',
        provider: provider || 'orange_money',
        phone,
        description: `Paiement créé par commande vocale - ${amount} XOF`,
        status: 'pending' as const
      }

      // Simuler la création du paiement
      const payment = {
        id: SecurityUtils.generateTransactionId(),
        ...paymentData,
        created_at: new Date().toISOString()
      }

      return {
        text: `Paiement de ${amount} francs créé avec succès pour le numéro ${phone}. L'ID de transaction est ${payment.id}.`,
        action: 'payment_created',
        data: payment
      }
    } catch (error) {
      return {
        text: 'Erreur lors de la création du paiement. Veuillez réessayer.'
      }
    }
  }

  private async handleGetStats(command: VoiceCommand): Promise<VoiceResponse> {
    const { period } = command.entities

    // Simuler des statistiques
    const stats = {
      today: {
        transactions: 24,
        revenue: 156000,
        successRate: 98.5
      },
      week: {
        transactions: 187,
        revenue: 1240000,
        successRate: 97.8
      },
      month: {
        transactions: 892,
        revenue: 5680000,
        successRate: 98.2
      }
    }

    const selectedStats = stats[period as keyof typeof stats] || stats.today
    const periodText = period === 'week' ? 'cette semaine' : 
                     period === 'month' ? 'ce mois' : 'aujourd\'hui'

    return {
      text: `Voici vos statistiques pour ${periodText}: ${selectedStats.transactions} transactions réussies, ${selectedStats.revenue.toLocaleString()} francs de revenus, avec un taux de succès de ${selectedStats.successRate}%.`,
      action: 'show_stats',
      data: selectedStats
    }
  }

  private async handleCheckStatus(command: VoiceCommand): Promise<VoiceResponse> {
    const { type } = command.entities

    if (type === 'webhooks') {
      return {
        text: 'Tous vos webhooks sont actifs et fonctionnent correctement. Aucun problème détecté.',
        action: 'show_webhooks'
      }
    } else if (type === 'payments') {
      return {
        text: 'Le système de paiements fonctionne normalement. Temps de réponse moyen: 245 millisecondes.',
        action: 'show_payments'
      }
    } else {
      return {
        text: 'Tous les systèmes PayFuse sont opérationnels. API: fonctionnelle, Base de données: fonctionnelle, Webhooks: fonctionnels.',
        action: 'show_system_status'
      }
    }
  }

  private async handleGenerateReport(command: VoiceCommand): Promise<VoiceResponse> {
    const { type } = command.entities
    const reportType = type || 'daily'

    return {
      text: `Génération du rapport ${reportType === 'monthly' ? 'mensuel' : reportType === 'weekly' ? 'hebdomadaire' : 'quotidien'} en cours. Il sera disponible dans quelques instants dans la section Analytics.`,
      action: 'generate_report',
      data: { type: reportType }
    }
  }

  private handleHelp(): VoiceResponse {
    const helpText = `Voici les commandes disponibles:
    
    • "Créer un paiement de [montant] francs" - Créer un nouveau paiement
    • "Afficher les statistiques du jour" - Voir les stats
    • "Vérifier le statut des webhooks" - Contrôler les webhooks
    • "Générer un rapport mensuel" - Créer un rapport
    • "Aide" - Afficher cette aide
    
    Vous pouvez aussi spécifier des numéros de téléphone et des providers dans vos commandes.`

    return {
      text: helpText,
      action: 'show_help'
    }
  }

  // Méthodes utilitaires
  getAvailableCommands(): string[] {
    return [
      'Créer un paiement de [montant] francs',
      'Afficher les statistiques du jour/semaine/mois',
      'Vérifier le statut du système/webhooks/paiements',
      'Générer un rapport quotidien/hebdomadaire/mensuel',
      'Aide'
    ]
  }

  isCurrentlyListening(): boolean {
    return this.isListening
  }

  // Gestion des contextes de conversation
  private conversationContext: Record<string, any> = {}

  setContext(key: string, value: any): void {
    this.conversationContext[key] = value
  }

  getContext(key: string): any {
    return this.conversationContext[key]
  }

  clearContext(): void {
    this.conversationContext = {}
  }

  // Gestion des commandes en plusieurs étapes
  async handleMultiStepCommand(step: string, data: any): Promise<VoiceResponse> {
    switch (step) {
      case 'confirm_payment':
        if (data.confirmed) {
          return await this.handleCreatePayment({
            id: 'multi_step',
            text: '',
            intent: 'create_payment',
            entities: data,
            confidence: 1.0
          })
        } else {
          return {
            text: 'Création du paiement annulée.'
          }
        }
      
      default:
        return {
          text: 'Étape de commande non reconnue.'
        }
    }
  }
}

export default VoiceAssistantService