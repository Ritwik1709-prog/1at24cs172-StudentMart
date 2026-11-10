import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import {
  ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, Box,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command,
  CreditCard, Download, Eye, EyeOff, GraduationCap, LayoutDashboard, LifeBuoy,
  Lock, LogOut, Mail, Menu, MoreHorizontal, Package, Plus, Search, Settings, ShieldCheck,
  ShoppingBag, Sparkles, TrendingUp, Users, X, Store, Moon, Sun,
} from 'lucide-react'
const StudentStorefront = lazy(() => import('./components/StudentStorefront.tsx'))

const API = '/api/auth'
const initialProducts = [
  { id: 'sample-calculus-notes', name: 'Calculus II — handwritten notes', category: 'Notes & study guides', price: 149, sales: 84, stock: 'Available', mark: '📓', tone: 'lilac', date: 'Nov 2, 2026', description: 'Clear, exam-ready notes with worked examples.' },
  { id: 'sample-engineering-maths', name: 'Engineering Mathematics III', category: 'Textbooks', price: 450, sales: 62, stock: 'Available', mark: '📘', tone: 'blue', date: 'Oct 30, 2026', description: 'Second-hand textbook in good condition.' },
  { id: 'sample-calculator', name: 'Casio fx-991CW scientific calculator', category: 'Electronics', price: 1249, sales: 41, stock: 'Available', mark: '🧮', tone: 'mint', date: 'Oct 28, 2026', description: 'Reliable scientific calculator for coursework.' },
  { id: 'sample-stationery', name: 'Campus stationery starter kit', category: 'Stationery', price: 299, sales: 36, stock: 'Available', mark: '✏️', tone: 'peach', date: 'Oct 26, 2026', description: 'Pens, sticky notes, highlighters and more.' },
  { id: 'sample-arduino', name: 'Arduino Uno project starter kit', category: 'Project kits', price: 899, sales: 29, stock: 'Available', mark: '🔌', tone: 'blue', date: 'Oct 24, 2026', description: 'Everything you need to start your next build.' },
  { id: 'sample-lab-set', name: 'Lab coat and safety goggles set', category: 'Campus essentials', price: 499, sales: 23, stock: 'Available', mark: '🥼', tone: 'lilac', date: 'Oct 22, 2026', description: 'A practical lab-ready coat and eye protection.' },
]
const orders = [
  { id: '#SM-2849', buyer: 'Aarav Sharma', initials: 'AS', color: 'lavender', item: 'Engineering Mathematics III', date: 'Today, 10:42 AM', amount: '₹450', status: 'Completed' },
  { id: '#SM-2848', buyer: 'Diya Reddy', initials: 'DR', color: 'peach', item: 'Campus stationery starter kit', date: 'Today, 9:18 AM', amount: '₹299', status: 'Processing' },
  { id: '#SM-2847', buyer: 'Kabir Mehta', initials: 'KM', color: 'mint', item: 'Calculus II — handwritten notes', date: 'Yesterday, 6:30 PM', amount: '₹149', status: 'Completed' },
  { id: '#SM-2846', buyer: 'Ananya Iyer', initials: 'AI', color: 'blue', item: 'Arduino Uno project starter kit', date: 'Yesterday, 4:05 PM', amount: '₹899', status: 'Completed' },
  { id: '#SM-2845', buyer: 'Ishaan Kapoor', initials: 'IK', color: 'pink', item: 'Casio fx-991CW scientific calculator', date: 'Oct 29, 2026', amount: '₹1,249', status: 'Refunded' },
]
const productCategories = ['Textbooks', 'Notes & study guides', 'Stationery', 'Electronics', 'Project kits', 'Campus essentials']
const categoryArt = { Textbooks: ['📚', 'blue'], 'Notes & study guides': ['📓', 'lilac'], Stationery: ['✏️', 'peach'], Electronics: ['🧮', 'mint'], 'Project kits': ['🔌', 'blue'], 'Campus essentials': ['🎒', 'lilac'] }
const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0)
const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My products', icon: Package, count: '12' },
  { label: 'Storefront', icon: Store },
  { label: 'Orders', icon: ShoppingBag, count: '4' },
  { label: 'Customers', icon: Users },
  { label: 'Analytics', icon: TrendingUp },
]
const sellerNav = [
  { label: 'My products', icon: Package },
  { label: 'Storefront', icon: Store },
]

const TOKEN_KEY = 'student_mart_token'

async function api(path, options = {}) {
  let token = null
  try { token = localStorage.getItem(TOKEN_KEY) } catch {}

  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.')
  return data
}

