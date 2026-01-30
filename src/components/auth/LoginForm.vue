<template>
  <div class="auth-form">
    <h2 class="auth-title">登录</h2>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="email" class="form-label">邮箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'error': errors.email }"
          placeholder="请输入邮箱"
          required
          @blur="validateEmail"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password" class="form-label">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          :class="{ 'error': errors.password }"
          placeholder="请输入密码"
          required
          @blur="validatePassword"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="form.rememberMe"
            class="checkbox"
          />
          <span class="checkbox-text">记住我</span>
        </label>
      </div>

      <div v-if="error" class="error-alert">
        {{ error }}
      </div>

      <button
        type="submit"
        class="submit-btn"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <div class="auth-links">
      <router-link to="/auth/reset-password" class="link">
        忘记密码？
      </router-link>
    </div>

    <div class="divider">
      <span class="divider-text">或使用社交账号登录</span>
    </div>

    <div class="social-auth">
      <button
        @click="handleSocialAuth('google')"
        class="social-btn google"
        :disabled="loading"
      >
        <span class="social-icon">🔍</span>
        Google
      </button>

      <button
        @click="handleSocialAuth('github')"
        class="social-btn github"
        :disabled="loading"
      >
        <span class="social-icon">🐙</span>
        GitHub
      </button>
    </div>

    <div class="auth-footer">
      <span>还没有账号？</span>
      <router-link to="/auth/register" class="link">
        立即注册
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { LoginCredentials, SocialProvider } from '@/types/auth'

const router = useRouter()
const { login, socialAuth, loading, error } = useAuth()

const form = ref<LoginCredentials & { rememberMe: boolean }>({
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref({
  email: '',
  password: ''
})

const validateEmail = () => {
  const email = form.value.email.trim()
  if (!email) {
    errors.value.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.value.email = '邮箱格式不正确'
  } else {
    errors.value.email = ''
  }
}

const validatePassword = () => {
  const password = form.value.password
  if (!password) {
    errors.value.password = '密码不能为空'
  } else if (password.length < 6) {
    errors.value.password = '密码至少需要6个字符'
  } else {
    errors.value.password = ''
  }
}

const isFormValid = computed(() => {
  return form.value.email &&
         form.value.password &&
         !errors.value.email &&
         !errors.value.password
})

const handleSubmit = async () => {
  validateEmail()
  validatePassword()

  if (!isFormValid.value) {
    return
  }

  try {
    await login({
      email: form.value.email,
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })
    router.push('/')
  } catch (err) {
    // Error is handled by useAuth
  }
}

const handleSocialAuth = async (provider: SocialProvider) => {
  try {
    await socialAuth({
      provider,
      accessToken: `mock_token_${provider}_${Date.now()}`
    })
    router.push('/')
  } catch (err) {
    // Error is handled by useAuth
  }
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
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: 300;
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

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  margin: 0;
}

.checkbox-text {
  font-size: 0.9rem;
  color: #666;
}

.error-alert {
  padding: 0.75rem;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  color: #c53030;
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

.auth-links {
  text-align: center;
  margin-top: 1rem;
}

.link {
  color: #42b883;
  text-decoration: none;
  font-size: 0.9rem;
}

.link:hover {
  text-decoration: underline;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e2e8f0;
}

.divider-text {
  background-color: white;
  padding: 0 1rem;
  color: #718096;
  font-size: 0.9rem;
}

.social-auth {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.social-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  color: #4a5568;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-btn:hover:not(:disabled) {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  font-size: 1.2rem;
}

.social-btn.google:hover:not(:disabled) {
  border-color: #db4437;
  color: #db4437;
}

.social-btn.github:hover:not(:disabled) {
  border-color: #333;
  color: #333;
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: #718096;
  font-size: 0.9rem;
}

.auth-footer .link {
  margin-left: 0.5rem;
}
</style>