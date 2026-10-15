/**
 * src/composables/useTopics.js
 * ---------------------------------------------------------------------------
 * Fess topics fetched from the backend (GET /topics) and enriched with their
 * Lucide icon — icons are pure UI assets, the topic data lives on the server.
 */

import { ref } from 'vue';
import {
  MessageSquare,
  BookOpen,
  Brain,
  Target,
  Frown,
  Smile,
  CloudRain,
  Flame,
  AlertCircle,
  BatteryLow,
  Heart,
  HeartCrack,
  Sparkles,
  UserMinus,
  MapPin,
  Calendar,
  Waves,
  Lock,
  Briefcase,
  GraduationCap,
  LogOut,
  TrendingUp,
  CreditCard,
  FileText,
  ClipboardCheck,
  Award,
  Code,
  Bug,
  Rocket,
  Cpu,
  Lightbulb,
  Laptop,
  Globe,
  Layers,
  Gamepad2,
  Film,
  Music,
  Book,
  Dumbbell,
  Plane,
  Utensils,
  Camera,
  Palette,
  PiggyBank,
  Receipt,
  Bitcoin,
  HeartPulse,
  Stethoscope,
  Pill,
  Apple,
  Moon,
  Shuffle,
  HelpCircle,
  MessageCircle,
  Star,
  ThumbsUp,
  Coffee,
  Cloud,
  Laugh,
  Ghost,
} from 'lucide-vue-next';
import { api } from '../api';

/** Presentation mapping: topic id → icon component. */
const ICON_BY_ID = {
  cerita: MessageSquare,
  pengalaman: BookOpen,
  renungan: Brain,
  motivasi: Target,
  kecewa: Frown,
  bahagia: Smile,
  sedih: CloudRain,
  marah: Flame,
  cemas: AlertCircle,
  lelah: BatteryLow,
  cinta: Heart,
  putus: HeartCrack,
  crush: Sparkles,
  friendzone: UserMinus,
  ldr: MapPin,
  pertemuan: Calendar,
  perpisahan: Waves,
  komitmen: Lock,
  kerja: Briefcase,
  magang: GraduationCap,
  wawancara: MessageSquare,
  resign: LogOut,
  promosi: TrendingUp,
  gaji: CreditCard,
  kuliah: GraduationCap,
  skripsi: FileText,
  ujian: ClipboardCheck,
  beasiswa: Award,
  coding: Code,
  debugging: Bug,
  deployment: Rocket,
  ai: Cpu,
  startup: Lightbulb,
  freelance: Laptop,
  remote: Globe,
  techstack: Layers,
  gaming: Gamepad2,
  anime: Sparkles,
  film: Film,
  musik: Music,
  baca: Book,
  olahraga: Dumbbell,
  travel: Plane,
  kuliner: Utensils,
  foto: Camera,
  desain: Palette,
  tabungan: PiggyBank,
  investasi: TrendingUp,
  cicilan: CreditCard,
  pengeluaran: Receipt,
  sidehustle: Briefcase,
  krypto: Bitcoin,
  kesehatan: HeartPulse,
  mental: Brain,
  terapi: Stethoscope,
  obat: Pill,
  diet: Apple,
  tidur: Moon,
  random: Shuffle,
  tanya: HelpCircle,
  opini: MessageCircle,
  review: Star,
  rekomendasi: ThumbsUp,
  kurcol: Coffee,
  mimpi: Cloud,
  lucu: Laugh,
  horor: Ghost,
  nsfw: Lock,
};

const topics = ref([]);
const loading = ref(false);
const error = ref(null);
const loaded = ref(false);
let inflight = null;

const enrich = (topic) => ({ ...topic, icon: ICON_BY_ID[topic.id] || MessageSquare });

export function useTopics() {
  async function fetchTopics() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.getTopics();
      const list = res?.data ?? res ?? [];
      topics.value = list.map(enrich);
      loaded.value = true;
      return topics.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /** Fetch once, then serve from the module cache. */
  function ensureLoaded() {
    if (loaded.value && topics.value.length) return Promise.resolve(topics.value);
    if (!inflight) {
      inflight = fetchTopics().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  const getTopicById = (id) => topics.value.find((t) => t.id === id);
  const getTopicsByCategory = (category) => topics.value.filter((t) => t.category === category);
  const getCategories = () => [...new Set(topics.value.map((t) => t.category))];

  return {
    topics,
    loading,
    error,
    fetchTopics,
    ensureLoaded,
    getTopicById,
    getTopicsByCategory,
    getCategories,
  };
}
