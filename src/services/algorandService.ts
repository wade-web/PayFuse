import algosdk from 'algosdk'

export interface AlgorandConfig {
  token: string
  server: string
  port: number
  network: 'testnet' | 'mainnet'
}

export interface AlgorandPayment {
  amount: number
  receiver: string
  note?: string
  sender?: string
}

export class AlgorandService {
  private static instance: AlgorandService
  private algodClient: algosdk.Algodv2
  private config: AlgorandConfig

  public static getInstance(): AlgorandService {
    if (!AlgorandService.instance) {
      AlgorandService.instance = new AlgorandService()
    }
    return AlgorandService.instance
  }

  constructor() {
    // Configuration par défaut pour TestNet
    this.config = {
      token: '',
      server: 'https://testnet-api.algonode.cloud',
      port: 443,
      network: 'testnet'
    }
    
    this.algodClient = new algosdk.Algodv2(
      this.config.token,
      this.config.server,
      this.config.port
    )
  }

  async createPayment(payment: AlgorandPayment): Promise<string> {
    try {
      // Obtenir les paramètres de transaction
      const params = await this.algodClient.getTransactionParams().do()
      
      // Créer la transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: payment.sender || 'SENDER_ADDRESS',
        to: payment.receiver,
        amount: payment.amount,
        note: payment.note ? new Uint8Array(Buffer.from(payment.note)) : undefined,
        suggestedParams: params
      })

      // Pour la démo, retourner l'ID de transaction simulé
      const txId = txn.txID()
      
      console.log('Transaction Algorand créée:', {
        txId,
        amount: payment.amount,
        receiver: payment.receiver,
        note: payment.note
      })

      return txId
    } catch (error) {
      console.error('Erreur création transaction Algorand:', error)
      throw error
    }
  }

  async getAccountInfo(address: string) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do()
      return {
        address,
        balance: accountInfo.amount,
        minBalance: accountInfo['min-balance'],
        assets: accountInfo.assets || []
      }
    } catch (error) {
      console.error('Erreur récupération compte Algorand:', error)
      return null
    }
  }

  async getTransactionStatus(txId: string) {
    try {
      const txInfo = await this.algodClient.pendingTransactionInformation(txId).do()
      return {
        txId,
        confirmed: txInfo['confirmed-round'] > 0,
        round: txInfo['confirmed-round'],
        poolError: txInfo['pool-error']
      }
    } catch (error) {
      console.error('Erreur statut transaction Algorand:', error)
      return null
    }
  }

  // Intégration avec PayFuse
  async createPayFuseAlgorandPayment(paymentData: {
    amount: number
    currency: string
    receiver: string
    description?: string
  }) {
    try {
      // Convertir le montant XOF en microAlgos (exemple de taux)
      const algoAmount = Math.floor(paymentData.amount * 1000) // 1 XOF = 1000 microAlgos (exemple)
      
      const txId = await this.createPayment({
        amount: algoAmount,
        receiver: paymentData.receiver,
        note: `PayFuse: ${paymentData.description || 'Payment'}`
      })

      return {
        txId,
        amount: algoAmount,
        currency: 'ALGO',
        originalAmount: paymentData.amount,
        originalCurrency: paymentData.currency,
        receiver: paymentData.receiver,
        status: 'pending'
      }
    } catch (error) {
      console.error('Erreur paiement PayFuse-Algorand:', error)
      throw error
    }
  }
}

export default AlgorandService