import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar.tsx'
import { Header } from './Header.tsx'
import { SiteFooter } from './SiteFooter.tsx'
import { WhatsAppFab } from './WhatsAppFab.tsx'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [location.pathname, location.search])

  return (
    <div className='min-h-screen text-zinc-100'>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className='lg:pl-64 flex flex-col min-h-screen'>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className='flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mx-auto w-full'>
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <WhatsAppFab />
    </div>
  )
}
