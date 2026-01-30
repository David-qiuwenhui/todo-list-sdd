<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2 class="profile-title">个人资料</h2>
      <p class="profile-subtitle">管理您的账户信息和偏好设置</p>
    </div>

    <div class="profile-content">
      <!-- Profile Information -->
      <div class="profile-section">
        <h3 class="section-title">基本信息</h3>

        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input
              id="username"
              v-model="profileForm.username"
              type="text"
              class="form-input"
              :class="{ 'error': errors.username }"
              placeholder="请输入用户名"
              required
              @blur="validateUsername"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <div class="email-container">
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                class="form-input email-input"
                :class="{ 'error': errors.email }"
                placeholder="请输入邮箱"
                required
                @blur="validateEmail"
              />
              <span v-if="user?.emailVerified" class="verified-badge">✓ 已验证</span>
              <span v-else class="unverified-badge">⚠ 未验证</span>
            </div>
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            <span v-if="!user?.emailVerified && !profileForm.email" class="help-text">
              邮箱未验证，
              <button @click.prevent="resendVerification" class="link-button">
                重新发送验证邮件
              </button>
            </span>
          </div>

          <div v-if="profileSuccessMessage" class="success-alert">
            {{ profileSuccessMessage }}
          </div>

          <div v-if="profileError" class="error-alert">
            {{ profileError }}
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="profileLoading || !isProfileFormValid"
          >
            <span v-if="profileLoading" class="loading-spinner"></span>
            {{ profileLoading ? '保存中...' : '保存更改' }}
          </button>
        </form>
      </div>

      <!-- Password Change -->
      <div class="profile-section">
        <h3 class="section-title">修改密码</h3>

        <form @submit.prevent="handleChangePassword" class="profile-form">
          <div class="form-group">
            <label for="currentPassword" class="form-label">当前密码</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              class="form-input"
              :class="{ 'error': passwordErrors.currentPassword }"
              placeholder="请输入当前密码"
              required
            />
            <span v-if="passwordErrors.currentPassword" class="error-message">{{ passwordErrors.currentPassword }}</span>
          </div>

          <div class="form-group">
            <label for="newPassword" class="form-label">新密码</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              :class="{ 'error': passwordErrors.newPassword }"
              placeholder="请输入新密码"
              required
              @blur="validateNewPassword"
            />
            <span v-if="passwordErrors.newPassword" class="error-message">{{ passwordErrors.newPassword }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认新密码</label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'error': passwordErrors.confirmPassword }"
              placeholder="请再次输入新密码"
              required
              @blur="validateConfirmPassword"
            />
            <span v-if="passwordErrors.confirmPassword" class="error-message">{{ passwordErrors.confirmPassword }}</span>
          </div>

          <div v-if="passwordSuccessMessage" class="success-alert">
            {{ passwordSuccessMessage }}
          </div>

          <div v-if="passwordError" class="error-alert">
            {{ passwordError }}
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="passwordLoading || !isPasswordFormValid"
          >
            <span v-if="passwordLoading" class="loading-spinner"></span>
            {{ passwordLoading ? '更新中...' : '更新密码' }}
          </button>
        </form>
      </div>

      <!-- Account Statistics -->
      <div class="profile-section">
        <h3 class="section-title">账户信息</h3>
        <div class="account-stats">
          <div class="stat-item">
            <span class="stat-label">用户角色</span>
            <span class="stat-value role-badge" :class="user?.role?.toLowerCase()">
              {{ user?.role === 'ADMIN' ? '管理员' : '普通用户' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">注册时间</span>
            <span class="stat-value">{{ formatDate(user?.createdAt) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">邮箱状态</span>
            <span class="stat-value">
              <span v-if="user?.emailVerified" class="verified-text">✓ 已验证</span>
              <span v-else class="unverified-text">⚠ 未验证</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { UserProfileUpdate } from '@/types/auth'

const { user, updateProfile, verifyEmail, loading, error } = useAuth()

// Profile form state
const profileForm = ref({
  username: '',
  email: ''
})

const errors = ref({
  username: '',
  email: ''
})

const profileLoading = ref(false)
const profileError = ref('')
const profileSuccessMessage = ref('')

// Password form state
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordErrors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccessMessage = ref('')

// Initialize form with user data
onMounted(() => {
  if (user.value) {
    profileForm.value.username = user.value.username
    profileForm.value.email = user.value.email
  }
})

const validateUsername = () => {
  const username = profileForm.value.username.trim()
  if (!username) {
    errors.value.username = '用户名不能为空'
  } else if (username.length < 3) {
    errors.value.username = '用户名至少需要3个字符'
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    errors.value.username = '用户名只能包含字母、数字、下划线和中文'
  } else if (user.value && username !== user.value.username) {
    // Check if username is different from current
    // In real app, check if username is available
  } else {
    errors.value.username = ''
  }
}

const validateEmail = () => {
  const email = profileForm.value.email.trim()
  if (!email) {
    errors.value.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.value.email = '邮箱格式不正确'
  } else if (user.value && email !== user.value.email) {
    // Check if email is different from current
    // In real app, check if email is available
  } else {
    errors.value.email = ''
  }
}

const validateNewPassword = () => {
  const password = passwordForm.value.newPassword
  if (!password) {
    passwordErrors.value.newPassword = '新密码不能为空'
  } else if (password.length < 6) {
    passwordErrors.value.newPassword = '新密码至少需要6个字符'
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    passwordErrors.value.newPassword = '新密码需要包含字母和数字'
  } else {
    passwordErrors.value.newPassword = ''
  }

  // Re-validate confirm password if it's already filled
  if (passwordForm.value.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  const confirmPassword = passwordForm.value.confirmPassword
  if (!confirmPassword) {
    passwordErrors.value.confirmPassword = '请确认新密码'
  } else if (confirmPassword !== passwordForm.value.newPassword) {
    passwordErrors.value.confirmPassword = '两次输入的新密码不一致'
  } else {
    passwordErrors.value.confirmPassword = ''
  }
}

const isProfileFormValid = computed(() => {
  const hasChanges = user.value &&
    (profileForm.value.username !== user.value.username ||
     profileForm.value.email !== user.value.email)

  return hasChanges &&
         !errors.value.username &&
         !errors.value.email
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         !passwordErrors.value.newPassword &&
         !passwordErrors.value.confirmPassword
})

const handleUpdateProfile = async () => {
  validateUsername()
  validateEmail()
  profileError.value = ''
  profileSuccessMessage.value = ''

  if (!isProfileFormValid.value) {
    return
  }

  try {
    profileLoading.value = true
    const updateData: UserProfileUpdate = {}

    if (profileForm.value.username !== user.value?.username) {
      updateData.username = profileForm.value.username
    }

    if (profileForm.value.email !== user.value?.email) {
      updateData.email = profileForm.value.email
    }

    await updateProfile(updateData)
    profileSuccessMessage.value = '个人资料更新成功！'
  } catch (err) {
    profileError.value = err instanceof Error ? err.message : '更新失败'
  } finally {
    profileLoading.value = false
  }
}

const handleChangePassword = async () => {
  validateNewPassword()
  validateConfirmPassword()
  passwordError.value = ''
  passwordSuccessMessage.value = ''

  if (!isPasswordFormValid.value) {
    return
  }

  try {
    passwordLoading.value = true
    await updateProfile({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })

    passwordSuccessMessage.value = '密码更新成功！'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (err) {
    passwordError.value = err instanceof Error ? err.message : '密码更新失败'
  } finally {
    passwordLoading.value = false
  }
}

const resendVerification = async () => {
  try {
    // In real app, this would send a verification email
    await verifyEmail(`mock_token_${user.value?.id}`)
    profileSuccessMessage.value = '验证邮件已重新发送！'
  } catch (err) {
    profileError.value = err instanceof Error ? err.message : '发送失败'
  }
}

const formatDate = (date: Date | undefined): string => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-title {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin-bottom: 0.5rem;
}

.profile-subtitle {
  color: #666;
  font-size: 1rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
}

.form-input.error {
  border-color: #ff6b6b;
}

.email-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.email-input {
  flex: 1;
  min-width: 200px;
}

.verified-badge {
  padding: 0.25rem 0.5rem;
  background-color: #c6f6d5;
  color: #2f855a;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.unverified-badge {
  padding: 0.25rem 0.5rem;
  background-color: #fef5e7;
  color: #c05621;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.help-text {
  color: #718096;
  font-size: 0.8rem;
}

.link-button {
  background: none;
  border: none;
  color: #42b883;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
}

.link-button:hover {
  color: #3aa876;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.error-alert {
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  color: #c53030;
  font-size: 0.9rem;
}

.success-alert {
  padding: 0.75rem;
  background-color: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 4px;
  color: #2f855a;
  font-size: 0.9rem;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: #3aa876;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.account-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 500;
  color: #1e293b;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background-color: #dbeafe;
  color: #1e40af;
}

.verified-text {
  color: #2f855a;
}

.unverified-text {
  color: #c05621;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-section {
    padding: 1.5rem;
  }

  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>