import { supabase, Payment } from '../lib/supabase'
import axios from 'axios'

export class PaymentService {
  private static instance: PaymentService
<<<<<<< HEAD
  private orangeMoneyConfig = {
    clientId: import.meta.env.VITE_ORANGE_MONEY_CLIENT_ID,
    clientSecret: import.meta.env.VITE_ORANGE_MONEY_CLIENT_SECRET,
    baseUrl: import.meta.env.VITE_ORANGE_MONEY_BASE_URL || 'https://api.orange.com/orange-money-webpay/dev/v1'
  }

  private waveConfig = {
    apiKey: import.meta.env.VITE_WAVE_API_KEY,
    baseUrl: import.meta.env.VITE_WAVE_BASE_URL || 'https://api.wave.com/v1'
=======
  private orangeMoneyConfig: {
    clientId: string
    clientSecret: string
    baseUrl: string
  }
  private waveConfig: {
    apiKey: string
    baseUrl: string
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

<<<<<<< HEAD
=======
  constructor() {
    this.orangeMoneyConfig = {
      clientId: process.env.VITE_ORANGE_MONEY_CLIENT_ID || '',
      clientSecret: process.env.VITE_ORANGE_MONEY_CLIENT_SECRET || '',
      baseUrl: process.env.VITE_ORANGE_MONEY_BASE_URL || 'https://api.orange.com/orange-money-webpay/dev/v1'
    }

    this.waveConfig = {
      apiKey: process.env.VITE_WAVE_API_KEY || '',
      baseUrl: process.env.VITE_WAVE_BASE_URL || 'https://api.wave.com/v1'
    }
  }

>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'user_id'>): Promise<Payment> {
    try {
      // 1. Créer le paiement dans Supabase
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) throw error

      // 2. Initier le paiement avec le provider
      let providerResponse
      switch (paymentData.provider.toLowerCase()) {
        case 'orange_money':
          providerResponse = await this.createOrangeMoneyPayment(payment)
          break
        case 'wave':
          providerResponse = await this.createWavePayment(payment)
          break
        default:
          throw new Error(`Provider ${paymentData.provider} non supporté`)
      }

      // 3. Mettre à jour avec les données du provider
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          provider_payment_id: providerResponse.id,
          payment_url: providerResponse.payment_url
        })
        .eq('id', payment.id)
        .select()
        .single()

      if (updateError) throw updateError

      return updatedPayment
    } catch (error) {
      console.error('Erreur création paiement:', error)
      throw error
    }
  }

  private async createOrangeMoneyPayment(payment: Payment) {
    try {
<<<<<<< HEAD
=======
      if (!this.orangeMoneyConfig.clientId || !this.orangeMoneyConfig.clientSecret) {
        throw new Error('Configuration Orange Money manquante')
      }

>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
      // Obtenir le token d'accès
      const tokenResponse = await axios.post(`${this.orangeMoneyConfig.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials'
      }, {
        auth: {
          username: this.orangeMoneyConfig.clientId,
          password: this.orangeMoneyConfig.clientSecret
        }
      })

      const accessToken = tokenResponse.data.access_token

      // Créer le paiement
      const paymentResponse = await axios.post(
        `${this.orangeMoneyConfig.baseUrl}/webpayment`,
        {
          merchant_key: this.orangeMoneyConfig.clientId,
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
      throw error
    }
  }

  private async createWavePayment(payment: Payment) {
    try {
<<<<<<< HEAD
=======
      if (!this.waveConfig.apiKey) {
        throw new Error('Configuration Wave manquante')
      }

>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
      const response = await axios.post(
        `${this.waveConfig.baseUrl}/checkout/sessions`,
        {
          amount: payment.amount,
          currency: payment.currency,
          error_url: `${window.location.origin}/payment-error`,
          success_url: `${window.location.origin}/payment-success`,
          webhook_url: payment.webhook_url
        },
        {
          headers: {
            'Authorization': `Bearer ${this.waveConfig.apiKey}`,
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
      throw error
    }
  }

  async getPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getPayment(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 85a67acb3397d11bde087ffc4087800d4f9a658a
