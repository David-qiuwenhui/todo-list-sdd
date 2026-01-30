import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  UserProfileUpdate,
  SocialAuthData,
  UserRole
} from '@/types/auth'
import { authService } from '@/services/authService'

const AUTH_STORAGE_KEY = 'auth_state_v1'

// Global state
const authState = ref<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
})

// Load auth state from localStorage
const loadAuthState = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.token) {
        // Validate token and get user
        // We can't await here, so we trigger the async process
        validateAndSetUser(parsed.token)
      }
    }
  } catch (error) {
    console.error('Failed to load auth state:', error)
  }
}

// Save auth state to localStorage
const saveAuthState = () => {
  try {
    const stateToSave = {
      user: authState.value.user,
      token: authState.value.token,
      isAuthenticated: authState.value.isAuthenticated
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.error('Failed to save auth state:', error)
  }
}

// Clear auth state
const clearAuthState = () => {
  authState.value = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

// Validate token and set user
const validateAndSetUser = async (authToken: string) => {
  try {
    authState.value.loading = true
    authState.value.error = null

    const user = await authService.getCurrentUser(authToken)
    if (user) {
      authState.value.user = user
      authState.value.token = authToken
      authState.value.isAuthenticated = true
    } else {
      // Invalid token, clear state
      clearAuthState()
    }
  } catch (error) {
    console.error('Token validation error:', error)
    clearAuthState()
  } finally {
    authState.value.loading = false
  }
}

// Set auth state
const setAuthState = (user: User, token: string) => {
  authState.value.user = user
  authState.value.token = token
  authState.value.isAuthenticated = true
  authState.value.error = null
  saveAuthState()
}

export function useAuth() {
  // Computed properties
  const user = computed(() => authState.value.user)
  const token = computed(() => authState.value.token)
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const loading = computed(() => authState.value.loading)
  const error = computed(() => authState.value.error)

  // Register new user
  const register = async (data: RegisterData): Promise<void> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      const response = await authService.register(data)
      setAuthState(response.user, response.token)
    } catch (error) {
      authState.value.error = error instanceof Error ? error.message : '注册失败'
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Login user
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      const response = await authService.login(credentials)
      setAuthState(response.user, response.token)

      // If "remember me" is not checked, remove from localStorage on tab close
      if (!credentials.rememberMe) {
        window.addEventListener('beforeunload', () => {
          if (!authState.value.isAuthenticated) {
            localStorage.removeItem(AUTH_STORAGE_KEY)
          }
        })
      }
    } catch (error) {
      authState.value.error = error instanceof Error ? error.message : '登录失败'
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      authState.value.loading = true

      if (authState.value.token) {
        await authService.logout(authState.value.token)
      }

      clearAuthState()
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails on server, clear local state
      clearAuthState()
    } finally {
      authState.value.loading = false
    }
  }

  // Request password reset
  const requestPasswordReset = async (data: PasswordResetRequest): Promise<string> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      const response = await authService.requestPasswordReset(data)
      return response.message
    } catch (error) {
      const message = error instanceof Error ? error.message : '密码重置请求失败'
      authState.value.error = message
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Confirm password reset
  const confirmPasswordReset = async (data: PasswordResetConfirm): Promise<string> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      const response = await authService.confirmPasswordReset(data)
      return response.message
    } catch (error) {
      const message = error instanceof Error ? error.message : '密码重置失败'
      authState.value.error = message
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Update user profile
  const updateProfile = async (data: UserProfileUpdate): Promise<User> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      if (!authState.value.user) {
        throw new Error('用户未登录')
      }

      const updatedUser = await authService.updateProfile(authState.value.user.id, data)
      authState.value.user = updatedUser
      saveAuthState()

      return updatedUser
    } catch (error) {
      const message = error instanceof Error ? error.message : '资料更新失败'
      authState.value.error = message
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Verify email
  const verifyEmail = async (token: string): Promise<string> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      const response = await authService.verifyEmail(token)

      // Update user's email verification status
      if (authState.value.user) {
        authState.value.user.emailVerified = true
        saveAuthState()
      }

      return response.message
    } catch (error) {
      const message = error instanceof Error ? error.message : '邮箱验证失败'
      authState.value.error = message
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Social authentication
  const socialAuth = async (data: SocialAuthData): Promise<void> => {
    try {
      authState.value.loading = true
      authState.value.error = null

      const response = await authService.socialAuth(data)
      setAuthState(response.user, response.token)
    } catch (error) {
      const message = error instanceof Error ? error.message : '社交登录失败'
      authState.value.error = message
      throw error
    } finally {
      authState.value.loading = false
    }
  }

  // Check permissions
  const hasPermission = (requiredRole?: UserRole): boolean => {
    return authService.hasPermission(authState.value.user, requiredRole)
  }

  // Check if user is admin
  const isAdmin = computed(() => {
    return authState.value.user?.role === 'ADMIN'
  })

  // Clear error
  const clearError = () => {
    authState.value.error = null
  }

  // Reset auth (for testing)
  const resetAuth = () => {
    clearAuthState()
  }

  // Initialize auth state on mount
  if (getCurrentInstance()) {
    onMounted(() => {
      // Only load if not authenticated (or maybe always reload to validate token?)
      // For now, let's load if we don't have user but have potential token in storage
      if (!authState.value.isAuthenticated) {
        loadAuthState()
      }
    })
  }

  return {
    // State
    authState,
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isAdmin,

    // Actions
    register,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    verifyEmail,
    socialAuth,
    hasPermission,
    clearError,
    
    // Test helper
    resetAuth
  }
}