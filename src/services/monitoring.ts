import { supabase } from '../lib/supabase'

export interface SystemMetrics {
  responseTime: number
  uptime: number
  requestsPerMinute: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
}

export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  resolved: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface ServiceStatus {
  api: 'operational' | 'degraded' | 'outage'
  database: 'operational' | 'degraded' | 'outage'
  webhooks: 'operational' | 'degraded' | 'outage'
  providers: {
    orangeMoney: 'operational' | 'degraded' | 'outage'
    wave: 'operational' | 'degraded' | 'outage'
    mtnMomo: 'operational' | 'degraded' | 'outage'
  }
}

export class MonitoringService {
  private static instance: MonitoringService
  private metrics: SystemMetrics = {
    responseTime: 0,
    uptime: 99.9,
    requestsPerMinute: 0,
    errorRate: 0,
    memoryUsage: 0,
    cpuUsage: 0
  }
  private alerts: Alert[] = []
  private metricsHistory: Array<SystemMetrics & { timestamp: string }> = []

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  constructor() {
    this.startMetricsCollection()
    this.initializeAlerts()
  }

  private startMetricsCollection() {
    // Collecter les métriques toutes les 30 secondes
    setInterval(() => {
      this.collectMetrics()
    }, 30000)

    // Nettoyer l'historique (garder seulement les 24 dernières heures)
    setInterval(() => {
      this.cleanupHistory()
    }, 3600000) // Toutes les heures
  }

  private async collectMetrics() {
    try {
      // Simuler la collecte de métriques réelles
      const startTime = Date.now()
      
      // Test de latence de la base de données
      await supabase.from('payments').select('count').limit(1)
      const dbLatency = Date.now() - startTime

      // Métriques simulées avec variations réalistes
      this.metrics = {
        responseTime: dbLatency + Math.random() * 50,
        uptime: 99.9 - Math.random() * 0.1,
        requestsPerMinute: Math.floor(1000 + Math.random() * 500),
        errorRate: Math.random() * 0.5,
        memoryUsage: 60 + Math.random() * 20,
        cpuUsage: 30 + Math.random() * 40
      }

      // Ajouter à l'historique
      this.metricsHistory.push({
        ...this.metrics,
        timestamp: new Date().toISOString()
      })

      // Vérifier les seuils d'alerte
      this.checkAlertThresholds()

    } catch (error) {
      console.error('Erreur collecte métriques:', error)
      this.createAlert('error', 'Erreur lors de la collecte des métriques', 'high')
    }
  }

  private checkAlertThresholds() {
    // Temps de réponse élevé
    if (this.metrics.responseTime > 1000) {
      this.createAlert(
        'warning',
        `Temps de réponse élevé: ${this.metrics.responseTime.toFixed(0)}ms`,
        'medium'
      )
    }

    // Taux d'erreur élevé
    if (this.metrics.errorRate > 1) {
      this.createAlert(
        'error',
        `Taux d'erreur élevé: ${this.metrics.errorRate.toFixed(2)}%`,
        'high'
      )
    }

    // Utilisation CPU élevée
    if (this.metrics.cpuUsage > 80) {
      this.createAlert(
        'warning',
        `Utilisation CPU élevée: ${this.metrics.cpuUsage.toFixed(1)}%`,
        'medium'
      )
    }

    // Utilisation mémoire élevée
    if (this.metrics.memoryUsage > 85) {
      this.createAlert(
        'warning',
        `Utilisation mémoire élevée: ${this.metrics.memoryUsage.toFixed(1)}%`,
        'medium'
      )
    }

    // Disponibilité faible
    if (this.metrics.uptime < 99.5) {
      this.createAlert(
        'error',
        `Disponibilité faible: ${this.metrics.uptime.toFixed(2)}%`,
        'critical'
      )
    }
  }

  private createAlert(
    type: Alert['type'],
    message: string,
    severity: Alert['severity']
  ) {
    // Éviter les doublons d'alertes récentes
    const recentAlert = this.alerts.find(
      alert => alert.message === message && 
      Date.now() - new Date(alert.timestamp).getTime() < 300000 // 5 minutes
    )

    if (recentAlert) return

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      resolved: false,
      severity
    }

    this.alerts.unshift(alert)

