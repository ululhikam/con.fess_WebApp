import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import FeedPage from '../views/FeedPage.vue'
import BaseAdminDashboard from '../views/BaseAdminDashboard.vue'
import SuperAdminDashboard from '../views/SuperAdminDashboard.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/feed', name: 'Feed', component: FeedPage, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: ProfilePage, meta: { requiresAuth: true } },
  {
    path: '/base-admin',
    name: 'BaseAdmin',
    component: BaseAdminDashboard,
    meta: { requiresAuth: true, roles: ['Base Admin', 'Super Admin'] }
  },
  {
    path: '/super-admin',
    name: 'SuperAdmin',
    component: SuperAdminDashboard,
    meta: { requiresAuth: true, roles: ['Super Admin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' })
  }
  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    return next({ name: 'Feed' })
  }
  next()
})

export default router
