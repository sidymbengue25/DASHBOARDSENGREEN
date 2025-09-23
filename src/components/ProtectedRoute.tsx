import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginForm } from './LoginForm'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="eco-card rounded-xl p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="text-green-600 font-medium">Vérification des accès...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <LoginForm />
  }

  return (
    <>
      {children}
    </>
  )
}
