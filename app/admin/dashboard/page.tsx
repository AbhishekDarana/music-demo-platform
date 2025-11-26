import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardUI from '@/components/admin/DashboardUI'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token) {
    redirect('/admin/login')
  }

  return <DashboardUI />
}