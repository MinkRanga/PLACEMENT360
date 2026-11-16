
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'

import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch (error) {
      return null
    }
  })

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  )

  const [isLoading, setIsLoading] = useState(true)

  // Validate session on initial load
  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('token')

      try {
        if (storedToken) {
          const userData = await authService.getCurrentUser()

          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        }
      } catch (error) {
        // If token verification fails, clear storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    verifySession()
  }, [])

  // Login
  const login = useCallback(async (email, password) => {
    const authData = await authService.login(email, password)

    const {
      access_token,
      role,
      user_id,
      email: userEmail,
    } = authData

    const userObj = {
      id: user_id,
      email: userEmail,
      role: role,
      is_active: true,
      is_verified: true,
    }

    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userObj))

    setToken(access_token)
    setUser(userObj)

    return userObj
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setToken(null)
    setUser(null)
  }, [])

  // Student Registration
  const registerStudent = useCallback(async (data) => {
    const authData = await authService.registerStudent(data)

    const { access_token, role, user_id, email } = authData

    const userObj = {
      id: user_id,
      email,
      role,
      is_active: true,
      is_verified: true,
    }

    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userObj))

    setToken(access_token)
    setUser(userObj)

    return userObj
  }, [])

  // Recruiter Registration
  const registerRecruiter = useCallback(async (data) => {
    const authData = await authService.registerRecruiter(data)

    const { access_token, role, user_id, email } = authData

    const userObj = {
      id: user_id,
      email,
      role,
      is_active: true,
      is_verified: true,
    }

    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userObj))

    setToken(access_token)
    setUser(userObj)

    return userObj
  }, [])

  // Admin Registration
  const registerAdmin = useCallback(async (data) => {
    const authData = await authService.registerAdmin(data)

    const { access_token, role, user_id, email } = authData

    const userObj = {
      id: user_id,
      email,
      role,
      is_active: true,
      is_verified: true,
    }

    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(userObj))

    setToken(access_token)
    setUser(userObj)

    return userObj
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    registerStudent,
    registerRecruiter,
    registerAdmin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
