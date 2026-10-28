<template>
  <div class="pc-console">
    <AdminTopNav active="super-admin" sticky />

    <div class="container pc-layout">
      <aside class="pc-sidebar" aria-label="Navigasi konsol platform">
        <div class="pc-sidebar__head">
          <p class="pc-sidebar__eyebrow">Platform operations</p>
          <p class="pc-sidebar__title">Konsol Super Admin</p>
        </div>

        <nav class="pc-sidebar__nav">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.to"
            class="pc-nav-link"
            :class="{ active: route.name === item.name }"
            :aria-current="route.name === item.name ? 'page' : null"
          >
            <component :is="item.icon" :size="15" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="pc-sidebar__foot">
          <div class="pc-inline" style="margin-bottom: 6px">
            <ConsoleStatusBadge status="Super Admin" />
            <span>Akses platform</span>
          </div>
          Operasi base dikelola Base Admin. Konsol ini fokus pada keuangan,
          pengguna, keamanan, dan integrasi platform.
        </div>
      </aside>

      <main class="pc-shell">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  LayoutTemplate,
  Settings2,
  ShieldCheck,
  UsersRound,
  Wallet,
} from 'lucide-vue-next';
import AdminTopNav from '../../components/admin/AdminTopNav.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';

const route = useRoute();

const navigation = [
  {
    name: 'SuperAdminOverview',
    label: 'Ringkasan',
    to: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    name: 'SuperAdminTemplates',
    label: 'Template Kartu',
    to: '/super-admin/templates',
    icon: LayoutTemplate,
  },
  {
    name: 'SuperAdminFinance',
    label: 'Keuangan',
    to: '/super-admin/keuangan',
    icon: Wallet,
  },
  {
    name: 'SuperAdminUsers',
    label: 'Pengguna & Akses',
    to: '/super-admin/pengguna',
    icon: UsersRound,
  },
  {
    name: 'SuperAdminSecurity',
    label: 'Keamanan & Audit',
    to: '/super-admin/keamanan',
    icon: ShieldCheck,
  },
  {
    name: 'SuperAdminSystem',
    label: 'Sistem & Integrasi',
    to: '/super-admin/sistem',
    icon: Settings2,
  },
];
</script>
