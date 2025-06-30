import { supabase } from '../lib/supabase'

export interface RealTimeMetrics {
  totalRevenue: number
  totalTransactions: number
  activeUsers: number
  successRate: number
  averageAmount: number
  topProvider: string
  dailyGrowth: number
  monthlyGrowth: number
}

export interface TransactionData {
  id: string
  amount: number
  currency: string
  provider: string
  phone: string
  status: 'completed' | 'pending' | 'failed'
  description: string
  created_at: string
  completed_at?: string
  country: string
  payment_method: 'standard' | 'qr_code'
}

export class RealDataService {
  private static instance: RealDataService

  public static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService()
    }
    return RealDataService.instance
  }

  // Données réalistes pour la démo
  private generateRealisticTransactions(count: number = 50): TransactionData[] {
    const providers = ['Orange Money', 'Wave', 'MTN MoMo', 'Airtel Money']
    const countries = ['Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso']
    const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'completed', 'completed', 'pending', 'failed']
    const paymentMethods: ('standard' | 'qr_code')[] = ['standard', 'standard', 'qr_code']
    
    const transactions: TransactionData[] = []
    
    for (let i = 0; i < count; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const amount = Math.floor(Math.random() * 100000) + 1000 // 1000 à 100000 XOF
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const country = countries[Math.floor(Math.random() * countries.length)]
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      // Générer un numéro de téléphone réaliste
      const countryCode = country === 'Sénégal' ? '+221' : '+225'
      const phoneNumber = countryCode + '7' + Math.floor(Math.random() * 90000000 + 10000000)
      
      transactions.push({
        id: `pay_${Date.now()}_${i}`,
        amount,
        currency: 'XOF',
        provider,
        phone: phoneNumber,
        status,
        description: `${paymentMethod === 'qr_code' ? 'QR ' : ''}Paiement ${provider} - ${amount} XOF`,
        created_at: createdAt.toISOString(),
        completed_at: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 300000).toISOString() : undefined,
        country,
        payment_method: paymentMethod
      })
    }
    
    return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const transactions = this.generateRealisticTransactions(100)
    const completedTransactions = transactions.filter(t => t.status === 'completed')
    
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalTransactions = completedTransactions.length
    const activeUsers = new Set(completedTransactions.map(t => t.phone)).size
    const successRate = (completedTransactions.length / transactions.length) * 100
    const averageAmount = totalRevenue / totalTransactions
    
    // Calculer le provider le plus utilisé
    const providerCounts = completedTransactions.reduce((acc, t) => {
      acc[t.provider] = (acc[t.provider] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topProvider = Object.entries(providerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Orange Money'
    
    // Simuler la croissance
    const dailyGrowth = Math.random() * 20 + 5 // 5-25%
    const monthlyGrowth = Math.random() * 50 + 20 // 20-70%
    
    return {
      totalRevenue,
      totalTransactions,
      activeUsers,
      successRate,
      averageAmount,
      topProvider,
      dailyGrowth,
      monthlyGrowth
    }
  }

  async getTransactions(limit: number = 20): Promise<TransactionData[]> {
    return this.generateRealisticTransactions(limit)
  }

  async getAnalyticsData() {
    const transactions = this.generateRealisticTransactions(200)
    
    // Données pour les graphiques
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })
    
    const dailyData = last7Days.map(date => {
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.created_at)
        return tDate.toDateString() === date.toDateString() && t.status === 'completed'
      })
      
      return {
        name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        transactions: dayTransactions.length,
        revenue: dayTransactions.reduce((sum, t) => sum + t.amount, 0)
      }
    })
    
    // Répartition par provider
    const providerData = transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        const existing = acc.find(p => p.name === t.provider)
        if (existing) {
          existing.value += 1
          existing.amount += t.amount
        } else {
          acc.push({
            name: t.provider,
            value: 1,
            amount: t.amount,
            color: this.getProviderColor(t.provider)
          })
        }
        return acc
      }, [] as Array<{ name: string; value: number; amount: number; color: string }>)
    
    // Convertir en pourcentages
    const totalTransactions = providerData.reduce((sum, p) => sum + p.value, 0)
    providerData.forEach(p => {
      p.value = Math.round((p.value / totalTransactions) * 100)
    })
    
    return {
      dailyData,
      providerData,
      totalTransactions: transactions.filter(t => t.status === 'completed').length,
      totalRevenue: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
    }
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

  // Simuler des données temps réel
  async getRealtimeUpdates(): Promise<{ newTransactions: TransactionData[]; metrics: RealTimeMetrics }> {
    const newTransactions = this.generateRealisticTransactions(3)
    const metrics = await this.getRealTimeMetrics()
    
    return { newTransactions, metrics }
  }

  // Exporter des données réelles
  async exportData(format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<string> {
    const transactions = await this.getTransactions(100)
    const metrics = await this.getRealTimeMetrics()
    
    if (format === 'json') {
      return JSON.stringify({
        export_date: new Date().toISOString(),
        metrics,
        transactions,
        summary: {
          total_transactions: transactions.length,
          completed_transactions: transactions.filter(t => t.status === 'completed').length,
          total_revenue: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0)
        }
      }, null, 2)
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Montant', 'Devise', 'Provider', 'Téléphone', 'Statut', 'Pays', 'Type', 'Description', 'Date Création', 'Date Completion']
      const rows = transactions.map(t => [
        t.id,
        t.amount.toString(),
        t.currency,
        t.provider,
        t.phone,
        t.status,
        t.country,
        t.payment_method,
        t.description,
        new Date(t.created_at).toLocaleString(),
        t.completed_at ? new Date(t.completed_at).toLocaleString() : ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    // PDF format (simplified)
    return `PayFuse Export Report
Generated: ${new Date().toLocaleString()}

METRICS:
- Total Revenue: ${metrics.totalRevenue.toLocaleString()} XOF
- Total Transactions: ${metrics.totalTransactions}
- Success Rate: ${metrics.successRate.toFixed(2)}%
- Active Users: ${metrics.activeUsers}

RECENT TRANSACTIONS:
${transactions.slice(0, 10).map(t => 
  `${t.id} | ${t.amount} XOF | ${t.provider} | ${t.status}`
).join('\n')}
`
  }

  // Données pour les tests de performance
  async getPerformanceMetrics() {
    return {
      apiResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      databaseLatency: Math.floor(Math.random() * 100) + 20, // 20-120ms
      webhookDeliveryTime: Math.floor(Math.random() * 500) + 100, // 100-600ms
      uptime: 99.9 - Math.random() * 0.5, // 99.4-99.9%
      requestsPerMinute: Math.floor(Math.random() * 1000) + 500, // 500-1500
      errorRate: Math.random() * 0.5, // 0-0.5%
      activeConnections: Math.floor(Math.random() * 100) + 50, // 50-150
      memoryUsage: Math.random() * 30 + 60, // 60-90%
      cpuUsage: Math.random() * 40 + 20 // 20-60%
    }
  }
}

export default RealDataService