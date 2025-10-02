import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { Button } from '../ui/Button.jsx'
import { 
  User, 
  Settings, 
  LogOut, 
  ShoppingBag, 
  Scissors,
  Upload,
  Bell
} from 'lucide-react'

function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">WearMade</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              {user?.role === 'customer' && (
                <>
                  <Link 
                    to="/order/new" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    New Order
                  </Link>
                  <Link 
                    to="/orders" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    My Orders
                  </Link>
                </>
              )}
              {user?.role === 'tailor' && (
                <>
                  <Link 
                    to="/requests" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Requests
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}
              <Link 
                to="/explore" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Explore
              </Link>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Upload button for tailors */}
                {user?.role === 'tailor' && (
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Work
                  </Button>
                )}

                {/* Notifications */}
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>

                {/* User menu */}
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header