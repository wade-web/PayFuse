import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, RefreshCw } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  currency: string
  provider: string
  phone: string
  status: 'completed' | 'pending' | 'failed'
  description: string
  createdAt: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  limit?: number
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  limit = 5 
}) => {
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

  const limitedTransactions = transactions.slice(0, limit)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Transactions Récentes
          </h3>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-600 text-sm">
                Transaction
              </th>
              <th className="text-left py-3 px-6 font-medium text-gray-600 text-sm">
                Montant
              </th>
              <th className="text-left py-3 px-6 font-medium text-gray-600 text-sm">
                Provider
              </th>
              <th className="text-left py-3 px-6 font-medium text-gray-600 text-sm">
                Statut
              </th>
              <th className="text-left py-3 px-6 font-medium text-gray-600 text-sm">
                Date
              </th>
              <th className="text-left py-3 px-6 font-medium text-gray-600 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {limitedTransactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div>
                    <div className="font-mono text-sm text-gray-900">
                      {transaction.id}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {transaction.description}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-900">
                    {transaction.amount.toLocaleString()} {transaction.currency}
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.phone}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-gray-900">
                    {transaction.provider}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-900">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
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

      {transactions.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-gray-500 mb-2">Aucune transaction récente</div>
          <div className="text-sm text-gray-400">
            Les transactions apparaîtront ici une fois créées
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default RecentTransactions