async function productApi(path, options = {}) {
  let token = null
  try { token = localStorage.getItem(TOKEN_KEY) } catch {}

  const response = await fetch(`/api/products${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Could not save this product. Please try again.')
  return data
}

function Brand({ small = false }) {
  return <div className={`brand ${small ? 'brand-small' : ''}`}><span className="brand-icon"><GraduationCap size={19} strokeWidth={2.1} /></span><span>student<span className="brand-light">mart</span></span></div>
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      className="theme-toggle-pill"
      onClick={onToggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}

function AuthScreen({ onAuthenticated, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [touched, setTouched] = useState(false)
  const googleAreaRef = useRef(null)
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320)
  const isRegister = mode === 'register'

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())
  const hasMinLen = form.password.length >= 8 && form.password.length <= 72
  const hasUpper = /[A-Z]/.test(form.password)
  const hasLower = /[a-z]/.test(form.password)
  const hasNumber = /\d/.test(form.password)
  const passwordOk = hasMinLen && hasUpper && hasLower && hasNumber
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0

  useEffect(() => {
    const element = googleAreaRef.current
    if (!element || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return
    const updateWidth = () => setGoogleButtonWidth(Math.max(220, Math.floor(element.getBoundingClientRect().width)))
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setTouched(true)
    setError('')

    if (!form.email.trim()) {
      return setError('Please enter your email address.')
    }
    if (!emailOk) {
      return setError('Enter a valid email address (e.g. you@college.edu).')
    }

    if (isRegister) {
      if (form.name.trim().length < 2) {
        return setError('Please enter your name (at least 2 characters).')
      }
      if (!passwordOk) {
        return setError('Password must be 8–72 characters and include an uppercase letter, lowercase letter, and a number.')
      }
      if (form.password !== form.confirmPassword) {
        return setError('Passwords do not match. Please verify.')
      }
    } else {
      if (!form.password) {
        return setError('Enter your password.')
      }
    }

    setBusy(true)
    try {
      const payload = isRegister
        ? { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password }
        : { email: form.email.trim().toLowerCase(), password: form.password }

      const result = await api(isRegister ? '/register' : '/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (result.token) {
        try { localStorage.setItem(TOKEN_KEY, result.token) } catch {}
      }
      onAuthenticated(result.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function googleSuccess(response) {
    if (!response.credential) return setError('Google did not return a sign-in credential. Please try again.')
    setBusy(true)
    setError('')
    try {
      const result = await api('/google', { method: 'POST', body: JSON.stringify({ credential: response.credential }) })
      if (result.token) {
        try { localStorage.setItem(TOKEN_KEY, result.token) } catch {}
      }
      onAuthenticated(result.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setError('')
    setTouched(false)
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return <main className="auth-shell">
    <section className="auth-visual">
      <div className="auth-visual-inner">
        <Brand />
        <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
        <div className="visual-art">
          <div className="floating-note note-one">
            <span className="tiny-symbol mint-symbol">↗</span>
            <div><b>₹24,680</b><small>Monthly volume · <span className="trend-badge">+18.4%</span></small></div>
          </div>
          <div className="art-window">
            <div className="art-window-head"><i /><i /><i /><span>campus creator edition</span></div>
            <div className="art-book">
              <div className="book-sun"/>
              <div className="book-ridge ridge-one"/>
              <div className="book-ridge ridge-two"/>
              <span>MAKE<br/>YOUR<br/>MARK.</span>
            </div>
            <div className="art-sticker">STUDENT<br/>VERIFIED <Sparkles size={12}/></div>
          </div>
          <div className="floating-note note-two">
            <div className="mini-stack"><i>✳</i><i>▤</i><i>◈</i></div>
            <div><b>New order!</b><small>Engineering book · ₹849</small></div>
            <span className="note-check"><Check size={14}/></span>
          </div>
        </div>
        <div className="visual-copy">
          <p className="eyebrow light-eyebrow"><Sparkles size={12} /> YOUR SPACE TO GROW</p>
          <h1>Big ideas deserve<br/>a <span className="visual-highlight">brilliant</span> home.</h1>
          <p>Everything you need to turn your side project into your main thing. Create, share, and earn — all in one place.</p>
        </div>
        <div className="visual-footer">
          <div className="avatar-group"><span>AS</span><span>MR</span><span>SK</span><span>+</span></div>
          <span>Trusted by 1,400+ student creators across campuses.</span>
        </div>
      </div>
    </section>

    <section className="auth-panel">
      <div className="auth-card-container">
        <div className="auth-form-wrap">
          <div className="auth-card-top">
            <div className="auth-badge">
              <span className="badge-sparkle"><Sparkles size={12} /></span>
              <span>{isRegister ? 'GET STARTED' : 'WELCOME BACK'}</span>
            </div>
            <div className="auth-switch-box">
              <span>{isRegister ? 'Have an account?' : 'New here?'}</span>
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode(isRegister ? 'login' : 'register')}
              >
                {isRegister ? 'Sign in' : 'Create account'}
                <ArrowRight size={13}/>
              </button>
            </div>
          </div>

          <div className="auth-header">
            <h2>
              {isRegister ? (
                <>Your next chapter <span className="auth-heading-gradient">starts here</span>.</>
              ) : (
                <>Good to have <span className="auth-heading-gradient">you back</span>.</>
              )}
            </h2>
            <p className="auth-subtitle">
              {isRegister
                ? 'Create your free account and launch your student store today.'
                : 'Sign in to access your student creator workspace and orders.'}
            </p>
          </div>

          <div className="google-auth-area" ref={googleAreaRef}>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={googleSuccess}
                onError={() => setError('Google sign-in was cancelled or could not be completed.')}
                text="continue_with"
                theme="outline"
                size="medium"
                shape="rectangular"
                logo_alignment="left"
                use_fedcm_for_button={false}
                width={String(googleButtonWidth)}
                containerProps={{ style: { width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
              />
            ) : (
              <button
                type="button"
                className="google-auth-fallback"
                onClick={() => setError('Google sign-in is almost ready. Add your Google Web Client ID to .env to activate it.')}
              >
                <GoogleIcon />
                <span>{isRegister ? 'Sign up' : 'Continue'} with Google</span>
              </button>
            )}
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <span className="google-setup-hint">Google OAuth sign-in is ready for setup</span>
            )}
          </div>

          <div className="auth-divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            {isRegister && (
              <label className="field-label">
                <span>Full name</span>
                <div className={`input-wrap ${touched && form.name.trim().length < 2 ? 'input-invalid' : ''}`}>
                  <Users size={17} className="input-icon" />
                  <input
                    autoComplete="name"
                    placeholder="e.g. Riya Sharma"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                {touched && form.name.trim().length < 2 && (
                  <span className="field-error">Please enter at least 2 characters.</span>
                )}
              </label>
            )}

            <label className="field-label">
              <span>Email address</span>
              <div className={`input-wrap ${touched && (!form.email.trim() || !emailOk) ? 'input-invalid' : ''}`}>
                <Mail size={17} className="input-icon" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {touched && (!form.email.trim() || !emailOk) && (
                <span className="field-error">Please enter a valid email address (e.g. name@domain.com).</span>
              )}
            </label>

            <label className="field-label">
              <span>Password</span>
              <div className={`input-wrap ${touched && form.password && isRegister && !passwordOk ? 'input-invalid' : ''}`}>
                <Lock size={17} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="icon-button password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </label>

            {isRegister && (
              <label className="field-label">
                <span>Confirm password</span>
                <div className={`input-wrap ${touched && form.confirmPassword && !passwordsMatch ? 'input-invalid' : ''}`}>
                  <ShieldCheck size={17} className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="icon-button password-toggle"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {touched && form.confirmPassword && !passwordsMatch && (
                  <span className="field-error">Passwords do not match.</span>
                )}
              </label>
            )}

            {isRegister && (
              <div className="password-criteria" role="status" aria-label="Password requirements checklist">
                <span className={`criteria-item ${hasMinLen ? 'met' : ''}`}>
                  <span className="criteria-check"><Check size={11} /></span> 8–72 characters
                </span>
                <span className={`criteria-item ${hasUpper ? 'met' : ''}`}>
                  <span className="criteria-check"><Check size={11} /></span> Uppercase letter
                </span>
                <span className={`criteria-item ${hasLower ? 'met' : ''}`}>
                  <span className="criteria-check"><Check size={11} /></span> Lowercase letter
                </span>
                <span className={`criteria-item ${hasNumber ? 'met' : ''}`}>
                  <span className="criteria-check"><Check size={11} /></span> Number (0-9)
                </span>
                {form.confirmPassword.length > 0 && (
                  <span className={`criteria-item ${passwordsMatch ? 'met' : ''}`} style={{ gridColumn: 'span 2' }}>
                    <span className="criteria-check"><Check size={11} /></span> Passwords match
                  </span>
                )}
              </div>
            )}

            {!isRegister && (
              <div className="form-options">
                <label className="remember">
                  <input type="checkbox"/>
                  <span className="custom-checkbox"><Check size={11} className="check-svg" /></span>
                  <span>Keep me signed in</span>
                </label>
                <button
                  className="text-button subtle-button"
                  type="button"
                  onClick={() => setError('Password reset is managed by the administrator. Contact support if needed.')}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <div role="alert" className="form-error">{error}</div>}

            <button className="primary-button auth-submit" disabled={busy}>
              {busy ? (
                <span className="spinner"/>
              ) : (
                <>
                  <span>{isRegister ? 'Create your account' : 'Sign in to your workspace'}</span>
                  <ArrowRight size={16} className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          <p className="auth-terms">
            By continuing, you agree to Student Mart's <button type="button">Terms</button> and <button type="button">Privacy Policy</button>.
          </p>
        </div>

        <footer className="auth-bottom">
          <span>© 2026 Student Mart</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme}/>
          <button type="button" onClick={() => alert('Student Mart Help Center: Support is available 24/7.')}>
            <CircleHelp size={14}/> Help center
          </button>
        </footer>
      </div>
    </section>
  </main>
}

function AreaChart({ period }) {
  const points = period === '7 days' ? '0,119 37,110 74,92 111,101 148,68 185,77 222,52 259,61 296,29 333,38 370,16 407,24 444,9' : period === '90 days' ? '0,125 37,112 74,118 111,80 148,99 185,63 222,72 259,39 296,50 333,20 370,32 407,11 444,5' : '0,120 37,104 74,111 111,76 148,88 185,57 222,72 259,43 296,53 333,20 370,34 407,12 444,4'
  return <div className="chart-wrap"><div className="chart-y-labels"><span>₹30k</span><span>₹20k</span><span>₹10k</span><span>₹0</span></div><div className="chart-plot"><div className="chart-grid"><i/><i/><i/><i/></div><svg viewBox="0 0 444 150" preserveAspectRatio="none" role="img" aria-label={`Revenue trend over the last ${period}`}><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4e52d8" stopOpacity=".18"/><stop offset="100%" stopColor="#4e52d8" stopOpacity="0"/></linearGradient></defs><polygon points={`0,150 ${points} 444,150`} fill="url(#chartFill)"/><polyline points={points} fill="none" stroke="#5755d9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/><circle cx="370" cy={period === '7 days' ? '16' : '34'} r="4" fill="#fff" stroke="#5755d9" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg><div className="chart-hover"><span>Oct 26</span><b>₹24,680</b></div><div className="chart-x-labels"><span>Oct 01</span><span>Oct 06</span><span>Oct 11</span><span>Oct 16</span><span>Oct 21</span><span>Oct 26</span><span>Oct 31</span></div></div></div>
}

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const isAdmin = user.role === 'admin'
  const visibleNav = isAdmin ? nav : sellerNav
  const [active, setActive] = useState(isAdmin ? 'Overview' : 'My products')
  const [period, setPeriod] = useState('30 days')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [products, setProducts] = useState(isAdmin ? initialProducts : [])
  const [toast, setToast] = useState('')
  const [notifications, setNotifications] = useState(false)
  const firstName = (user?.name || user?.email?.split('@')[0] || 'User').trim().split(/\s+/)[0] || 'User'
  const initials = ((user?.name || user?.email || 'U').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('') || 'U').toUpperCase()
  const filteredOrders = useMemo(() => orders.filter(o => `${o.id} ${o.buyer} ${o.item} ${o.status}`.toLowerCase().includes(search.toLowerCase())), [search])
  const filteredProducts = useMemo(() => products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())), [products, search])
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3000); return () => clearTimeout(id) }, [toast])
  useEffect(() => {
    let live = true
    productApi('/').then(({ products: saved = [] }) => {
      if (!live) return
      const mapped = saved.map(product => {
        const [mark, tone] = categoryArt[product.category] || ['🎓', 'lilac']
        return { id: product._id, name: product.name, category: product.category, price: product.price, description: product.description, sales: 0, stock: 'Available', mark, tone, date: new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
      })
      setProducts(current => [...mapped, ...current.filter(item => !mapped.some(savedProduct => savedProduct.id === item.id))])
    }).catch(() => {})
    return () => { live = false }
  }, [user.id])

  async function logout() {
    try { await api('/logout', { method: 'POST' }) } catch {}
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    onLogout()
  }
  async function saveProduct(event) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    setSavingProduct(true)
    try {
      const payload = { name: String(fd.get('name')), category: String(fd.get('category')), price: Number(fd.get('price')), description: String(fd.get('description') || '') }
      const { product } = await productApi('/', { method: 'POST', body: JSON.stringify(payload) })
      const [mark, tone] = categoryArt[product.category] || ['🎓', 'lilac']
      const created = { id: product._id, name: product.name, category: product.category, price: product.price, description: product.description, sales: 0, stock: 'Available', mark, tone, date: 'Just now' }
      setProducts(current => [created, ...current])
      setAddOpen(false); setActive('Storefront'); setSearch(''); setToast('Your product is live on the storefront.')
    } catch (error) { setToast(error.message) }
    finally { setSavingProduct(false) }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}><div className="sidebar-brand"><Brand/><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <button className="store-switcher"><div className="store-avatar">{firstName.slice(0, 1).toUpperCase()}</div><span className="store-name"><b>{firstName}’s store</b><small>Student creator</small></span><ChevronDown size={15}/></button>
      <p className="nav-label">{isAdmin ? 'ADMIN WORKSPACE' : 'MY SELLER PANEL'}</p><nav className="main-nav">{visibleNav.map(item => <button key={item.label} className={`nav-item ${active === item.label ? 'nav-active' : ''}`} onClick={() => { setActive(item.label); setSearch(''); setMobileNav(false) }}><item.icon size={18}/><span>{item.label}</span>{item.label === 'My products' ? <small>{products.filter(product => !String(product.id).startsWith('sample-')).length}</small> : item.count && <small>{item.count}</small>}</button>)}</nav>
      <p className="nav-label tools-label">PREFERENCES</p><nav className="main-nav"><button className={`nav-item ${active === 'Settings' ? 'nav-active' : ''}`} onClick={() => {setActive('Settings');setMobileNav(false)}}><Settings size={18}/><span>Settings</span></button><button className="nav-item" onClick={() => setToast('Help center is ready to assist you.')}><LifeBuoy size={18}/><span>Help & support</span><ArrowUpRight className="external-icon" size={13}/></button></nav>
      <div className="sidebar-bottom"><div className="plan-card"><span className="plan-spark"><Sparkles size={15}/></span><b>Enjoying Student Mart?</b><p>Invite a friend and grow together.</p><button onClick={() => {navigator.clipboard?.writeText(window.location.origin);setToast('Your store link was copied.')}}>Invite a friend <ArrowRight size={14}/></button><span className="plan-decoration">✳</span></div><button className="profile-button" onClick={() => setMenuOpen(!menuOpen)}><span className="profile-avatar">{initials}</span><span className="profile-copy"><b>{user?.name || 'User'}</b><small>{user?.email}</small></span><MoreHorizontal size={18}/></button>{menuOpen && <div className="profile-menu"><button onClick={() => {setActive('Settings');setMenuOpen(false)}}><Settings size={15}/> Account settings</button><button onClick={logout}><LogOut size={15}/> Sign out</button></div>}</div>
    </aside>
    {mobileNav && <button className="mobile-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><b>{active}</b></div></div><div className="topbar-actions"><label className="global-search"><Search size={16}/><input aria-label="Search orders or products" placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd><Command size={11}/> K</kbd></label><ThemeToggle theme={theme} onToggle={onToggleTheme}/><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={()=>setNotifications(!notifications)}><Bell size={18}/><i/></button>{notifications && <div className="notification-popover"><b>You’re all caught up</b><span>New orders and updates will show here.</span></div>}</div><span className="topbar-divider"/><button className="top-user" onClick={()=>setMenuOpen(!menuOpen)}><span className="profile-avatar">{initials}</span><ChevronDown size={14}/></button></div></header>
      <div className="page-content">
        {isAdmin && (active === 'Overview' || active === 'Analytics') ? <Overview active={active} firstName={firstName} period={period} setPeriod={setPeriod} filteredOrders={filteredOrders} products={products} setActive={setActive} setAddOpen={setAddOpen}/> : active === 'My products' ? <ProductsView products={filteredProducts} onAdd={()=>setAddOpen(true)} search={search}/> : active === 'Storefront' ? <StorefrontView products={filteredProducts} onAdd={()=>setAddOpen(true)}/> : isAdmin && active === 'Orders' ? <OrdersView orders={filteredOrders}/> : isAdmin && active === 'Customers' ? <CustomersView/> : active === 'Settings' ? <SettingsView user={user} onLogout={logout}/> : <ProductsView products={filteredProducts} onAdd={()=>setAddOpen(true)} search={search}/>}
      </div>
    </main>
    {addOpen && <div className="modal-backdrop" onClick={()=>setAddOpen(false)}><form className="product-modal" onSubmit={saveProduct} onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">GROW YOUR STORE</span><h3>Add a student product</h3></div><button type="button" className="icon-button" onClick={()=>setAddOpen(false)} aria-label="Close"><X size={18}/></button></div><label className="field-label">Product name<input name="name" required minLength="2" maxLength="120" placeholder="e.g. Data Structures study notes"/></label><label className="field-label">Category<select name="category">{productCategories.map(category=><option key={category}>{category}</option>)}</select></label><label className="field-label">Price (₹ INR)<input name="price" type="number" min="1" max="1000000" required placeholder="499"/></label><label className="field-label">Description <span className="optional-label">Optional</span><textarea name="description" maxLength="280" rows="3" placeholder="Condition, edition, what's included…"/></label><button className="primary-button" type="submit" disabled={savingProduct}>{savingProduct ? <span className="spinner"/> : <><Plus size={16}/> Add to storefront</>}</button></form></div>}
    {toast && <div className="toast"><span><Check size={15}/></span>{toast}</div>}
  </div>
}

function StorefrontView({ products, onAdd }) {
  return <Suspense fallback={<div className="storefront-loading">Preparing your campus collection…</div>}><StudentStorefront products={products} onAdd={onAdd} /></Suspense>
}

function Overview({ active, firstName, period, setPeriod, filteredOrders, products, setActive, setAddOpen }) {
  const [selectedMetric, setSelectedMetric] = useState('Revenue')
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()
  return <>
    <div className="welcome-row"><div><div className="date-line"><span className="live-dot"/>YOUR STORE IS LOOKING GOOD <span className="date-separator">·</span> {today}</div><h1>{active === 'Analytics' ? 'Your numbers, at a glance.' : <>Good morning, {firstName}<span className="wave">✳</span></>}</h1><p className="welcome-sub">{active === 'Analytics' ? 'A closer look at how your ideas are doing.' : 'Here’s what’s happening with your store today.'}</p></div><button className="primary-button add-product" onClick={()=>setAddOpen(true)}><Plus size={17}/> Add a product</button></div>
    <div className="stats-grid">
      <StatCard icon={CreditCard} label="Total revenue" value="₹28,640" delta="12.8%" comparison="vs last month" color="violet" direction="up"/>
      <StatCard icon={ShoppingBag} label="Total orders" value="184" delta="8.2%" comparison="vs last month" color="blue" direction="up"/>
      <StatCard icon={Users} label="Customers" value="132" delta="4.3%" comparison="vs last month" color="green" direction="up"/>
      <StatCard icon={Box} label="Products listed" value={products.length} delta="live" comparison="in your catalog" color="amber" direction="flat"/>
    </div>
    <section className="dashboard-grid"><div className="panel revenue-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Revenue over time</h2><span className="live-tag"><span/> LIVE</span></div><p>Track how your store is growing.</p></div><div className="panel-controls"><div className="metric-select" aria-label="Select metric">{['Revenue', 'Orders'].map(m=><button key={m} className={selectedMetric===m?'metric-active':''} onClick={()=>setSelectedMetric(m)}>{m}</button>)}</div><label className="select-shell"><select aria-label="Time period" value={period} onChange={e=>setPeriod(e.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select><ChevronDown size={14}/></label></div></div><div className="chart-total"><b>{selectedMetric === 'Revenue' ? '₹28,640' : '184'}</b><span className="chart-growth"><ArrowUpRight size={14}/> 12.8%</span><small>compared to last month</small></div><AreaChart period={period}/></div>
      <div className="panel product-panel"><div className="panel-heading"><div><h2>Student essentials</h2><p>What’s on your shelf today.</p></div><button className="round-arrow" aria-label="View products" onClick={()=>setActive('My products')}><ArrowRight size={16}/></button></div><div className="top-products">{products.slice(0,4).map((p,i)=><div className="top-product" key={p.id}><div className={`product-thumb ${p.tone}`}>{p.mark}</div><div className="top-product-info"><b>{p.name}</b><span>{p.category}</span></div><div className="top-product-price"><b>{formatINR(p.price)}</b><span className="product-rank">#{i+1}</span></div></div>)}</div><button className="view-all-button" onClick={()=>setActive('My products')}>View all products <ArrowRight size={14}/></button></div>
    </section>
    <section className="panel orders-panel"><div className="panel-heading orders-heading"><div><h2>Recent orders <span className="count-chip">4 new</span></h2><p>The latest activity from your store.</p></div><button className="outline-button" onClick={()=>setActive('Orders')}>View all orders <ArrowRight size={14}/></button></div><OrdersTable orders={filteredOrders.slice(0,4)} compact/></section>
    <div className="dashboard-footnote"><span><span className="live-dot"/> Your store is up to date</span><span>Last synced just now <span className="footnote-dot">·</span> <button onClick={()=>setActive('Settings')}>Store settings <ArrowUpRight size={12}/></button></span></div>
  </>
}

function StatCard({ icon: Icon, label, value, delta, comparison, color, direction }) {
  return <article className="stat-card"><div className="stat-top"><span className={`stat-icon ${color}`}><Icon size={17}/></span><button className="stat-more" aria-label={`${label} details`}><MoreHorizontal size={18}/></button></div><p className="stat-label">{label}</p><div className="stat-value-row"><b>{value}</b><span className={`stat-delta ${direction}`}>{direction==='up'?<ArrowUpRight size={13}/>:<Sparkles size={12}/>} {delta}</span></div><div className="stat-bottom"><span>{comparison}</span><span className="mini-sparkline"><svg viewBox="0 0 70 23" preserveAspectRatio="none"><polyline points={color==='amber'?'0,17 9,14 18,15 27,9 36,13 45,6 54,10 63,4 70,7':'0,19 8,15 16,17 25,9 34,13 43,6 52,10 61,4 70,7'} fill="none" stroke={color==='violet'?'#6f66de':color==='blue'?'#5185d6':color==='green'?'#36aa82':'#df9a49'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div></article>
}

function OrdersTable({ orders: list, compact = false }) {
  if (!list.length) return <div className="empty-state"><div><Search size={19}/></div><b>No orders found</b><span>Try adjusting your search.</span></div>
  return <div className="table-scroll"><table className="orders-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th>{!compact&&<th/>}</tr></thead><tbody>{list.map(o=><tr key={o.id}><td className="order-id">{o.id}</td><td><span className="buyer-cell"><i className={`buyer-avatar ${o.color}`}>{o.initials}</i>{o.buyer}</span></td><td>{o.item}</td><td className="date-cell">{o.date}</td><td className="amount-cell">{o.amount}</td><td><span className={`status status-${o.status.toLowerCase()}`}><i/>{o.status}</span></td>{!compact&&<td><button className="row-more" aria-label={`More about ${o.id}`}><MoreHorizontal size={17}/></button></td>}</tr>)}</tbody></table></div>
}

function ProductsView({ products, onAdd, search }) {
  return <><div className="welcome-row subpage-title"><div><div className="date-line">YOUR CREATOR SPACE <span className="date-separator">·</span> CATALOG</div><h1>My products<span className="count-heading">{products.length}</span></h1><p className="welcome-sub">Books, study resources and campus essentials listed by you.</p></div><button className="primary-button add-product" onClick={onAdd}><Plus size={17}/> Add a product</button></div><div className="filter-bar"><div className="filter-label"><Package size={16}/> All products <span>{products.length}</span></div><button className="outline-button"><Download size={15}/> Export</button></div><section className="panel table-panel"><div className="table-scroll"><table className="orders-table products-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>SALES</th><th>STATUS</th><th>ADDED</th><th/></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><span className="table-product"><i className={`product-thumb ${p.tone}`}>{p.mark}</i><b>{p.name}</b></span></td><td>{p.category}</td><td className="amount-cell">{formatINR(p.price)}</td><td>{p.sales}</td><td><span className={`stock-status ${p.stock==='Low stock'?'low':''}`}><i/>{p.stock}</span></td><td className="date-cell">{p.date}</td><td><button className="row-more" aria-label={`More about ${p.name}`}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>{!products.length&&<div className="empty-state"><div><Search size={19}/></div><b>No products match “{search}”</b><span>Try another search or add a product.</span></div>}</div><div className="table-pagination"><span>Showing <b>{products.length}</b> products</span><div><button className="pagination-button" aria-label="Previous page"><ChevronLeft size={16}/></button><button className="pagination-button current-page">1</button><button className="pagination-button" aria-label="Next page"><ChevronRight size={16}/></button></div></div></section><div className="page-note"><Sparkles size={15}/> Every listing helps another student find what they need.</div></>
}

function OrdersView({ orders: list }) {
  return <><div className="welcome-row subpage-title"><div><div className="date-line">YOUR CREATOR SPACE <span className="date-separator">·</span> ACTIVITY</div><h1>Orders<span className="count-heading">184</span></h1><p className="welcome-sub">A little love for the things you make.</p></div><button className="outline-button"><Download size={15}/> Export orders</button></div><div className="orders-summary"><div><span>Total orders</span><b>184</b><small><ArrowUpRight size={13}/> 8.2% this month</small></div><div><span>Processing</span><b>4</b><small>Ready to fulfill</small></div><div><span>Completed</span><b>176</b><small>Successfully delivered</small></div><div><span>Refunded</span><b>4</b><small>Across all time</small></div></div><section className="panel table-panel"><div className="panel-heading list-panel-heading"><div><h2>All orders</h2><p>Search and keep track of every order.</p></div><button className="outline-button"><Clock3 size={15}/> Last 30 days <ChevronDown size={14}/></button></div><OrdersTable orders={list}/><div className="table-pagination"><span>Showing <b>{list.length}</b> of <b>184</b> orders</span><div><button className="pagination-button"><ChevronLeft size={16}/></button><button className="pagination-button current-page">1</button><button className="pagination-button">2</button><button className="pagination-button">3</button><span>…</span><button className="pagination-button">19</button><button className="pagination-button"><ChevronRight size={16}/></button></div></div></section></>
}

function CustomersView() {
  const customers = [{ initials:'AS',name:'Aarav Sharma',email:'aarav.s@college.edu',orders:8,spent:'₹4,280',color:'lavender' },{ initials:'DR',name:'Diya Reddy',email:'diya.r@college.edu',orders:6,spent:'₹3,450',color:'peach' },{ initials:'KM',name:'Kabir Mehta',email:'kabir.m@college.edu',orders:5,spent:'₹2,180',color:'mint' },{ initials:'AI',name:'Ananya Iyer',email:'ananya.i@college.edu',orders:4,spent:'₹1,940',color:'blue' },{ initials:'IK',name:'Ishaan Kapoor',email:'ishaan.k@college.edu',orders:3,spent:'₹1,580',color:'pink' }]
  return <><div className="welcome-row subpage-title"><div><div className="date-line">YOUR CREATOR SPACE <span className="date-separator">·</span> COMMUNITY</div><h1>Your customers<span className="count-heading">132</span></h1><p className="welcome-sub">People who believe in what you make.</p></div><button className="outline-button"><Download size={15}/> Export list</button></div><div className="customers-banner"><div className="customers-banner-icon"><Users size={20}/></div><div><b>132 people in your corner.</b><span>Your community has grown 4.3% this month. Keep creating things they love.</span></div><div className="customer-bubbles"><i>AS</i><i>DR</i><i>KM</i><i>AI</i><i>+128</i></div></div><section className="panel table-panel"><div className="panel-heading list-panel-heading"><div><h2>Recent customers</h2><p>Your most recent supporters, all in one place.</p></div><button className="outline-button"><Users size={15}/> All customers</button></div><div className="table-scroll"><table className="orders-table"><thead><tr><th>CUSTOMER</th><th>ORDERS</th><th>TOTAL SPENT</th><th>LAST ORDER</th><th/></tr></thead><tbody>{customers.map((c,i)=><tr key={c.email}><td><span className="buyer-cell"><i className={`buyer-avatar ${c.color}`}>{c.initials}</i><span className="customer-name-cell"><b>{c.name}</b><small>{c.email}</small></span></span></td><td>{c.orders}</td><td className="amount-cell">{c.spent}</td><td className="date-cell">{i<2?'Today':'Oct 29, 2026'}</td><td><button className="row-more"><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div><div className="table-pagination"><span>Showing <b>5</b> of <b>132</b> customers</span><div><button className="pagination-button"><ChevronLeft size={16}/></button><button className="pagination-button current-page">1</button><button className="pagination-button">2</button><button className="pagination-button"><ChevronRight size={16}/></button></div></div></section></>
}

function SettingsView({ user, onLogout }) {
  const initials = ((user?.name || user?.email || 'U').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('') || 'U').toUpperCase()
  return <><div className="welcome-row subpage-title"><div><div className="date-line">YOUR CREATOR SPACE <span className="date-separator">·</span> PREFERENCES</div><h1>Settings</h1><p className="welcome-sub">A few details that make this space yours.</p></div></div><section className="panel settings-panel"><div className="settings-heading"><div className="settings-avatar">{initials}</div><div><h2>Account information</h2><p>These are the details connected to your account.</p></div></div><div className="settings-detail"><span>Full name</span><b>{user?.name || 'Student Creator'}</b></div><div className="settings-detail"><span>Email address</span><b>{user?.email}</b></div><div className="settings-detail"><span>Member since</span><b>{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</b></div><div className="settings-security"><span><ShieldCheck size={18}/></span><div><b>Your account is protected</b><small>Your password is securely encrypted and your session is private.</small></div></div><button className="signout-button" onClick={onLogout}><LogOut size={16}/> Sign out of your account</button></section></>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('student-mart-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' } })
  useEffect(() => {
    let live = true
    api('/me')
      .then(result => { if (live) setUser(result.user) })
      .catch(() => { try { localStorage.removeItem(TOKEN_KEY) } catch {} })
      .finally(() => { if (live) setCheckingSession(false) })
    return () => { live = false }
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('student-mart-theme', theme) } catch {} }, [theme])
  if (checkingSession) return <div className="boot-screen"><Brand/><span className="spinner dark-spinner"/></div>
  const onToggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  return user ? <Dashboard user={user} onLogout={()=>setUser(null)} theme={theme} onToggleTheme={onToggleTheme}/> : <AuthScreen onAuthenticated={setUser} theme={theme} onToggleTheme={onToggleTheme}/>
}
