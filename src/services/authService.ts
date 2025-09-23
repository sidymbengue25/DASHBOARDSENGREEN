import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export interface UserProfile {
  id: string
  email: string
  role: string
  nom?: string
  prenom?: string
}

export class AuthService {
  static async signIn(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Récupérer le profil utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        throw new Error('Profil utilisateur non trouvé')
      }
      
      const userData = userDoc.data()
      
      // Vérifier si l'utilisateur a le rôle admin
      if (userData.role !== 'admin') {
        await signOut(auth)
        throw new Error('Accès refusé. Seuls les administrateurs peuvent accéder au dashboard.')
      }
      
      return {
        id: user.uid,
        email: user.email!,
        role: userData.role,
        nom: userData.nom,
        prenom: userData.prenom
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la connexion')
    }
  }
  
  static async signOut(): Promise<void> {
    await signOut(auth)
  }
  
  static onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Vérifier le rôle admin
            if (userData.role === 'admin') {
              callback({
                id: user.uid,
                email: user.email!,
                role: userData.role,
                nom: userData.nom,
                prenom: userData.prenom
              })
            } else {
              // Si l'utilisateur n'est pas admin, le déconnecter
              await signOut(auth)
              callback(null)
            }
          } else {
            callback(null)
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du profil utilisateur:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }
  
  static getCurrentUser(): User | null {
    return auth.currentUser
  }
}
