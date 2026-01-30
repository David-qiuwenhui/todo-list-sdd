<template>
  <div id="app">
    <!-- App Header with Navigation -->
    <header class="app-header" v-if="isAuthenticated">
      <div class="header-content">
        <router-link to="/" class="app-logo">
          <h1>待办清单</h1>
        </router-link>

        <nav class="app-nav">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            任务列表
          </router-link>

          <router-link
            to="/profile"
            class="nav-link"
            :class="{ active: $route.path === '/profile' }"
          >
            个人资料
          </router-link>

          <router-link
            v-if="isAdmin"
            to="/admin"
            class="nav-link admin-link"
            :class="{ active: $route.path === '/admin' }"
          >
            管理面板
          </router-link>
        </nav>

        <div class="user-menu">
          <div class="user-info" @click="toggleUserMenu" ref="userMenuRef">
            <span class="username">{{ user?.username }}</span>
            <span class="user-role" :class="user?.role?.toLowerCase()">{{
              user?.role === 'ADMIN' ? '管理员' : '用户'
            }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>

          <div v-if="showUserMenu" class="user-dropdown">
            <div class="dropdown-item user-details">
              <span class="detail-label">邮箱:</span>
              <span class="detail-value">{{ user?.email }}</span>
              <span v-if="user?.emailVerified" class="verified-badge">✓ 已验证</span>
              <span v-else class="unverified-badge">⚠ 未验证</span>
            </div>

            <div class="dropdown-divider"></div>

            <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
              个人资料
            </router-link>

            <button @click="handleLogout" class="dropdown-item logout-btn">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Global Error Alert -->
    <div v-if="error" class="global-error">
      <div class="error-content">
        <span class="error-message">{{ error }}</span>
        <button @click="clearError" class="error-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import TodoList from './components/TodoList.vue'

const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, isAdmin, loading, error, logout, clearError } = useAuth()

const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

// Toggle user menu
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Close user menu
const closeUserMenu = () => {
  showUserMenu.value = false
}

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  showUserMenu.value = false
  try {
    await logout()
    router.push('/auth/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Close menu on route change
router.afterEach(() => {
  showUserMenu.value = false
})

// Event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

<style>
html,
body {
  margin: 0;
  padding: 0;
}

body {
  font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.4em;
  background: #f5f5f5;
  color: #4d4d4d;
  min-width: 230px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 300;
}

#app {
  width: 100%;
  min-height: 100vh;
}

:focus {
  outline: 2px solid #42b883;
  outline-offset: 2px;
}

.hidden {
  display: none;
}

/* App Header */
.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-logo {
  text-decoration: none;
}

.app-logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 300;
  color: #42b883;
}

.app-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: #42b883;
  border-bottom-color: #42b883;
}

.nav-link.admin-link {
  color: #dc2626;
}

.nav-link.admin-link:hover,
.nav-link.admin-link.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info:hover {
  background: #e2e8f0;
}

.username {
  font-weight: 500;
  color: #1e293b;
}

.user-role {
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.user-role.admin {
  background: #fef3c7;
  color: #92400e;
}

.user-role.user {
  background: #dbeafe;
  color: #1e40af;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #64748b;
  transition: transform 0.2s;
}

.user-info:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  border: none;
  background: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item.user-details {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: default;
}

.dropdown-item.user-details:hover {
  background: #f8fafc;
}

.detail-label {
  font-weight: 500;
  color: #64748b;
  margin-right: 0.5rem;
}

.detail-value {
  color: #1e293b;
}

.verified-badge,
.unverified-badge {
  margin-left: 0.5rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.verified-badge {
  background: #c6f6d5;
  color: #2f855a;
}

.unverified-badge {
  background: #fef5e7;
  color: #c05621;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.logout-btn {
  color: #dc2626;
}

.logout-btn:hover {
  background: #fef2f2;
}

/* Main Content */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Global Error Alert */
.global-error {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

.error-content {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-message {
  color: #c53030;
  font-size: 0.9rem;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #c53030;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.error-close:hover {
  background: #fed7d7;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Admin Page */
.admin-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-page h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

/* Not Found Page */
.not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.not-found h1 {
  font-size: 4rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.home-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.home-link:hover {
  background: #3aa876;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .app-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }

  .app-main {
    padding: 1rem;
  }

  .user-dropdown {
    right: auto;
    left: 0;
  }

  .global-error {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .app-nav {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .user-info {
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>