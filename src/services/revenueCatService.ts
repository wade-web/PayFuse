export interface RevenueCatConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
}

export interface Subscription {
  id: string
  productId: string
  userId: string
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  expirationDate?: string
  revenue: number
  currency: string
}

export interface Purchase {
  id: string
  productId: string
  userId: string
  amount: number
  currency: string
  timestamp: string
  platform: 'ios' | 'android' | 'web'
}

export class RevenueCatService {
  private static instance: RevenueCatService
  private config: RevenueCatConfig

  public static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService()
    }
    return RevenueCatService.instance
  }

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_REVENUECAT_API_KEY || 'demo_key',
      environment: 'sandbox'
    }
  }

  async initializeRevenueCat(userId: string): Promise<boolean> {
    try {
      console.log('Initialisation RevenueCat pour utilisateur:', userId)
      
      // En production, initialiser le SDK RevenueCat
      // await Purchases.configure({ apiKey: this.config.apiKey })
      // await Purchases.logIn(userId)
      
      return true
    } catch (error) {
      console.error('Erreur initialisation RevenueCat:', error)
      return false
    }
  }

  async getSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      // Simuler des abonnements pour la démo
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          productId: 'payfuse_pro_monthly',
          userId,
          status: 'active',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          revenue: 2500,
          currency: 'XOF'
        },
        {
          id: 'sub_2',
          productId: 'payfuse_enterprise_yearly',
          userId,
          status: 'active',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          expirationDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
          revenue: 25000,
          currency: 'XOF'
        }
      ]

      return mockSubscriptions
    } catch (error) {
      console.error('Erreur récupération abonnements:', error)
      return []
    }
  }

  async getPurchases(userId: string): Promise<Purchase[]> {
    try {
      // Simuler des achats pour la démo
      const mockPurchases: Purchase[] = [
        {
          id: 'pur_1',
          productId: 'payfuse_pro_monthly',
          userId,
          amount: 2500,
          currency: 'XOF',
          timestamp: new Date().toISOString(),
          platform: 'web'
        },
        {
          id: 'pur_2',
          productId: 'payfuse_api_credits',
          userId,
          amount: 5000,
          currency: 'XOF',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          platform: 'web'
        }
      ]

      return mockPurchases
    } catch (error) {
      console.error('Erreur récupération achats:', error)
      return []
    }
  }

  async purchaseProduct(productId: string, userId: string): Promise<Purchase> {
    try {
      // Simuler un achat
      const purchase: Purchase = {
        id: `pur_${Date.now()}`,
        productId,
        userId,
        amount: this.getProductPrice(productId),
        currency: 'XOF',
        timestamp: new Date().toISOString(),
        platform: 'web'
      }

      console.log('Achat effectué:', purchase)
      return purchase
    } catch (error) {
      console.error('Erreur achat produit:', error)
      throw error
    }
  }

  async getRevenue(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    total: number
    currency: string
    subscriptions: number
    oneTime: number
  }> {
    try {
      const subscriptions = await this.getSubscriptions(userId)
      const purchases = await this.getPurchases(userId)

      const subscriptionRevenue = subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((sum, sub) => sum + sub.revenue, 0)

      const oneTimeRevenue = purchases
        .reduce((sum, purchase) => sum + purchase.amount, 0)

      return {
        total: subscriptionRevenue + oneTimeRevenue,
        currency: 'XOF',
        subscriptions: subscriptionRevenue,
        oneTime: oneTimeRevenue
      }
    } catch (error) {
      console.error('Erreur calcul revenus:', error)
      return { total: 0, currency: 'XOF', subscriptions: 0, oneTime: 0 }
    }
  }

  private getProductPrice(productId: string): number {
    const prices: Record<string, number> = {
      'payfuse_pro_monthly': 2500,
      'payfuse_enterprise_yearly': 25000,
      'payfuse_api_credits': 5000,
      'payfuse_premium_features': 7500
    }
    return prices[productId] || 1000
  }

  // Intégration avec PayFuse
  async createPayFuseSubscription(subscriptionData: {
    userId: string
    plan: 'basic' | 'pro' | 'enterprise'
    paymentMethod: 'orange_money' | 'wave' | 'mtn_momo'
  }) {
    try {
      const productId = `payfuse_${subscriptionData.plan}_monthly`
      const purchase = await this.purchaseProduct(productId, subscriptionData.userId)

      // Créer l'abonnement
      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        productId,
        userId: subscriptionData.userId,
        status: 'active',
        startDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revenue: purchase.amount,
        currency: purchase.currency
      }

      return { purchase, subscription }
    } catch (error) {
      console.error('Erreur création abonnement PayFuse:', error)
      throw error
    }
  }
}

export default RevenueCatService