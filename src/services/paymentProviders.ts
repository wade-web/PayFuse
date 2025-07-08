import axios from 'axios'
import { Payment } from '../lib/supabase'
import { SecurityUtils } from '../utils/security'

export interface PaymentProvider {
  name: string
  createPayment(payment: Payment): Promise<{ id: string; payment_url: string }>
  checkStatus(providerPaymentId: string): Promise<{ status: string; details?: any }>
  processWebhook(payload: any, signature?: string): Promise<{ event: string; data: any }>
}

export class OrangeMoneyProvider implements PaymentProvider {
  name = 'Orange Money'
<<<<<<< HEAD
  private clientId = import.meta.env.VITE_ORANGE_MONEY_CLIENT_ID
  private clientSecret = import.meta.env.VITE_ORANGE_MONEY_CLIENT_SECRET
  private baseUrl = import.meta.env.VITE_ORANGE_MONEY_BASE_URL

  async createPayment(payment: Payment): Promise<{ id: string; payment_url: string }> {
    try {
=======
  private clientId: string
  private clientSecret: string
  private baseUrl: string

  constructor() {
    this.clientId = process.env.VITE_ORANGE_MONEY_CLIENT_ID || ''
    this.clientSecret = process.env.VITE_ORANGE_MONEY_CLIENT_SECRET || ''
    this.baseUrl = process.env.VITE_ORANGE_MONEY_BASE_URL || 'https://api.orange.com/orange-money-webpay/dev/v1'
  }

  async createPayment(payment: Payment): Promise<{ id: string; payment_url: string }> {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Configuration Orange Money manquante')
      }

>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
      // 1. Obtenir le token d'accès
      const tokenResponse = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials'
      }, {
        auth: {
          username: this.clientId,
          password: this.clientSecret
        }
      })

      const accessToken = tokenResponse.data.access_token

      // 2. Créer le paiement
      const paymentResponse = await axios.post(
        `${this.baseUrl}/webpayment`,
        {
          merchant_key: this.clientId,
          currency: payment.currency,
          order_id: payment.id,
          amount: payment.amount,
          return_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/payment-cancel`,
          notif_url: payment.webhook_url,
          lang: 'fr',
          reference: payment.description
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        id: paymentResponse.data.pay_token,
        payment_url: paymentResponse.data.payment_url
      }
    } catch (error) {
      console.error('Erreur Orange Money:', error)
      throw new Error('Erreur lors de la création du paiement Orange Money')
    }
  }

  async checkStatus(providerPaymentId: string): Promise<{ status: string; details?: any }> {
    try {
      const response = await axios.get(`${this.baseUrl}/payment/${providerPaymentId}/status`)
      return {
        status: this.mapStatus(response.data.status),
        details: response.data
      }
    } catch (error) {
      console.error('Erreur vérification statut Orange Money:', error)
      return { status: 'unknown' }
    }
  }

  async processWebhook(payload: any, signature?: string): Promise<{ event: string; data: any }> {
    // Vérifier la signature si fournie
    if (signature && !await this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Signature webhook invalide')
    }

    return {
      event: payload.status === 'SUCCESS' ? 'payment.completed' : 'payment.failed',
      data: {
        id: payload.order_id,
        provider_payment_id: payload.pay_token,
        status: this.mapStatus(payload.status),
        amount: payload.amount,
        currency: payload.currency
      }
    }
  }

  private mapStatus(orangeStatus: string): string {
    switch (orangeStatus) {
      case 'SUCCESS': return 'completed'
      case 'PENDING': return 'pending'
      case 'FAILED': return 'failed'
      case 'CANCELLED': return 'cancelled'
      default: return 'pending'
    }
  }

  private async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
<<<<<<< HEAD
    const secret = import.meta.env.VITE_WEBHOOK_SECRET
=======
    const secret = process.env.VITE_WEBHOOK_SECRET || ''
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
    return await SecurityUtils.verifyWebhookSignature(JSON.stringify(payload), signature, secret)
  }
}

export class WaveProvider implements PaymentProvider {
  name = 'Wave'
<<<<<<< HEAD
  private apiKey = import.meta.env.VITE_WAVE_API_KEY
  private baseUrl = import.meta.env.VITE_WAVE_BASE_URL

  async createPayment(payment: Payment): Promise<{ id: string; payment_url: string }> {
    try {
=======
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.VITE_WAVE_API_KEY || ''
    this.baseUrl = process.env.VITE_WAVE_BASE_URL || 'https://api.wave.com/v1'
  }

  async createPayment(payment: Payment): Promise<{ id: string; payment_url: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('Configuration Wave manquante')
      }

>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
      const response = await axios.post(
        `${this.baseUrl}/checkout/sessions`,
        {
          amount: payment.amount,
          currency: payment.currency,
          error_url: `${window.location.origin}/payment-error`,
          success_url: `${window.location.origin}/payment-success`,
          webhook_url: payment.webhook_url,
          client_reference: payment.id
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        id: response.data.id,
        payment_url: response.data.wave_launch_url
      }
    } catch (error) {
      console.error('Erreur Wave:', error)
      throw new Error('Erreur lors de la création du paiement Wave')
    }
  }

  async checkStatus(providerPaymentId: string): Promise<{ status: string; details?: any }> {
    try {
      const response = await axios.get(`${this.baseUrl}/checkout/sessions/${providerPaymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      return {
        status: this.mapStatus(response.data.status),
        details: response.data
      }
    } catch (error) {
      console.error('Erreur vérification statut Wave:', error)
      return { status: 'unknown' }
    }
  }

  async processWebhook(payload: any, signature?: string): Promise<{ event: string; data: any }> {
    return {
      event: payload.type === 'checkout.session.completed' ? 'payment.completed' : 'payment.failed',
      data: {
        id: payload.data.client_reference,
        provider_payment_id: payload.data.id,
        status: this.mapStatus(payload.data.status),
        amount: payload.data.amount,
        currency: payload.data.currency
      }
    }
  }

  private mapStatus(waveStatus: string): string {
    switch (waveStatus) {
      case 'completed': return 'completed'
      case 'pending': return 'pending'
      case 'failed': return 'failed'
      case 'cancelled': return 'cancelled'
      default: return 'pending'
    }
  }
}

export class MTNMoMoProvider implements PaymentProvider {
  name = 'MTN MoMo'
<<<<<<< HEAD
  private apiKey = import.meta.env.VITE_MTN_MOMO_API_KEY
  private baseUrl = import.meta.env.VITE_MTN_MOMO_BASE_URL

