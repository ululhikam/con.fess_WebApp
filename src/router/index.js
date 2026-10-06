import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Routes are code-split with dynamic `import()` so each screen ships as its
 * own chunk — the visitor only downloads what they navigate to.
 */
const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingPage.vue'),
    meta: { title: 'Beranda' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { title: 'Masuk', layout: 'auth' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { title: 'Daftar', layout: 'auth' },
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('../views/FeedPage.vue'),
    meta: { requiresAuth: true, title: 'Feed' },
  },
  {
    path: '/create',
    name: 'CreateFess',
    component: () => import('../views/CreateFessPage.vue'),
    meta: { requiresAuth: true, title: 'Buat Fess' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue'),
    meta: { requiresAuth: true, title: 'Profil' },
  },
  {
    path: '/base-admin',
    name: 'BaseAdmin',
    component: () => import('../views/BaseAdminDashboard.vue'),
    meta: {
      requiresAuth: true,
      roles: ['Base Admin', 'Super Admin'],
      title: 'Base Admin',
    },
  },
  {
    path: '/super-admin',
    name: 'SuperAdmin',
    component: () => import('../views/SuperAdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['Super Admin'], title: 'Super Admin' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
    meta: { title: 'Tidak ditemukan' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  /** Respect in-page anchors and restore scroll on back/forward. */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 };
    return { top: 0 };
  },
});

/** Global guard: auth -> role -> document title. */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
    return next({ name: 'Feed' });
  }

  next();
});

router.afterEach((to) => {
  const base = 'FessHub';
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base;
});

export default router;
