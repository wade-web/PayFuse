# PayFuse SDK - Passerelle Mobile Money Intelligente 🚀

[![npm version](https://badge.fury.io/js/%40payfuse%2Fsdk.svg)](https://badge.fury.io/js/%40payfuse%2Fsdk)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://opensource.org/licenses/Apache-2.0)
[![Built with Bolt](https://img.shields.io/badge/Built%20with-Bolt.new-purple)](https://bolt.new)

> **PayFuse** révolutionne les paiements Mobile Money en Afrique de l'Ouest avec une API unifiée, un assistant IA intégré et des fonctionnalités avancées de sécurité.

## 🌟 Fonctionnalités Principales

### 🔌 API Unifiée Production-Ready
- **Multi-Provider**: Orange Money, Wave, MTN MoMo, Airtel Money
- **Supabase Backend**: Base de données PostgreSQL avec RLS
- **Webhooks Sécurisés**: Notifications temps réel avec signatures cryptographiques
- **Rate Limiting**: Protection contre les abus
- **Analytics Temps Réel**: Métriques et tableaux de bord

### 🧠 Assistant IA Intégré
- **ElevenLabs ConvAI**: Assistant vocal avancé
- **Chat Interface**: Interface écrite + vocale
- **Génération de Code**: Créez des intégrations automatiquement
- **Documentation Interactive**: Aide contextuelle intelligente

### 🛡️ Sécurité de Niveau Bancaire
- **JWT + RBAC**: Authentification et autorisation robustes
- **Chiffrement End-to-End**: Protection des données sensibles
- **Monitoring Temps Réel**: Détection d'anomalies avec IA
- **Audit Logs**: Traçabilité complète

## 🚀 Installation

```bash
npm install @payfuse/sdk
```

## ⚡ Démarrage Rapide

### 1. Configuration

```typescript
import PayFuse from '@payfuse/sdk'

const payfuse = PayFuse.create({
  apiKey: 'pk_live_your_api_key',
  environment: 'production', // ou 'sandbox'
  webhookSecret: 'your_webhook_secret'
})
```

### 2. Créer un Paiement

```typescript
const payment = await payfuse.createPayment({
  amount: 10000,
  currency: 'XOF',
  provider: 'orange_money',
  phone: '+221771234567',
  description: 'Achat produit #12345',
  webhook_url: 'https://yourapp.com/webhooks/payfuse'
})

console.log('URL de paiement:', payment.payment_url)
console.log('ID de transaction:', payment.id)
```

### 3. Gérer les Webhooks

```typescript
// Créer un webhook
const webhook = await payfuse.createWebhook(
  'https://yourapp.com/payfuse-webhook',
  ['payment.completed', 'payment.failed']
)

// Traiter les notifications
app.post('/payfuse-webhook', async (req, res) => {
  const signature = req.headers['x-payfuse-signature']
  const payload = JSON.stringify(req.body)
  
  try {
    const isValid = await payfuse.verifyWebhook(payload, signature)
    if (isValid) {
      await payfuse.processWebhook(req.body, signature)
      res.status(200).send('OK')
    } else {
      res.status(400).send('Invalid signature')
    }
  } catch (error) {
    res.status(500).send('Error processing webhook')
  }
})
```

## 📊 Interface Administrateur vs Utilisateur

### 🔧 Interface Administrateur (Actuelle)
L'interface que vous voyez est le **tableau de bord administrateur** pour:
- **Développeurs**: Gérer les intégrations et APIs
- **Administrateurs**: Surveiller les transactions et performances
- **Support**: Déboguer et résoudre les problèmes

**Fonctionnalités Admin:**
- Dashboard avec métriques temps réel
- Gestion des paiements et webhooks
- Analytics avancées et exports
- Monitoring système et sécurité
- Assistant IA pour le développement
- Tests et playground API

### 👤 Interface Utilisateur Final
Les utilisateurs finaux interagissent via:
- **API REST/GraphQL**: Intégrations directes
- **SDK JavaScript/TypeScript**: Applications web
- **Widgets**: Composants prêts à l'emploi
- **QR Codes**: Paiements instantanés
- **Applications mobiles**: Apps natives

## 🌍 Providers Supportés

| Provider | Pays | Statut | Type |
|----------|------|--------|------|
| **Orange Money** | 🇸🇳 🇨🇮 🇲🇱 🇧🇫 | ✅ Production | Mobile Money |
| **Wave** | 🇸🇳 🇨🇮 | ✅ Production | Mobile Money |
| **MTN MoMo** | 🇨🇮 🇬🇭 🇺🇬 | ✅ Production | Mobile Money |
| **Airtel Money** | 🇳🇪 🇹🇩 🇲🇱 | 🔄 En cours | Mobile Money |

## 🛠️ Configuration Avancée

### Variables d'Environnement

```env
# Supabase (Obligatoire)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Orange Money
VITE_ORANGE_MONEY_CLIENT_ID=your_client_id
VITE_ORANGE_MONEY_CLIENT_SECRET=your_client_secret

# Wave
VITE_WAVE_API_KEY=your_wave_api_key

# MTN MoMo
VITE_MTN_MOMO_API_KEY=your_mtn_api_key

# Assistant IA
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_OPENAI_API_KEY=your_openai_key
```

### Configuration Supabase

```sql
-- Créer les tables nécessaires
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'XOF',
  provider text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politique d'accès
CREATE POLICY "Users can manage own payments"
  ON payments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

## 📱 Exemples d'Utilisation

### React/Next.js

```tsx
import { useState } from 'react'
import PayFuse from '@payfuse/sdk'

const PaymentForm = () => {
  const [loading, setLoading] = useState(false)
  
  const handlePayment = async (formData) => {
    setLoading(true)
    try {
      const payfuse = PayFuse.create({
        apiKey: process.env.NEXT_PUBLIC_PAYFUSE_API_KEY,
        environment: 'production'
      })
      
      const payment = await payfuse.createPayment({
        amount: formData.amount,
        currency: 'XOF',
        provider: formData.provider,
        phone: formData.phone,
        description: `Commande ${formData.orderId}`
      })
      
      // Rediriger vers la page de paiement
      window.location.href = payment.payment_url
    } catch (error) {
      console.error('Erreur paiement:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handlePayment}>
      {/* Formulaire de paiement */}
    </form>
  )
}
```

### Node.js/Express

```javascript
const express = require('express')
const PayFuse = require('@payfuse/sdk')

const app = express()
const payfuse = PayFuse.create({
  apiKey: process.env.PAYFUSE_API_KEY,
  environment: 'production'
})

app.post('/create-payment', async (req, res) => {
  try {
    const payment = await payfuse.createPayment({
      amount: req.body.amount,
      currency: 'XOF',
      provider: req.body.provider,
      phone: req.body.phone,
      webhook_url: 'https://yourapp.com/webhooks/payfuse'
    })
    
    res.json({ payment_url: payment.payment_url })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

### PHP/Laravel

```php
<?php
use PayFuse\PayFuseSDK;

$payfuse = new PayFuseSDK([
    'apiKey' => env('PAYFUSE_API_KEY'),
    'environment' => 'production'
]);

$payment = $payfuse->createPayment([
    'amount' => 25000,
    'currency' => 'XOF',
    'provider' => 'wave',
    'phone' => '+221781234567',
    'description' => 'Achat boutique en ligne'
]);

return redirect($payment['payment_url']);
?>
```

## 🔧 API Reference

### Méthodes Principales

#### `createPayment(request)`
Crée un nouveau paiement Mobile Money.

**Paramètres:**
- `amount` (number): Montant en XOF
- `currency` (string): Devise (XOF)
- `provider` (string): orange_money, wave, mtn_momo
- `phone` (string): Numéro au format +221XXXXXXXXX
- `description` (string, optionnel): Description du paiement
- `webhook_url` (string, optionnel): URL de notification

**Retour:**
```typescript
{
  id: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  currency: string
  provider: string
  payment_url: string
  created_at: string
}
```

#### `getPayment(paymentId)`
Récupère les détails d'un paiement.

#### `listPayments(limit?)`
Liste les paiements avec pagination.

#### `createWebhook(url, events, secret?)`
Configure un webhook pour les notifications.

#### `verifyWebhook(payload, signature, secret?)`
Vérifie la signature d'un webhook.

## 🧪 Tests et Développement

### Tests Unitaires

```bash
npm test
```

### Tests d'Intégration

```bash
npm run test:integration
```

### Playground API

Utilisez l'interface administrateur pour tester l'API en temps réel:
- **Dashboard** → **API Playground**
- Testez tous les endpoints
- Générez du code automatiquement
- Vérifiez les webhooks

## 📈 Monitoring et Analytics

### Métriques Temps Réel
- **Revenus**: Suivi en temps réel
- **Transactions**: Volume et taux de succès
- **Performance**: Latence et disponibilité
- **Erreurs**: Monitoring et alertes

### Tableaux de Bord
- **Dashboard Admin**: Vue d'ensemble complète
- **Analytics**: Graphiques et tendances
- **Monitoring**: Santé du système
- **Sécurité**: Logs et alertes

## 🔒 Sécurité

### Bonnes Pratiques
- **Clés API**: Stockage sécurisé côté serveur
- **Webhooks**: Vérification des signatures
- **HTTPS**: Obligatoire pour toutes les communications
- **Rate Limiting**: Protection contre les abus

### Conformité
- **PCI DSS**: Standards de sécurité des paiements
- **GDPR**: Protection des données personnelles
- **ISO 27001**: Gestion de la sécurité de l'information

## 🌍 Support Multi-Pays

| Pays | Code | Devise | Providers |
|------|------|--------|-----------|
| 🇸🇳 Sénégal | SN | XOF | Orange Money, Wave |
| 🇨🇮 Côte d'Ivoire | CI | XOF | Orange Money, Wave, MTN MoMo |
| 🇲🇱 Mali | ML | XOF | Orange Money, Airtel Money |
| 🇧🇫 Burkina Faso | BF | XOF | Orange Money, Airtel Money |

## 📞 Support et Communauté

### Ressources
- **Documentation**: [docs.payfuse.dev](https://docs.payfuse.dev)
- **Status Page**: [status.payfuse.dev](https://status.payfuse.dev)
- **GitHub**: [github.com/payfuse/payfuse-sdk](https://github.com/payfuse/payfuse-sdk)

### Contact
- **Email**: support@payfuse.dev
- **Discord**: [PayFuse Community](https://discord.gg/payfuse)
- **Twitter**: [@PayFuseDev](https://twitter.com/PayFuseDev)

### Contribution
Nous accueillons les contributions ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

## 📄 Licence

Ce projet est sous licence Apache 2.0 - voir [LICENSE](LICENSE) pour les détails.

## 🏆 Hackathon Success

**PayFuse** a été développé pour le **World's Largest Hackathon 2025** avec:
- ✅ **Innovation**: Assistant IA + Commandes vocales
- ✅ **Impact**: Simplification des paiements en Afrique
- ✅ **Technique**: Architecture scalable + Sécurité avancée
- ✅ **UX/UI**: Interface premium + Design moderne
- ✅ **Viabilité**: Modèle SaaS + Open source

---

<div align="center">
  <p>Fait avec ❤️ pour l'Afrique de l'Ouest</p>
  <p>
    <a href="https://bolt.new">Built with Bolt.new</a> • 
    <a href="https://worldslargesthackathon.devpost.com/">World's Largest Hackathon 2025</a>
  </p>
</div>#   P a y F u s e  
 