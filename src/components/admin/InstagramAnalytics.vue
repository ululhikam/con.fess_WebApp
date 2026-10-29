<template>
  <section class="ig-analytics" aria-label="Analitik Instagram">
    <header class="ig-head">
      <div class="ig-head-left">
        <span class="ig-logo" aria-hidden="true">
          <Instagram :size="17" />
        </span>
        <div class="ig-head-copy">
          <div class="ig-title">Instagram</div>
          <div class="ig-sub">
            <span>{{ account?.handle || 'Belum terhubung' }}</span>
            <template v-if="lastSyncLabel">
              <span class="ig-dot">•</span>
              <span>{{ lastSyncLabel }}</span>
            </template>
          </div>
        </div>
      </div>

      <button type="button" class="ig-refresh" :disabled="loading" @click="refresh">
        <RefreshCw :size="13" :class="{ 'ig-spin': loading }" aria-hidden="true" />
        <span>{{ loading ? 'Memuat…' : 'Perbarui' }}</span>
      </button>
    </header>

    <div v-if="loading && !hasAccountData" class="ig-skeleton" aria-live="polite">
      <span class="ig-skel-line" />
      <span class="ig-skel-line" />
      <span class="ig-skel-line" />
    </div>

    <div v-else-if="!hasConnection" class="ig-empty">
      <span class="ig-empty-icon"><Instagram :size="22" /></span>
      <div>
        <div class="ig-empty-title">Instagram belum terhubung</div>
        <p class="ig-empty-text">{{ notConnectedMessage }}</p>
        <div class="ig-empty-actions">
          <button type="button" class="ig-btn primary" @click="$emit('open-connections')">
            Hubungkan Instagram
          </button>
          <button type="button" class="ig-btn" :disabled="loading" @click="refresh">
            Periksa Koneksi
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="errorMessage" class="ig-empty ig-empty-error" role="alert">
      <span class="ig-empty-icon"><RefreshCw :size="20" /></span>
      <div>
        <div class="ig-empty-title">Gagal memuat analitik Instagram</div>
        <p class="ig-empty-text">{{ errorMessage }}</p>
        <button type="button" class="ig-btn" @click="refresh">Coba Lagi</button>
      </div>
    </div>

    <template v-else>
      <!-- ============================ RINGKASAN ============================ -->
      <template v-if="section === 'summary'">
        <div class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">Matriks Kinerja</h4>
              <p class="ig-panel-sub">Dibandingkan dengan 7 hari sebelumnya</p>
            </div>
            <span class="ig-badge">{{ rangeLabel }}</span>
          </div>

          <div class="ig-matrix-wrap">
            <table class="ig-matrix">
              <thead>
                <tr>
                  <th scope="col">Metrik</th>
                  <th scope="col" class="ig-num">{{ rangeLabel }}</th>
                  <th scope="col" class="ig-num">7 hari</th>
                  <th scope="col" class="ig-num">Perubahan</th>
                  <th scope="col">Tren</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in summaryMetrics" :key="m.metric" :class="{ 'is-muted': !m.available }">
                  <th scope="row" class="ig-metric-name">
                    {{ m.label }}
                    <span v-if="!m.available && !hasFollowerFallback(m)" class="ig-mini-note">tidak tersedia</span>
                  </th>
                  <td class="ig-num">{{ formatPeriodCell(m) }}</td>
                  <td class="ig-num">{{ hasComparison(m) ? formatNumber(m.last7) : '—' }}</td>
                  <td class="ig-num">
                    <span v-if="hasComparison(m)" class="ig-delta" :class="deltaClass(m)">
                      <component
                        :is="m.change >= 0 ? ArrowUpRight : ArrowDownRight"
                        :size="12"
                        aria-hidden="true"
                      />
                      <span>{{ formatDelta(m) }}</span>
                      <small v-if="m.changePct !== null">{{ formatDeltaPct(m) }}</small>
                    </span>
                    <span v-else>—</span>
                  </td>
                  <td>
                    <svg
                      v-if="hasTrend(m)"
                      class="ig-spark"
                      viewBox="0 0 80 24"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <polyline :points="sparkPoints(m)" />
                    </svg>
                    <span v-else class="ig-mini-note">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="ig-note ig-matrix-note">
            Total Pengikut: kolom 7 hari = posisi 7 hari lalu, perubahan = net follow − unfollow.
            Pengikut Baru: kolom 7 hari = jumlah follow baru (gross), perubahan dibanding 7 hari
            sebelumnya. Metrik total periode ditandai — pada kolom tren.
          </p>
        </div>

        <div class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">{{ summaryChartTitle }}</h4>
              <p class="ig-panel-sub">{{ rangeLabel }} · data harian Meta</p>
            </div>
            <div class="ig-legend">
              <span v-for="s in summaryChart.series" :key="s.key" class="ig-legend-item">
                <i :style="{ background: s.color }" aria-hidden="true" />
                {{ s.label }}
              </span>
            </div>
          </div>

          <div v-if="summaryChart.series.length" class="ig-chart">
            <svg
              :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
              role="img"
              aria-label="Grafik tren jangkauan dan tayangan Instagram"
            >
              <defs>
                <linearGradient
                  v-for="s in summaryChart.series"
                  :id="`ig-area-${s.key}`"
                  :key="`grad-${s.key}`"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" :stop-color="s.color" stop-opacity="0.26" />
                  <stop offset="100%" :stop-color="s.color" stop-opacity="0" />
                </linearGradient>
              </defs>

              <g class="ig-grid">
                <line
                  v-for="line in chartGridLines"
                  :key="`grid-${line.y}`"
                  :x1="CHART_PAD_X"
                  :x2="CHART_WIDTH - CHART_PAD_X"
                  :y1="line.y"
                  :y2="line.y"
                />
              </g>

              <g v-for="s in summaryChart.series" :key="`series-${s.key}`">
                <path :d="s.areaPath" :fill="`url(#ig-area-${s.key})`" />
                <path :d="s.linePath" fill="none" :stroke="s.color" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </g>

              <g class="ig-grid-labels">
                <text
                  v-for="label in chartYLabels"
                  :key="`y-${label.y}`"
                  :x="CHART_WIDTH - CHART_PAD_X"
                  :y="label.y - 4"
                  text-anchor="end"
                >
                  {{ label.text }}
                </text>
              </g>

              <g class="ig-axis-labels">
                <text
                  v-for="label in chartXLabels"
                  :key="`x-${label.x}`"
                  :x="label.x"
                  :y="CHART_HEIGHT - 6"
                  :text-anchor="label.anchor"
                >
                  {{ label.text }}
                </text>
              </g>
            </svg>
          </div>
          <p v-else class="ig-note">
            Data tren belum tersedia dari Meta. Pastikan izin <strong>instagram_business_manage_insights</strong>
            aktif pada koneksi Instagram.
          </p>
        </div>

        <div v-if="!hasAnyMetric" class="ig-panel ig-panel-warning">
          <ShieldAlert :size="16" aria-hidden="true" />
          <div>
            <p>
              Meta tidak mengembalikan metrik akun. Koneksi Instagram kemungkinan tidak memiliki izin
              insights atau akun bukan Business/Creator.
            </p>
            <button type="button" class="ig-btn" @click="$emit('open-connections')">
              Hubungkan Ulang Instagram
            </button>
          </div>
        </div>
      </template>

      <!-- ============================ KONTEN ============================ -->
      <template v-else-if="section === 'content'">
        <div class="ig-stat-row">
          <div class="ig-stat">
            <span class="ig-stat-label">Interaksi 6 konten</span>
            <strong class="ig-stat-value">{{ formatNumber(mediaTotals.interactions) }}</strong>
            <small class="ig-stat-hint">suka + komentar + simpan + bagikan</small>
          </div>
          <div class="ig-stat">
            <span class="ig-stat-label">Tayangan konten</span>
            <strong class="ig-stat-value">{{ formatNumber(mediaTotals.views) }}</strong>
            <small class="ig-stat-hint">total views media terbaru</small>
          </div>
          <div class="ig-stat">
            <span class="ig-stat-label">Rata-rata reach</span>
            <strong class="ig-stat-value">{{ formatNumber(mediaTotals.avgReach) }}</strong>
            <small class="ig-stat-hint">per konten terbaru</small>
          </div>
        </div>

        <div class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">Matriks Konten Instagram</h4>
              <p class="ig-panel-sub">6 konten terbaru dari akun base</p>
            </div>
            <button type="button" class="ig-mini-refresh" :disabled="mediaLoading" @click="refreshMedia">
              <RefreshCw :size="12" :class="{ 'ig-spin': mediaLoading }" aria-hidden="true" />
              {{ mediaLoading ? 'Memuat…' : 'Perbarui konten' }}
            </button>
          </div>

          <div v-if="mediaLoading && !media.length" class="ig-skeleton">
            <span class="ig-skel-line" />
            <span class="ig-skel-line" />
            <span class="ig-skel-line" />
          </div>

          <p v-else-if="mediaError" class="ig-note ig-note-error">
            {{ mediaError.message || 'Gagal memuat konten Instagram.' }}
          </p>

          <div v-else-if="media.length" class="ig-media-list">
            <article v-for="item in media" :key="item.id" class="ig-media-row">
              <a
                :href="safePermalink(item.permalink) || undefined"
                :target="safePermalink(item.permalink) ? '_blank' : undefined"
                :rel="safePermalink(item.permalink) ? 'noopener noreferrer' : undefined"
                class="ig-media-thumb"
                :aria-label="`Buka konten Instagram ${shortCaption(item)}`"
              >
                <img
                  v-if="item.thumbnailUrl || item.mediaUrl"
                  :src="item.thumbnailUrl || item.mediaUrl"
                  alt=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                <Instagram v-else :size="18" aria-hidden="true" />
              </a>

              <div class="ig-media-main">
                <div class="ig-media-top">
                  <span class="ig-media-type">{{ mediaTypeLabel(item) }}</span>
                  <span class="ig-media-date">{{ formatDate(item.timestamp) }}</span>
                </div>
                <p class="ig-media-caption">{{ item.caption || 'Tanpa caption' }}</p>
                <div class="ig-media-metrics">
                  <span><Eye :size="12" aria-hidden="true" /> {{ formatNumber(item.insights?.views) }}</span>
                  <span><Radio :size="12" aria-hidden="true" /> {{ formatNumber(item.insights?.reach) }}</span>
                  <span><Heart :size="12" aria-hidden="true" /> {{ formatNumber(item.insights?.likes ?? item.likeCount) }}</span>
                  <span><MessageSquare :size="12" aria-hidden="true" /> {{ formatNumber(item.insights?.comments ?? item.commentsCount) }}</span>
                  <span><Bookmark :size="12" aria-hidden="true" /> {{ formatNumber(item.insights?.saved) }}</span>
                  <span><Share2 :size="12" aria-hidden="true" /> {{ formatNumber(item.insights?.shares) }}</span>
                </div>
              </div>

              <a
                v-if="safePermalink(item.permalink)"
                :href="safePermalink(item.permalink)"
                target="_blank"
                rel="noopener noreferrer"
                class="ig-media-link"
                aria-label="Buka di Instagram"
              >
                <ExternalLink :size="14" />
              </a>
            </article>
          </div>

          <p v-else class="ig-note">
            {{ mediaMessage || 'Belum ada konten Instagram yang bisa dianalisis.' }}
          </p>
        </div>

        <div v-if="media.length" class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">Interaksi per Konten</h4>
              <p class="ig-panel-sub">Total interaksi tiap media</p>
            </div>
          </div>
          <div class="ig-bars">
            <div v-for="item in media" :key="`bar-${item.id}`" class="ig-bar-row">
              <span class="ig-bar-label" :title="item.caption || 'Tanpa caption'">
                {{ shortCaption(item) }}
              </span>
              <span class="ig-bar-track">
                <i :style="{ width: interactionWidth(item) }" />
              </span>
              <span class="ig-bar-value">{{ formatNumber(item.insights?.total_interactions) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ============================ KOMUNITAS ============================ -->
      <template v-else-if="section === 'community'">
        <div class="ig-stat-row">
          <div class="ig-stat">
            <span class="ig-stat-label">Pengikut Instagram</span>
            <strong class="ig-stat-value">{{ followerDisplay }}</strong>
            <small class="ig-stat-hint" :class="deltaClass(followerMetric)">
              {{ followerGrowthLabel }}
            </small>
          </div>
          <div class="ig-stat">
            <span class="ig-stat-label">Pengikut baru</span>
            <strong class="ig-stat-value">{{ metricDisplay(newFollowersMetric, 'total') }}</strong>
            <small class="ig-stat-hint">{{ rangeLabel }} · follow baru</small>
          </div>
          <div class="ig-stat">
            <span class="ig-stat-label">Kunjungan profil</span>
            <strong class="ig-stat-value">{{ metricDisplay(profileViewsMetric, 'total') }}</strong>
            <small class="ig-stat-hint">{{ rangeLabel }}</small>
          </div>
          <div class="ig-stat">
            <span class="ig-stat-label">Klik website</span>
            <strong class="ig-stat-value">{{ metricDisplay(websiteClicksMetric, 'total') }}</strong>
            <small class="ig-stat-hint">{{ rangeLabel }}</small>
          </div>
        </div>

        <div v-if="newFollowersChart.series.length" class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">Pengikut Baru per Hari</h4>
              <p class="ig-panel-sub">{{ rangeLabel }} · follow baru, belum dikurangi unfollow</p>
            </div>
            <span class="ig-badge">{{ metricDisplay(newFollowersMetric, 'total') }} follow baru</span>
          </div>
          <div class="ig-chart">
            <svg
              :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
              role="img"
              aria-label="Grafik pengikut baru harian Instagram"
            >
              <defs>
                <linearGradient id="ig-area-followers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22c55e" stop-opacity="0.28" />
                  <stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
                </linearGradient>
              </defs>

              <g class="ig-grid">
                <line
                  v-for="line in newFollowersGridLines"
                  :key="`f-grid-${line.y}`"
                  :x1="CHART_PAD_X"
                  :x2="CHART_WIDTH - CHART_PAD_X"
                  :y1="line.y"
                  :y2="line.y"
                />
              </g>

              <g v-for="s in newFollowersChart.series" :key="`f-series-${s.key}`">
                <path :d="s.areaPath" fill="url(#ig-area-followers)" />
                <path :d="s.linePath" fill="none" :stroke="s.color" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </g>

              <g class="ig-grid-labels">
                <text
                  v-for="label in newFollowersYLabels"
                  :key="`f-y-${label.y}`"
                  :x="CHART_WIDTH - CHART_PAD_X"
                  :y="label.y - 4"
                  text-anchor="end"
                >
                  {{ label.text }}
                </text>
              </g>

              <g class="ig-axis-labels">
                <text
                  v-for="label in newFollowersXLabels"
                  :key="`f-x-${label.x}`"
                  :x="label.x"
                  :y="CHART_HEIGHT - 6"
                  :text-anchor="label.anchor"
                >
                  {{ label.text }}
                </text>
              </g>
            </svg>
          </div>
        </div>

        <div class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">Matriks Audiens</h4>
              <p class="ig-panel-sub">Data lifetime akun Instagram</p>
            </div>
          </div>

          <div class="ig-audience-grid">
            <div v-for="group in demographicGroups" :key="group.metric" class="ig-audience-block">
              <div class="ig-audience-title">{{ group.label }}</div>
              <div v-if="group.available" class="ig-hbars">
                <div v-for="row in topItems(group)" :key="`${group.metric}-${row.label}`" class="ig-hbar">
                  <span class="ig-hbar-label" :title="formatAudienceLabel(group.metric, row.label)">
                    {{ formatAudienceLabel(group.metric, row.label) }}
                  </span>
                  <span class="ig-hbar-track">
                    <i :style="{ width: hbarWidth(group, row) }" />
                  </span>
                  <span class="ig-hbar-value">{{ formatNumber(row.value) }}</span>
                </div>
              </div>
              <p v-else class="ig-note">Belum tersedia dari Meta.</p>
            </div>
          </div>
        </div>

        <div v-if="onlineFollowers?.available" class="ig-panel">
          <div class="ig-panel-head">
            <div>
              <h4 class="ig-panel-title">Jam Aktif Pengikut</h4>
              <p class="ig-panel-sub">Rata-rata pengikut online per jam (waktu Pasifik)</p>
            </div>
          </div>
          <div class="ig-hour-chart">
            <div v-for="hour in onlineHourBars" :key="`hour-${hour.label}`" class="ig-hour-col">
              <span class="ig-hour-value">{{ hour.value ? formatNumber(hour.value) : '' }}</span>
              <span class="ig-hour-track">
                <i :style="{ height: hour.height }" />
              </span>
              <span class="ig-hour-label">{{ hour.label }}</span>
            </div>
          </div>
        </div>

        <div class="ig-panel ig-panel-note">
          <Info :size="15" aria-hidden="true" />
          <p>
            Jangkauan, tayangan, dan kunjungan profil dihitung dari metrik akun Instagram.
            Data audiens hanya tersedia bila akun memiliki minimal 100 pengikut.
          </p>
        </div>
      </template>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  ExternalLink,
  Eye,
  Heart,
  Info,
  Instagram,
  MessageSquare,
  Radio,
  RefreshCw,
  Share2,
  ShieldAlert,
} from 'lucide-vue-next';

import { useInstagramAnalytics } from '../../composables/useInstagramAnalytics';
import { safeExternalUrl } from '../../utils/url';

const props = defineProps({
  /** Bagian analitik yang dirender: summary | content | community. */
  section: {
    type: String,
    default: 'summary',
    validator: (value) => ['summary', 'content', 'community'].includes(value),
  },
});

defineEmits(['open-connections']);

/**
 * Permalink berasal dari respons Graph API. Nilainya disaring sebelum masuk
 * `href` agar tautan `javascript:`/`data:` tidak bisa dieksekusi.
 */
const safePermalink = (url) => safeExternalUrl(url || '');

const {
  account,
  accountData,
  accountMessage,
  accountError,
  accountLoading,
  accountFetchedAt,
  media,
  mediaMessage,
  mediaError,
  mediaLoading,
  loadAccountInsights,
  loadMediaInsights,
} = useInstagramAnalytics();

/* ============================ Helper format ============================ */

const numberFormatter = new Intl.NumberFormat('id-ID');
const compactFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
const timeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

/** Tampilkan "—" bila metrik tidak dikembalikan Meta. */
function metricDisplay(item, key) {
  return item?.available ? formatNumber(item[key]) : '—';
}

function compactNumber(value) {
  return compactFormatter.format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

function parseDateLabel(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

/* ============================ State turunan ============================ */

const hasAccountData = computed(() => Boolean(accountData.value));
const hasConnection = computed(() => Boolean(account.value || accountData.value));
const loading = computed(
  () => accountLoading.value || (props.section === 'content' && mediaLoading.value)
);

const notConnectedMessage = computed(
  () =>
    accountMessage.value ||
    'Hubungkan akun Instagram Business/Creator dari menu Koneksi Medsos untuk melihat analitik medsos di sini.'
);

const errorMessage = computed(() => {
  if (accountError.value) {
    return accountError.value.message || 'Koneksi ke server gagal.';
  }
  if (hasConnection.value && !accountData.value) {
    return accountMessage.value || 'Data analitik Instagram tidak bisa dimuat.';
  }
  return '';
});

const lastSyncLabel = computed(() => {
  if (!accountFetchedAt.value) return '';
  return `Diperbarui ${timeFormatter.format(new Date(accountFetchedAt.value))}`;
});

const rangeLabel = computed(() => {
  const days = accountData.value?.range?.days;
  return days ? `${days} hari terakhir` : '30 hari terakhir';
});

function metric(name) {
  return accountData.value?.metrics?.find((item) => item.metric === name) || null;
}

const summaryMetrics = computed(() => accountData.value?.metrics || []);
const hasAnyMetric = computed(() => summaryMetrics.value.some((item) => item.available));
const followerMetric = computed(() => metric('follower_count'));
const newFollowersMetric = computed(() => metric('new_followers'));
const profileViewsMetric = computed(() => metric('profile_views'));
const websiteClicksMetric = computed(() => metric('website_clicks'));
const profileFollowers = computed(() => {
  const value = accountData.value?.profile?.followers;
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
});

/* ============================ Matriks ============================ */

function periodValue(item) {
  if (!item) return 0;
  return item.aggregate === 'latest' ? item.latest : item.total;
}

function hasFollowerFallback(item) {
  return item?.metric === 'follower_count' && profileFollowers.value !== null;
}

function formatPeriodCell(item) {
  if (!item) return '—';
  if (hasFollowerFallback(item) && !item.available) {
    return formatNumber(profileFollowers.value);
  }
  return item.available ? formatNumber(periodValue(item)) : '—';
}

function hasTrend(item) {
  return Array.isArray(item?.points) && item.points.length > 1;
}

function hasComparison(item) {
  return Boolean(item?.available && (hasTrend(item) || item?.changeAvailable));
}

const followerDisplay = computed(() => {
  if (followerMetric.value?.available) return formatNumber(followerMetric.value.latest);
  return profileFollowers.value === null ? '—' : formatNumber(profileFollowers.value);
});

function deltaClass(item) {
  if (!item?.available || !item.change) return 'is-flat';
  return item.change > 0 ? 'is-up' : 'is-down';
}

function formatDelta(item) {
  if (!item?.available) return '—';
  if (!item.change) return '0';
  return `${item.change > 0 ? '+' : '-'}${formatNumber(Math.abs(item.change))}`;
}

function formatDeltaPct(item) {
  if (!item?.available || item.changePct === null || item.changePct === undefined) return '';
  return `${item.changePct > 0 ? '+' : ''}${item.changePct.toFixed(1)}%`;
}

function sparkPoints(item) {
  const points = item?.points || [];
  if (points.length < 2) return '0,12 80,12';

  const values = points.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 80;
      const y = 22 - ((point.value - min) / span) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const followerGrowthLabel = computed(() => {
  const item = followerMetric.value;
  if (!item?.available) {
    return profileFollowers.value === null
      ? 'Belum tersedia'
      : `${formatNumber(profileFollowers.value)} pengikut saat ini`;
  }
  if (item.changeAvailable === false) {
    return 'Perubahan 7 hari belum tersedia';
  }
  const change = item.change || 0;
  const sign = change > 0 ? '+' : '';
  const pct = item.changePct === null ? '' : ` (${sign}${item.changePct.toFixed(1)}%)`;
  const net30 =
    item.first !== null && item.first !== item.latest
      ? item.latest - item.first
      : null;
  const suffix =
    net30 !== null
      ? ` · ${net30 >= 0 ? '+' : ''}${formatNumber(net30)} dalam 30 hari`
      : '';
  return `${sign}${formatNumber(change)} bersih dalam 7 hari${pct}${suffix}`;
});

/* ============================ Grafik SVG ============================ */

const CHART_WIDTH = 340;
const CHART_HEIGHT = 150;
const CHART_PAD_X = 10;
const CHART_PAD_TOP = 16;
const CHART_PAD_BOTTOM = 26;

function buildChartSeries(definitions) {
  const available = definitions
    .map((definition) => {
      const data = metric(definition.metric);
      if (!data?.available || !data.points?.length) return null;
      return { ...definition, data };
    })
    .filter(Boolean);

  if (!available.length) {
    return { series: [], dates: [], max: 0 };
  }

  const dates = available[0].data.points.map((point) => point.date);
  let max = 0;
  available.forEach((entry) => {
    entry.data.points.forEach((point) => {
      if (point.value > max) max = point.value;
    });
  });

  const safeMax = max || 1;
  const innerWidth = CHART_WIDTH - CHART_PAD_X * 2;
  const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  const stepX = dates.length > 1 ? innerWidth / (dates.length - 1) : 0;
  const bottomY = CHART_PAD_TOP + innerHeight;

  const series = available
    .map((entry) => {
      const byDate = new Map(entry.data.points.map((point) => [point.date, point.value]));
      let line = '';
      let firstX = null;
      let lastX = null;

      dates.forEach((date, index) => {
        const value = byDate.get(date);
        if (value === undefined) return;

        const x = CHART_PAD_X + stepX * index;
        const y = CHART_PAD_TOP + innerHeight - (value / safeMax) * innerHeight;
        line += `${line ? ' L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
        if (firstX === null) firstX = x;
        lastX = x;
      });

      if (!line) return null;

      const area = `${line} L${lastX.toFixed(2)},${bottomY} L${firstX.toFixed(2)},${bottomY} Z`;
      return { ...entry, linePath: line, areaPath: area, color: entry.color };
    })
    .filter(Boolean);

  return { series, dates, max };
}

const summaryChart = computed(() =>
  buildChartSeries([
    { key: 'reach', metric: 'reach', label: 'Reach', color: '#8b5cf6' },
    { key: 'views', metric: 'views', label: 'Tayangan', color: '#0ea5e9' },
  ])
);

const summaryChartTitle = computed(() =>
  summaryChart.value.series.some((series) => series.key === 'views')
    ? 'Tren Jangkauan & Tayangan'
    : 'Tren Jangkauan'
);

const newFollowersChart = computed(() =>
  buildChartSeries([
    { key: 'new_followers', metric: 'new_followers', label: 'Pengikut Baru', color: '#22c55e' },
  ])
);

function buildGridLines(chart) {
  const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  const bottom = CHART_PAD_TOP + innerHeight;
  return [
    { y: CHART_PAD_TOP },
    { y: CHART_PAD_TOP + innerHeight / 2 },
    { y: bottom },
  ];
}

const chartGridLines = computed(() => buildGridLines(summaryChart.value));
const newFollowersGridLines = computed(() => buildGridLines(newFollowersChart.value));

const newFollowersYLabels = computed(() => {
  const max = newFollowersChart.value.max;
  const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  return [
    { y: CHART_PAD_TOP, text: compactNumber(max) },
    { y: CHART_PAD_TOP + innerHeight / 2, text: compactNumber(max / 2) },
    { y: CHART_PAD_TOP + innerHeight, text: '0' },
  ];
});

const chartYLabels = computed(() => {
  const max = summaryChart.value.max;
  const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  return [
    { y: CHART_PAD_TOP, text: compactNumber(max) },
    { y: CHART_PAD_TOP + innerHeight / 2, text: compactNumber(max / 2) },
    { y: CHART_PAD_TOP + innerHeight, text: '0' },
  ];
});

function buildXLabels(dates) {
  if (!dates.length) return [];
  const indexes = [...new Set([0, Math.floor((dates.length - 1) / 2), dates.length - 1])];
  return indexes.map((index, position) => ({
    x:
      position === 0
        ? CHART_PAD_X
        : position === indexes.length - 1
          ? CHART_WIDTH - CHART_PAD_X
          : CHART_PAD_X + (CHART_WIDTH - CHART_PAD_X * 2) / 2,
    anchor: position === 0 ? 'start' : position === indexes.length - 1 ? 'end' : 'middle',
    text: parseDateLabel(dates[index]),
  }));
}

const chartXLabels = computed(() => buildXLabels(summaryChart.value.dates));
const newFollowersXLabels = computed(() => buildXLabels(newFollowersChart.value.dates));

/* ============================ Konten ============================ */

const mediaTotals = computed(() => {
  const items = media.value || [];
  const interactions = items.reduce(
    (total, item) => total + (item.insights?.total_interactions || 0),
    0
  );
  const views = items.reduce((total, item) => total + (item.insights?.views || 0), 0);
  const reach = items.reduce((total, item) => total + (item.insights?.reach || 0), 0);

  return {
    interactions,
    views,
    avgReach: items.length ? Math.round(reach / items.length) : 0,
  };
});

const maxInteractions = computed(() =>
  Math.max(...(media.value || []).map((item) => item.insights?.total_interactions || 0), 1)
);

function interactionWidth(item) {
  const value = item.insights?.total_interactions || 0;
  return `${Math.max(3, (value / maxInteractions.value) * 100).toFixed(1)}%`;
}

function shortCaption(item) {
  const text = String(item.caption || 'Tanpa caption').replace(/\s+/g, ' ').trim();
  return text.length > 34 ? `${text.slice(0, 34)}…` : text;
}

function mediaTypeLabel(item) {
  if (item.mediaProductType === 'REELS') return 'Reels';
  if (item.mediaType === 'CAROUSEL_ALBUM') return 'Carousel';
  if (item.mediaType === 'VIDEO') return 'Video';
  return 'Feed';
}

/* ============================ Audiens ============================ */

const audienceGroups = computed(() => accountData.value?.audience || []);

const demographicGroups = computed(() =>
  audienceGroups.value.filter((group) => group.metric !== 'online_followers')
);

const onlineFollowers = computed(() =>
  audienceGroups.value.find((group) => group.metric === 'online_followers')
);

function topItems(group) {
  const items = group.items || [];
  if (group.metric === 'online_followers') return items;
  return items.slice(0, 6);
}

function groupMax(group) {
  return Math.max(...(group.items || []).map((row) => row.value), 1);
}

function hbarWidth(group, row) {
  return `${Math.max(3, (row.value / groupMax(group)) * 100).toFixed(1)}%`;
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['id'], { type: 'region' });
  } catch {
    return null;
  }
})();

function formatCountryLabel(label) {
  const code = String(label || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return String(label || '');
  return regionNames?.of(code) || code;
}

function formatAudienceLabel(metricName, label) {
  if (metricName === 'audience_gender_age') {
    const [gender, range] = String(label).split('.');
    const genderLabel =
      gender === 'F' ? 'Perempuan' : gender === 'M' ? 'Laki-laki' : 'Tidak diketahui';
    return range ? `${genderLabel} ${range}` : genderLabel;
  }
  if (metricName === 'audience_country') {
    return formatCountryLabel(label);
  }
  if (metricName === 'online_followers') {
    return `${String(label).padStart(2, '0')}:00`;
  }
  return label;
}

const onlineHourBars = computed(() => {
  const items = onlineFollowers.value?.items || [];
  const max = Math.max(...items.map((row) => row.value), 1);
  return items.map((row) => ({
    label: String(Number(row.label)),
    value: row.value,
    height: `${Math.max(2, (row.value / max) * 100)}%`,
  }));
});

/* ============================ Aksi ============================ */

function refresh() {
  loadAccountInsights({ force: true });
  if (props.section === 'content') {
    loadMediaInsights({ force: true });
  }
}

function refreshMedia() {
  loadMediaInsights({ force: true });
}

onMounted(() => {
  loadAccountInsights();
  if (props.section === 'content') {
    loadMediaInsights();
  }
});

watch(
  () => props.section,
  (section) => {
    loadAccountInsights();
    if (section === 'content') {
      loadMediaInsights();
    }
  }
);
</script>

<style scoped>
.ig-analytics {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px dashed var(--shell-border);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ig-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ig-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ig-logo {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #f58529 0%, #dd2a7b 52%, #8134af 100%);
  flex-shrink: 0;
}

.ig-head-copy {
  min-width: 0;
}

.ig-title {
  font-size: 14px;
  font-weight: 900;
  color: var(--shell-text);
  line-height: 1.2;
}

.ig-sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-dot {
  opacity: 0.55;
}

.ig-refresh,
.ig-mini-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 11px;
  border-radius: var(--radius-pill, 999px);
  border: 1px solid var(--shell-border);
  background: var(--shell-card);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
}

.ig-refresh:disabled,
.ig-mini-refresh:disabled {
  opacity: 0.6;
  cursor: wait;
}

.ig-spin {
  animation: ig-spin 0.8s linear infinite;
}

@keyframes ig-spin {
  to {
    transform: rotate(360deg);
  }
}

.ig-panel {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px;
  min-width: 0;
}

.ig-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.ig-panel-title {
  margin: 0;
  font-size: 12.5px;
  font-weight: 900;
  color: var(--shell-text);
}

.ig-panel-sub {
  margin: 2px 0 0;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.ig-badge {
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.ig-matrix-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ig-matrix {
  width: 100%;
  min-width: 470px;
  border-collapse: collapse;
  font-size: 11.5px;
}

.ig-matrix th,
.ig-matrix td {
  padding: 8px 8px;
  border-bottom: 1px solid var(--shell-border);
  text-align: left;
  vertical-align: middle;
}

.ig-matrix thead th {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--shell-text-muted);
  padding-top: 0;
}

.ig-matrix tbody tr:last-child th,
.ig-matrix tbody tr:last-child td {
  border-bottom: none;
}

.ig-matrix th.ig-metric-name {
  font-weight: 800;
  color: var(--shell-text);
  white-space: nowrap;
}

.ig-matrix .ig-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ig-matrix tr.is-muted th,
.ig-matrix tr.is-muted td {
  opacity: 0.55;
}

.ig-mini-note {
  display: block;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.ig-matrix-note {
  margin-top: 8px;
}

.ig-delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 900;
  font-size: 11px;
  white-space: nowrap;
}

.ig-delta small {
  font-size: 9.5px;
  font-weight: 700;
  opacity: 0.8;
}

.is-up {
  color: #16a34a;
}

.is-down {
  color: #e11d48;
}

.is-flat {
  color: var(--shell-text-muted);
}

.ig-spark {
  display: block;
  width: 74px;
  height: 22px;
}

.ig-spark polyline {
  fill: none;
  stroke: var(--brand-blue, #3b82f6);
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.ig-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ig-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
  white-space: nowrap;
}

.ig-legend-item i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.ig-chart {
  width: 100%;
}

.ig-chart svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.ig-grid line {
  stroke: var(--shell-border);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}

.ig-axis-labels text,
.ig-grid-labels text {
  fill: var(--shell-text-muted);
  font-size: 8.5px;
  font-weight: 700;
  font-family: inherit;
}

.ig-stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 9px;
}

.ig-stat {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ig-stat-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.ig-stat-value {
  font-size: 20px;
  font-weight: 900;
  color: var(--shell-text);
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.ig-stat-hint {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-media-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ig-media-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px;
  border: 1px solid var(--shell-border);
  border-radius: 13px;
  background: var(--shell-chip);
}

.ig-media-thumb {
  width: 52px;
  height: 66px;
  border-radius: 9px;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f58529, #dd2a7b);
  color: #fff;
}

.ig-media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ig-media-main {
  flex: 1;
  min-width: 0;
}

.ig-media-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ig-media-type {
  font-size: 9px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.ig-media-date {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-media-caption {
  margin: 5px 0 6px;
  font-size: 11.5px;
  line-height: 1.35;
  color: var(--shell-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ig-media-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.ig-media-metrics span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-variant-numeric: tabular-nums;
}

.ig-media-link {
  color: var(--shell-text-muted);
  flex-shrink: 0;
  padding: 4px;
}

.ig-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ig-bar-row {
  display: grid;
  grid-template-columns: minmax(80px, 1.2fr) 2fr auto;
  align-items: center;
  gap: 9px;
}

.ig-bar-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--shell-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ig-bar-track {
  height: 9px;
  border-radius: 999px;
  background: var(--shell-chip);
  overflow: hidden;
}

.ig-bar-track i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #dd2a7b, #8134af);
  min-width: 3px;
}

.ig-bar-value {
  font-size: 10px;
  font-weight: 900;
  color: var(--shell-text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 24px;
  text-align: right;
}

.ig-audience-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.ig-audience-block {
  min-width: 0;
}

.ig-audience-title {
  font-size: 10.5px;
  font-weight: 900;
  color: var(--shell-text);
  margin-bottom: 8px;
}

.ig-hbars {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ig-hbar {
  display: grid;
  grid-template-columns: minmax(64px, 1fr) 1.4fr auto;
  align-items: center;
  gap: 7px;
}

.ig-hbar-label {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ig-hbar-track {
  height: 7px;
  border-radius: 999px;
  background: var(--shell-chip);
  overflow: hidden;
}

.ig-hbar-track i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b5cf6, #0ea5e9);
  min-width: 3px;
}

.ig-hbar-value {
  font-size: 9.5px;
  font-weight: 900;
  color: var(--shell-text-muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.ig-hour-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 108px;
}

.ig-hour-col {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
  min-width: 0;
}

.ig-hour-track {
  width: 100%;
  height: 72px;
  display: flex;
  align-items: flex-end;
  background: var(--shell-chip);
  border-radius: 5px;
  overflow: hidden;
}

.ig-hour-track i {
  width: 100%;
  border-radius: 5px;
  background: linear-gradient(180deg, #8b5cf6, #0ea5e9);
}

.ig-hour-label {
  font-size: 8px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-hour-value {
  font-size: 7.5px;
  font-weight: 800;
  color: var(--shell-text-muted);
  height: 9px;
  white-space: nowrap;
}

.ig-note {
  margin: 0;
  font-size: 10.5px;
  line-height: 1.45;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.ig-note-error {
  color: #e11d48;
}

.ig-panel-warning,
.ig-panel-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--shell-text-muted);
}

.ig-panel-warning p,
.ig-panel-note p {
  margin: 0;
  font-size: 10.5px;
  line-height: 1.45;
  font-weight: 600;
}

.ig-panel-warning .ig-btn {
  margin-top: 8px;
}

.ig-panel-warning {
  border-color: rgba(245, 158, 11, 0.45);
}

.ig-panel-warning svg,
.ig-panel-note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.ig-empty {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 15px;
  border-radius: 16px;
  border: 1px dashed var(--shell-border);
  background: var(--shell-card);
}

.ig-empty-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.ig-empty-title {
  font-size: 12.5px;
  font-weight: 900;
  color: var(--shell-text);
}

.ig-empty-text {
  margin: 3px 0 0;
  font-size: 10.5px;
  line-height: 1.45;
  font-weight: 600;
  color: var(--shell-text-muted);
}

.ig-empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.ig-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 13px;
  border-radius: 999px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 10px;
}

.ig-btn.primary {
  background: linear-gradient(135deg, #dd2a7b, #8134af);
  border-color: transparent;
  color: #fff;
}

.ig-empty-actions .ig-btn {
  margin-top: 0;
}

.ig-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--shell-border);
  background: var(--shell-card);
}

.ig-skel-line {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: var(--shell-chip);
  animation: ig-pulse 1.2s ease-in-out infinite;
}

.ig-skel-line:nth-child(2) {
  width: 82%;
}

.ig-skel-line:nth-child(3) {
  width: 64%;
}

@keyframes ig-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 420px) {
  .ig-panel {
    padding: 12px;
  }

  .ig-stat-value {
    font-size: 18px;
  }

  .ig-refresh span {
    display: none;
  }

  .ig-refresh {
    padding: 7px;
  }
}
</style>
