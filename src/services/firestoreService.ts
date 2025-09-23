import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export async function getCollectes() {
  try {
    const snapshot = await getDocs(collection(db, 'collecte'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getCollectes failed', e)
    return []
  }
}

export async function getUsers() {
  try {
    const snapshot = await getDocs(collection(db, 'users'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getUsers failed', e)
    return []
  }
}

export async function getDepots() {
  try {
    const snapshot = await getDocs(collection(db, 'depot'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getDepots failed', e)
    return []
  }
}

export async function getHistoriqueDepots() {
  try {
    const snapshot = await getDocs(collection(db, 'historiqueDepot'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getHistoriqueDepots failed', e)
    return []
  }
}

export async function getMobilier() {
  try {
    const snapshot = await getDocs(collection(db, 'mobilier'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getMobilier failed', e)
    return []
  }
}

export async function getNotifications() {
  try {
    const snapshot = await getDocs(collection(db, 'notification'))
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('getNotifications failed', e)
    return []
  }
}


