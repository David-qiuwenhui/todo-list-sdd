<template>
  <div class="auth-form">
    <h2 class="auth-title">注册账号</h2>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="username" class="form-label">用户名</label>
        <input
          id="username"
          v-model="form.username"
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

      <div class="form-group">
        <label for="confirmPassword" class="form-label">确认密码</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          class="form-input"
          :class="{ 'error': errors.confirmPassword }"
          placeholder="请再次输入密码"
          required
          @blur="validateConfirmPassword"
        />
        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            v-model="form.acceptTerms"
            class="checkbox"
            required
          />
          <span class="checkbox-text">
            我同意
            <a href="#" class="link">服务条款</a>
            和
            <a href="#" class="link">隐私政策</a>
          </span>
        </label>
        <span v-if="errors.acceptTerms" class="error-message">{{ errors.acceptTerms }}</span>
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
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>

    <div class="auth-footer">
      <span>已有账号？</span>
      <router-link to="/auth/login" class="link">
        立即登录
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { RegisterData } from '@/types/auth'

const router = useRouter()
const { register, loading, error } = useAuth()

const form = ref<RegisterData & { acceptTerms: boolean }>({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const validateUsername = () => {
  const username = form.value.username.trim()
  if (!username) {
    errors.value.username = '用户名不能为空'
  } else if (username.length < 3) {
    errors.value.username = '用户名至少需要3个字符'
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
    errors.value.username = '用户名只能包含字母、数字、下划线和中文'
  } else {
    errors.value.username = ''
  }
}

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
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    errors.value.password = '密码需要包含字母和数字'
  } else {
    errors.value.password = ''
  }

  // Re-validate confirm password if it's already filled
  if (form.value.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  const confirmPassword = form.value.confirmPassword
  if (!confirmPassword) {
    errors.value.confirmPassword = '请确认密码'
  } else if (confirmPassword !== form.value.password) {
    errors.value.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.value.confirmPassword = ''
  }
}

const validateAcceptTerms = () => {
  if (!form.value.acceptTerms) {
    errors.value.acceptTerms = '请同意服务条款和隐私政策'
  } else {
    errors.value.acceptTerms = ''
  }
}

const isFormValid = computed(() => {
  return form.value.email &&
         form.value.username &&
         form.value.password &&
         form.value.confirmPassword &&
         form.value.acceptTerms &&
         !errors.value.email &&
         !errors.value.username &&
         !errors.value.password &&
         !errors.value.confirmPassword &&
         !errors.value.acceptTerms
})

const handleSubmit = async () => {
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  validateAcceptTerms()

  if (!isFormValid.value) {
    return
  }

  try {
    await register({
      email: form.value.email,
      username: form.value.username,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword
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
  flex-direction: column;
  align-items: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  line-height: 1.4;
}

.checkbox {
  margin: 0;
  margin-top: 0.2rem;
}

.checkbox-text {
  font-size: 0.9rem;
  color: #666;
  flex: 1;
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
  color: #718096;
  font-size: 0.9rem;
}

.auth-footer .link {
  margin-left: 0.5rem;
}
</style>