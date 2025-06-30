import { SupabaseService } from './supabaseService'
import { PaymentProviderFactory } from './paymentProviders'
import { SecurityUtils } from '../utils/security'
import { Payment, Webhook } from '../lib/supabase'

export interface PayFuseConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
  webhookSecret?: string
}

export interface CreatePaymentRequest {
  amount: number
  currency: string
  provider: string
  phone: string
  description?: string
  webhook_url?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  id: string
  status: string
  amount: number
  currency: string
  provider: string
  payment_url?: string
  created_at: string
}

export class PayFuseSDK {
  private config: PayFuseConfig
  private supabaseService: SupabaseService
  private userId: string

  constructor(config: PayFuseConfig) {
    this.config = config
    this.supabaseService = SupabaseService.getInstance()
    this.userId = this.extractUserIdFromApiKey(config.apiKey)
  }

  // Créer un paiement
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      // Validation des données
      this.validatePaymentRequest(request)

      // Créer le paiement dans Supabase
      const payment = await this.supabaseService.createPayment({
        user_id: this.userId,
        amount: request.amount,
        currency: request.currency,
        provider: request.provider,
        phone: request.phone,
        status: 'pending',
        description: request.description,
        webhook_url: request.webhook_url,
        metadata: request.metadata
      })

      // Initier le paiement avec le provider
      try {
        const provider = PaymentProviderFactory.getProvider(request.provider)
        const providerResponse = await provider.createPayment(payment)

        // Mettre à jour avec les données du provider
        const updatedPayment = await this.supabaseService.updatePaymentStatus(
          payment.id,
          'pending'
        )

        return {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          provider: payment.provider,
          payment_url: providerResponse.payment_url,
          created_at: payment.created_at
        }
      } catch (providerError) {
        // Marquer le paiement comme échoué
        await this.supabaseService.updatePaymentStatus(payment.id, 'failed')
        throw providerError
      }
    } catch (error) {
      console.error('Erreur création paiement:', error)
      throw error
    }
  }

  // Récupérer un paiement
  async getPayment(paymentId: string): Promise<PaymentResponse | null> {
    const payment = await this.supabaseService.getPayment(paymentId)
    if (!payment) return null

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      payment_url: payment.payment_url,
      created_at: payment.created_at
    }
  }

  // Lister les paiements
  async listPayments(limit: number = 20): Promise<PaymentResponse[]> {
    const payments = await this.supabaseService.getPayments(this.userId, limit)
    
    return payments.map(payment => ({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      payment_url: payment.payment_url,
      created_at: payment.created_at
    }))
  }

  // Créer un webhook
  async createWebhook(url: string, events: string[], secret?: string): Promise<Webhook> {
    return await this.supabaseService.createWebhook({
      user_id: this.userId,
      url,
      events,
      status: 'active',
      secret: secret || this.config.webhookSecret
    })
  }

  // Vérifier une signature webhook
  async verifyWebhook(payload: string, signature: string, secret?: string): Promise<boolean> {
    const webhookSecret = secret || this.config.webhookSecret
    if (!webhookSecret) {
      throw new Error('Secret webhook requis pour la vérification')
    }

    return await SecurityUtils.verifyWebhookSignature(payload, signature, webhookSecret)
  }

  // Traiter un webhook
  async processWebhook(payload: any, signature?: string): Promise<void> {
    if (signature) {
      const isValid = await this.verifyWebhook(JSON.stringify(payload), signature)
      if (!isValid) {
        throw new Error('Signature webhook invalide')
      }
    }

    // Traiter l'événement
    if (payload.event === 'payment.completed') {
      await this.supabaseService.updatePaymentStatus(
        payload.data.id,
        'completed',
        new Date().toISOString()
      )
    } else if (payload.event === 'payment.failed') {
      await this.supabaseService.updatePaymentStatus(payload.data.id, 'failed')
    }
  }

  // Obtenir les analytics
  async getAnalytics(days: number = 30) {
    return await this.supabaseService.getAnalytics(this.userId, days)
  }

  // Méthodes utilitaires
  private validatePaymentRequest(request: CreatePaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Montant invalide')
    }

    if (!request.currency || request.currency !== 'XOF') {
      throw new Error('Devise non supportée')
    }

    if (!SecurityUtils.validatePhoneNumber(request.phone)) {
      throw new Error('Numéro de téléphone invalide')
    }

    if (!PaymentProviderFactory.getSupportedProviders().includes(request.provider)) {
      throw new Error('Provider non supporté')
    }
  }

  private extractUserIdFromApiKey(apiKey: string): string {
    // En production, ceci devrait vérifier la clé API dans la base de données
    // Pour la démo, on génère un ID basé sur la clé
    return 'user_' + apiKey.slice(-8)
  }

  // Méthodes statiques pour l'initialisation
  static create(config: PayFuseConfig): PayFuseSDK {
    return new PayFuseSDK(config)
  }

  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const supabaseService = SupabaseService.getInstance()
      const keyHash = await SecurityUtils.hashApiKey(apiKey)
      
      // Vérifier si la clé existe et est active
      // En production, ceci devrait faire une vraie vérification
      return apiKey.startsWith('pk_') && apiKey.length > 20
    } catch (error) {
      return false
    }
  }
}

// Export pour utilisation comme module npm
export default PayFuseSDK
