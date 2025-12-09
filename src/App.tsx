import React, { useState, useRef, useEffect } from 'react'
import { Search, Earth, User, Camera, Settings, Upload, Check, X, Users, Bell, Star, Shield, Share2, Image, IdCard, BarChart3, AlertCircle, CheckCircle, Plus } from 'lucide-react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import html2canvas from 'html2canvas';

interface User {
  email: string;
  password: string;
  name: string;
}

interface RecentDestination {
  flag: string;
  city: string;
  country: string;
  photo?: string | null;
}

interface VisitedCountry {
  id: string;
  name: string;
}

interface VisitedCity {
  id: string;
  name: string;
}

interface GeographyProps {
  geographies: Array<{
    id: string;
    rsmKey: string;
    properties: any;
  }>;
}

interface Notification {
  id: number;
  type: 'request';
  from: string;
  message: string;
  seen: boolean;
}

interface Highlight {
  id: number;
  friendId: number;
  avatar: string;
  name: string;
  text: string;
  time: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

type Screen = 'auth' | 'friends' | 'map' | 'profile'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users')
    return saved ? JSON.parse(saved) : [
      { email: 'ana@example.com', password: '123', name: 'Ana' },
      { email: 'joao@example.com', password: '123', name: 'João' },
      { email: 'maria@example.com', password: '123', name: 'Maria' },
      { email: 'pedro@example.com', password: '123', name: 'Pedro' },
      { email: 'carla@example.com', password: '123', name: 'Carla' },
      { email: 'lucas@example.com', password: '123', name: 'Lucas' },
      { email: 'sofia@example.com', password: '123', name: 'Sofia' },
      { email: 'miguel@example.com', password: '123', name: 'Miguel' },
      { email: 'isabela@example.com', password: '123', name: 'Isabela' },
      { email: 'rafael@example.com', password: '123', name: 'Rafael' }
    ]
  })
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [userName, setUserName] = useState('Global Explorer')
  const [tempUserName, setTempUserName] = useState(userName)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [friends, setFriends] = useState([
    { id: 1, name: 'Ana', role: 'Visualizer', avatar: '👩‍🦰', isOnline: true },
    { id: 2, name: 'João', role: 'Explorer', avatar: '👨‍🦱', isOnline: false },
    { id: 3, name: 'Maria', role: '@vembrony', avatar: '👩‍🦳', isOnline: true },
    { id: 4, name: 'Pedro', role: 'Visualizer', avatar: '👨‍🦲', isOnline: true },
    { id: 5, name: 'Carla', role: 'Explorer', avatar: '👩‍🦱', isOnline: false },
    { id: 6, name: 'Lucas', role: 'Adventurer', avatar: '👨‍🦰', isOnline: true },
    { id: 7, name: 'Sofia', role: 'Traveler', avatar: '👩‍🦰', isOnline: false },
    { id: 8, name: 'Miguel', role: 'Explorer', avatar: '👨‍🦱', isOnline: true },
    { id: 9, name: 'Isabela', role: 'Visualizer', avatar: '👩‍🦳', isOnline: true },
    { id: 10, name: 'Rafael', role: 'Nomad', avatar: '👨‍🦲', isOnline: false }
  ])
  const [showAllFriends, setShowAllFriends] = useState(false)
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false)
  const [newFriendName, setNewFriendName] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'request', from: 'Lucas', message: 'Lucas sent you a friend request', seen: false }
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [showFriendModal, setShowFriendModal] = useState(false)
  const [highlights] = useState<Highlight[]>([
    { id: 1, friendId: 3, avatar: '👩‍🦳', name: 'Maria', text: 'added a memory in Tokyo', time: '2 hours ago' },
    { id: 2, friendId: 2, avatar: '👨‍🦱', name: 'João', text: 'new adventure started', time: '5 hours ago' },
    { id: 3, friendId: 1, avatar: '👩‍🦰', name: 'Ana', text: 'completed Paris challenge', time: '1 day ago' }
  ])
  const [seenHighlights, setSeenHighlights] = useState(new Set([2]))
  const [recentDestinations, setRecentDestinations] = useState<RecentDestination[]>([]);
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([])
  const [visitedCities, setVisitedCities] = useState<VisitedCity[]>([])
  const [geographyData, setGeographyData] = useState<any>(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [language, setLanguage] = useState('pt')
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [countries, setCountries] = useState<string[]>([]);
  const [countryToISO, setCountryToISO] = useState<Record<string, string>>({});

  const countryFlags: Record<string, string> = {
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Brazil': '🇧🇷',
    'Portugal': '🇵🇹',
    'Germany': '🇩🇪'
  }
  
  const achievements = [
    { icon: '🏆', title: 'First trip', color: 'bg-yellow-400' },
    { icon: '🇪🇺', title: '10 countries. Europe', color: 'bg-blue-500' },
    { icon: '✈️', title: '100th in the air', color: 'bg-blue-400' }
  ]

  useEffect(() => {
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setIsAuthenticated(true)
      setUserName(user.name)
      setCurrentScreen('friends')
    }
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
        .then(res => res.json())
        .then(data => {
          setGeographyData(data);
          const isoMap: Record<string, string> = {};
          const countryNames: string[] = [];
          data.features.forEach((feature: any) => {
            const name = feature.properties.name;
            const iso = feature.properties['ISO3166-1-Alpha-2'];
            if (name && iso) {
              isoMap[name] = iso;
              countryNames.push(name);
            }
          });
          setCountryToISO(isoMap);
          setCountries(countryNames.sort());
        })
        .catch(err => {
          console.error('Error fetching geography data:', err);
        });
    }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== prev[0]?.id))
    }, 3000)
    return () => clearTimeout(timer)
  }, [toasts.length])

  const addToast = (message: string, type: 'success' | 'error') => {
    const newToast: Toast = { id: Date.now(), message, type }
    setToasts(prev => [newToast, ...prev.slice(0, 2)])
  }

  const getRandomAvatar = () => ['👩‍🦰', '👨‍🦱', '👩‍🦳', '👨‍🦲'][Math.floor(Math.random() * 4)]

  const unseenCount = notifications.filter(n => !n.seen).length

  const handleAddFriend = () => {
    const trimmedName = newFriendName.trim()
    if (!trimmedName) {
      addToast('Please enter a name', 'error')
      return
    }
    if (trimmedName.toLowerCase() === userName.toLowerCase()) {
      addToast('Cannot add yourself!', 'error')
      return
    }
    const targetUser = users.find(u => u.name.toLowerCase() === trimmedName.toLowerCase())
    if (!targetUser) {
      addToast('User not found!', 'error')
      return
    }
    if (friends.find(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      addToast('Already a friend!', 'error')
      return
    }
    if (notifications.find(n => n.from.toLowerCase() === trimmedName.toLowerCase() && n.type === 'request')) {
      addToast('Request already pending!', 'error')
      return
    }
    const newNotifId = Date.now()
    const newNotif: Notification = {
      id: newNotifId,
      type: 'request',
      from: trimmedName,
      message: `${trimmedName} sent you a friend request`,
      seen: false
    }
    setNotifications(prev => [...prev, newNotif])
    setNewFriendName('')
    setIsAddFriendModalOpen(false)
    addToast(`Friend request sent to ${trimmedName}!`, 'success')
  }

  const handleAcceptRequest = (fromName: string) => {
    const newFriend = {
      id: Date.now(),
      name: fromName,
      role: 'Friend',
      avatar: getRandomAvatar(),
      isOnline: true
    }
    setFriends(prev => [...prev, newFriend])
    setNotifications(prev => prev.filter(n => !(n.type === 'request' && n.from === fromName)))
    setShowNotifications(false)
  }

  const handleRejectRequest = (fromName: string) => {
    setNotifications(prev => prev.filter(n => !(n.type === 'request' && n.from === fromName)))
    setShowNotifications(false)
  }

  const handleNotificationsOpen = () => {
    setNotifications(prev => prev.map(n => !n.seen ? { ...n, seen: true } : n))
    setShowNotifications(true)
  }

  const handleHighlightClick = (highlightId: number) => {
    setSeenHighlights(prev => new Set([...prev, highlightId]))
  }

  const hasUnseenMemory = (friendId: number) => {
    return highlights.some(h => h.friendId === friendId && !seenHighlights.has(h.id))
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfileImage(url)
    }
  }

  const handleSaveProfile = () => {
    setUserName(tempUserName)
    setIsEditingProfile(false)
  }

  const handleCancelEdit = () => {
    setTempUserName(userName)
    setIsEditingProfile(false)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (users.find(u => u.email === email)) {
      addToast('Email already exists!', 'error')
      return
    }
    const newUser: User = { email, password, name: signupName || 'Global Explorer' }
    setUsers(prev => {
      const updated = [...prev, newUser]
      localStorage.setItem('users', JSON.stringify(updated))
      return updated
    })
    setCurrentUser(newUser)
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    setIsAuthenticated(true)
    setUserName(newUser.name)
    setCurrentScreen('friends')
    setIsSignup(false)
    addToast('Signup successful! You can now log in.', 'success')
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      setIsAuthenticated(true)
      setUserName(user.name)
      setCurrentScreen('friends')
    } else {
      addToast('Invalid email or password!', 'error')
    }
  }

  const handleAuthSubmit = (e: React.FormEvent) => {
    if (isSignup) {
      handleSignup(e)
    } else {
      handleLogin(e)
    }
  }

  const handleSaveSettings = () => {
    setIsSettingsModalOpen(false)
  }

  const StatusBar = ({ time }: { time: string }) => (
    <div className="flex justify-between items-center px-4 py-2 text-black text-sm font-medium relative">
      <span>{time}</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-1 h-3 bg-black rounded-full"></div>
          <div className="w-1 h-3 bg-black rounded-full"></div>
          <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
        </div>
        <div className="w-6 h-3 border border-black rounded-sm">
          <div className="w-4 h-full bg-black rounded-sm"></div>
        </div>
      </div>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`absolute top-0 left-0 right-0 bg-${toast.type === 'success' ? 'green' : 'red'}-500 text-white px-4 py-2 text-sm flex items-center gap-2 transform translate-y-[-100%] ${toast.type === 'success' ? 'border-green-600' : 'border-red-600'} border-l-4 z-20`}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      ))}
    </div>
  )

  const BottomNavigation = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 z-10">
      <button
        onClick={() => setCurrentScreen('friends')}
        className={`flex flex-col items-center gap-1 ${currentScreen === 'friends' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Users size={24} />
        <span className="text-xs font-medium">Friends</span>
      </button>
      <button
        onClick={() => setCurrentScreen('map')}
        className={`flex flex-col items-center gap-1 ${currentScreen === 'map' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Earth size={24} />
        <span className="text-xs font-medium">Map</span>
      </button>
      <button
        onClick={() => setCurrentScreen('profile')}
        className={`flex flex-col items-center gap-1 ${currentScreen === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <User size={24} />
        <span className="text-xs font-medium">Profile</span>
      </button>
    </div>
  )

  const AuthScreen = () => {
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const nameRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
      if (isSignup && nameRef.current) nameRef.current.focus()
      else if (emailRef.current) emailRef.current.focus()
    }, [isSignup])
    return (
      <div className="bg-gradient-to-b from-blue-300 to-blue-400 h-full flex flex-col justify-center items-center px-4">
        <StatusBar time="10:30" />
        <div className="w-full max-w-md">
          <h1 className="text-white text-3xl font-bold text-center mb-8">
            {isSignup ? 'Sign Up' : 'Log In'}
          </h1>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                  required
                />
              </div>
            )}
            <div>
              <input
                ref={emailRef}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                required
              />
            </div>
            <div>
              <input
                ref={passwordRef}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
            >
              {isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </form>
          <button
            onClick={() => {
              setIsSignup(!isSignup)
              setEmail('')
              setPassword('')
              setSignupName('')
            }}
            className="w-full mt-4 text-blue-200 hover:text-white"
          >
            {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    )
  }

  const FriendsScreen = () => (
    <div className="bg-gradient-to-b from-blue-300 to-blue-400 h-full overflow-y-auto relative">
      <StatusBar time="10:30" />
      <div className="px-4 py-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-white text-xl font-semibold">Friends</h1>
          </div>
          <div className="relative">
            <button onClick={handleNotificationsOpen} className="text-white">
              <Bell size={20} />
            </button>
            {unseenCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2 max-w-[70%]">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-sm w-full min-w-0 px-1"
            />
          </div>
          <button
            onClick={() => setIsAddFriendModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Add Friend
          </button>
        </div>
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-3">Connections</h2>
          {!showAllFriends ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {friends.slice(0, 5).map((friend) => {
                const hasUnseen = hasUnseenMemory(friend.id)
                return (
                  <button
                    key={friend.id}
                    onClick={() => {
                      setSelectedFriend(friend)
                      setShowFriendModal(true)
                    }}
                    className={`bg-white rounded-xl p-3 text-center hover:bg-gray-50 transition-colors transform hover:scale-105 relative ${hasUnseen ? 'ring-2 ring-blue-500/30' : ''}`}
                  >
                    {friend.isOnline && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                    <div className="text-2xl mb-2">{friend.avatar}</div>
                    <div className="text-sm font-semibold text-gray-800">{friend.name}</div>
                    <div className="text-xs text-gray-500">{friend.role}</div>
                  </button>
                )
              })}
              <button
                onClick={() => setShowAllFriends(true)}
                className="bg-white rounded-xl p-3 text-center flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="text-gray-400 text-2xl mb-1">+</div>
                <div className="text-xs text-gray-500">Ver mais</div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => {
                const hasUnseen = hasUnseenMemory(friend.id)
                return (
                  <div key={friend.id} className={`bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${hasUnseen ? 'ring-2 ring-blue-500/30' : ''}`} onClick={() => {
                    setSelectedFriend(friend)
                    setShowFriendModal(true)
                  }}>
                    {friend.isOnline && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                    <div className="text-2xl">{friend.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-800">{friend.name}</div>
                      <div className="text-sm text-gray-600">{friend.role}</div>
                    </div>
                  </div>
                )
              })}
              <button
                onClick={() => setShowAllFriends(false)}
                className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg"
              >
                Ver menos
              </button>
            </div>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-3">Recent highlights</h2>
          <div className="space-y-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className={`bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!seenHighlights.has(highlight.id) ? 'ring-1 ring-blue-500' : ''}`}
                onClick={() => handleHighlightClick(highlight.id)}
              >
                <div className="text-2xl">{highlight.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-800">{highlight.name}</div>
                  <div className="text-sm text-gray-600">{highlight.text}</div>
                  <div className="text-xs text-gray-400">{highlight.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isAddFriendModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h2 className="text-xl font-bold mb-4">Add Friend</h2>
            <input
              type="text"
              placeholder="Enter friend's name"
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddFriend}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
              >
                Send Request
              </button>
              <button
                onClick={() => {
                  setIsAddFriendModalOpen(false)
                  setNewFriendName('')
                }}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 max-h-80 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            {notifications.map(notif => (
              <div key={notif.id} className={`p-3 rounded-lg mb-2 ${!notif.seen ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <p className="text-sm">{notif.message}</p>
                {notif.type === 'request' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAcceptRequest(notif.from)}
                      className="flex-1 bg-green-500 text-white py-1 rounded text-xs"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(notif.from)}
                      className="flex-1 bg-red-500 text-white py-1 rounded text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full mt-4 bg-gray-300 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showFriendModal && selectedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80">
            <h2 className="text-xl font-bold mb-4">{selectedFriend.name}'s Profile</h2>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                <User size={16} /> View Profile
              </button>
              <button className="w-full p-3 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                <Earth size={16} /> View Map
              </button>
              <button className="w-full p-3 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                <Image size={16} /> View Memories
              </button>
              <button className="w-full p-3 bg-yellow-100 rounded-lg flex items-center gap-2 hover:bg-yellow-200">
                <Star size={16} /> Mark as Favorite
              </button>
              <button className="w-full p-3 bg-red-100 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-200">
                <X size={16} /> Remove
              </button>
              <button className="w-full p-3 bg-red-100 rounded-lg flex items-center gap-2 text-red-600 hover:bg-red-200">
                <Shield size={16} /> Block
              </button>
              <button className="w-full p-3 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200">
                <Share2 size={16} /> Send Profile
              </button>
            </div>
            <button
              onClick={() => setShowFriendModal(false)}
              className="w-full mt-4 bg-gray-300 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const MapScreen = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [localSelectedCountry, setLocalSelectedCountry] = useState('');
    const [localCityInput, setLocalCityInput] = useState('');
    const [localPhoto, setLocalPhoto] = useState<string | null>(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState('');

    // Função para lidar com upload de foto
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLocalPhoto(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleCameraClick = () => {
      fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
      setLocalPhoto(null);
    };

    const filteredCountries = countries.filter(country =>
      country.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    // Função para adicionar nova viagem - integrada com o estado global
    const handleAddTrip = () => {
      if (localSelectedCountry && localCityInput && localCityInput !== 'E.g. Paris, Tokyo') {
        // Adicionar ao estado global de países visitados
        const iso = countryToISO[localSelectedCountry];
        if (iso && !visitedCountries.find(v => v.id === iso)) {
          setVisitedCountries(prev => [...prev, { id: iso, name: localSelectedCountry }]);
        }

        const cityId = `${localSelectedCountry.toLowerCase().replace(/\s+/g, '-')}-${localCityInput.toLowerCase().replace(/\s+/g, '-')}`;
        if (!visitedCities.find(v => v.id === cityId)) {
          setVisitedCities(prev => [...prev, { 
            id: cityId, 
            name: localCityInput
          }]);
        }

        // Adicionar aos destinos recentes com a foto
        const newDest = {
          flag: countryFlags[localSelectedCountry as keyof typeof countryFlags] || '🌍',
          city: localCityInput,
          country: localSelectedCountry,
          photo: localPhoto // Adiciona a foto ao destino
        };
        
        setRecentDestinations(prev => [newDest, ...prev].slice(0, 3));
        
        // Limpar formulário
        setLocalSelectedCountry('');
        setLocalCityInput('');
        setLocalPhoto(null);
        setIsFormVisible(false);
        
        addToast('Trip added successfully!', 'success');
      } else {
        addToast('Please select a country and enter a city.', 'error');
      }
    };

    // Função para clicar no país - mostra a foto se existir
    const handleCountryClick = (countryName: string) => {
      const visitedCountry = recentDestinations.find(dest => 
        dest.country.toLowerCase() === countryName.toLowerCase()
      );
      
      if (visitedCountry && (visitedCountry as any).photo) {
        setSelectedPhoto((visitedCountry as any).photo);
        setShowPhotoModal(true);
      }
    };

    return (
      <div className="bg-gradient-to-b from-blue-300 to-blue-400 h-full flex flex-col relative" id="map-container">
        <StatusBar time="10:30" />
        {/* Mapa em tela cheia */}
        <div className="flex-1 overflow-hidden relative">
          {geographyData ? (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 200,
                center: [0, 0]
              }}
              style={{ width: "100%", height: "100%" }}
            >
            <ZoomableGroup
              maxZoom={50}
              filterZoomEvent={(event: any) => {
                return ["wheel","touchmove", "mousedown", "mousemove", "mouseup", "touchstart", "touchend"].includes(event.type);
              }}
              translateExtent={[
                [-100, 550],   // esquerda infinita, limite superior
                [ 1030, 0],   // direita infinita, limite inferior
              ]}
            >
            <Geographies geography={geographyData}>
              {({ geographies }: GeographyProps) =>
                geographies.map((geo: any) => {
                  const countryName = geo.properties.name;
                  const isVisited = visitedCountries.some(
                    (country) =>
                      country.name.toLowerCase() === countryName.toLowerCase()
                  );
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isVisited ? "#F0AB3F" : "#E0E0E0"}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: isVisited ? "#E89B2F" : "#D6D6D6",
                          cursor: isVisited ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onClick={() => isVisited && handleCountryClick(countryName)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        ) : (
        <div className="flex items-center justify-center h-full text-gray-500">Loading map...</div>
        )}
      </div>

        {/* Botão + flutuante - posicionado acima da navbar */}
        <button
          onClick={() => setIsFormVisible(true)}
          className="absolute bottom-20 right-6 w-12 h-12 bg-blue-400 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-500 transition-all duration-200 z-10"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Overlay com formulário */}
        {isFormVisible && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-20 flex items-end">
            <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="p-4">
                {/* Header do formulário */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Your Journey</h2>
                  <button 
                    onClick={() => setIsFormVisible(false)}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 rounded-full"
                  >
                    <X></X>
                  </button>
                </div>
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Country</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value);
                          setIsDropdownOpen(value.length >= 2); // Show after 2 letters
                        }}
                        onFocus={() => setIsDropdownOpen(searchTerm.length >= 2)}
                        placeholder={localSelectedCountry || "Select a country"}
                        className="w-full p-4 border border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:outline-none transition-colors text-base pr-10"
                      />
                      {localSelectedCountry && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocalSelectedCountry('');
                            setSearchTerm('');
                            setIsDropdownOpen(false);
                          }}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      )}
                      {isDropdownOpen && filteredCountries.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg">
                          {filteredCountries.map((country) => (
                            <li
                              key={country}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base"
                              onClick={() => {
                                setLocalSelectedCountry(country);
                                setSearchTerm(country);
                                setIsDropdownOpen(false);
                              }}
                            >
                              {country}
                            </li>
                          ))}
                        </ul>
                      )}
                      {isDropdownOpen && searchTerm.length >= 2 && filteredCountries.length === 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg px-4 py-2 text-gray-500">
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">City</label>
                    <input
                      type="text"
                      value={localCityInput}
                      onChange={(e) => setLocalCityInput(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base"
                      placeholder="Enter city name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} ref={fileInputRef} className="hidden"/>
                    {localPhoto ? (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative w-24 h-24">
                          <img 
                            src={localPhoto} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-xl border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Mostra APENAS o botão de upload quando não há foto
                      <button
                        type="button"
                        onClick={handleCameraClick}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-base hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2"
                      >
                        <Camera size={32} className="text-gray-500" />
                        <span className="text-gray-600 font-medium">Click to upload photo</span>
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={handleAddTrip}
                    disabled={!localSelectedCountry || !localCityInput}
                    className="w-full bg-blue-500 text-white py-4 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed text-base"
                  >
                    Add Trip
                  </button>
                </div>
              </div>

              {/* Recent Destinations */}
              <div className="bg-gray-50 rounded-2xl m-4 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Destinations</h3>
                <div className="space-y-3">
                  {recentDestinations.map((dest, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer active:bg-gray-200 transition-colors"
                      onClick={() => {
                        if ((dest as any).photo) {
                          setSelectedPhoto((dest as any).photo);
                          setShowPhotoModal(true);
                        }
                      }}
                    >
                      {(dest as any).photo ? (
                        <img src={(dest as any).photo} alt={dest.city} className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <div className="text-xl w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                          {dest.flag}
                        </div>
                      )}
                      <span className="text-gray-700 font-medium">{dest.city}, {dest.country}</span>
                    </div>
                  ))}
                  {recentDestinations.length === 0 && (
                    <div className="text-gray-500 text-center py-6">No destinations added yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para mostrar a foto */}
        {showPhotoModal && (
          <div className="absolute inset-0 bg-black bg-opacity-90 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
              <div className="flex justify-end p-3">
                <button 
                  onClick={() => setShowPhotoModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl bg-gray-100 rounded-full"
                >
                  <X></X>
                </button>
              </div>
              <div className="p-4">
                <img 
                  src={selectedPhoto} 
                  alt="Trip photo" 
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProfileScreen = () => {
    const nameInputRef = useRef<HTMLInputElement>(null)

  const handleShareMap = async () => {
    try {
      // 1. Primeiro navegar para o MapScreen
      setCurrentScreen('map');
      
      // 2. Esperar que o mapa carregue
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 3. Agora capturar o mapa
      const targetElement = document.getElementById('map-container');
      
      if (!targetElement) {
        throw new Error("Mapa ainda não carregou. Tenta novamente.");
      }

      const canvas = await html2canvas(targetElement, {
        backgroundColor: '#93c5fd',
        scale: 2,
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const fileName = `meu-mapa-${Date.now()}.png`;
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = imageData;
      link.click();

      alert(`Mapa capturado com sucesso!\n\nAgora podes partilhar no Instagram!`);

    } catch (error) {
      console.error("❌ Erro:", error);
      alert("Não foi possível capturar o mapa. Tenta ir manualmente para o mapa primeiro.");
    }
  };

    useEffect(() => {
      if (isEditingProfile && nameInputRef.current) {
        nameInputRef.current.focus()
      }
    }, [isEditingProfile])
    return (
      <div className="bg-gradient-to-b from-blue-300 to-blue-400 h-full overflow-y-auto relative">
        <StatusBar time="10:00" />
        <div className="px-4 py-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-white text-xl font-semibold">Profile</h1>
            </div>
            <div className="flex items-center gap-3">
            <button
              onClick={handleShareMap}
              className="text-white hover:text-blue-100 transition-colors"
              title="Share personal map"
            >
              <Upload size={20} />
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <Settings size={20} />
            </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 mb-4 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center hover:bg-blue-300 transition-colors group relative"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={32} className="text-blue-500" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all">
                    <Camera size={16} className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
                <div>
                  {isEditingProfile ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={tempUserName}
                        onChange={(e) => setTempUserName(e.target.value)}
                        className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 outline-none bg-transparent"
                        autoFocus
                      />
                      <button onClick={handleSaveProfile} className="text-green-500 hover:text-green-600">
                        <Check size={16} />
                      </button>
                      <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <IdCard size={16} className="text-gray-600" />
                </button>
                <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <BarChart3 size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            {/* Combined Stats */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-center flex-1">
                <div className="text-gray-600 font-medium mb-1">Countries</div>
                <div className="text-2xl font-bold text-gray-800">{visitedCountries.length}</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-gray-600 font-medium mb-1">Cities</div>
                <div className="text-2xl font-bold text-gray-800">{visitedCities.length}</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-gray-600 font-medium mb-1">Friends</div>
                <div className="text-2xl font-bold text-gray-800">{friends.length}</div>
              </div>
            </div>  
          </div>
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-3">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <button
                  key={index}
                  className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors transform hover:scale-105"
                >
                  <div className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center text-white text-lg`}>
                    {achievement.icon}
                  </div>
                  <span className="font-medium text-gray-800">{achievement.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-3">Travel Stats 1</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Distance Traveled</span>
                  <span className="font-bold text-gray-800">45,230 km</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Passport Progress</span>
                  <span className="font-bold text-gray-800">{visitedCountries.length}/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(visitedCountries.length / 50) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-80 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-gray-700">Accept Terms & Conditions</label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="flex-1 bg-gray-300 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCurrentScreen = () => {
    if (!isAuthenticated) {
      return <AuthScreen />
    }
    switch(currentScreen) {
      case 'friends':
        return <FriendsScreen />
      case 'map':
        return <MapScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <MapScreen />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          {renderCurrentScreen()}
          {isAuthenticated && <BottomNavigation />}
        </div>
      </div>
    </div>
  )
}

export default App