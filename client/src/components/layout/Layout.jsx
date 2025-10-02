import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container-custom py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout