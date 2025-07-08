# Guide de Contribution - PayFuse

Merci de votre intérêt pour contribuer à PayFuse ! Ce guide vous aidera à comprendre comment participer au développement de notre plateforme de paiements Mobile Money.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Git
- Compte Supabase (optionnel pour le développement local)

### Installation
```bash
# Cloner le repository
git clone https://github.com/payfuse/payfuse.git
cd payfuse

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## 📋 Types de Contributions

Nous accueillons plusieurs types de contributions :

### 🐛 Rapports de Bugs
- Utilisez les templates d'issues GitHub
- Incluez les étapes de reproduction
- Précisez votre environnement (OS, navigateur, version Node.js)
- Ajoutez des captures d'écran si pertinent

### ✨ Nouvelles Fonctionnalités
- Ouvrez d'abord une issue pour discuter de la fonctionnalité
- Suivez les guidelines de design et d'architecture
- Incluez des tests pour toute nouvelle fonctionnalité
- Mettez à jour la documentation

### 📚 Documentation
- Améliorations de la documentation API
- Guides d'utilisation
- Exemples de code
- Traductions

### 🔧 Améliorations Techniques
- Optimisations de performance
- Refactoring de code
- Améliorations de sécurité
- Mise à jour des dépendances

## 🛠️ Processus de Développement

### 1. Fork et Clone
```bash
# Fork le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/votre-username/payfuse.git
cd payfuse

# Ajouter le repository original comme remote
git remote add upstream https://github.com/payfuse/payfuse.git
```

### 2. Créer une Branche
```bash
# Créer une branche pour votre fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite

# Ou pour un bugfix
git checkout -b fix/description-du-bug
```

### 3. Développement
- Suivez les conventions de code existantes
- Écrivez des tests pour votre code
- Utilisez des messages de commit descriptifs
- Testez votre code localement

### 4. Tests
```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests E2E
npm run test:e2e

# Linting
npm run lint
```

### 5. Commit et Push
```bash
# Ajouter vos changements
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter support pour MTN MoMo"

# Push vers votre fork
git push origin feature/nom-de-la-fonctionnalite
```

### 6. Pull Request
- Ouvrez une PR depuis votre fork vers le repository principal
- Utilisez le template de PR fourni
- Décrivez clairement vos changements
- Liez les issues pertinentes
- Attendez la review et les retours

## 📝 Conventions de Code

### Style de Code
- Utilisez TypeScript pour tout nouveau code
- Suivez les règles ESLint configurées
- Utilisez Prettier pour le formatage
- Nommage en camelCase pour les variables et fonctions
- Nommage en PascalCase pour les composants React

### Structure des Fichiers
```
src/
├── components/          # Composants React réutilisables
├── pages/              # Pages de l'application
├── services/           # Services et logique métier
├── utils/              # Fonctions utilitaires
├── types/              # Définitions TypeScript
├── hooks/              # Hooks React personnalisés
└── lib/                # Configuration des librairies
```

### Conventions de Nommage
- **Fichiers**: kebab-case (`payment-service.ts`)
- **Composants**: PascalCase (`PaymentForm.tsx`)
- **Fonctions**: camelCase (`createPayment`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Messages de Commit
Utilisez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

feat(payments): ajouter support Orange Money
fix(webhooks): corriger validation signature
docs(api): mettre à jour documentation endpoints
style(ui): améliorer responsive design
refactor(auth): simplifier logique authentification
test(payments): ajouter tests unitaires
chore(deps): mettre à jour dépendances
```

## 🧪 Tests

### Types de Tests
- **Tests Unitaires**: Testent des fonctions/composants isolés
- **Tests d'Intégration**: Testent l'interaction entre modules
- **Tests E2E**: Testent les parcours utilisateur complets

### Écriture de Tests
```typescript
// Exemple de test unitaire
import { describe, it, expect } from 'vitest'
import { validatePhoneNumber } from '../utils/security'

describe('validatePhoneNumber', () => {
  it('should validate Senegal phone numbers', () => {
    expect(validatePhoneNumber('+221771234567')).toBe(true)
    expect(validatePhoneNumber('123456')).toBe(false)
  })
})
```

### Couverture de Tests
- Visez une couverture de 80%+ pour le nouveau code
- Tous les services critiques doivent avoir des tests
- Les composants UI doivent avoir des tests de rendu

## 🔒 Sécurité

### Bonnes Pratiques
- Ne jamais committer de clés API ou secrets
- Utiliser les variables d'environnement pour la configuration
- Valider toutes les entrées utilisateur
- Suivre les principes OWASP

### Rapporter des Vulnérabilités
- Envoyez un email à security@payfuse.dev
- Ne créez pas d'issue publique pour les vulnérabilités
- Incluez une description détaillée et les étapes de reproduction

## 📖 Documentation

### Documentation du Code
- Commentez le code complexe
- Utilisez JSDoc pour les fonctions publiques
- Maintenez le README à jour
- Documentez les APIs et interfaces

### Documentation Utilisateur
- Guides d'installation et configuration
- Exemples d'utilisation
- FAQ et troubleshooting
- Changelog pour les releases

## 🎯 Roadmap et Priorités

### Priorités Actuelles
1. **Intégrations Providers**: Ajouter plus de providers Mobile Money
2. **Sécurité**: Renforcer les mesures de sécurité
3. **Performance**: Optimiser les temps de réponse
4. **Documentation**: Améliorer la documentation API
5. **Tests**: Augmenter la couverture de tests

### Fonctionnalités Futures
- Support multi-devises
- Paiements récurrents
- Marketplace de plugins
- Application mobile
- Intégration blockchain

## 🤝 Code de Conduite

### Notre Engagement
Nous nous engageons à maintenir un environnement ouvert et accueillant pour tous, indépendamment de :
- L'âge, la taille corporelle, le handicap
- L'origine ethnique, l'identité de genre
- Le niveau d'expérience, la nationalité
- L'apparence personnelle, la race, la religion
- L'identité et l'orientation sexuelle

### Comportements Attendus
- Utiliser un langage accueillant et inclusif
- Respecter les différents points de vue
- Accepter les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

### Comportements Inacceptables
- Langage ou imagerie sexualisés
- Trolling, commentaires insultants/désobligeants
- Harcèlement public ou privé
- Publication d'informations privées sans permission
- Autres conduites inappropriées dans un cadre professionnel

## 📞 Support et Contact

### Canaux de Communication
- **Issues GitHub**: Pour les bugs et demandes de fonctionnalités
- **Discussions GitHub**: Pour les questions générales
- **Discord**: [PayFuse Community](https://discord.gg/payfuse)
- **Email**: dev@payfuse.dev

### Temps de Réponse
- Issues critiques: 24h
- Pull Requests: 48-72h
- Questions générales: 1 semaine

## 🏆 Reconnaissance

### Contributeurs
Tous les contributeurs sont reconnus dans :
- Le fichier CONTRIBUTORS.md
- Les notes de release
- Le site web PayFuse

### Types de Reconnaissance
- **Contributeur**: Première contribution acceptée
- **Collaborateur Régulier**: 5+ contributions
- **Mainteneur**: Accès en écriture au repository
- **Core Team**: Membre de l'équipe principale

## 📄 Licence

En contribuant à PayFuse, vous acceptez que vos contributions soient licenciées sous la [Licence Apache 2.0](LICENSE).

---

Merci de contribuer à PayFuse ! Ensemble, nous construisons l'avenir des paiements en Afrique de l'Ouest. 🚀

Pour toute question, n'hésitez pas à nous contacter ou à ouvrir une issue.