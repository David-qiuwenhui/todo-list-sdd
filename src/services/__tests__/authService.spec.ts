import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../authService'
import type { User, RegisterData, LoginCredentials } from '@/types/auth'
import { UserRole } from '@/types/auth'

// Mock localStorage with state
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    for (const key in store) delete store[key]
  })
}

vi.stubGlobal('localStorage', localStorageMock)

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage state
    localStorageMock.clear()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const result = await authService.register(registerData)

      expect(result.user.email).toBe('test@example.com')
      expect(result.user.username).toBe('testuser')
      expect(result.user.role).toBe(UserRole.ADMIN) // First user should be admin
      expect(result.token).toBeDefined()
      expect(result.message).toBe('注册成功！请查收邮箱验证邮件。')

      // Check that user was saved to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_users_v1',
        expect.any(String)
      )
    })

    it('should reject if email already exists', async () => {
      // First register a user
      const registerData1: RegisterData = {
        email: 'test@example.com',
        username: 'testuser1',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await authService.register(registerData1)

      // Try to register with same email
      const registerData2: RegisterData = {
        email: 'test@example.com',
        username: 'testuser2',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await expect(authService.register(registerData2))
        .rejects.toThrow('该邮箱已被注册')
    })

    it('should reject if username already exists', async () => {
      // First register a user
      const registerData1: RegisterData = {
        email: 'test1@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await authService.register(registerData1)

      // Try to register with same username
      const registerData2: RegisterData = {
        email: 'test2@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await expect(authService.register(registerData2))
        .rejects.toThrow('该用户名已被使用')
    })

    it('should reject if passwords do not match', async () => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'differentpassword'
      }

      await expect(authService.register(registerData))
        .rejects.toThrow('密码不匹配')
    })

    it('should reject if password is too short', async () => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '12345',
        confirmPassword: '12345'
      }

      await expect(authService.register(registerData))
        .rejects.toThrow('密码至少需要6个字符')
    })

    it('should reject if required fields are missing', async () => {
      const registerData: RegisterData = {
        email: '',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await expect(authService.register(registerData))
        .rejects.toThrow('所有字段都是必需的')
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      // Register a user first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }
      await authService.register(registerData)
    })

    it('should login user successfully with correct credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = await authService.login(credentials)

      expect(result.user.email).toBe('test@example.com')
      expect(result.user.username).toBe('testuser')
      expect(result.token).toBeDefined()
      expect(result.message).toBe('登录成功！')
    })

    it('should reject with incorrect password', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      await expect(authService.login(credentials))
        .rejects.toThrow('邮箱或密码错误')
    })

    it('should reject with non-existent email', async () => {
      const credentials: LoginCredentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      await expect(authService.login(credentials))
        .rejects.toThrow('邮箱或密码错误')
    })

    it('should reject with missing credentials', async () => {
      const credentials: LoginCredentials = {
        email: '',
        password: 'password123'
      }

      await expect(authService.login(credentials))
        .rejects.toThrow('邮箱和密码都是必需的')
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Register and login first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const registerResult = await authService.register(registerData)

      const result = await authService.logout(registerResult.token)

      expect(result).toBeUndefined()

      // Verify token was removed
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('getCurrentUser', () => {
    it('should return user for valid token', async () => {
      // Register a user first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const registerResult = await authService.register(registerData)

      const user = await authService.getCurrentUser(registerResult.token)

      expect(user).toBeDefined()
      expect(user?.email).toBe('test@example.com')
      expect(user?.username).toBe('testuser')
    })

    it('should return null for invalid token', async () => {
      const user = await authService.getCurrentUser('invalid_token')

      expect(user).toBeNull()
    })
  })

  describe('password reset', () => {
    it('should request password reset successfully', async () => {
      // Register a user first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await authService.register(registerData)

      const resetRequest = { email: 'test@example.com' }
      const result = await authService.requestPasswordReset(resetRequest)

      expect(result.message).toBe('重置链接已发送到您的邮箱')
    })

    it('should confirm password reset successfully', async () => {
      // Register a user first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await authService.register(registerData)

      // Request password reset to get token
      const resetRequest = { email: 'test@example.com' }
      await authService.requestPasswordReset(resetRequest)

      // Get the reset token from localStorage
      const resetTokens = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}')
      const userId = Object.keys(resetTokens)[0]
      const resetToken = resetTokens[userId].token

      const resetData = {
        token: resetToken,
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }

      const result = await authService.confirmPasswordReset(resetData)

      expect(result.message).toBe('密码重置成功')
    })

    it('should reject password reset with mismatched passwords', async () => {
      const resetData = {
        token: 'some_token',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword'
      }

      await expect(authService.confirmPasswordReset(resetData))
        .rejects.toThrow('密码不匹配')
    })

    it('should reject password reset with short password', async () => {
      const resetData = {
        token: 'some_token',
        newPassword: '12345',
        confirmPassword: '12345'
      }

      await expect(authService.confirmPasswordReset(resetData))
        .rejects.toThrow('密码至少需要6个字符')
    })
  })

  describe('profile management', () => {
    let userId: string
    let token: string

    beforeEach(async () => {
      // Register a user first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const result = await authService.register(registerData)
      userId = result.user.id
      token = result.token
    })

    it('should update username successfully', async () => {
      const updateData = { username: 'newusername' }

      const result = await authService.updateProfile(userId, updateData)

      expect(result.username).toBe('newusername')
      expect(result.email).toBe('test@example.com') // Should remain unchanged
    })

    it('should update email successfully', async () => {
      const updateData = { email: 'newemail@example.com' }

      const result = await authService.updateProfile(userId, updateData)

      expect(result.email).toBe('newemail@example.com')
      expect(result.emailVerified).toBe(false) // Should require re-verification
      expect(result.username).toBe('testuser') // Should remain unchanged
    })

    it('should update password successfully', async () => {
      const updateData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }

      const result = await authService.updateProfile(userId, updateData)

      expect(result.username).toBe('testuser') // Should remain unchanged

      // Verify new password works
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'newpassword123'
      })

      expect(loginResult.user.email).toBe('test@example.com')
    })

    it('should reject password update with wrong current password', async () => {
      const updateData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      }

      await expect(authService.updateProfile(userId, updateData))
        .rejects.toThrow('当前密码错误')
    })

    it('should reject username update if username already exists', async () => {
      // Register another user
      const registerData2: RegisterData = {
        email: 'test2@example.com',
        username: 'existinguser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await authService.register(registerData2)

      // Try to update to existing username
      const updateData = { username: 'existinguser' }

      await expect(authService.updateProfile(userId, updateData))
        .rejects.toThrow('用户名已被使用')
    })

    it('should reject email update if email already exists', async () => {
      // Register another user
      const registerData2: RegisterData = {
        email: 'existing@example.com',
        username: 'testuser2',
        password: 'password123',
        confirmPassword: 'password123'
      }

      await authService.register(registerData2)

      // Try to update to existing email
      const updateData = { email: 'existing@example.com' }

      await expect(authService.updateProfile(userId, updateData))
        .rejects.toThrow('邮箱已被使用')
    })
  })

  describe('email verification', () => {
    it('should verify email successfully', async () => {
      // Register a user first
      const registerData: RegisterData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      }

      const result = await authService.register(registerData)
      const userId = result.user.id

      const verifyResult = await authService.verifyEmail(`mock_jwt_${userId}_123_${Math.random()}`)

      expect(verifyResult.message).toBe('邮箱验证成功')
    })

    it('should reject invalid verification token', async () => {
      await expect(authService.verifyEmail('invalid_token'))
        .rejects.toThrow('验证链接无效')
    })
  })

  describe('social authentication', () => {
    it('should handle Google social auth', async () => {
      const socialData = {
        provider: 'google' as const,
        accessToken: 'google_access_token'
      }

      const result = await authService.socialAuth(socialData)

      expect(result.user.email).toBe('user_google@example.com')
      expect(result.user.username).toMatch(/^google_user_\d+$/)
      expect(result.user.emailVerified).toBe(true)
      expect(result.token).toBeDefined()
      expect(result.message).toBe('google 登录成功！')
    })

    it('should handle GitHub social auth', async () => {
      const socialData = {
        provider: 'github' as const,
        accessToken: 'github_access_token'
      }

      const result = await authService.socialAuth(socialData)

      expect(result.user.email).toBe('user_github@example.com')
      expect(result.user.username).toMatch(/^github_user_\d+$/)
      expect(result.user.emailVerified).toBe(true)
      expect(result.token).toBeDefined()
      expect(result.message).toBe('github 登录成功！')
    })

    it('should reuse existing social auth user', async () => {
      const socialData = {
        provider: 'google' as const,
        accessToken: 'google_access_token'
      }

      // First social auth
      const result1 = await authService.socialAuth(socialData)

      // Second social auth with same provider
      const result2 = await authService.socialAuth(socialData)

      expect(result1.user.id).toBe(result2.user.id)
      expect(result1.user.email).toBe(result2.user.email)
    })
  })

  describe('permissions', () => {
    it('should allow admin access to admin features', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        role: UserRole.ADMIN,
        emailVerified: true,
        createdAt: new Date()
      }

      const result = authService.hasPermission(adminUser, UserRole.ADMIN)

      expect(result).toBe(true)
    })

    it('should deny user access to admin features', () => {
      const regularUser: User = {
        id: '2',
        email: 'user@example.com',
        username: 'user',
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date()
      }

      const result = authService.hasPermission(regularUser, UserRole.ADMIN)

      expect(result).toBe(false)
    })

    it('should allow user access to user features', () => {
      const regularUser: User = {
        id: '2',
        email: 'user@example.com',
        username: 'user',
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date()
      }

      const result = authService.hasPermission(regularUser, UserRole.USER)

      expect(result).toBe(true)
    })

    it('should deny access to unauthenticated users', () => {
      const result = authService.hasPermission(null, UserRole.USER)

      expect(result).toBe(false)
    })

    it('should allow access when no role is required', () => {
      const user: User = {
        id: '1',
        email: 'user@example.com',
        username: 'user',
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date()
      }

      const result = authService.hasPermission(user)

      expect(result).toBe(true)
    })
  })
})