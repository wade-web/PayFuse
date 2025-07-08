import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      name: 'PayFuse Developer',
      email: 'admin@payfuse.dev',
      company: 'PayFuse Inc.',
      phone: '+221771234567'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      webhookFailures: true,
      dailyReports: true,
      securityAlerts: true
    },
    api: {
      environment: 'sandbox',
      webhookUrl: 'https://yourapp.com/webhooks/payfuse',
      timeout: 30,
      retryAttempts: 3
    },
    providers: {
      orangeMoney: {
        enabled: true,
        clientId: 'your_client_id',
        environment: 'sandbox'
      },
      wave: {
        enabled: true,
        apiKey: 'your_api_key',
        environment: 'test'
      },
      mtnMomo: {
        enabled: false,
        apiKey: '',
        environment: 'sandbox'
      }
    }
  })

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'Configuration API', icon: SettingsIcon },
    { id: 'providers', label: 'Providers', icon: CreditCard },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ]

  const handleSave = () => {
    toast.success('Paramètres sauvegardés avec succès!')
  }

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const updateNestedSetting = (section: string, subsection: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [key]: value
        }
      }
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Configurez votre compte et vos préférences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-4"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Informations du Profil</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={settings.profile.company}
                      onChange={(e) => updateSetting('profile', 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Préférences de Notification</h2>
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {key === 'emailNotifications' && 'Recevoir des notifications par email'}
                          {key === 'smsNotifications' && 'Recevoir des notifications par SMS'}
                          {key === 'webhookFailures' && 'Alertes en cas d\'échec de webhook'}
                          {key === 'dailyReports' && 'Rapports quotidiens automatiques'}
                          {key === 'securityAlerts' && 'Alertes de sécurité importantes'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Configuration API</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environnement
                    </label>
                    <select
                      value={settings.api.environment}
                      onChange={(e) => updateSetting('api', 'environment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sandbox">Sandbox</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Webhook
                    </label>
                    <input
                      type="url"
                      value={settings.api.webhookUrl}
                      onChange={(e) => updateSetting('api', 'webhookUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeout (secondes)
                      </label>
                      <input
                        type="number"
                        value={settings.api.timeout}
                        onChange={(e) => updateSetting('api', 'timeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tentatives de retry
                      </label>
                      <input
                        type="number"
                        value={settings.api.retryAttempts}
                        onChange={(e) => updateSetting('api', 'retryAttempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'providers' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Configuration des Providers</h2>
                <div className="space-y-6">
                  {Object.entries(settings.providers).map(([providerKey, provider]) => (
                    <div key={providerKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium capitalize">
                          {providerKey.replace(/([A-Z])/g, ' $1')}
                        </h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={provider.enabled}
                            onChange={(e) => updateNestedSetting('providers', providerKey, 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {provider.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {provider.clientId ? 'Client ID' : 'API Key'}
                            </label>
                            <input
                              type="text"
                              value={provider.clientId || provider.apiKey}
                              onChange={(e) => updateNestedSetting(
                                'providers', 
                                providerKey, 
                                provider.clientId ? 'clientId' : 'apiKey', 
                                e.target.value
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Environnement
                            </label>
                            <select
                              value={provider.environment}
                              onChange={(e) => updateNestedSetting('providers', providerKey, 'environment', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="sandbox">Sandbox</option>
                              <option value="test">Test</option>
                              <option value="production">Production</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Paramètres de Sécurité</h2>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Authentification à Deux Facteurs</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Renforcez la sécurité de votre compte avec l'authentification à deux facteurs.
                    </p>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                      Activer 2FA
                    </button>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-800 mb-2">Sessions Actives</h3>
                    <p className="text-sm text-red-700 mb-3">
                      Gérez vos sessions actives et déconnectez-vous des appareils non reconnus.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                      Voir les Sessions
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">Logs d'Audit</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Consultez l'historique des actions effectuées sur votre compte.
                    </p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Voir les Logs
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les Modifications
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings