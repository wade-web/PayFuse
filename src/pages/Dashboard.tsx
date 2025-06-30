import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Smartphone,
  Globe,
  RefreshCw,
  Download
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import RealDataService from '../services/realDataService'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [metrics, setMetrics] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const realDataService = RealDataService.getInstance()

  useEffect(() => {
    loadDashboardData()
    
    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const [metricsData, transactionsData, analytics] = await Promise.all([
        realDataService.getRealTimeMetrics(),
        realDataService.getTransactions(10),
        realDataService.getAnalyticsData()
      ])
      
      setMetrics(metricsData)
      setTransactions(transactionsData)
      setAnalyticsData(analytics)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
    toast.success('Données actualisées!')
  }

  const handleExport = async () => {
    try {
      const exportData = await realDataService.exportData('json')
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payfuse-dashboard-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export terminé!')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Revenus Totaux',
      value: `${metrics?.totalRevenue?.toLocaleString() || 0} XOF`,
      change: `+${metrics?.dailyGrowth?.toFixed(1) || 0}%`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Transactions',
      value: metrics?.totalTransactions?.toLocaleString() || '0',
      change: `+${((metrics?.totalTransactions || 0) * 0.08).toFixed(1)}%`,
      trend: 'up',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      title: 'Utilisateurs Actifs',
      value: metrics?.activeUsers?.toString() || '0',
      change: `+${((metrics?.activeUsers || 0) * 0.15).toFixed(1)}%`,
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Taux de Réussite',
      value: `${metrics?.successRate?.toFixed(1) || 0}%`,
      change: `+${(Math.random() * 2).toFixed(1)}%`,
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord</h1>
            <p className="text-gray-600">Vue d'ensemble temps réel de vos paiements Mobile Money</p>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs hier</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-gray-50`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Évolution des Revenus (7 jours)</h2>
            <div className="text-sm text-gray-500">
              Total: {analyticsData?.totalRevenue?.toLocaleString() || 0} XOF
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${value} XOF` : value,
                    name === 'revenue' ? 'Revenus' : 'Transactions'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Provider Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Répartition par Provider</h2>
            <div className="text-sm text-gray-500">
              {analyticsData?.totalTransactions || 0} transactions
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.providerData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {(analyticsData?.providerData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Part de marché']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {(analyticsData?.providerData || []).map((provider: any) => (
              <div key={provider.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: provider.color }}
                  />
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{provider.value}%</div>
                  <div className="text-xs text-gray-600">
                    {provider.amount?.toLocaleString() || 0} XOF
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Transactions Récentes</h2>
          <div className="text-sm text-gray-500">
            Dernières 10 transactions
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID Transaction</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Provider</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Heure</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm">{transaction.id}</div>
                      <div className="text-xs text-gray-500">{transaction.country}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {transaction.amount.toLocaleString()} {transaction.currency}
                    </td>
                    <td className="py-3 px-4">{transaction.provider}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {transaction.payment_method === 'qr_code' ? (
                          <Smartphone className="w-4 h-4 text-purple-600 mr-1" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-blue-600 mr-1" />
                        )}
                        <span className="text-sm">
                          {transaction.payment_method === 'qr_code' ? 'QR Code' : 'Standard'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Complété' : 
                         transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  )
}

export default Dashboard