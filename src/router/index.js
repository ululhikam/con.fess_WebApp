import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Routes are code-split with dynamic `import()` so each screen ships as its
 * own chunk — the visitor only downloads what they navigate to.
 *
 * Strict Role Separation:
 *  • User Portal: Feed, CreateFess, Profile (roles: ['User'])
 *  • Admin Portal: BaseAdmin (roles: ['Base Admin', 'Super Admin']), SuperAdmin (roles: ['Super Admin'])
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
    meta: { title: 'Masuk', layout: 'auth', guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterUserPage.vue'),
    meta: { title: 'Daftar Akun User', layout: 'auth', guestOnly: true },
  },
  {
    path: '/register/user',
    name: 'RegisterUser',
    component: () => import('../views/RegisterUserPage.vue'),
    meta: { title: 'Daftar Akun User', layout: 'auth', guestOnly: true },
  },
  {
    path: '/register-user',
    redirect: '/register/user',
  },
  {
    path: '/register/base',
    name: 'RegisterBase',
    component: () => import('../views/RegisterPage.vue'),
    meta: { title: 'Buat Akun Base', layout: 'auth', guestOnly: true },
  },
  {
    path: '/register-base',
    redirect: '/register/base',
  },
  {
    /**
     * Activation gate: a Base Admin account without a managed base must
     * finish this wizard before entering the admin portal (see router guard).
     */
    path: '/onboarding/base',
    name: 'BaseOnboarding',
    component: () => import('../views/BaseOnboardingPage.vue'),
    meta: { requiresAuth: true, roles: ['Base Admin'], title: 'Lengkapi Profil Base' },
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('../views/FeedPage.vue'),
    meta: { requiresAuth: true, roles: ['User'], title: 'Feed' },
  },
  {
    path: '/create',
    name: 'CreateFess',
    component: () => import('../views/CreateFessPage.vue'),
    meta: { requiresAuth: true, roles: ['User', 'Base Admin'], title: 'Buat Fess' },
  },
  {
    path: '/profile',
    name: 'Profile',
    redirect: { path: '/feed', query: { tab: 'profile' } },
  },
  {
    path: '/base/:handle',
    name: 'BasePublicProfile',
    component: () => import('../views/BasePublicProfilePage.vue'),
    meta: {
      requiresAuth: true,
      roles: ['User', 'Base Admin', 'Super Admin'],
      title: 'Profil Base',
    },
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

/** Global guard: auth -> base-admin onboarding gate -> role separation -> title. */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const userRole = authStore.user?.role;
  const hasManagedBase = (authStore.user?.managedBases?.length ?? 0) > 0;
  const needsBaseOnboarding = userRole === 'Base Admin' && !hasManagedBase;

  // 1. Protected route: requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 2. Guest-only routes (Login / Register): redirect already logged-in users to their respective home
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    if (userRole === 'Super Admin') return next({ name: 'SuperAdmin' });
    if (userRole === 'Base Admin') {
      return next(needsBaseOnboarding ? { name: 'BaseOnboarding' } : { name: 'BaseAdmin' });
    }
    return next({ name: 'Feed' });
  }

  // 3. Base Admin without a base: force the onboarding wizard (create base profile)
  if (needsBaseOnboarding && to.name !== 'BaseOnboarding') {
    return next({ name: 'BaseOnboarding' });
  }
  if (to.name === 'BaseOnboarding' && !needsBaseOnboarding) {
    if (userRole === 'Super Admin') return next({ name: 'SuperAdmin' });
    if (userRole === 'Base Admin') return next({ name: 'BaseAdmin' });
    return next({ name: 'Feed' });
  }

  // 4. Strict Role Access Control:
  // If route specifies allowed roles, check if current user matches
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    // Send to appropriate home based on current role
    if (userRole === 'Super Admin') {
      return next({ name: 'SuperAdmin' });
    }
    if (userRole === 'Base Admin') {
      return next(needsBaseOnboarding ? { name: 'BaseOnboarding' } : { name: 'BaseAdmin' });
    }
    return next({ name: 'Feed' });
  }

  next();
});

router.afterEach((to) => {
  const base = 'Fess n Curious';
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base;
});

export default router;
