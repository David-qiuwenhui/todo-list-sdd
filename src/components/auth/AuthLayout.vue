<template>
  <div class="auth-layout">
    <div class="auth-background">
      <div class="auth-container">
        <div class="auth-header">
          <router-link to="/" class="auth-logo">
            <h1 class="logo-text">待办清单</h1>
          </router-link>
          <p class="auth-description">
            {{ description }}
          </p>
        </div>

        <div class="auth-content">
          <slot></slot>
        </div>

        <div class="auth-footer">
          <div class="footer-links">
            <router-link to="/" class="footer-link">
              ← 返回首页
            </router-link>
          </div>
          <div class="footer-info">
            <p class="footer-text">
              演示版本 - 所有数据仅保存在本地浏览器中
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const description = computed(() => {
  switch (route.path) {
    case '/auth/login':
      return '登录您的账户，开始管理您的待办事项'
    case '/auth/register':
      return '创建新账户，开始使用我们的待办事项管理工具'
    case '/auth/reset-password':
      return '重置您的密码，重新获得账户访问权限'
    default:
      return '欢迎使用待办事项管理系统'
  }
})
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-background {
  width: 100%;
  max-width: 480px;
}

.auth-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.auth-logo {
  text-decoration: none;
  display: block;
  margin-bottom: 1rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: 300;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-description {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.4;
}

.auth-content {
  padding: 2rem;
}

.auth-footer {
  padding: 1.5rem 2rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.footer-links {
  text-align: center;
  margin-bottom: 1rem;
}

.footer-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #42b883;
}

.footer-info {
  text-align: center;
}

.footer-text {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .auth-layout {
    padding: 1rem;
  }

  .auth-background {
    max-width: 100%;
  }

  .auth-container {
    border-radius: 8px;
  }

  .auth-header {
    padding: 1.5rem 1.5rem 0.75rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }

  .auth-description {
    font-size: 0.9rem;
  }

  .auth-content {
    padding: 1.5rem;
  }

  .auth-footer {
    padding: 1rem 1.5rem;
  }
}

/* Animation for smooth transitions */
.auth-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus styles for accessibility */
.auth-logo:focus {
  outline: 2px solid #42b883;
  outline-offset: 2px;
  border-radius: 4px;
}

.footer-link:focus {
  outline: 2px solid #42b883;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>