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

/**
 * src/data/topics.js
 * Daftar topik fess yang bisa dipilih user
 */

export const TOPICS = [
  // Hidup Sehari-hari
  { id: 'cerita', label: 'Cerita', category: 'Hidup', icon: MessageSquare, color: '#3B82F6' },
  { id: 'pengalaman', label: 'Pengalaman', category: 'Hidup', icon: BookOpen, color: '#06B6D4' },
  { id: 'renungan', label: 'Renungan', category: 'Hidup', icon: Brain, color: '#8B5CF6' },
  { id: 'motivasi', label: 'Motivasi', category: 'Hidup', icon: Target, color: '#F59E0B' },
  { id: 'kecewa', label: 'Kecewa', category: 'Hidup', icon: Frown, color: '#EF4444' },
  { id: 'bahagia', label: 'Bahagia', category: 'Hidup', icon: Smile, color: '#22C55E' },
  { id: 'sedih', label: 'Sedih', category: 'Hidup', icon: CloudRain, color: '#6366F1' },
  { id: 'marah', label: 'Marah', category: 'Hidup', icon: Flame, color: '#F97316' },
  { id: 'cemas', label: 'Cemas', category: 'Hidup', icon: AlertCircle, color: '#F59E0B' },
  { id: 'lelah', label: 'Lelah', category: 'Hidup', icon: BatteryLow, color: '#9CA3AF' },

  // Hubungan
  { id: 'cinta', label: 'Cinta', category: 'Hubungan', icon: Heart, color: '#EC4899' },
  { id: 'putus', label: 'Putus Cinta', category: 'Hubungan', icon: HeartCrack, color: '#EF4444' },
  { id: 'crush', label: 'Crush', category: 'Hubungan', icon: Sparkles, color: '#F472B6' },
  {
    id: 'friendzone',
    label: 'Friendzone',
    category: 'Hubungan',
    icon: UserMinus,
    color: '#6B7280',
  },
  { id: 'ldr', label: 'LDR', category: 'Hubungan', icon: MapPin, color: '#8B5CF6' },
  { id: 'pertemuan', label: 'Pertemuan', category: 'Hubungan', icon: Calendar, color: '#22C55E' },
  { id: 'perpisahan', label: 'Perpisahan', category: 'Hubungan', icon: Waves, color: '#6366F1' },
  { id: 'komitmen', label: 'Komitmen', category: 'Hubungan', icon: Lock, color: '#059669' },

  // Karir & Pendidikan
  { id: 'kerja', label: 'Kerja', category: 'Karir', icon: Briefcase, color: '#1D4ED8' },
  { id: 'magang', label: 'Magang', category: 'Karir', icon: GraduationCap, color: '#059669' },
  {
    id: 'wawancara',
    label: 'Wawancara',
    category: 'Karir',
    icon: MessageSquare,
    color: '#0891B2',
  },
  { id: 'resign', label: 'Resign', category: 'Karir', icon: LogOut, color: '#DC2626' },
  { id: 'promosi', label: 'Promosi', category: 'Karir', icon: TrendingUp, color: '#16A34A' },
  { id: 'gaji', label: 'Gaji', category: 'Karir', icon: CreditCard, color: '#84CC16' },
  {
    id: 'kuliah',
    label: 'Kuliah',
    category: 'Pendidikan',
    icon: GraduationCap,
    color: '#7C3AED',
  },
  {
    id: 'skripsi',
    label: 'Skripsi/Tesis',
    category: 'Pendidikan',
    icon: FileText,
    color: '#A855F7',
  },
  { id: 'ujian', label: 'Ujian', category: 'Pendidikan', icon: ClipboardCheck, color: '#2563EB' },
  { id: 'beasiswa', label: 'Beasiswa', category: 'Pendidikan', icon: Award, color: '#F59E0B' },

  // Teknologi & Programming
  { id: 'coding', label: 'Coding', category: 'Teknologi', icon: Code, color: '#0D9488' },
  { id: 'debugging', label: 'Debugging', category: 'Teknologi', icon: Bug, color: '#DC2626' },
  {
    id: 'deployment',
    label: 'Deployment',
    category: 'Teknologi',
    icon: Rocket,
    color: '#059669',
  },
  { id: 'ai', label: 'AI/ML', category: 'Teknologi', icon: Cpu, color: '#8B5CF6' },
  { id: 'startup', label: 'Startup', category: 'Teknologi', icon: Lightbulb, color: '#F59E0B' },
  { id: 'freelance', label: 'Freelance', category: 'Teknologi', icon: Laptop, color: '#0891B2' },
  { id: 'remote', label: 'Remote Work', category: 'Teknologi', icon: Globe, color: '#6366F1' },
  { id: 'techstack', label: 'Tech Stack', category: 'Teknologi', icon: Layers, color: '#EC4899' },

  // Hobi & Minat
  { id: 'gaming', label: 'Gaming', category: 'Hobi', icon: Gamepad2, color: '#8B5CF6' },
  { id: 'anime', label: 'Anime/Manga', category: 'Hobi', icon: Sparkles, color: '#F472B6' },
  { id: 'film', label: 'Film/Series', category: 'Hobi', icon: Film, color: '#EC4899' },
  { id: 'musik', label: 'Musik', category: 'Hobi', icon: Music, color: '#F97316' },
  { id: 'baca', label: 'Membaca', category: 'Hobi', icon: Book, color: '#059669' },
  { id: 'olahraga', label: 'Olahraga', category: 'Hobi', icon: Dumbbell, color: '#EF4444' },
  { id: 'travel', label: 'Traveling', category: 'Hobi', icon: Plane, color: '#06B6D4' },
  { id: 'kuliner', label: 'Kuliner', category: 'Hobi', icon: Utensils, color: '#F97316' },
  { id: 'foto', label: 'Fotografi', category: 'Hobi', icon: Camera, color: '#6366F1' },
  { id: 'desain', label: 'Desain', category: 'Hobi', icon: Palette, color: '#A855F7' },

  // Keuangan
  { id: 'tabungan', label: 'Tabungan', category: 'Keuangan', icon: PiggyBank, color: '#22C55E' },
  {
    id: 'investasi',
    label: 'Investasi',
    category: 'Keuangan',
    icon: TrendingUp,
    color: '#16A34A',
  },
  {
    id: 'cicilan',
    label: 'Cicilan/Hutang',
    category: 'Keuangan',
    icon: CreditCard,
    color: '#EF4444',
  },
  {
    id: 'pengeluaran',
    label: 'Pengeluaran',
    category: 'Keuangan',
    icon: Receipt,
    color: '#F97316',
  },
  {
    id: 'sidehustle',
    label: 'Side Hustle',
    category: 'Keuangan',
    icon: Briefcase,
    color: '#8B5CF6',
  },
  { id: 'krypto', label: 'Kripto', category: 'Keuangan', icon: Bitcoin, color: '#F59E0B' },

  // Kesehatan
  {
    id: 'kesehatan',
    label: 'Kesehatan',
    category: 'Kesehatan',
    icon: HeartPulse,
    color: '#EC4899',
  },
  { id: 'mental', label: 'Mental Health', category: 'Kesehatan', icon: Brain, color: '#8B5CF6' },
  { id: 'terapi', label: 'Terapi', category: 'Kesehatan', icon: Stethoscope, color: '#06B6D4' },
  { id: 'obat', label: 'Obat', category: 'Kesehatan', icon: Pill, color: '#F59E0B' },
  { id: 'diet', label: 'Diet/Nutrisi', category: 'Kesehatan', icon: Apple, color: '#22C55E' },
  { id: 'tidur', label: 'Gangguan Tidur', category: 'Kesehatan', icon: Moon, color: '#6366F1' },

  // Lainnya
  { id: 'random', label: 'Random', category: 'Lainnya', icon: Shuffle, color: '#6B7280' },
  { id: 'tanya', label: 'Bertanya', category: 'Lainnya', icon: HelpCircle, color: '#06B6D4' },
  { id: 'opini', label: 'Opini', category: 'Lainnya', icon: MessageCircle, color: '#F59E0B' },
  { id: 'review', label: 'Review', category: 'Lainnya', icon: Star, color: '#F59E0B' },
  {
    id: 'rekomendasi',
    label: 'Rekomendasi',
    category: 'Lainnya',
    icon: ThumbsUp,
    color: '#22C55E',
  },
  { id: 'kurcol', label: 'Kurcol', category: 'Lainnya', icon: Coffee, color: '#92400E' },
  { id: 'mimpi', label: 'Mimpi', category: 'Lainnya', icon: Cloud, color: '#6366F1' },
  { id: 'lucu', label: 'Lucu/Meme', category: 'Lainnya', icon: Laugh, color: '#F59E0B' },
  { id: 'horor', label: 'Horor/Misteri', category: 'Lainnya', icon: Ghost, color: '#374151' },
  { id: 'nsfw', label: 'NSFW', category: 'Lainnya', icon: Lock, color: '#DC2626' },
];

/** Get topic by ID */
export function getTopicById(id) {
  return TOPICS.find((t) => t.id === id);
}

/** Get topics by category */
export function getTopicsByCategory(category) {
  return TOPICS.filter((t) => t.category === category);
}

/** Get all categories */
export function getCategories() {
  return [...new Set(TOPICS.map((t) => t.category))];
}
