import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, DollarSign, Users, Activity, Calendar, Download, RefreshCw, Filter } from 'lucide-react'
import RealDataService from '../services/realDataService'
import toast from 'react-hot-toast'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const realDataService = RealDataService.getInstance()

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [analytics, metricsData] = await Promise.all([
        realDataService.getAnalyticsData(),
        realDataService.getRealTimeMetrics()
      ])
      
      setAnalyticsData(analytics)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Erreur chargement analytics:', error)
      toast.error('Erreur lors du chargement des analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
    toast.success('Analytics actualisées!')
  }

  const exportAnalytics = async () => {
    try {
      const exportData = await realDataService.exportData('csv')
      const blob = new Blob([exportData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payfuse-analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export analytics terminé!')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  // Données pour les graphiques horaires
  const hourlyData = [
    { hour: '00h', transactions: 5, revenue: 45000 },
    { hour: '04h', transactions: 2, revenue: 18000 },
    { hour: '08h', transactions: 25, revenue: 280000 },
    { hour: '12h', transactions: 45, revenue: 520000 },
    { hour: '16h', transactions: 38, revenue: 445000 },
    { hour: '20h', transactions: 22, revenue: 195000 }
  ]

  // Données de conversion
  const conversionData = [
    { name: 'Jan', initiated: 1200, completed: 1140, rate: 95 },
    { name: 'Fév', initiated: 1100, completed: 1045, rate: 95 },
    { name: 'Mar', initiated: 1400, completed: 1358, rate: 97 },
    { name: 'Avr', initiated: 1600, completed: 1568, rate: 98 },
    { name: 'Mai', initiated: 1500, completed: 1485, rate: 99 },
    { name: 'Jun', initiated: 1800, completed: 1782, rate: 99 }
  ]

  const kpis = [
    {
      title: 'Revenus Moyens/Jour',
      value: `${Math.floor((metrics?.totalRevenue || 0) / 7).toLocaleString()} XOF`,
      change: `+${metrics?.dailyGrowth?.toFixed(1) || 0}%`,
      trend: 'up',
      icon: DollarSign,
      description: 'Revenus quotidiens moyens sur 7 jours'
    },
    {
      title: 'Transactions/Heure',
      value: `${Math.floor((metrics?.totalTransactions || 0) / 24).toFixed(1)}`,
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      description: 'Moyenne de transactions par heure'
    },
    {
      title: 'Nouveaux Utilisateurs',
      value: Math.floor((metrics?.activeUsers || 0) * 0.3).toString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      description: 'Nouveaux utilisateurs cette semaine'
    },
    {
      title: 'Taux de Conversion',
      value: `${metrics?.successRate?.toFixed(1) || 0}%`,
      change: '+0.8%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Taux de réussite des paiements'
    }
  ]

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Avancées</h1>
            <p className="text-gray-600">Analysez vos performances et tendances en détail</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            
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
              onClick={exportAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <kpi.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">{kpi.change}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
            <p className="text-xs text-gray-500">{kpi.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue & Transactions Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Revenus et Transactions</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Revenus</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Transactions</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${value} XOF` : value,
                    name === 'revenue' ? 'Revenus' : 'Transactions'
                  ]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
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
          <div className="h-64">
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Activité par Heure</h2>
            <div className="text-sm text-gray-500">Dernières 24h</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${value} XOF` : value,
                    name === 'revenue' ? 'Revenus' : 'Transactions'
                  ]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="transactions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Taux de Conversion</h2>
            <div className="text-sm text-gray-500">6 derniers mois</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    value,
                    name === 'initiated' ? 'Initiées' : 
                    name === 'completed' ? 'Complétées' : 'Taux (%)'
                  ]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="initiated" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analytics