import { supabase, Payment, Webhook, ApiKey, Profile } from '../lib/supabase'
import { SecurityUtils } from '../utils/security'

export class SupabaseService {
  private static instance: SupabaseService

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  // Gestion des profils
  async createProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        ...profileData,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Gestion des paiements
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getPayments(userId: string, limit: number = 50): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getPayment(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updatePaymentStatus(id: string, status: Payment['status'], completedAt?: string): Promise<Payment> {
    const updates: Partial<Payment> = { status }
    if (completedAt) updates.completed_at = completedAt

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Gestion des webhooks
  async createWebhook(webhookData: Omit<Webhook, 'id' | 'created_at' | 'delivery_count' | 'failure_count'>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .insert([{
        ...webhookData,
        delivery_count: 0,
        failure_count: 0
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getWebhooks(userId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteWebhook(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Gestion des clés API
  async createApiKey(apiKeyData: Omit<ApiKey, 'id' | 'created_at' | 'key_hash'> & { key: string }): Promise<ApiKey> {
    const keyHash = await SecurityUtils.hashApiKey(apiKeyData.key)
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{
        ...apiKeyData,
        key_hash: keyHash
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getApiKeys(userId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async updateApiKeyLastUsed(keyHash: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('key_hash', keyHash)

    if (error) throw error
  }

  async revokeApiKey(id: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update({ status: 'revoked' })
      .eq('id', id)

    if (error) throw error
  }

  // Analytics et métriques
  async getAnalytics(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())

    if (error) throw error

    const completedPayments = payments?.filter(p => p.status === 'completed') || []
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalTransactions = completedPayments.length
    const successRate = payments?.length ? (completedPayments.length / payments.length) * 100 : 0

    // Grouper par jour
    const dailyData = this.groupPaymentsByDay(completedPayments, days)
    
    // Grouper par provider
    const providerData = this.groupPaymentsByProvider(completedPayments)

    return {
      totalRevenue,
      totalTransactions,
      successRate,
      dailyData,
      providerData,
      averageAmount: totalTransactions ? totalRevenue / totalTransactions : 0
    }
  }

  private groupPaymentsByDay(payments: Payment[], days: number) {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayPayments = payments.filter(p => {
        const paymentDate = new Date(p.created_at)
        return paymentDate >= dayStart && paymentDate <= dayEnd
      })

      result.push({
        name: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        transactions: dayPayments.length,
        revenue: dayPayments.reduce((sum, p) => sum + p.amount, 0)
      })
    }
    return result
  }

  private groupPaymentsByProvider(payments: Payment[]) {
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

  // Temps réel avec Supabase Realtime
  subscribeToPayments(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }

  subscribeToWebhooks(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('webhooks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webhooks',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

export default SupabaseService