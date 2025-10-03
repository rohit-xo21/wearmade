import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: false,
  loading: true
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      localStorage.setItem('accessToken', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      localStorage.removeItem('accessToken')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'AUTH_ERROR':
      localStorage.removeItem('accessToken')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    try {
      const res = await api.get('/auth/me')
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: res.data.data, token } 
      })
    } catch (error) {
      console.error('Load user error:', error)
      dispatch({ type: 'AUTH_ERROR' })
    }
  }

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials)
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: res.data.data 
      })
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData)
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: res.data.data 
      })
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }