import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://epflwghuawfpcbrydctg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZmx3Z2h1YXdmcGNicnlkY3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjI1MzcsImV4cCI6MjA2NjczODUzN30.bmGHqelw-7bE2bjee7BCAjPfsSbdLLTj03HkSX8k12k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types pour la base de données
export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  provider: string
  phone: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description?: string
  provider_payment_id?: string
  payment_url?: string
  webhook_url?: string
  created_at: string
  completed_at?: string
  metadata?: Record<string, any>
}

export interface Webhook {
  id: string
  user_id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  secret?: string
  last_delivery?: string
  delivery_count: number
  failure_count: number
  created_at: string
}

export interface ApiKey {
  id: string
  user_id: string
  name: string
  key_hash: string
  permissions: string[]
  last_used?: string
  status: 'active' | 'revoked'
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  company?: string
  phone?: string
  created_at: string
  updated_at: string
}

// Fonctions utilitaires
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('payments').select('count').limit(1)
    return !error
  } catch (error) {
    console.error('Erreur connexion Supabase:', error)
    return false
  }
}

export const initializeSupabase = async () => {
  const isConnected = await checkSupabaseConnection()
  if (!isConnected) {
    console.warn('Connexion Supabase indisponible - Mode démo activé')
    return false
  }
  console.log('✅ Supabase connecté avec succès')
  return true
}

// Services Supabase
export class SupabaseService {
  static async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getPayments(userId: string, limit: number = 50): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async getPayment(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async updatePaymentStatus(
    id: string, 
    status: Payment['status'], 
    completedAt?: string
  ): Promise<Payment> {
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

  static subscribeToPayments(userId: string, callback: (payload: any) => void) {
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
}