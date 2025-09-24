import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export async function getCollectes() {
  try {
    const q = query(collection(db, 'collecte'), orderBy('dateCollecte', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    console.error('getCollectes failed', e)
    return []
  }
}

export async function getUsers() {
  try {
    const q = query(collection(db, 'users'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    console.error('getUsers failed', e)
    return []
  }
}

export async function getDepots() {
  try {
    const q = query(collection(db, 'depot'), orderBy('heure', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    console.error('getDepots failed', e)
    return []
  }
}


