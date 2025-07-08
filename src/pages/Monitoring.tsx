import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, CheckCircle, Clock, Zap, Server, Database, Globe } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const Monitoring = () => {
  const [systemStatus, setSystemStatus] = useState({
    api: 'operational',
    database: 'operational',
    webhooks: 'operational',
    providers: {
      orangeMoney: 'operational',
      wave: 'degraded',
      mtnMomo: 'operational'
    }
  })

  const [metrics, setMetrics] = useState({
    responseTime: 145,
    uptime: 99.9,
    requestsPerMinute: 1247,
    errorRate: 0.1
  })

  const responseTimeData = [
    { time: '00:00', value: 120 },
    { time: '04:00', value: 110 },
    { time: '08:00', value: 180 },
    { time: '12:00', value: 145 },
    { time: '16:00', value: 160 },
    { time: '20:00', value: 135 }
  ]

  const requestVolumeData = [
    { time: '00:00', requests: 800, errors: 2 },
    { time: '04:00', requests: 400, errors: 1 },
    { time: '08:00', requests: 1200, errors: 5 },
    { time: '12:00', requests: 1800, errors: 3 },
    { time: '16:00', requests: 1600, errors: 4 },
    { time: '20:00', requests: 1000, errors: 2 }
  ]

  const alerts = [
    {
      id: '1',
      type: 'warning',
      message: 'Wave API response time elevated (>200ms)',
      timestamp: '2025-01-16T10:30:00Z',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '2025-01-16T09:00:00Z',
      resolved: true
    },
    {
      id: '3',
      type: 'error',
      message: 'High error rate detected on webhook deliveries',
      timestamp: '2025-01-16T08:45:00Z',
      resolved: true
    }
  ]

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 50) + 120,
        requestsPerMinute: Math.floor(Math.random() * 500) + 1000,
        errorRate: Math.random() * 0.5
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'outage': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-4 h-4" />
      case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'outage': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoring Système</h1>
        <p className="text-gray-600">Surveillez la santé et les performances de PayFuse en temps réel</p>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600" />
          Statut du Système
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Server className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium">API</span>
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(systemStatus.api)}`}>
              {getStatusIcon(systemStatus.api)}
              <span className="ml-1 capitalize">{systemStatus.api}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium">Base de Données</span>
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(systemStatus.database)}`}>
              {getStatusIcon(systemStatus.database)}
              <span className="ml-1 capitalize">{systemStatus.database}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium">Webhooks</span>
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(systemStatus.webhooks)}`}>
              {getStatusIcon(systemStatus.webhooks)}
              <span className="ml-1 capitalize">{systemStatus.webhooks}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium">Providers</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded-full text-xs text-yellow-600 bg-yellow-100">
              {getStatusIcon('degraded')}
              <span className="ml-1">Dégradé</span>
            </div>
          </div>
        </div>

        {/* Provider Details */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-medium mb-3">Détail des Providers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(systemStatus.providers).map(([provider, status]) => (
              <div key={provider} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm capitalize">{provider.replace(/([A-Z])/g, ' $1')}</span>
                <div className={`flex items-center px-2 py-1 rounded text-xs ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Temps de Réponse', value: `${metrics.responseTime}ms`, color: 'text-blue-600', icon: Clock },
          { label: 'Disponibilité', value: `${metrics.uptime}%`, color: 'text-green-600', icon: CheckCircle },
          { label: 'Requêtes/min', value: metrics.requestsPerMinute.toLocaleString(), color: 'text-purple-600', icon: Activity },
          { label: 'Taux d\'Erreur', value: `${metrics.errorRate.toFixed(2)}%`, color: 'text-red-600', icon: AlertTriangle }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Response Time Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Temps de Réponse (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}ms`, 'Temps de réponse']} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Request Volume Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Volume de Requêtes (24h)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={requestVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
                name="Requêtes"
              />
              <Area 
                type="monotone" 
                dataKey="errors" 
                stackId="2"
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.8}
                name="Erreurs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Alertes Récentes</h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start p-3 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'border-red-500 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              } ${alert.resolved ? 'opacity-60' : ''}`}
            >
              <div className="mr-3 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {alert.message}
                  {alert.resolved && <span className="ml-2 text-green-600">(Résolu)</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Monitoring