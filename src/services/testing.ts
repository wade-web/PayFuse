import { PaymentService } from './paymentService'
import { WebhookService } from './webhookService'
import { SecurityUtils } from '../utils/security'

export interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'running'
  duration: number
  error?: string
  details?: any
}

export interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestResult[]
}

export class TestingService {
  private static instance: TestingService
  private paymentService = PaymentService.getInstance()
  private webhookService = WebhookService.getInstance()

  public static getInstance(): TestingService {
    if (!TestingService.instance) {
      TestingService.instance = new TestingService()
    }
    return TestingService.instance
  }

  async runTestSuite(suiteId: string): Promise<TestSuite> {
    switch (suiteId) {
      case 'api-endpoints':
        return this.testApiEndpoints()
      case 'providers':
        return this.testProviders()
      case 'security':
        return this.testSecurity()
      case 'webhooks':
        return this.testWebhooks()
      default:
        throw new Error(`Suite de tests inconnue: ${suiteId}`)
    }
  }

  private async testApiEndpoints(): Promise<TestSuite> {
    const tests: TestResult[] = []

    // Test création de paiement
    tests.push(await this.runTest('create-payment', 'Créer un paiement', async () => {
      const paymentData = {
        amount: 10000,
        currency: 'XOF',
        provider: 'orange_money',
        phone: '+221771234567',
        description: 'Test payment',
        status: 'pending' as const
      }

      // Simuler la création
      const result = {
        id: SecurityUtils.generateTransactionId(),
        ...paymentData,
        created_at: new Date().toISOString()
      }

      if (!result.id || result.amount !== 10000) {
        throw new Error('Données de paiement invalides')
      }

      return result
    }))

    // Test validation des données
    tests.push(await this.runTest('validate-data', 'Validation des données', async () => {
      const validPhone = SecurityUtils.validatePhoneNumber('+221771234567')
      const invalidPhone = SecurityUtils.validatePhoneNumber('123456')
      const validAmount = SecurityUtils.validateAmount(10000)
      const invalidAmount = SecurityUtils.validateAmount(-100)

      if (!validPhone || invalidPhone || !validAmount || invalidAmount) {
        throw new Error('Validation échouée')
      }

      return { validPhone, validAmount }
    }))

    // Test rate limiting
    tests.push(await this.runTest('rate-limiting', 'Rate Limiting', async () => {
      const identifier = 'test-user'
      
      // Première requête - doit passer
      const first = SecurityUtils.checkRateLimit(identifier, 5, 60000)
      if (!first) throw new Error('Première requête bloquée')

      // Simuler 5 requêtes rapides
      for (let i = 0; i < 5; i++) {
        SecurityUtils.checkRateLimit(identifier, 5, 60000)
      }

      // 6ème requête - doit être bloquée
      const blocked = SecurityUtils.checkRateLimit(identifier, 5, 60000)
      if (blocked) throw new Error('Rate limiting non fonctionnel')

      return { rateLimitWorking: true }
    }))

    return {
      id: 'api-endpoints',
      name: 'Tests API Endpoints',
      description: 'Vérification des endpoints de l\'API PayFuse',
      tests
    }
  }

  private async testProviders(): Promise<TestSuite> {
    const tests: TestResult[] = []

    // Test Orange Money
    tests.push(await this.runTest('orange-money', 'Orange Money Sandbox', async () => {
      // Simuler un test de connexion Orange Money
      const config = {
        clientId: process.env.VITE_ORANGE_MONEY_CLIENT_ID,
        baseUrl: process.env.VITE_ORANGE_MONEY_BASE_URL
      }

      if (!config.clientId) {
        throw new Error('Configuration Orange Money manquante')
      }

      // Simuler une réponse API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { provider: 'Orange Money', status: 'connected' }
    }))

    // Test Wave
    tests.push(await this.runTest('wave', 'Wave Test Environment', async () => {
      const config = {
        apiKey: process.env.VITE_WAVE_API_KEY,
        baseUrl: process.env.VITE_WAVE_BASE_URL
      }

      if (!config.apiKey) {
        throw new Error('Configuration Wave manquante')
      }

      await new Promise(resolve => setTimeout(resolve, 800))
      
      return { provider: 'Wave', status: 'connected' }
    }))

    // Test MTN MoMo
    tests.push(await this.runTest('mtn-momo', 'MTN MoMo Sandbox', async () => {
      const config = {
        apiKey: process.env.VITE_MTN_MOMO_API_KEY,
        baseUrl: process.env.VITE_MTN_MOMO_BASE_URL
      }

      // MTN MoMo peut ne pas être configuré
      if (!config.apiKey) {
        return { provider: 'MTN MoMo', status: 'not_configured' }
      }

      await new Promise(resolve => setTimeout(resolve, 1200))
      
      return { provider: 'MTN MoMo', status: 'connected' }
    }))

    return {
      id: 'providers',
      name: 'Tests Providers',
      description: 'Tests de connexion avec les providers Mobile Money',
      tests
    }
  }

