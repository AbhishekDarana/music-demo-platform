'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Cookies from 'js-cookie'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      if (event === 'SIGNED_OUT' || !session) {
        Cookies.remove('token', { path: '/' })
        router.push('/admin/login')
        router.refresh()
      } else if (event === 'SIGNED_IN' && session) {
        Cookies.set('token', session.access_token, { path: '/', expires: 1 })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return <>{children}</>
}