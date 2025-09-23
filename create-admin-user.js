// Script pour créer un utilisateur admin SENGREEN
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Configuration Firebase (remplacez par vos vraies valeurs)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.VITE_FIREBASE_APP_ID || "your-app-id"
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