  async createPayment(payment: Payment): Promise<{ id: string; payment_url: string }> {
    try {
=======
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.VITE_MTN_MOMO_API_KEY || ''
    this.baseUrl = process.env.VITE_MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com'
  }

  async createPayment(payment: Payment): Promise<{ id: string; payment_url: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('Configuration MTN MoMo manquante')
      }

>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
      const response = await axios.post(
        `${this.baseUrl}/collection/v1_0/requesttopay`,
        {
          amount: payment.amount.toString(),
          currency: payment.currency,
          externalId: payment.id,
          payer: {
            partyIdType: 'MSISDN',
            partyId: payment.phone.replace('+', '')
          },
          payerMessage: payment.description,
          payeeNote: `PayFuse payment ${payment.id}`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Reference-Id': SecurityUtils.generateTransactionId('mtn'),
<<<<<<< HEAD
            'X-Target-Environment': import.meta.env.VITE_ENVIRONMENT === 'production' ? 'live' : 'sandbox'
=======
            'X-Target-Environment': process.env.VITE_ENVIRONMENT === 'production' ? 'live' : 'sandbox'
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
          }
        }
      )

      return {
        id: response.headers['x-reference-id'],
        payment_url: `mtn://pay?ref=${response.headers['x-reference-id']}`
      }
    } catch (error) {
      console.error('Erreur MTN MoMo:', error)
      throw new Error('Erreur lors de la création du paiement MTN MoMo')
    }
  }

  async checkStatus(providerPaymentId: string): Promise<{ status: string; details?: any }> {
    try {
      const response = await axios.get(`${this.baseUrl}/collection/v1_0/requesttopay/${providerPaymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
<<<<<<< HEAD
          'X-Target-Environment': import.meta.env.VITE_ENVIRONMENT === 'production' ? 'live' : 'sandbox'
=======
          'X-Target-Environment': process.env.VITE_ENVIRONMENT === 'production' ? 'live' : 'sandbox'
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
        }
      })

      return {
        status: this.mapStatus(response.data.status),
        details: response.data
      }
    } catch (error) {
      console.error('Erreur vérification statut MTN MoMo:', error)
      return { status: 'unknown' }
    }
  }

  async processWebhook(payload: any): Promise<{ event: string; data: any }> {
    return {
      event: payload.status === 'SUCCESSFUL' ? 'payment.completed' : 'payment.failed',
      data: {
        id: payload.externalId,
        provider_payment_id: payload.financialTransactionId,
        status: this.mapStatus(payload.status),
        amount: parseInt(payload.amount),
        currency: payload.currency
      }
    }
  }

  private mapStatus(mtnStatus: string): string {
    switch (mtnStatus) {
      case 'SUCCESSFUL': return 'completed'
      case 'PENDING': return 'pending'
      case 'FAILED': return 'failed'
      case 'REJECTED': return 'failed'
      default: return 'pending'
    }
  }
}

export class PaymentProviderFactory {
<<<<<<< HEAD
  private static providers: Map<string, PaymentProvider> = new Map([
    ['orange_money', new OrangeMoneyProvider()],
    ['wave', new WaveProvider()],
    ['mtn_momo', new MTNMoMoProvider()]
  ])
=======
  private static providers: Map<string, PaymentProvider> = new Map()

  static {
    // Initialiser les providers
    this.providers.set('orange_money', new OrangeMoneyProvider())
    this.providers.set('wave', new WaveProvider())
    this.providers.set('mtn_momo', new MTNMoMoProvider())
  }
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a

  static getProvider(providerName: string): PaymentProvider {
    const provider = this.providers.get(providerName.toLowerCase())
    if (!provider) {
      throw new Error(`Provider ${providerName} non supporté`)
    }
    return provider
  }

  static getAllProviders(): PaymentProvider[] {
    return Array.from(this.providers.values())
  }

  static getSupportedProviders(): string[] {
    return Array.from(this.providers.keys())
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
