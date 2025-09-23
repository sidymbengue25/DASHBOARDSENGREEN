// Script pour créer un utilisateur admin SENGREEN
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Configuration Firebase - Remplacez par vos vraies valeurs
const firebaseConfig = {
  apiKey: "AIzaSyArIUj6FtmMWFZR4kD7fKNpyOH_O_UsIzM", // Remplacez par votre vraie clé API
  authDomain: "sengreen.firebaseapp.com", // Remplacez par votre domaine
  projectId: "sengreen", // Remplacez par votre ID de projet
  storageBucket: "sengreen.appspot.com", // Remplacez par votre bucket
  messagingSenderId: "173239728564", // Remplacez par votre sender ID
  appId: "1:173239728564:web:09236009a1647cb3509ae1" // Remplacez par votre app ID
}

console.log('🔧 Configuration requise:')
console.log('1. Remplacez les valeurs dans firebaseConfig par vos vraies valeurs Firebase')
console.log('2. Ou créez un fichier .env avec vos variables VITE_FIREBASE_*')
console.log('3. Relancez le script')
console.log('')

// Vérifier si les valeurs par défaut sont utilisées
if (firebaseConfig.apiKey.includes('xxxxxxxx')) {
  console.log('❌ Veuillez d\'abord configurer vos clés Firebase!')
  console.log('📋 Étapes à suivre:')
  console.log('1. Allez dans Firebase Console (https://console.firebase.google.com)')
  console.log('2. Sélectionnez votre projet SENGREEN')
  console.log('3. Allez dans Project Settings > General')
  console.log('4. Copiez les valeurs de configuration')
  console.log('5. Remplacez les valeurs dans ce script ou créez un fichier .env')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createAdminUser() {
  try {
    console.log('🚀 Création de l\'utilisateur admin SENGREEN...')
    
    // Créer l'utilisateur avec Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@sengreen.com', 
      '12345678'
    )
    
    const user = userCredential.user
    console.log('✅ Utilisateur créé avec succès:', user.uid)
    
    // Créer le document utilisateur dans Firestore avec le rôle admin
    await setDoc(doc(db, 'users', user.uid), {
      email: 'admin@sengreen.com',
      nom: 'Administrateur',
      prenom: 'SENGREEN',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true
    })
    
    console.log('✅ Profil admin créé dans Firestore')
    console.log('🎉 Utilisateur admin SENGREEN créé avec succès!')
    console.log('📧 Email: admin@sengreen.com')
    console.log('🔑 Mot de passe: 12345678')
    console.log('👑 Rôle: admin')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error.message)
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  L\'utilisateur existe déjà. Vérifiez Firestore pour le rôle admin.')
    }
  }
}

// Exécuter le script
createAdminUser()
