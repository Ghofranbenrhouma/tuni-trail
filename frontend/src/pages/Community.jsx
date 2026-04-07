import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { communityApi } from '../services/api'

const COMMUNITY_POSTS = [
  {
    id: 1,
    author: 'Mehdi Gouia',
    avatar: 'M',
    location: 'Camping Zaghouan',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop',
    caption: 'Quelle vue incroyable au lever du soleil! Une nuit inoubliable au Zaghouan 🏔️✨',
    likes: 342,
    comments: 45,
    timestamp: 'Il y a 2h',
    liked: false,
    saved: false
  },
  {
    id: 2,
    author: 'Linda Li',
    avatar: 'L',
    location: 'Trek Ichkeul',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop',
    caption: 'Bivouac sous les étoiles... un moment magique que je n\'oublierai jamais 🌟🏕️',
    likes: 523,
    comments: 78,
    timestamp: 'Il y a 4h',
    liked: false,
    saved: false
  },
  {
    id: 3,
    author: 'Mohamed Abouda',
    avatar: 'MA',
    location: 'Bivouac Tataouine',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
    caption: 'Avec les amis dans le désert de Tataouine 🐪🌅 TuniTrail a rendu ce voyage si facile!',
    likes: 678,
    comments: 92,
    timestamp: 'Il y a 1j',
    liked: false,
    saved: false
  },
  {
    id: 4,
    author: 'Rayen Benbarek',
    avatar: 'R',
    location: 'Rando Tabarka',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=600&fit=crop',
    caption: 'Les paysages côtiers de Tabarka sont tout simplement spectaculaires! 🌊⛰️',
    likes: 451,
    comments: 64,
    timestamp: 'Il y a 1j',
    liked: false,
    saved: false
  },
  {
    id: 5,
    author: 'Helena Fa',
    avatar: 'H',
    location: 'Kayak Djerba',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=600&fit=crop',
    caption: 'Vacances en famille à Djerba 🏖️ Le service de TuniTrail était impeccable!',
    likes: 612,
    comments: 88,
    timestamp: 'Il y a 2j',
    liked: false,
    saved: false
  }
]

const STORIES = [
  { id: 1, name: 'Zaghouan', emoji: '🏔️', gradient: 'linear-gradient(135deg, #2F5420, #7DB853)' },
  { id: 2, name: 'Ichkeul', emoji: '🦅', gradient: 'linear-gradient(135deg, #163a5a, #4a90d9)' },
  { id: 3, name: 'Tataouine', emoji: '🏜️', gradient: 'linear-gradient(135deg, #6b2e12, #C98A1A)' },
  { id: 4, name: 'Tabarka', emoji: '🌊', gradient: 'linear-gradient(135deg, #1a4a6a, #5aaecc)' },
  { id: 5, name: 'Djerba', emoji: '🏖️', gradient: 'linear-gradient(135deg, #3c1e5c, #9c6ad0)' },
  { id: 6, name: 'Hammamet', emoji: '⛵', gradient: 'linear-gradient(135deg, #224a30, #4a9a5a)' },
]

const CHAT_MESSAGES = [
  { id: 1, author: 'Mehdi Gouia', message: 'Quelqu\'un pour une randonnée ce week-end ?', timestamp: Date.now() - 600000, avatar: 'M', isAI: false },
  { id: 2, author: 'Linda Li', message: 'Je suis partante! Où pensez-vous aller?', timestamp: Date.now() - 480000, avatar: 'L', isAI: false },
  { id: 3, author: 'Mohamed Abouda', message: 'Tabarka serait sympa, j\'ai entendu dire que c\'était magnifique', timestamp: Date.now() - 300000, avatar: 'MA', isAI: false },
  { id: 4, author: 'Rayen Benbarek', message: 'J\'ai des coordonnées pour les meilleurs spots de camping là-bas', timestamp: Date.now() - 180000, avatar: 'R', isAI: false },
]

