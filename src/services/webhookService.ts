import { supabase, Webhook } from '../lib/supabase'
import { SecurityUtils } from '../utils/security'

export class WebhookService {
  private static instance: WebhookService

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  async createWebhook(webhookData: Omit<Webhook, 'id' | 'created_at' | 'user_id' | 'delivery_count' | 'failure_count'>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .insert([{
        ...webhookData,
        user_id: (await supabase.auth.getUser()).data.user?.id,
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

  async verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    return await SecurityUtils.verifyWebhookSignature(payload, signature, secret)
  }

  async deliverWebhook(webhookId: string, event: any): Promise<boolean> {
    try {
      const webhook = await this.getWebhook(webhookId)
      if (!webhook || webhook.status !== 'active') {
        return false
      }

      const payload = JSON.stringify(event)
      const signature = webhook.secret 
        ? await SecurityUtils.generateWebhookSignature(payload, webhook.secret)
        : undefined

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'PayFuse-Webhook/1.0'
      }

      if (signature) {
        headers['X-PayFuse-Signature'] = signature
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payload
      })

      const success = response.ok
      
      // Mettre à jour les statistiques
      await supabase
        .from('webhooks')
        .update({
          last_delivery: new Date().toISOString(),
          delivery_count: webhook.delivery_count + 1,
          failure_count: success ? webhook.failure_count : webhook.failure_count + 1
        })
        .eq('id', webhookId)

      return success
    } catch (error) {
      console.error('Erreur livraison webhook:', error)
      return false
    }
  }

  private async getWebhook(id: string): Promise<Webhook | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }
}