    // Garder seulement les 100 dernières alertes
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }

    // Log l'alerte
    console.log(`[${severity.toUpperCase()}] ${type.toUpperCase()}: ${message}`)
  }

  private initializeAlerts() {
    // Quelques alertes d'exemple
    this.alerts = [
      {
        id: 'alert_1',
        type: 'info',
        message: 'Maintenance programmée terminée avec succès',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: true,
        severity: 'low'
      },
      {
        id: 'alert_2',
        type: 'warning',
        message: 'Temps de réponse Wave API légèrement élevé',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        resolved: false,
        severity: 'medium'
      }
    ]
  }

  private cleanupHistory() {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - 24)
    
    this.metricsHistory = this.metricsHistory.filter(
      metric => new Date(metric.timestamp) > cutoff
    )
  }

  // API publique
  getCurrentMetrics(): SystemMetrics {
    return { ...this.metrics }
  }

  getMetricsHistory(hours: number = 24): Array<SystemMetrics & { timestamp: string }> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - hours)
    
    return this.metricsHistory.filter(
      metric => new Date(metric.timestamp) > cutoff
    )
  }

  getAlerts(limit: number = 50): Alert[] {
    return this.alerts.slice(0, limit)
  }

  getUnresolvedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      return true
    }
    return false
  }

  async getSystemStatus(): Promise<ServiceStatus> {
    try {
      // Tester la connectivité de la base de données
      const dbStart = Date.now()
      await supabase.from('payments').select('count').limit(1)
      const dbLatency = Date.now() - dbStart

      // Déterminer le statut basé sur les métriques
      const status: ServiceStatus = {
        api: this.metrics.responseTime > 1000 ? 'degraded' : 'operational',
        database: dbLatency > 500 ? 'degraded' : 'operational',
        webhooks: this.metrics.errorRate > 1 ? 'degraded' : 'operational',
        providers: {
          orangeMoney: Math.random() > 0.1 ? 'operational' : 'degraded',
          wave: Math.random() > 0.05 ? 'operational' : 'degraded',
          mtnMomo: Math.random() > 0.15 ? 'operational' : 'degraded'
        }
      }

      return status
    } catch (error) {
      console.error('Erreur vérification statut:', error)
      return {
        api: 'outage',
        database: 'outage',
        webhooks: 'outage',
        providers: {
          orangeMoney: 'outage',
          wave: 'outage',
          mtnMomo: 'outage'
        }
      }
    }
  }

  async generateHealthReport(): Promise<string> {
    const metrics = this.getCurrentMetrics()
    const status = await this.getSystemStatus()
    const unresolvedAlerts = this.getUnresolvedAlerts()

    const report = `
# Rapport de Santé PayFuse

## Métriques Actuelles
- **Temps de réponse**: ${metrics.responseTime.toFixed(0)}ms
- **Disponibilité**: ${metrics.uptime.toFixed(2)}%
- **Requêtes/minute**: ${metrics.requestsPerMinute}
- **Taux d'erreur**: ${metrics.errorRate.toFixed(2)}%
- **Utilisation CPU**: ${metrics.cpuUsage.toFixed(1)}%
- **Utilisation mémoire**: ${metrics.memoryUsage.toFixed(1)}%

## Statut des Services
- **API**: ${status.api}
- **Base de données**: ${status.database}
- **Webhooks**: ${status.webhooks}

### Providers
- **Orange Money**: ${status.providers.orangeMoney}
- **Wave**: ${status.providers.wave}
- **MTN MoMo**: ${status.providers.mtnMomo}

## Alertes Non Résolues
${unresolvedAlerts.length === 0 ? 'Aucune alerte active' : 
  unresolvedAlerts.map(alert => 
    `- [${alert.severity.toUpperCase()}] ${alert.message} (${new Date(alert.timestamp).toLocaleString()})`
  ).join('\n')
}

---
Généré le ${new Date().toLocaleString()}
`

    return report.trim()
  }

  // Méthodes pour les tests de charge
  simulateLoad(requestsPerSecond: number, duration: number) {
    console.log(`Simulation de charge: ${requestsPerSecond} req/s pendant ${duration}s`)
    
    const interval = setInterval(() => {
      this.metrics.requestsPerMinute = requestsPerSecond * 60
      this.metrics.responseTime += Math.random() * 100
      this.metrics.cpuUsage += Math.random() * 20
      this.metrics.errorRate += Math.random() * 0.1
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
      console.log('Simulation de charge terminée')
    }, duration * 1000)
  }

  // Webhook pour recevoir des métriques externes
  async receiveExternalMetrics(source: string, metrics: Partial<SystemMetrics>) {
    console.log(`Métriques reçues de ${source}:`, metrics)
    
    // Fusionner avec les métriques actuelles
    this.metrics = { ...this.metrics, ...metrics }
    
    // Créer une alerte si nécessaire
    if (metrics.errorRate && metrics.errorRate > 2) {
      this.createAlert(
        'error',
        `Taux d'erreur élevé rapporté par ${source}: ${metrics.errorRate}%`,
        'high'
      )
    }
  }
}

export default MonitoringService