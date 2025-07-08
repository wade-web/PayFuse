import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Eye, RefreshCw, QrCode, Smartphone, CreditCard, X } from 'lucide-react'
import { supabase, SupabaseService, Payment } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import AlgorandService from '../services/algorandService'
import RevenueCatService from '../services/revenueCatService'
import toast from 'react-hot-toast'

interface PaymentWithDetails extends Payment {
  payment_method: 'standard' | 'qr_code' | 'algorand' | 'subscription'
  country?: string
}

const Payments = () => {
  const { user } = useAuthStore()
  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null)
  const [newPayment, setNewPayment] = useState({
    amount: '',
    provider: 'orange_money',
    phone: '',
    description: '',
    payment_method: 'standard' as 'standard' | 'qr_code' | 'algorand' | 'subscription'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const algorandService = AlgorandService.getInstance()
  const revenueCatService = RevenueCatService.getInstance()

  useEffect(() => {
    loadPayments()
    
    // Abonnement temps réel Supabase
    if (user?.id) {
      const subscription = SupabaseService.subscribeToPayments(user.id, (payload) => {
        console.log('Mise à jour temps réel:', payload)
        loadPayments() // Recharger les paiements
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  const loadPayments = async () => {
    try {
      setLoading(true)
      
      if (user?.id) {
        // Essayer de charger depuis Supabase
        try {
          const supabasePayments = await SupabaseService.getPayments(user.id)
          const transformedPayments = supabasePayments.map(payment => ({
            ...payment,
            payment_method: payment.metadata?.payment_method || 'standard',
            country: payment.metadata?.country || 'Sénégal'
          }))
          setPayments(transformedPayments)
        } catch (error) {
          console.error('Erreur Supabase:', error)
          // Fallback avec données simulées
          setPayments(generateMockPayments())
          toast.error('Connexion Supabase indisponible - Données simulées affichées')
        }
      } else {
        // Données simulées si pas d'utilisateur
        setPayments(generateMockPayments())
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
      setPayments(generateMockPayments())
      toast.error('Erreur lors du chargement des paiements')
    } finally {
      setLoading(false)
    }
  }

  const generateMockPayments = (): PaymentWithDetails[] => {
    const providers = ['Orange Money', 'Wave', 'MTN MoMo', 'Algorand']
    const countries = ['Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso']
    const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'completed', 'completed', 'pending', 'failed']
    const paymentMethods: ('standard' | 'qr_code' | 'algorand' | 'subscription')[] = ['standard', 'standard', 'qr_code', 'algorand', 'subscription']
    
    return Array.from({ length: 20 }, (_, i) => {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const amount = Math.floor(Math.random() * 100000) + 1000
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const country = countries[Math.floor(Math.random() * countries.length)]
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      const phoneNumber = `+221${Math.floor(Math.random() * 90000000 + 10000000)}`
      
      return {
        id: `pay_${Date.now()}_${i}`,
        user_id: user?.id || 'demo_user',
        amount,
        currency: 'XOF',
        provider,
        phone: phoneNumber,
        status,
        description: `${paymentMethod === 'qr_code' ? 'QR ' : paymentMethod === 'algorand' ? 'Algorand ' : paymentMethod === 'subscription' ? 'Subscription ' : ''}Paiement ${provider} - ${amount} XOF`,
        created_at: createdAt.toISOString(),
        completed_at: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 300000).toISOString() : undefined,
        payment_method: paymentMethod,
        country,
        metadata: { payment_method: paymentMethod, country }
      }
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPayments()
    setRefreshing(false)
    toast.success('Paiements actualisés!')
  }

  const handleCreatePayment = async () => {
    if (!newPayment.amount || (!newPayment.phone && newPayment.payment_method !== 'algorand')) {
      toast.error('Montant et téléphone requis (sauf pour Algorand)')
      return
    }

    try {
      let paymentData: Omit<Payment, 'id' | 'created_at'> = {
        user_id: user?.id || 'demo_user',
        amount: parseInt(newPayment.amount),
        currency: 'XOF',
        provider: newPayment.provider,
        phone: newPayment.phone || 'N/A',
        status: 'pending',
        description: newPayment.description || `Paiement ${newPayment.provider}`,
        metadata: { 
          payment_method: newPayment.payment_method,
          country: 'Sénégal'
        }
      }

      // Traitement spécial selon le type de paiement
      if (newPayment.payment_method === 'algorand') {
        try {
          const algoPayment = await algorandService.createPayFuseAlgorandPayment({
            amount: parseInt(newPayment.amount),
            currency: 'XOF',
            receiver: 'ALGORAND_RECEIVER_ADDRESS',
            description: newPayment.description
          })
          
          paymentData.provider = 'Algorand'
          paymentData.provider_payment_id = algoPayment.txId
          paymentData.description = `Algorand: ${newPayment.description}`
          paymentData.phone = 'Blockchain'
        } catch (error) {
          console.error('Erreur Algorand:', error)
          toast.error('Erreur lors de la création du paiement Algorand')
          return
        }
      } else if (newPayment.payment_method === 'subscription') {
        try {
          const subscription = await revenueCatService.createPayFuseSubscription({
            userId: user?.id || 'demo_user',
            plan: 'pro',
            paymentMethod: newPayment.provider as any
          })
          
          paymentData.provider_payment_id = subscription.subscription.id
          paymentData.description = `Abonnement: ${newPayment.description}`
        } catch (error) {
          console.error('Erreur RevenueCat:', error)
          toast.error('Erreur lors de la création de l\'abonnement')
          return
        }
      }

      // Essayer d'insérer dans Supabase
      try {
        const createdPayment = await SupabaseService.createPayment(paymentData)
        
        const transformedPayment: PaymentWithDetails = {
          ...createdPayment,
          payment_method: newPayment.payment_method,
          country: 'Sénégal'
        }
        
        setPayments(prev => [transformedPayment, ...prev])
        toast.success('Paiement créé avec succès!')
        
        // Simuler la completion après 5 secondes
        setTimeout(async () => {
          try {
            await SupabaseService.updatePaymentStatus(
              createdPayment.id,
              'completed',
              new Date().toISOString()
            )
            
            setPayments(prev => prev.map(p => 
              p.id === createdPayment.id 
                ? { ...p, status: 'completed', completed_at: new Date().toISOString() }
                : p
            ))
            toast.success('Paiement complété!')
          } catch (error) {
            console.error('Erreur mise à jour statut:', error)
          }
        }, 5000)
        
      } catch (error) {
        console.error('Erreur Supabase:', error)
        
        // Fallback: ajouter localement
        const localPayment: PaymentWithDetails = {
          id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...paymentData,
          created_at: new Date().toISOString(),
          payment_method: newPayment.payment_method,
          country: 'Sénégal'
        }
        
        setPayments(prev => [localPayment, ...prev])
        toast.success('Paiement créé localement (Supabase indisponible)')
      }

      // Reset form
      setNewPayment({ 
        amount: '', 
        provider: 'orange_money', 
        phone: '', 
        description: '', 
        payment_method: 'standard' 
      })
      setShowCreateModal(false)
      setShowQRModal(false)

    } catch (error) {
      console.error('Erreur création paiement:', error)
      toast.error('Erreur lors de la création du paiement')
    }
  }

  const handleViewDetails = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment)
    setShowDetailModal(true)
  }

  const exportPayments = async () => {
    try {
      const csv = [
        ['ID', 'Montant', 'Devise', 'Provider', 'Téléphone', 'Statut', 'Type', 'Description', 'Date Création'],
        ...filteredPayments.map(p => [
          p.id,
          p.amount.toString(),
          p.currency,
          p.provider,
          p.phone,
          p.status,
          p.payment_method,
          p.description || '',
          new Date(p.created_at).toLocaleString()
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payfuse-payments-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export terminé!')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété'
      case 'pending': return 'En attente'
      case 'failed': return 'Échoué'
      default: return status
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'qr_code': return <QrCode className="w-4 h-4 text-purple-600" />
      case 'algorand': return <div className="w-4 h-4 bg-blue-600 rounded-full" />
      case 'subscription': return <div className="w-4 h-4 bg-green-600 rounded-full" />
      default: return <CreditCard className="w-4 h-4 text-blue-600" />
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'qr_code': return 'QR Code'
      case 'algorand': return 'Algorand'
      case 'subscription': return 'Abonnement'
      default: return 'Standard'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phone.includes(searchTerm) ||
                         (payment.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesType = typeFilter === 'all' || payment.payment_method === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Paiements</h1>
            <p className="text-gray-600">
              {filteredPayments.length} paiement(s) • Total: {filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()} XOF
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQRModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Payment
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Paiement
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par ID, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Complétés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="standard">Standard</option>
            <option value="qr_code">QR Code</option>
            <option value="algorand">Algorand</option>
            <option value="subscription">Abonnement</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportPayments}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </motion.button>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID & Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Provider</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Téléphone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm font-medium">{payment.id}</div>
                      <div className="text-xs text-gray-500 mt-1">{payment.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{payment.provider}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span className="text-sm font-medium ml-2">
                          {getPaymentMethodText(payment.payment_method)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{payment.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(payment)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500 mb-2">Aucun paiement trouvé</div>
            <div className="text-sm text-gray-400">
              Ajustez vos filtres ou créez un nouveau paiement
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Détails */}
      {showDetailModal && selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Détails du Paiement</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Transaction</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedPayment.status)}`}>
                  {getStatusText(selectedPayment.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <p className="text-lg font-semibold">{selectedPayment.amount.toLocaleString()} {selectedPayment.currency}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <p>{selectedPayment.provider}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <p className="font-mono">{selectedPayment.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex items-center">
                  {getPaymentMethodIcon(selectedPayment.payment_method)}
                  <span className="ml-2">{getPaymentMethodText(selectedPayment.payment_method)}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p>{selectedPayment.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
                <p>{new Date(selectedPayment.created_at).toLocaleString()}</p>
              </div>
              {selectedPayment.completed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de completion</label>
                  <p>{new Date(selectedPayment.completed_at).toLocaleString()}</p>
                </div>
              )}
              {selectedPayment.provider_payment_id && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Provider</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.provider_payment_id}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Standard Payment Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold">Nouveau Paiement</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de paiement
                </label>
                <select
                  value={newPayment.payment_method}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, payment_method: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="qr_code">QR Code</option>
                  <option value="algorand">Algorand Blockchain</option>
                  <option value="subscription">Abonnement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (XOF)
                </label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  value={newPayment.provider}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                  <option value="mtn_momo">MTN MoMo</option>
                  {newPayment.payment_method === 'algorand' && <option value="algorand">Algorand</option>}
                </select>
              </div>

              {newPayment.payment_method !== 'algorand' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={newPayment.phone}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+221771234567"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du paiement"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreatePayment}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer Paiement
              </motion.button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* QR Payment Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center mb-4">
              <QrCode className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold">Nouveau QR Payment</h2>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-purple-900 mb-2">Avantages QR Payment:</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Paiement instantané par scan</li>
                <li>• Auto-détection du provider</li>
                <li>• Compatible tous smartphones</li>
                <li>• Sécurisé et traçable</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (XOF)
                </label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider (Auto-détecté)
                </label>
                <select
                  value={newPayment.provider}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="orange_money">Orange Money</option>
                  <option value="wave">Wave</option>
                  <option value="mtn_momo">MTN MoMo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="QR Payment - Achat boutique"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setNewPayment(prev => ({ ...prev, payment_method: 'qr_code', phone: '+221771234567' }))
                  handleCreatePayment()
                }}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Générer QR Code
              </motion.button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Payments