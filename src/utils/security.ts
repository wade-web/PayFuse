export class SecurityUtils {
  /**
   * Génère un hash sécurisé pour les clés API
   */
  static async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Génère une clé API aléatoire
   */
  static generateApiKey(prefix: string = 'pk_test'): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const randomString = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    return `${prefix}_${randomString.substring(0, 32)}`
  }

  /**
   * Vérifie la signature d'un webhook
   */
  static async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    const expectedSignature = await this.generateWebhookSignature(payload, secret)
    return signature === expectedSignature
  }

  /**
   * Génère une signature pour un webhook
   */
  static async generateWebhookSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return `sha256=${hashHex}`
  }

  /**
   * Chiffre des données sensibles (simple XOR pour la démo)
   */
  static encrypt(data: string, key: string): string {
    let result = ''
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return btoa(result)
  }

  /**
   * Déchiffre des données
   */
  static decrypt(encryptedData: string, key: string): string {
    const data = atob(encryptedData)
    let result = ''
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  }

  /**
   * Valide un numéro de téléphone Mobile Money
   */
  static validatePhoneNumber(phone: string): boolean {
    // Format: +221XXXXXXXXX (Sénégal) ou +225XXXXXXXXX (Côte d'Ivoire)
    const phoneRegex = /^\+22[15]\d{8}$/
    return phoneRegex.test(phone)
  }

  /**
   * Valide un montant de paiement
   */
  static validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000000 && Number.isInteger(amount)
  }

  /**
   * Sanitise une chaîne pour éviter les injections
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Supprime les balises HTML
      .replace(/['"]/g, '') // Supprime les guillemets
      .trim()
  }

  /**
   * Génère un token JWT simple (pour démo)
   */
  static generateJWT(payload: object, secret: string): string {
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    
    // Simple hash pour la démo (en production, utiliser une vraie librairie JWT)
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`).substring(0, 32)
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  /**
   * Vérifie un token JWT
   */
  static verifyJWT(token: string, secret: string): object | null {
    try {
      const [header, payload, signature] = token.split('.')
      
      // Vérification simple pour la démo
      const expectedSignature = btoa(`${header}.${payload}.${secret}`).substring(0, 32)
      
      if (signature !== expectedSignature) {
        return null
      }
      
      return JSON.parse(atob(payload))
    } catch (error) {
      return null
    }
  }

  /**
   * Rate limiting simple en mémoire
   */
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): boolean {
    const now = Date.now()
    const record = this.rateLimitStore.get(identifier)

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }

  /**
   * Génère un ID unique pour les transactions
   */
  static generateTransactionId(prefix: string = 'pay'): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `${prefix}_${timestamp}${random}`
  }

  /**
   * Masque les données sensibles pour les logs
   */
  static maskSensitiveData(data: any): any {
    const masked = { ...data }
    
    // Masquer les numéros de téléphone
    if (masked.phone) {
      masked.phone = masked.phone.replace(/(\+\d{3})(\d{4})(\d{4})/, '$1****$3')
    }
    
    // Masquer les clés API
    if (masked.apiKey) {
      masked.apiKey = masked.apiKey.replace(/(.{8}).*(.{4})/, '$1****$2')
    }
    
    // Masquer les secrets
    if (masked.secret) {
      masked.secret = '****'
    }
    
    return masked
  }
}

export default SecurityUtils