const TRENDING = [
  { tag: '#CampingTunisie', posts: '2.4k posts' },
  { tag: '#RandoWeekend', posts: '1.8k posts' },
  { tag: '#NatureTunisienne', posts: '956 posts' },
  { tag: '#TuniTrailAdventure', posts: '743 posts' },
]

// ── AI Travel Guide Suggestions ──
const AI_SUGGESTIONS = [
  {
    message: "🏔️ **Suggestion du jour — Zaghouan !** Le Djebel Zaghouan offre des sentiers de randonnée spectaculaires avec vue sur les ruines du Temple des Eaux romaines. Idéal pour un weekend de camping entre amis. Altitude : 1 295m, difficulté moyenne.",
    tag: '🧭 Guide voyage'
  },
  {
    message: "🏜️ **Découvrez Tozeur** — L'oasis de montagne au cœur du désert ! Explorez les palmeraies, le Chott el Jérid et les paysages de Star Wars. Le coucher de soleil sur le lac salé est inoubliable 🌅",
    tag: '🌴 Oasis'
  },
  {
    message: "🌊 **Tabarka vous attend !** Entre forêts de chênes-lièges et plages cristallines, Tabarka est le joyau du nord-ouest. Ne manquez pas les aiguilles rocheuses et le fort génois. Plongée sous-marine exceptionnelle 🤿",
    tag: '🏖️ Côte'
  },
  {
    message: "🏛️ **Dougga — trésor UNESCO !** Le site archéologique le mieux préservé d'Afrique du Nord. Théâtre romain, temples, thermes... Un voyage dans le temps à 2h de Tunis. Entrée : 8 DT seulement ✨",
    tag: '🏺 Culture'
  },
  {
    message: "🏖️ **Cap Bon en automne** — Les plages de Kélibia et El Haouaria sont magiques hors saison. Grottes romaines, falaises de rapaces, et les meilleurs fruits de mer de Tunisie 🦐 Camping sauvage possible !",
    tag: '⛺ Aventure'
  },
  {
    message: "🐪 Envie d'**aventure saharienne** ? Douz, la porte du Sahara, propose des méharées inoubliables. Nuit sous les étoiles dans le Grand Erg Oriental, musique bédouine et thé à la menthe sous les dunes 🌙",
    tag: '🏜️ Sahara'
  },
  {
    message: "🦅 **Parc national d'Ichkeul** — Classé UNESCO, c'est le paradis des ornithologues ! Plus de 200 000 oiseaux migrateurs chaque hiver. Randonnée autour du lac et du djebel. Calme absolu garanti 🌿",
    tag: '🌿 Nature'
  },
  {
    message: "⛵ **Sidi Bou Saïd** — Le village bleu et blanc le plus photogénique de Méditerranée ! Flânez dans les ruelles, savourez un thé aux pignons au Café des Nattes, et admirez le coucher de soleil sur le golfe de Tunis 💙",
    tag: '📸 Incontournable'
  },
  {
    message: "🏔️ **Aïn Draham** — La petite Suisse tunisienne ! Forêts denses de chênes, cascades, et brouillard mystique. Parfait pour le trekking et le VTT. En hiver, vous pouvez même voir de la neige ❄️",
    tag: '🌲 Montagne'
  },
  {
    message: "🏖️ **Île de Djerba** — L'île des rêves ! Plages de sable fin, architecture traditionnelle, street art à Erriadh, et la synagogue de la Ghriba. Un mélange unique de cultures et de paysages 🎨",
    tag: '🏝️ Île'
  },
]

// Simulated community members who "reply" sometimes
const SIMULATED_USERS = [
  { name: 'Salma Baroudi', avatar: 'S' },
  { name: 'Youssef Khelil', avatar: 'Y' },
  { name: 'Amira Trabelsi', avatar: 'A' },
]

const SIMULATED_REPLIES = [
  "Super idée ! Je note ça 📝",
  "Quelqu'un y est déjà allé récemment ?",
  "Merci TuniBot pour les bons plans ! 🙌",
  "J'adorerais y aller ce weekend",
  "Les photos de cet endroit sont incroyables",
  "On pourrait organiser un groupe ?",
  "C'est noté dans ma liste ! ✨",
]

function formatRelativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 10) return "À l'instant"
  if (diff < 60) return `Il y a ${diff}s`
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return `Il y a ${Math.floor(diff / 86400)}j`
}

function renderMessageText(text) {
  // Parse **bold** markdown
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function Community() {
  const { user } = useAuth()
  const [posts, setPosts] = useState(COMMUNITY_POSTS)  // fallback until API loads

  // Load real posts from backend
  useEffect(() => {
    communityApi.getPosts()
      .then(rows => { if (rows && rows.length > 0) setPosts(rows) })
      .catch(() => {}) // keep fallback data on error
  }, [])
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [chatInput, setChatInput] = useState('')
  const [uploadCaption, setUploadCaption] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [activeStory, setActiveStory] = useState(null)
  const [aiTyping, setAiTyping] = useState(false)
  const chatEndRef = useRef(null)
  const aiTimerRef = useRef(null)
  const aiIndexRef = useRef(0)
  const lastUserMsgTimeRef = useRef(Date.now())
  const msgIdRef = useRef(CHAT_MESSAGES.length + 1)

  // AI inactivity delay (15 seconds of no user messages)
  const AI_DELAY = 15000
  // Typing indicator duration
  const AI_TYPING_DURATION = 2500

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiTyping])

  // Reset AI timer whenever a new user message is sent
  const resetAITimer = useCallback(() => {
    lastUserMsgTimeRef.current = Date.now()
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current)

    aiTimerRef.current = setTimeout(() => {
      triggerAIResponse()
    }, AI_DELAY)
  }, [])

  const triggerAIResponse = useCallback(() => {
    // Show typing indicator
    setAiTyping(true)

    setTimeout(() => {
      const suggestion = AI_SUGGESTIONS[aiIndexRef.current % AI_SUGGESTIONS.length]
      aiIndexRef.current += 1

      const aiMessage = {
        id: msgIdRef.current++,
        author: 'TuniBot 🤖',
        message: suggestion.message,
        timestamp: Date.now(),
        avatar: '🧭',
        isAI: true,
        aiTag: suggestion.tag,
      }

      setAiTyping(false)
      setMessages(prev => [...prev, aiMessage])

      // Occasionally a simulated user replies to the AI after a delay
      const shouldReply = Math.random() > 0.4
      if (shouldReply) {
        const replyDelay = 4000 + Math.random() * 6000
        setTimeout(() => {
          const simUser = SIMULATED_USERS[Math.floor(Math.random() * SIMULATED_USERS.length)]
          const simReply = SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)]
          const replyMessage = {
            id: msgIdRef.current++,
            author: simUser.name,
            message: simReply,
            timestamp: Date.now(),
            avatar: simUser.avatar,
            isAI: false,
          }
          setMessages(prev => [...prev, replyMessage])
          // After a simulated user reply, set up the next AI suggestion
          lastUserMsgTimeRef.current = Date.now()
          aiTimerRef.current = setTimeout(() => {
            triggerAIResponse()
          }, AI_DELAY)
        }, replyDelay)
      } else {
        // If no simulated reply, schedule next AI message
        aiTimerRef.current = setTimeout(() => {
          triggerAIResponse()
        }, AI_DELAY + 5000)
      }
    }, AI_TYPING_DURATION)
  }, [])

  // Start the AI timer on mount
  useEffect(() => {
    aiTimerRef.current = setTimeout(() => {
      triggerAIResponse()
    }, AI_DELAY)

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current)
    }
  }, [triggerAIResponse])

  // Update relative timestamps every 30s
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleLike = async (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes_count: (post.likes_count || post.likes || 0) + (post.liked ? -1 : 1) }
        : post
    ))
    if (user) {
      try { await communityApi.likePost(postId) } catch {}
    }
  }

  const toggleSave = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, saved: !post.saved }
        : post
    ))
  }

  const handleSendMessage = async () => {
    if (chatInput.trim() && user) {
      const newMessage = {
        id: msgIdRef.current++,
        author: user.name || 'Utilisateur',
        message: chatInput,
        timestamp: Date.now(),
        avatar: user.name?.[0] || 'U',
        isAI: false,
      }
      setMessages(prev => [...prev, newMessage])
      setChatInput('')
      resetAITimer()
      try { await communityApi.sendChat(chatInput.trim()) } catch {}
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  const onlineCount = 4 + messages.filter(m => m.isAI).length > 0 ? 5 : 4

  return (
    <div className="comm-root">
      {/* Hero Header */}
      <div className="comm-hero">
        <div className="comm-hero-bg" />
        <div className="comm-hero-content">
          <div className="comm-hero-text">
            <div className="comm-hero-badge">
              <span className="comm-hero-badge-dot" />
              <span>Communauté active</span>
            </div>
            <h1 className="comm-hero-title">
              Partagez vos <em>aventures</em>
            </h1>
            <p className="comm-hero-sub">
              Rejoignez des milliers de passionnés de nature et partagez vos plus beaux moments en plein air.
            </p>
          </div>
          <div className="comm-hero-stats">
            <div className="comm-stat">
              <span className="comm-stat-num">2.4k</span>
              <span className="comm-stat-lbl">Membres actifs</span>
            </div>
            <div className="comm-stat-div" />
            <div className="comm-stat">
              <span className="comm-stat-num">850</span>
              <span className="comm-stat-lbl">Posts ce mois</span>
            </div>
            <div className="comm-stat-div" />
            <div className="comm-stat">
              <span className="comm-stat-num">12k</span>
              <span className="comm-stat-lbl">Interactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Bar */}
      <div className="comm-stories-wrap">
        <div className="comm-stories">
          {STORIES.map(story => (
            <div
              key={story.id}
              className={`comm-story${activeStory === story.id ? ' active' : ''}`}
              onClick={() => setActiveStory(activeStory === story.id ? null : story.id)}
            >
              <div className="comm-story-ring">
                <div className="comm-story-avatar" style={{ background: story.gradient }}>
                  <span>{story.emoji}</span>
                </div>
              </div>
              <span className="comm-story-name">{story.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="comm-layout">
        {/* Feed Column */}
        <div className="comm-feed">
          {/* Compose Box */}
          {user && (
            <div className="comm-compose">
              <div className="comm-compose-top">
                <div className="comm-compose-avatar">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <input
                  type="text"
                  className="comm-compose-input"
                  placeholder="Partagez votre aventure..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  onFocus={() => setShowUpload(true)}
                />
              </div>
              {showUpload && (
                <div className="comm-compose-actions">
                  <button className="comm-compose-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Photo
                  </button>
                  <button className="comm-compose-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Lieu
                  </button>
                  <button className="comm-compose-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    Tag
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    className="comm-compose-cancel"
                    onClick={() => { setShowUpload(false); setUploadCaption('') }}
                  >
                    Annuler
                  </button>
                  <button className="comm-compose-submit" disabled={!uploadCaption.trim()}>
                    Publier
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Posts */}
          {posts.map(post => (
            <div key={post.id} className="comm-post">
              {/* Post Header */}
              <div className="comm-post-header">
                <div className="comm-post-author">
                  <div className="comm-post-avatar">{post.avatar}</div>
                  <div>
                    <div className="comm-post-name">{post.author}</div>
                    <div className="comm-post-location">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {post.location}
                    </div>
                  </div>
                </div>
                <button className="comm-post-menu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
              </div>

              {/* Post Image */}
              <div className="comm-post-img">
                <img src={post.image} alt={post.caption} loading="lazy" />
                <div className="comm-post-img-overlay" />
              </div>

              {/* Post Actions */}
              <div className="comm-post-body">
                <div className="comm-post-actions">
                  <div className="comm-post-actions-left">
                    <button
                      className={`comm-action-btn${post.liked ? ' liked' : ''}`}
                      onClick={() => toggleLike(post.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={post.liked ? '#e05c5c' : 'none'} stroke={post.liked ? '#e05c5c' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                    <button className="comm-action-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <button className="comm-action-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    className={`comm-action-btn${post.saved ? ' saved' : ''}`}
                    onClick={() => toggleSave(post.id)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={post.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>

                {/* Likes */}
                <div className="comm-post-likes">{formatNumber(post.likes)} mentions J'aime</div>

                {/* Caption */}
                <div className="comm-post-caption">
                  <span className="comm-post-caption-author">{post.author}</span> {post.caption}
                </div>

                {/* Comments link */}
                <button className="comm-post-comments-link">
                  Voir les {post.comments} commentaires
                </button>

                {/* Timestamp */}
                <div className="comm-post-time">{post.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="comm-sidebar">
          {/* Chat Panel */}
          <div className="comm-chat">
            <div className="comm-chat-header">
              <div className="comm-chat-header-left">
                <div className="comm-chat-dot" />
                <span>Chat en direct</span>
              </div>
              <span className="comm-chat-count">{onlineCount} en ligne</span>
            </div>

            <div className="comm-chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`comm-chat-msg${msg.isAI ? ' comm-chat-msg--ai' : ''}`}>
                  <div className={`comm-chat-avatar${msg.isAI ? ' comm-chat-avatar--ai' : ''}`}>
                    {msg.avatar}
                  </div>
                  <div className="comm-chat-msg-body">
                    <div className={`comm-chat-msg-name${msg.isAI ? ' comm-chat-msg-name--ai' : ''}`}>
                      {msg.author}
                      {msg.isAI && msg.aiTag && (
                        <span className="comm-chat-ai-tag">{msg.aiTag}</span>
                      )}
                    </div>
                    <div className={`comm-chat-msg-text${msg.isAI ? ' comm-chat-msg-text--ai' : ''}`}>
                      {msg.isAI ? renderMessageText(msg.message) : msg.message}
                    </div>
                    <div className="comm-chat-msg-time">{formatRelativeTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))}

              {/* AI typing indicator */}
              {aiTyping && (
                <div className="comm-chat-msg comm-chat-msg--ai">
                  <div className="comm-chat-avatar comm-chat-avatar--ai">🧭</div>
                  <div className="comm-chat-msg-body">
                    <div className="comm-chat-msg-name comm-chat-msg-name--ai">TuniBot 🤖</div>
                    <div className="comm-chat-msg-text comm-chat-msg-text--ai comm-chat-typing">
                      <span className="comm-typing-dots">
                        <span className="comm-typing-dot" />
                        <span className="comm-typing-dot" />
                        <span className="comm-typing-dot" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {user ? (
              <div className="comm-chat-input-wrap">
                <input
                  type="text"
                  className="comm-chat-input"
                  placeholder="Votre message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="comm-chat-send" onClick={handleSendMessage} disabled={!chatInput.trim()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="comm-chat-login">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Connectez-vous pour participer
              </div>
            )}
          </div>

          {/* Trending */}
          <div className="comm-trending">
            <div className="comm-trending-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              <span>Tendances</span>
            </div>
            {TRENDING.map((t, i) => (
              <div key={i} className="comm-trending-item">
                <span className="comm-trending-tag">{t.tag}</span>
                <span className="comm-trending-count">{t.posts}</span>
              </div>
            ))}
          </div>

          {/* Suggested Members */}
          <div className="comm-suggested">
            <div className="comm-suggested-header">Membres suggérés</div>
            {[
              { name: 'Salma Baroudi', role: 'Photographe nature', av: 'S' },
              { name: 'Youssef Khelil', role: 'Guide montagne', av: 'Y' },
              { name: 'Amira Trabelsi', role: 'Blogueuse voyage', av: 'A' },
            ].map((m, i) => (
              <div key={i} className="comm-member">
                <div className="comm-member-avatar">{m.av}</div>
                <div className="comm-member-info">
                  <div className="comm-member-name">{m.name}</div>
                  <div className="comm-member-role">{m.role}</div>
                </div>
                <button className="comm-follow-btn">Suivre</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
