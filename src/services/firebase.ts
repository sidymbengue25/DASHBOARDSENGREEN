import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// TODO: Remplacer par votre configuration Firebase
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

for (const key of requiredVars) {
  if (!import.meta.env[key as keyof ImportMetaEnv]) {
    // eslint-disable-next-line no-console
    console.warn(`Missing env var: ${key}`)
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY  || 'AIzaSyArIUj6FtmMWFZR4kD7fKNpyOH_O_UsIzM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sengreen.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sengreen',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sengreen.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '173239728564',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:173239728564:web:09236009a1647cb3509ae1',
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)