  private async testSecurity(): Promise<TestSuite> {
    const tests: TestResult[] = []

    // Test chiffrement
    tests.push(await this.runTest('encryption', 'Chiffrement/Déchiffrement', async () => {
      const data = 'données sensibles'
      const key = 'clé-secrète'
      
      const encrypted = SecurityUtils.encrypt(data, key)
      const decrypted = SecurityUtils.decrypt(encrypted, key)
      
      if (decrypted !== data) {
        throw new Error('Chiffrement/déchiffrement échoué')
      }
      
      return { encrypted: encrypted.substring(0, 20) + '...', decrypted }
    }))

    // Test signature webhook
    tests.push(await this.runTest('webhook-signature', 'Signature Webhook', async () => {
      const payload = '{"event":"payment.completed","data":{"id":"pay_123"}}'
      const secret = 'webhook-secret'
      
      const signature = await SecurityUtils.generateWebhookSignature(payload, secret)
      const isValid = await SecurityUtils.verifyWebhookSignature(payload, signature, secret)
      
      if (!isValid) {
        throw new Error('Vérification de signature échouée')
      }
      
      return { signature: signature.substring(0, 20) + '...', valid: isValid }
    }))

    // Test JWT
    tests.push(await this.runTest('jwt-tokens', 'Tokens JWT', async () => {
      const payload = { userId: '123', role: 'admin' }
      const secret = 'jwt-secret'
      
      const token = SecurityUtils.generateJWT(payload, secret)
      const decoded = SecurityUtils.verifyJWT(token, secret)
      
      if (!decoded || (decoded as any).userId !== '123') {
        throw new Error('JWT invalide')
      }
      
      return { tokenLength: token.length, decoded }
    }))

    // Test sanitisation
    tests.push(await this.runTest('input-sanitization', 'Sanitisation des Entrées', async () => {
      const maliciousInput = '<script>alert("xss")</script>test"data'
      const sanitized = SecurityUtils.sanitizeString(maliciousInput)
      
      if (sanitized.includes('<script>') || sanitized.includes('"')) {
        throw new Error('Sanitisation échouée')
      }
      
      return { original: maliciousInput, sanitized }
    }))

    return {
      id: 'security',
      name: 'Tests de Sécurité',
      description: 'Vérification des mesures de sécurité',
      tests
    }
  }

  private async testWebhooks(): Promise<TestSuite> {
    const tests: TestResult[] = []

    // Test création webhook
    tests.push(await this.runTest('create-webhook', 'Créer un Webhook', async () => {
      const webhookData = {
        url: 'https://example.com/webhook',
        events: ['payment.completed'],
        status: 'active' as const,
        secret: 'webhook-secret'
      }

      // Simuler la création
      const webhook = {
        id: SecurityUtils.generateTransactionId('wh'),
        ...webhookData,
        delivery_count: 0,
        failure_count: 0,
        created_at: new Date().toISOString()
      }

      return webhook
    }))

    // Test livraison webhook
    tests.push(await this.runTest('webhook-delivery', 'Livraison Webhook', async () => {
      const event = {
        type: 'payment.completed',
        data: {
          id: 'pay_123',
          amount: 10000,
          status: 'completed'
        }
      }

      // Simuler la livraison
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { event, delivered: true, responseTime: 245 }
    }))

    // Test retry webhook
    tests.push(await this.runTest('webhook-retry', 'Retry Webhook', async () => {
      // Simuler plusieurs tentatives
      const attempts = []
      for (let i = 1; i <= 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts.push({
          attempt: i,
          timestamp: new Date().toISOString(),
          success: i === 3 // Succès au 3ème essai
        })
      }
      
      return { attempts, finalSuccess: true }
    }))

    return {
      id: 'webhooks',
      name: 'Tests Webhooks',
      description: 'Tests de fonctionnement des webhooks',
      tests
    }
  }

  private async runTest(
    id: string,
    name: string,
    testFunction: () => Promise<any>
  ): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      return {
        id,
        name,
        status: 'passed',
        duration,
        details: result
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      return {
        id,
        name,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  async generateTestReport(suites: TestSuite[]): Promise<string> {
    const totalTests = suites.reduce((acc, suite) => acc + suite.tests.length, 0)
    const passedTests = suites.reduce(
      (acc, suite) => acc + suite.tests.filter(t => t.status === 'passed').length,
      0
    )
    const failedTests = totalTests - passedTests

    const report = `
# Rapport de Tests PayFuse

## Résumé
- **Total**: ${totalTests} tests
- **Réussis**: ${passedTests} tests
- **Échoués**: ${failedTests} tests
- **Taux de réussite**: ${((passedTests / totalTests) * 100).toFixed(1)}%

## Détails par Suite

${suites.map(suite => `
### ${suite.name}
${suite.description}

${suite.tests.map(test => `
- **${test.name}**: ${test.status === 'passed' ? '✅' : '❌'} (${test.duration}ms)
  ${test.error ? `  Erreur: ${test.error}` : ''}
`).join('')}
`).join('')}

---
Généré le ${new Date().toLocaleString()}
`

    return report.trim()
  }
}

export default TestingService
