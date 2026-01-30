import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { UserRole } from '@/types/auth'

// Lazy load components for better performance
const TodoList = () => import('@/components/TodoList.vue')
const LoginForm = () => import('@/components/auth/LoginForm.vue')
const RegisterForm = () => import('@/components/auth/RegisterForm.vue')
const PasswordResetForm = () => import('@/components/auth/PasswordResetForm.vue')
const UserProfile = () => import('@/components/auth/UserProfile.vue')
const AuthLayout = () => import('@/components/auth/AuthLayout.vue')

// Route meta fields interface
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    requiredRole?: UserRole
    layout?: 'default' | 'auth'
  }
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: TodoList,
    meta: {
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginForm,
        meta: {
          requiresGuest: true,
          layout: 'auth'
        }
      },
      {
        path: 'register',
        name: 'Register',
        component: RegisterForm,
        meta: {
          requiresGuest: true,
          layout: 'auth'
        }
      },
      {
        path: 'reset-password',
        name: 'PasswordReset',
        component: PasswordResetForm,
        meta: {
          requiresGuest: true,
          layout: 'auth'
        }
      },
      {
        path: '',
        redirect: '/auth/login'
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfile,
    meta: {
      requiresAuth: true,
      layout: 'default'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: {
      template: '<div class="admin-page"><h2>管理员面板</h2><p>这是一个管理员专用页面。</p></div>'
    },
    meta: {
      requiresAuth: true,
      requiredRole: 'ADMIN',
      layout: 'default'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      template: `
        <div class="not-found">
          <h1>404</h1>
          <p>页面未找到</p>
          <router-link to="/" class="home-link">返回首页</router-link>
        </div>
      `
    },
    meta: {
      layout: 'default'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll to top on route change
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, user, loading } = useAuth()

  // Wait for auth to initialize
  while (loading.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const requiredRole = to.meta.requiredRole

  // Check if route requires authentication
  if (requiresAuth && !isAuthenticated.value) {
    // Save the intended destination for redirect after login
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Check if route requires guest (no authentication)
  if (requiresGuest && isAuthenticated.value) {
    // Redirect to home or intended destination
    const redirect = from.query.redirect as string || '/'
    next(redirect)
    return
  }

  // Check role-based access
  if (requiredRole && user.value) {
    const { hasPermission } = useAuth()
    if (!hasPermission(requiredRole)) {
      // User doesn't have required role
      next('/')
      return
    }
  }

  // All checks passed, proceed
  next()
})

// Global afterEach hook for analytics or logging
router.afterEach((to, from) => {
  // You can add analytics tracking here
  console.log(`Navigated from ${from.fullPath} to ${to.fullPath}`)
})

export default router