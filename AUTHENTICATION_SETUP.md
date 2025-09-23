# Configuration de l'authentification SENGREEN Dashboard

## Vue d'ensemble

Le dashboard SENGREEN est maintenant protégé par un système d'authentification Firebase. Seuls les utilisateurs avec le rôle `admin` peuvent accéder au dashboard.

## Configuration requise

### 1. Variables d'environnement

Assurez-vous que toutes les variables d'environnement Firebase sont configurées dans votre fichier `.env` :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Configuration Firebase Console

1. **Activer l'authentification** :
   - Allez dans Firebase Console → Authentication
   - Activez le fournisseur "Email/Password"

2. **Structure des utilisateurs dans Firestore** :
   - Collection : `users`
   - Document ID : UID de l'utilisateur Firebase Auth
   - Structure du document :
   ```json
   {
     "email": "admin@sengreen.com",
     "nom": "Doe",
     "prenom": "John",
     "role": "admin"
   }
   ```

### 3. Création d'un utilisateur admin

1. **Via Firebase Console** :
   - Allez dans Authentication → Users
   - Cliquez sur "Add user"
   - Ajoutez l'email et le mot de passe

2. **Créer le document utilisateur dans Firestore** :
   - Allez dans Firestore Database → users
   - Créez un nouveau document avec l'UID de l'utilisateur
   - Ajoutez les champs requis avec `role: "admin"`

## Fonctionnalités d'authentification

### Sécurité
- ✅ Vérification du rôle admin à la connexion
- ✅ Déconnexion automatique si le rôle n'est pas admin
- ✅ Protection de toutes les routes du dashboard
- ✅ Gestion des états de chargement
- ✅ Messages d'erreur clairs

### Interface utilisateur
- ✅ Page de connexion élégante avec le thème SENGREEN
- ✅ Header avec informations utilisateur et bouton de déconnexion
- ✅ Écrans de chargement avec animations
- ✅ Gestion des erreurs avec feedback visuel

## Structure du code

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexte React pour l'authentification
├── services/
│   ├── firebase.ts              # Configuration Firebase (Auth ajouté)
│   └── authService.ts           # Service d'authentification
├── components/
│   ├── LoginForm.tsx            # Formulaire de connexion
│   ├── ProtectedRoute.tsx       # Composant de protection des routes
│   └── DashboardHeader.tsx      # Header avec déconnexion
└── main.tsx                     # Point d'entrée avec AuthProvider
```

## Utilisation

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Accéder au dashboard** :
   - L'utilisateur sera automatiquement redirigé vers la page de connexion
   - Seuls les utilisateurs avec `role: "admin"` peuvent se connecter
   - Une fois connecté, l'utilisateur accède au dashboard complet

3. **Se déconnecter** :
   - Cliquer sur le bouton "Déconnexion" dans le header
   - L'utilisateur est automatiquement redirigé vers la page de connexion

## Dépannage

### Erreurs communes

1. **"Profil utilisateur non trouvé"** :
   - Vérifiez que le document utilisateur existe dans Firestore
   - Vérifiez que l'UID correspond à celui de Firebase Auth

2. **"Accès refusé"** :
   - Vérifiez que le champ `role` est défini sur `"admin"`
   - Vérifiez l'orthographe du rôle (sensible à la casse)

3. **Variables d'environnement manquantes** :
   - Vérifiez que toutes les variables VITE_FIREBASE_* sont définies
   - Redémarrez le serveur de développement après modification

## Sécurité en production

- Les règles Firestore doivent être configurées pour sécuriser l'accès aux données
- Considérez l'ajout de règles de sécurité Firebase Auth personnalisées
- Implémentez une rotation régulière des mots de passe admin
