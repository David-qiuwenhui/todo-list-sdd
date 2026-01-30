<template>
  <div class="auth-form">
    <template v-if="!showResetForm">
      <h2 class="auth-title">重置密码</h2>
      <p class="auth-description">
        请输入您的邮箱地址，我们将发送重置密码的链接到您的邮箱。
      </p>

      <form @submit.prevent="handleRequestReset" class="form">
        <div class="form-group">
          <label for="email" class="form-label">邮箱</label>
          <input
            id="email"
            v-model="emailForm.email"
            type="email"
            class="form-input"
            :class="{ 'error': emailFormErrors.email }"
            placeholder="请输入注册邮箱"
            required
            @blur="validateEmail"
          />
          <span v-if="emailFormErrors.email" class="error-message">{{ emailFormErrors.email }}</span>
        </div>

        <div v-if="emailFormError" class="error-alert">
          {{ emailFormError }}
        </div>

        <div v-if="emailSuccessMessage" class="success-alert">
          {{ emailSuccessMessage }}
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="emailFormLoading || !isEmailFormValid"
        >
          <span v-if="emailFormLoading" class="loading-spinner"></span>
          {{ emailFormLoading ? '发送中...' : '发送重置链接' }}
        </button>
      </form>
    </template>

    <template v-else>
      <h2 class="auth-title">设置新密码</h2>
      <p class="auth-description">
        请设置您的新密码。
      </p>

      <form @submit.prevent="handleResetPassword" class="form">
        <div class="form-group">
          <label for="newPassword" class="form-label">新密码</label>
          <input
            id="newPassword"
            v-model="resetForm.newPassword"
            type="password"
            class="form-input"
            :class="{ 'error': resetFormErrors.newPassword }"
            placeholder="请输入新密码"
            required
            @blur="validateNewPassword"
          />
          <span v-if="resetFormErrors.newPassword" class="error-message">{{ resetFormErrors.newPassword }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认新密码</label>
          <input
            id="confirmPassword"
            v-model="resetForm.confirmPassword"
            type="password"
            class="form-input"
            :class="{ 'error': resetFormErrors.confirmPassword }"
            placeholder="请再次输入新密码"
            required
            @blur="validateConfirmPassword"
          />
          <span v-if="resetFormErrors.confirmPassword" class="error-message">{{ resetFormErrors.confirmPassword }}</span>
        </div>

        <div v-if="resetFormError" class="error-alert">
          {{ resetFormError }}
        </div>

        <div v-if="resetSuccessMessage" class="success-alert">
          {{ resetSuccessMessage }}
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="resetFormLoading || !isResetFormValid"
        >
          <span v-if="resetFormLoading" class="loading-spinner"></span>
          {{ resetFormLoading ? '重置中...' : '重置密码' }}
        </button>
      </form>
    </template>

    <div class="auth-footer">
      <router-link to="/auth/login" class="link">
        返回登录
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { PasswordResetRequest, PasswordResetConfirm } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const { requestPasswordReset, confirmPasswordReset, loading, error } = useAuth()

const showResetForm = ref(false)

// Email form state
const emailForm = ref<PasswordResetRequest>({
  email: ''
})

const emailFormErrors = ref({
  email: ''
})

const emailFormLoading = ref(false)
const emailFormError = ref('')
const emailSuccessMessage = ref('')

// Reset form state
const resetForm = ref({
  token: '',
  newPassword: '',
  confirmPassword: ''
})

const resetFormErrors = ref({
  newPassword: '',
  confirmPassword: ''
})

const resetFormLoading = ref(false)
const resetFormError = ref('')
const resetSuccessMessage = ref('')

const validateEmail = () => {
  const email = emailForm.value.email.trim()
  if (!email) {
    emailFormErrors.value.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailFormErrors.value.email = '邮箱格式不正确'
  } else {
    emailFormErrors.value.email = ''
  }
}

const validateNewPassword = () => {
  const password = resetForm.value.newPassword
  if (!password) {
    resetFormErrors.value.newPassword = '密码不能为空'
  } else if (password.length < 6) {
    resetFormErrors.value.newPassword = '密码至少需要6个字符'
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    resetFormErrors.value.newPassword = '密码需要包含字母和数字'
  } else {
    resetFormErrors.value.newPassword = ''
  }

  // Re-validate confirm password if it's already filled
  if (resetForm.value.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  const confirmPassword = resetForm.value.confirmPassword
  if (!confirmPassword) {
    resetFormErrors.value.confirmPassword = '请确认密码'
  } else if (confirmPassword !== resetForm.value.newPassword) {
    resetFormErrors.value.confirmPassword = '两次输入的密码不一致'
  } else {
    resetFormErrors.value.confirmPassword = ''
  }
}

const isEmailFormValid = computed(() => {
  return emailForm.value.email && !emailFormErrors.value.email
})

const isResetFormValid = computed(() => {
  return resetForm.value.newPassword &&
         resetForm.value.confirmPassword &&
         !resetFormErrors.value.newPassword &&
         !resetFormErrors.value.confirmPassword
})

const handleRequestReset = async () => {
  validateEmail()
  emailFormError.value = ''
  emailSuccessMessage.value = ''

  if (!isEmailFormValid.value) {
    return
  }

  try {
    emailFormLoading.value = true
    const message = await requestPasswordReset(emailForm.value)
    emailSuccessMessage.value = message
  } catch (err) {
    emailFormError.value = err instanceof Error ? err.message : '发送失败'
  } finally {
    emailFormLoading.value = false
  }
}

const handleResetPassword = async () => {
  validateNewPassword()
  validateConfirmPassword()
  resetFormError.value = ''
  resetSuccessMessage.value = ''

  if (!isResetFormValid.value) {
    return
  }

  try {
    resetFormLoading.value = true
    const message = await confirmPasswordReset({
      token: resetForm.value.token,
      newPassword: resetForm.value.newPassword,
      confirmPassword: resetForm.value.confirmPassword
    })
    resetSuccessMessage.value = message

    // Redirect to login after successful reset
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err) {
    resetFormError.value = err instanceof Error ? err.message : '重置失败'
  } finally {
    resetFormLoading.value = false
  }
}

// Check if we have a token in the URL (for direct reset link)
if (route.query.token) {
  showResetForm.value = true
  resetForm.value.token = route.query.token as string
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.auth-title {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: 300;
}

.auth-description {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.link {
  color: #42b883;
  text-decoration: none;
  font-size: 0.9rem;
}

.link:hover {
  text-decoration: underline;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
}
</style>