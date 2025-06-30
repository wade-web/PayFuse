import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Eye, RefreshCw, Calendar } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  amount: number
  currency: string
  provider: string
  phone: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  description: string
  createdAt: string
  completedAt?: string
}

const Transactions: React.FC = () => {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      // Simuler le chargement des transactions
      const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
        id: `txn_${Date.now()}_${i}`,
        amount: Math.floor(Math.random() * 100000) + 1000,
        currency: 'XOF',
        provider: ['Orange Money', 'Wave', 'MTN MoMo'][Math.floor(Math.random() * 3)],
        phone: `+221${Math.floor(Math.random() * 90000000 + 10000000)}`,
        status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)] as any,
        description: `Transaction ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
      
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Erreur chargement transactions:', error)
      toast.error('Erreur lors du chargement des transactions')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.phone.includes(searchTerm) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    
    let matchesDate = true
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', ''))
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      matchesDate = new Date(transaction.createdAt) >= cutoff
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété'
      case 'pending': return 'En attente'
      case 'failed': return 'Échoué'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const exportTransactions = () => {
    const csv = [
      ['ID', 'Montant', 'Devise', 'Provider', 'Téléphone', 'Statut', 'Description', 'Date de création'],
      ...filteredTransactions.map(t => [
        t.id,
        t.amount.toString(),
        t.currency,
        t.provider,
        t.phone,
        t.status,
        t.description,
        new Date(t.createdAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export terminé!')
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
            <p className="text-gray-600">
              {filteredTransactions.length} transaction(s) trouvée(s)
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Transaction
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
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
            <option value="cancelled">Annulés</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les dates</option>
            <option value="1d">Dernières 24h</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>

          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadTransactions}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportTransactions}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Provider</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Téléphone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm">{transaction.id}</div>
                    <div className="text-xs text-gray-500 mt-1">{transaction.description}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    {transaction.amount.toLocaleString()} {transaction.currency}
                  </td>
                  <td className="py-3 px-4">{transaction.provider}</td>
                  <td className="py-3 px-4 font-mono">{transaction.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3 px-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500 mb-2">Aucune transaction trouvée</div>
            <div className="text-sm text-gray-400">
              Ajustez vos filtres ou créez une nouvelle transaction
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Transactions
