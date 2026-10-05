<template>
  <!-- Decorative layer of the hero: doodles, frosted cards & rotating sticker. -->

  <!-- SVG Neon Green Hashtag Doodle -->
  <div class="doodle-hashtag" aria-hidden="true">
    <svg
      width="110"
      height="110"
      viewBox="0 0 100 100"
      fill="none"
      stroke="#BAFF00"
      stroke-width="14"
      stroke-linecap="round"
    >
      <line x1="30" y1="15" x2="20" y2="85" />
      <line x1="75" y1="15" x2="65" y2="85" />
      <line x1="10" y1="38" x2="90" y2="38" />
      <line x1="10" y1="68" x2="90" y2="68" />
    </svg>
  </div>

  <!-- SVG Top Right Curved Neon Arrow -->
  <div class="doodle-arrow-top" aria-hidden="true">
    <svg
      width="130"
      height="130"
      viewBox="0 0 100 100"
      fill="none"
      stroke="#BAFF00"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M 20 80 Q 75 80 75 30 T 45 20" />
      <polyline points="35,32 45,20 58,32" />
    </svg>
  </div>

  <!-- SVG Bottom Left Curved Neon Arrow -->
  <div class="doodle-arrow-bottom" aria-hidden="true">
    <svg
      width="140"
      height="140"
      viewBox="0 0 100 100"
      fill="none"
      stroke="#BAFF00"
      stroke-width="8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M 80 80 Q 20 70 30 20" />
      <polyline points="15,35 30,20 45,35" />
    </svg>
  </div>

  <!-- FLOATING FROSTED GLASS CARDS -->
  <div class="hero-glass-card card-top-right" aria-hidden="true">
    <div class="glass-avatar">
      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=pearl" alt="" />
    </div>
    <div class="glass-info">
      <div class="glass-handle">pearl_anon</div>
      <div class="glass-sub">293 582 disukai</div>
    </div>
  </div>

  <div class="hero-glass-card card-center-left" aria-hidden="true">
    <div class="glass-avatar monkey-bg">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=baseclub" alt="" />
    </div>
    <div class="glass-info">
      <div class="glass-handle">base_sender</div>
      <div class="glass-sub">23 422 fess terkirim</div>
    </div>
  </div>

  <!-- ROTATING BADGE STICKER -->
  <div class="hero-badge-sticker" aria-hidden="true">
    <div class="sticker-circle">
      <svg class="sticker-text-svg" viewBox="0 0 100 100">
        <path
          id="textPath"
          d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="none"
        />
        <text font-size="11.5" font-weight="900" letter-spacing="2" fill="#000">
          <textPath href="#textPath" startOffset="0%">
            KIRIM FESS SEKARANG • KIRIM FESS SEKARANG •
          </textPath>
        </text>
      </svg>
      <div class="sticker-center-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7,7 17,7 17,17" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * HeroFloaters — pure artwork layer of the hero (doodles, mock glass cards,
 * rotating sticker). No state; absolutely positioned against `.hero-main`.
 * SVG stroke / sticker colours are illustration, kept as authored.
 */
</script>

<style scoped>
/* DOODLES POSITIONING */
.doodle-hashtag {
  position: absolute;
  top: -10px;
  left: 14%;
  z-index: 5;
  animation: pulseRotate 6s ease-in-out infinite alternate;
}

.doodle-arrow-top {
  position: absolute;
  top: 10px;
  right: 18%;
  z-index: 5;
  animation: floatSlow 4s ease-in-out infinite alternate;
}

.doodle-arrow-bottom {
  position: absolute;
  bottom: 20px;
  left: 20%;
  z-index: 5;
}

/* FLOATING FROSTED GLASS CARDS */
.hero-glass-card {
  position: absolute;
  background: var(--shell-chip);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--shell-border-strong);
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 20px 40px var(--shadow-color);
  z-index: 10;
  transition: transform 0.3s ease;
}

.card-top-right {
  top: 60px;
  right: 22%;
  transform: rotate(7deg);
}

.card-top-right:hover {
  transform: rotate(4deg) scale(1.05);
}

.card-center-left {
  bottom: 40px;
  left: 28%;
  transform: rotate(-8deg);
}

.card-center-left:hover {
  transform: rotate(-5deg) scale(1.05);
}

/* Avatar tiles are mock artwork; only the neutral one follows a surface token. */
.glass-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: var(--bg-surface);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-avatar.monkey-bg {
  background: #ffe082;
}

.glass-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.glass-info {
  text-align: left;
}

.glass-handle {
  font-weight: 800;
  font-size: 15px;
  color: var(--shell-text);
  text-shadow: 0 1px 4px var(--shadow-color);
}

.glass-sub {
  font-size: 12px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

/* ROTATING BADGE STICKER */
.hero-badge-sticker {
  position: absolute;
  bottom: 10px;
  right: 14%;
  z-index: 12;
}

.sticker-circle {
  position: relative;
  width: 120px;
  height: 120px;
  background: var(--shell-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px var(--shadow-color);
}

.sticker-text-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: spinSlow 12s linear infinite;
}

.sticker-center-arrow {
  width: 44px;
  height: 44px;
  background: var(--shell-accent);
  border: 3px solid var(--border-on-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes floatSlow {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-12px);
  }
}

@keyframes pulseRotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  100% {
    transform: rotate(10deg) scale(1.08);
  }
}

@media (max-width: 992px) {
  .hero-glass-card {
    display: none;
  }
}
</style>
