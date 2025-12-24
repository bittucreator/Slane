/**
 * @author Shiva Nagendra Babu Kore
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log('Auth callback - user:', user, 'loading:', loading)
    
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to tasks...')
        router.push('/tasks')
      } else {
        // Check if this is from a sign-out callback
        const isSignOutCallback = localStorage.getItem('recentSignOut')
        if (isSignOutCallback) {
          console.log('Sign-out callback detected, redirecting to home...')
          router.push('/')
        } else {
          console.log('No user found, redirecting to login...')
          router.push('/login')
        }
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}
