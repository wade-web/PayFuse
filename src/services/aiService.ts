export class AIService {
  private static instance: AIService
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async generateCodeExample(prompt: string): Promise<string> {
    try {
      // Si pas de clé API, utiliser des réponses prédéfinies
      if (!this.apiKey) {
        return this.getPrebuiltResponse(prompt)
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant expert en API PayFuse. Génère du code clair et fonctionnel avec des explications.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Erreur AI Service:', error)
      return this.getPrebuiltResponse(prompt)
    }
  }

  private getPrebuiltResponse(prompt: string): string {
    const responses: Record<string, string> = {
      'Comment créer un paiement Orange Money en JavaScript?': `Voici comment créer un paiement Orange Money avec PayFuse:

\`\`\`javascript
import { PaymentService } from '@payfuse/sdk'

const paymentService = PaymentService.getInstance()

const payment = await paymentService.createPayment({
  amount: 10000, // Montant en XOF
  currency: 'XOF',
  provider: 'orange_money',
  phone: '+221771234567',
  description: 'Achat produit #12345',
  webhook_url: 'https://yourapp.com/webhooks/payment'
})

console.log('URL de paiement:', payment.payment_url)
console.log('ID de transaction:', payment.id)
\`\`\`

Le client sera redirigé vers \`payment.payment_url\` pour finaliser le paiement.`,

      'Comment configurer et vérifier les webhooks PayFuse?': `Configuration et vérification des webhooks PayFuse:

\`\`\`javascript
import { WebhookService } from '@payfuse/sdk'

const webhookService = WebhookService.getInstance()

// 1. Créer un webhook
const webhook = await webhookService.createWebhook({
  url: 'https://yourapp.com/payfuse-webhook',
  events: ['payment.completed', 'payment.failed'],
  secret: 'your_webhook_secret'
})

// 2. Vérifier la signature
function verifyWebhook(payload, signature, secret) {
  return webhookService.verifyWebhookSignature(payload, signature, secret)
}

// 3. Traiter le webhook
app.post('/payfuse-webhook', (req, res) => {
  const signature = req.headers['x-payfuse-signature']
  const payload = JSON.stringify(req.body)
  
  if (verifyWebhook(payload, signature, 'your_webhook_secret')) {
    const event = req.body
    console.log('Événement reçu:', event)
    res.status(200).send('OK')
  } else {
    res.status(400).send('Invalid signature')
  }
})
\`\`\``,

      default: `Je peux vous aider avec les intégrations PayFuse. Voici un exemple général:

\`\`\`javascript
import { PayFuse } from '@payfuse/sdk'

const payfuse = new PayFuse({
  apiKey: 'your_api_key',
  environment: 'sandbox'
})

// Exemple d'utilisation
const result = await payfuse.payments.create({
  amount: 25000,
  currency: 'XOF',
  provider: 'wave',
  phone: '+221781234567'
})
\`\`\`

Que souhaitez-vous faire spécifiquement?`
    }

    return responses[prompt] || responses.default
  }
}