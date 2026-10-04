import { defineStore } from 'pinia'

export const useFessStore = defineStore('fess', {
  state: () => ({
    bases: [
      { id: 'b1', name: 'Code Memes & Rants', handle: '@codememfess', members: '48.2k', keyword: '[code]', avatar: '💻', verified: true },
      { id: 'b2', name: 'Gaming Confessions', handle: '@gamerfess', members: '89.1k', keyword: '[game]', avatar: '🎮', verified: true },
      { id: 'b3', name: 'Indie Hacker Secrets', handle: '@indiefess', members: '24.5k', keyword: '[indie]', avatar: '🚀', verified: false },
      { id: 'b4', name: 'Design Rants & Feedback', handle: '@designfess', members: '18.9k', keyword: '[design]', avatar: '🎨', verified: true }
    ],
    fesses: [
      {
        id: 'fess_101',
        baseHandle: '@codememfess',
        content: '[code] Jujur aja, kadang suka nulis console.log("sini bang") daripada panggil debugger beneran pas fixing production bug jam 2 pagi. Anyone else? 😭',
        timestamp: '12m ago',
        upvotes: 248,
        downvotes: 12,
        userVote: 'up', // 'up' | 'down' | null
        commentsCount: 34,
        status: 'published', // 'published' | 'pending' | 'rejected'
        comments: [
          { id: 'c1', author: 'Anon_Ninja', time: '10m ago', text: 'Saya malah console.log("kontol") wkwkwk' },
          { id: 'c2', author: 'Senior_Dev', time: '5m ago', text: 'Itu standar industri bro, gapapa.' }
        ]
      },
      {
        id: 'fess_102',
        baseHandle: '@gamerfess',
        content: '[game] Pengen beli GPU 4090 tapi tabungan cuma cukup buat RTX 3060 Ti second. Mending sikat skrg apa nunggu 50 series rilis gaes?',
        timestamp: '1h ago',
        upvotes: 182,
        downvotes: 5,
        userVote: null,
        commentsCount: 19,
        status: 'published',
        comments: []
      },
      {
        id: 'fess_103',
        baseHandle: '@indiefess',
        content: '[indie] Akhirnya MRR tembus $1,000/mo setelah 8 bulan solo dev tanpa pendanaan VC! Kuncinya cuma konsisten posting di Twitter & Reddit.',
        timestamp: '3h ago',
        upvotes: 512,
        downvotes: 3,
        userVote: 'up',
        commentsCount: 67,
        status: 'published',
        comments: []
      },
      {
        id: 'fess_104',
        baseHandle: '@codememfess',
        content: '[code] Mau nanya tentang rate-limit di NestJS vs Express. Mana yang lebih gampang disetup buat webhook?',
        timestamp: '5m ago',
        upvotes: 4,
        downvotes: 0,
        userVote: null,
        commentsCount: 1,
        status: 'pending',
        comments: []
      }
    ]
  }),
  actions: {
    addFess(baseHandle, content) {
      const newFess = {
        id: 'fess_' + Date.now(),
        baseHandle,
        content,
        timestamp: 'Just now',
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        commentsCount: 0,
        status: 'pending',
        comments: []
      }
      this.fesses.unshift(newFess)
      return newFess
    },
    vote(fessId, type) {
      const fess = this.fesses.find(f => f.id === fessId)
      if (!fess) return

      if (fess.userVote === type) {
        // Toggle off
        if (type === 'up') fess.upvotes--
        if (type === 'down') fess.downvotes--
        fess.userVote = null
      } else {
        if (fess.userVote === 'up') fess.upvotes--
        if (fess.userVote === 'down') fess.downvotes--

        if (type === 'up') fess.upvotes++
        if (type === 'down') fess.downvotes++
        fess.userVote = type
      }
    },
    approveFess(fessId) {
      const fess = this.fesses.find(f => f.id === fessId)
      if (fess) fess.status = 'published'
    },
    rejectFess(fessId) {
      const fess = this.fesses.find(f => f.id === fessId)
      if (fess) fess.status = 'rejected'
    }
  }
})
