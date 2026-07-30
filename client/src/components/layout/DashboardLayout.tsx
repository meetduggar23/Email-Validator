import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0C]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[280px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8 max-w-[1440px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
