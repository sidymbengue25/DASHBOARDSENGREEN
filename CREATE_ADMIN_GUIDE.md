# 🚀 Guide de création de l'utilisateur Admin SENGREEN

## 📋 Informations de connexion
- **Email**: `admin@sengreen.com`
- **Mot de passe**: `12345678`
- **Rôle**: `admin`

## 🔧 Étapes pour créer l'utilisateur

### Option 1: Via Firebase Console (Recommandé)

1. **Accéder à Firebase Console**:
   - Allez sur [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sélectionnez votre projet SENGREEN

2. **Activer l'authentification**:
   - Cliquez sur "Authentication" dans le menu de gauche
   - Allez dans l'onglet "Sign-in method"
   - Activez "Email/Password" si ce n'est pas déjà fait

3. **Créer l'utilisateur**:
   - Allez dans l'onglet "Users"
   - Cliquez sur "Add user"
   - Email: `admin@sengreen.com`
   - Mot de passe: `12345678`
   - Cliquez sur "Add user"

4. **Créer le profil dans Firestore**:
   - Allez dans "Firestore Database"
   - Créez une collection `users`
   - Créez un document avec l'UID de l'utilisateur (visible dans Authentication > Users)
   - Ajoutez les champs suivants:
   ```json
   {
     "email": "admin@sengreen.com",
     "nom": "Administrateur",
     "prenom": "SENGREEN",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "isActive": true
   }
   ```

### Option 2: Via le script automatique

1. **Configurer les variables d'environnement**:
   ```bash
   # Copiez le fichier d'exemple
   cp env.example .env
   
   # Éditez .env avec vos vraies valeurs Firebase
   nano .env
   ```

2. **Exécuter le script**:
   ```bash
   node create-admin-user.mjs
   ```

## 🔍 Vérification

Une fois l'utilisateur créé, vous pouvez:

1. **Tester la connexion**:
   - Lancez l'application: `npm run dev`
   - Allez sur la page de connexion
   - Connectez-vous avec `admin@sengreen.com` / `12345678`

2. **Vérifier dans Firebase Console**:
   - Authentication > Users: L'utilisateur doit apparaître
   - Firestore > users: Le document avec `role: "admin"` doit exister

## 🛡️ Sécurité

- Changez le mot de passe par défaut en production
- Utilisez des mots de passe forts
- Activez l'authentification à deux facteurs si nécessaire
- Configurez les règles Firestore pour sécuriser l'accès

## 🚨 Dépannage

### Erreur "Email already in use"
- L'utilisateur existe déjà dans Firebase Auth
- Vérifiez juste que le document Firestore a le bon rôle `admin`

### Erreur "Invalid API key"
- Vérifiez que vos variables d'environnement sont correctes
- Redémarrez le serveur après modification du `.env`

### L'utilisateur ne peut pas se connecter
- Vérifiez que l'authentification Email/Password est activée
- Vérifiez que le document Firestore a `role: "admin"`
- Vérifiez que l'utilisateur est actif dans Firebase Auth
