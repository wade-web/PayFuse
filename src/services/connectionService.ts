import { supabase, testSupabaseConnection } from '../lib/supabase'
import RealDataService from './realDataService'
import toast from 'react-hot-toast'

export class ConnectionService {
  private static instance: ConnectionService
  private isSupabaseAvailable = false
  private realDataService = RealDataService.getInstance()
  private connectionChecked = false

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService()
    }
    return ConnectionService.instance
  }

  async initialize(): Promise<void> {
    if (this.connectionChecked) return

    console.log('🔄 Vérification de la connexion Supabase...')
    this.isSupabaseAvailable = await testSupabaseConnection()
    this.connectionChecked = true
    
    if (!this.isSupabaseAvailable) {
      console.warn('🔄 Mode démo activé - Supabase indisponible')
      toast.error('Connexion Supabase indisponible - Données simulées affichées', {
        duration: 5000,
        icon: '⚠️'
      })
    } else {
      console.log('✅ Mode production - Supabase connecté')
      toast.success('Connexion Supabase établie', {
        duration: 3000,
        icon: '✅'
      })
    }
  }

  async getPayments(userId: string, limit: number = 50) {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      } catch (error) {
        console.error('❌ Erreur Supabase, fallback vers données simulées:', error)
        this.isSupabaseAvailable = false
        toast.error('Erreur Supabase - Basculement vers mode démo')
      }
    }
    
    // Fallback vers données simulées
    return this.realDataService.getTransactions(limit)
  }

  async createPayment(paymentData: any) {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert([paymentData])
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        console.error('❌ Erreur création paiement Supabase:', error)
        this.isSupabaseAvailable = false
        toast.error('Erreur Supabase - Paiement créé en mode démo')
      }
    }
    
    // Fallback: créer un paiement simulé
    return {
      id: `pay_demo_${Date.now()}`,
      ...paymentData,
      created_at: new Date().toISOString()
    }
  }

  async getAnalytics(userId: string) {
    if (this.isSupabaseAvailable) {
      try {
        // Récupérer les analytics depuis Supabase
        const { data: payments, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (error) throw error
        
        // Traiter les données pour les analytics
        return this.processAnalyticsData(payments || [])
      } catch (error) {
        console.error('❌ Erreur analytics Supabase:', error)
        this.isSupabaseAvailable = false
      }
    }
    
    // Fallback vers analytics simulées
    return this.realDataService.getAnalyticsData()
  }

  private processAnalyticsData(payments: any[]) {
    const completedPayments = payments.filter(p => p.status === 'completed')
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    
    // Grouper par jour pour les graphiques
    const dailyData = this.groupPaymentsByDay(completedPayments)
    const providerData = this.groupPaymentsByProvider(completedPayments)
    
    return {
      dailyData,
      providerData,
      totalTransactions: completedPayments.length,
      totalRevenue
    }
  }

  private groupPaymentsByDay(payments: any[]) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })
    
    return last7Days.map(date => {
      const dayPayments = payments.filter(p => {
        const paymentDate = new Date(p.created_at)
        return paymentDate.toDateString() === date.toDateString()
      })
      
      return {
        name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        transactions: dayPayments.length,
        revenue: dayPayments.reduce((sum, p) => sum + p.amount, 0)
      }
    })
  }

  private groupPaymentsByProvider(payments: any[]) {
    const providerCounts = payments.reduce((acc, p) => {
      acc[p.provider] = (acc[p.provider] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = Object.values(providerCounts).reduce((sum, count) => sum + count, 0)
    
    return Object.entries(providerCounts).map(([provider, count]) => ({
      name: provider,
      value: Math.round((count / total) * 100),
      amount: payments.filter(p => p.provider === provider).reduce((sum, p) => sum + p.amount, 0),
      color: this.getProviderColor(provider)
    }))
  }

  private getProviderColor(provider: string): string {
    const colors: Record<string, string> = {
      'Orange Money': '#FF6B35',
      'Wave': '#4ECDC4',
      'MTN MoMo': '#FFD93D',
      'Airtel Money': '#E74C3C'
    }
    return colors[provider] || '#6B7280'
  }

  isConnected(): boolean {
    return this.isSupabaseAvailable
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'checking' {
    if (!this.connectionChecked) return 'checking'
    return this.isSupabaseAvailable ? 'connected' : 'disconnected'
  }

  async retryConnection(): Promise<boolean> {
    console.log('🔄 Tentative de reconnexion à Supabase...')
    this.isSupabaseAvailable = await testSupabaseConnection()
    
    if (this.isSupabaseAvailable) {
      toast.success('Reconnexion Supabase réussie!')
    } else {
      toast.error('Reconnexion Supabase échouée')
    }
    
    return this.isSupabaseAvailable
  }
}

export default ConnectionService
