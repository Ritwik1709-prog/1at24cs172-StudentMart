import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import {
  ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, Box,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Command,
  CreditCard, Download, Eye, EyeOff, GraduationCap, LayoutDashboard, LifeBuoy,
  Lock, LogOut, Mail, Menu, MoreHorizontal, Package, Plus, Search, Settings, ShieldCheck,
  ShoppingBag, Sparkles, TrendingUp, Users, X, Store, Moon, Sun, Trash2,
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
const ORDERS_STORAGE_KEY = 'student_mart_orders_v2'
const orders = [
  { id: '#SM-2849', buyer: 'Aarav Sharma', initials: 'AS', color: 'lavender', item: 'Engineering Mathematics III', category: 'Textbooks', date: 'Today, 10:42 AM', amount: '₹450', status: 'Completed', pickupLocation: 'Central Campus Library (Desk 3)' },
  { id: '#SM-2848', buyer: 'Diya Reddy', initials: 'DR', color: 'peach', item: 'Campus stationery starter kit', category: 'Stationery', date: 'Today, 9:18 AM', amount: '₹299', status: 'Processing', pickupLocation: 'Student Activity Center' },
  { id: '#SM-2847', buyer: 'Kabir Mehta', initials: 'KM', color: 'mint', item: 'Calculus II — handwritten notes', category: 'Notes & study guides', date: 'Yesterday, 6:30 PM', amount: '₹149', status: 'Completed', pickupLocation: 'Main Campus Canteen' },
  { id: '#SM-2846', buyer: 'Ananya Iyer', initials: 'AI', color: 'blue', item: 'Arduino Uno project starter kit', category: 'Project kits', date: 'Yesterday, 4:05 PM', amount: '₹899', status: 'Completed', pickupLocation: 'Robotics Lab Foyer' },
  { id: '#SM-2845', buyer: 'Ishaan Kapoor', initials: 'IK', color: 'pink', item: 'Casio fx-991CW scientific calculator', category: 'Electronics', date: 'Oct 29, 2026', amount: '₹1,249', status: 'Refunded', pickupLocation: 'Central Campus Library (Desk 3)' },
]

function getInitialOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return orders
}
const productCategories = ['Textbooks', 'Notes & study guides', 'Stationery', 'Electronics', 'Project kits', 'Campus essentials']
const categoryArt = { Textbooks: ['📚', 'blue'], 'Notes & study guides': ['📓', 'lilac'], Stationery: ['✏️', 'peach'], Electronics: ['🧮', 'mint'], 'Project kits': ['🔌', 'blue'], 'Campus essentials': ['🎒', 'lilac'] }
const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0)
const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My products', icon: Package },
  { label: 'Storefront', icon: Store },
  { label: 'Orders', icon: ShoppingBag, count: '4' },
  { label: 'Customers', icon: Users },
  { label: 'Analytics', icon: TrendingUp },
]
const sellerNav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My products', icon: Package },
  { label: 'Storefront', icon: Store },
  { label: 'Orders', icon: ShoppingBag },
  { label: 'Analytics', icon: TrendingUp },
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

async function orderApi(path, options = {}) {
  let token = null
  try { token = localStorage.getItem(TOKEN_KEY) } catch {}

  const response = await fetch(`/api/orders${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Could not process order. Please try again.')
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2,})?$/i
  const emailOk = emailRegex.test(form.email.trim())
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
      return setError('Please enter a valid student email address ending with .edu (e.g. you@college.edu).')
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
                key={theme}
                onSuccess={googleSuccess}
                onError={() => setError('Google sign-in was cancelled or could not be completed.')}
                text="continue_with"
                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                size="large"
                shape="rectangular"
                logo_alignment="left"
                use_fedcm_for_button={false}
                width={String(googleButtonWidth)}
                containerProps={{
                  style: {
                    width: '100%',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  },
                }}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Email address</span>
                <span style={{ fontSize: '10.5px', color: '#818cf8', fontWeight: 600 }}>.edu only</span>
              </div>
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
                <span className="field-error">
                  {!form.email.trim()
                    ? 'Please enter your email address.'
                    : 'Only student email addresses with .edu are accepted (e.g. you@college.edu).'}
                </span>
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

function AreaChart({ period = '30 days', metric = 'Revenue' }) {
  const isRevenue = metric === 'Revenue'

  const datasets = {
    '7 days': {
      Revenue: [
        { date: 'Nov 05', fullDate: 'Wednesday, Nov 05', value: 14200, formatted: '₹14,200', orders: 12, delta: '+8.4%' },
        { date: 'Nov 06', fullDate: 'Thursday, Nov 06', value: 16800, formatted: '₹16,800', orders: 15, delta: '+18.3%' },
        { date: 'Nov 07', fullDate: 'Friday, Nov 07', value: 21500, formatted: '₹21,500', orders: 19, delta: '+27.9%' },
        { date: 'Nov 08', fullDate: 'Saturday, Nov 08', value: 19400, formatted: '₹19,400', orders: 16, delta: '-9.7%' },
        { date: 'Nov 09', fullDate: 'Sunday, Nov 09', value: 23900, formatted: '₹23,900', orders: 20, delta: '+23.1%' },
        { date: 'Nov 10', fullDate: 'Monday, Nov 10', value: 24680, formatted: '₹24,680', orders: 22, delta: '+3.2%' },
        { date: 'Nov 11', fullDate: 'Today (Nov 11)', value: 28640, formatted: '₹28,640', orders: 26, delta: '+16.0%' },
      ],
      Orders: [
        { date: 'Nov 05', fullDate: 'Wednesday, Nov 05', value: 12, formatted: '12 orders', orders: 12, delta: '+20%' },
        { date: 'Nov 06', fullDate: 'Thursday, Nov 06', value: 15, formatted: '15 orders', orders: 15, delta: '+25%' },
        { date: 'Nov 07', fullDate: 'Friday, Nov 07', value: 19, formatted: '19 orders', orders: 19, delta: '+26%' },
        { date: 'Nov 08', fullDate: 'Saturday, Nov 08', value: 16, formatted: '16 orders', orders: 16, delta: '-15%' },
        { date: 'Nov 09', fullDate: 'Sunday, Nov 09', value: 20, formatted: '20 orders', orders: 20, delta: '+25%' },
        { date: 'Nov 10', fullDate: 'Monday, Nov 10', value: 22, formatted: '22 orders', orders: 22, delta: '+10%' },
        { date: 'Nov 11', fullDate: 'Today (Nov 11)', value: 26, formatted: '26 orders', orders: 26, delta: '+18%' },
      ],
    },
    '30 days': {
      Revenue: [
        { date: 'Oct 12', fullDate: 'Sunday, Oct 12', value: 11200, formatted: '₹11,200', orders: 9, delta: '+5%' },
        { date: 'Oct 15', fullDate: 'Wednesday, Oct 15', value: 14500, formatted: '₹14,500', orders: 13, delta: '+29%' },
        { date: 'Oct 18', fullDate: 'Saturday, Oct 18', value: 13800, formatted: '₹13,800', orders: 11, delta: '-5%' },
        { date: 'Oct 21', fullDate: 'Tuesday, Oct 21', value: 18200, formatted: '₹18,200', orders: 16, delta: '+31%' },
        { date: 'Oct 24', fullDate: 'Friday, Oct 24', value: 17400, formatted: '₹17,400', orders: 14, delta: '-4%' },
        { date: 'Oct 27', fullDate: 'Monday, Oct 27', value: 22100, formatted: '₹22,100', orders: 18, delta: '+27%' },
        { date: 'Oct 30', fullDate: 'Thursday, Oct 30', value: 20800, formatted: '₹20,800', orders: 17, delta: '-6%' },
        { date: 'Nov 02', fullDate: 'Sunday, Nov 02', value: 25400, formatted: '₹25,400', orders: 21, delta: '+22%' },
        { date: 'Nov 05', fullDate: 'Wednesday, Nov 05', value: 23900, formatted: '₹23,900', orders: 20, delta: '-6%' },
        { date: 'Nov 08', fullDate: 'Saturday, Nov 08', value: 26800, formatted: '₹26,800', orders: 23, delta: '+12%' },
        { date: 'Nov 11', fullDate: 'Today (Nov 11)', value: 28640, formatted: '₹28,640', orders: 26, delta: '+6.8%' },
      ],
      Orders: [
        { date: 'Oct 12', fullDate: 'Sunday, Oct 12', value: 9, formatted: '9 orders', orders: 9, delta: '+12%' },
        { date: 'Oct 15', fullDate: 'Wednesday, Oct 15', value: 13, formatted: '13 orders', orders: 13, delta: '+44%' },
        { date: 'Oct 18', fullDate: 'Saturday, Oct 18', value: 11, formatted: '11 orders', orders: 11, delta: '-15%' },
        { date: 'Oct 21', fullDate: 'Tuesday, Oct 21', value: 16, formatted: '16 orders', orders: 16, delta: '+45%' },
        { date: 'Oct 24', fullDate: 'Friday, Oct 24', value: 14, formatted: '14 orders', orders: 14, delta: '-12%' },
        { date: 'Oct 27', fullDate: 'Monday, Oct 27', value: 18, formatted: '18 orders', orders: 18, delta: '+28%' },
        { date: 'Oct 30', fullDate: 'Thursday, Oct 30', value: 17, formatted: '17 orders', orders: 17, delta: '-5%' },
        { date: 'Nov 02', fullDate: 'Sunday, Nov 02', value: 21, formatted: '21 orders', orders: 21, delta: '+23%' },
        { date: 'Nov 05', fullDate: 'Wednesday, Nov 05', value: 20, formatted: '20 orders', orders: 20, delta: '-5%' },
        { date: 'Nov 08', fullDate: 'Saturday, Nov 08', value: 23, formatted: '23 orders', orders: 23, delta: '+15%' },
        { date: 'Nov 11', fullDate: 'Today (Nov 11)', value: 26, formatted: '26 orders', orders: 26, delta: '+13%' },
      ],
    },
    '90 days': {
      Revenue: [
        { date: 'Aug 15', fullDate: 'Semester Start (Aug 15)', value: 8200, formatted: '₹8,200', orders: 7, delta: '+10%' },
        { date: 'Aug 25', fullDate: 'Monday, Aug 25', value: 12400, formatted: '₹12,400', orders: 11, delta: '+51%' },
        { date: 'Sep 05', fullDate: 'Friday, Sep 05', value: 16800, formatted: '₹16,800', orders: 14, delta: '+35%' },
        { date: 'Sep 18', fullDate: 'Thursday, Sep 18', value: 19500, formatted: '₹19,500', orders: 17, delta: '+16%' },
        { date: 'Sep 30', fullDate: 'Tuesday, Sep 30', value: 17800, formatted: '₹17,800', orders: 15, delta: '-8%' },
        { date: 'Oct 12', fullDate: 'Mid-term Week (Oct 12)', value: 23400, formatted: '₹23,400', orders: 21, delta: '+31%' },
        { date: 'Oct 24', fullDate: 'Friday, Oct 24', value: 25100, formatted: '₹25,100', orders: 23, delta: '+7%' },
        { date: 'Nov 05', fullDate: 'Wednesday, Nov 05', value: 26900, formatted: '₹26,900', orders: 24, delta: '+7%' },
        { date: 'Nov 11', fullDate: 'Today (Nov 11)', value: 28640, formatted: '₹28,640', orders: 26, delta: '+6.5%' },
      ],
      Orders: [
        { date: 'Aug 15', fullDate: 'Semester Start (Aug 15)', value: 7, formatted: '7 orders', orders: 7, delta: '+10%' },
        { date: 'Aug 25', fullDate: 'Monday, Aug 25', value: 11, formatted: '11 orders', orders: 11, delta: '+57%' },
        { date: 'Sep 05', fullDate: 'Friday, Sep 05', value: 14, formatted: '14 orders', orders: 14, delta: '+27%' },
        { date: 'Sep 18', fullDate: 'Thursday, Sep 18', value: 17, formatted: '17 orders', orders: 17, delta: '+21%' },
        { date: 'Sep 30', fullDate: 'Tuesday, Sep 30', value: 15, formatted: '15 orders', orders: 15, delta: '-11%' },
        { date: 'Oct 12', fullDate: 'Mid-term Week (Oct 12)', value: 21, formatted: '21 orders', orders: 21, delta: '+40%' },
        { date: 'Oct 24', fullDate: 'Friday, Oct 24', value: 23, formatted: '23 orders', orders: 23, delta: '+9%' },
        { date: 'Nov 05', fullDate: 'Wednesday, Nov 05', value: 24, formatted: '24 orders', orders: 24, delta: '+4%' },
        { date: 'Nov 11', fullDate: 'Today (Nov 11)', value: 26, formatted: '26 orders', orders: 26, delta: '+8%' },
      ],
    },
  }

  const rawData = datasets[period]?.[metric] || datasets['30 days'].Revenue
  const [hoverIndex, setHoverIndex] = useState(null)

  const width = 500
  const height = 150
  const padY = 18
  const maxY = isRevenue ? 35000 : 35
  const minY = 0

  const points = rawData.map((d, i) => {
    const x = (i / (rawData.length - 1)) * width
    const y = height - padY - ((d.value - minY) / (maxY - minY)) * (height - padY * 2)
    return { ...d, x, y }
  })

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`
    const prev = arr[i - 1]
    const cx1 = prev.x + (pt.x - prev.x) / 2
    const cy1 = prev.y
    const cx2 = prev.x + (pt.x - prev.x) / 2
    const cy2 = pt.y
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`
  }, '')

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`

  const activeIndex = hoverIndex !== null ? hoverIndex : points.length - 1
  const activePt = points[activeIndex]

  const yLabels = isRevenue ? ['₹35k', '₹25k', '₹15k', '₹0'] : ['35', '25', '15', '0']

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = mouseX / rect.width
    const nearest = Math.round(ratio * (points.length - 1))
    setHoverIndex(nearest)
  }

  return (
    <div className="interactive-chart-wrap">
      <div className="chart-y-labels">
        {yLabels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
      <div
        className="chart-plot interactive-chart-plot"
        onMouseMove={handleMouseMove}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            const touch = e.touches[0]
            const rect = e.currentTarget.getBoundingClientRect()
            const mouseX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
            const ratio = mouseX / rect.width
            setHoverIndex(Math.round(ratio * (points.length - 1)))
          }
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <div className="chart-grid"><i /><i /><i /><i /></div>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="chart-svg-interactive">
          <defs>
            <linearGradient id="interactiveChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Area gradient under curve */}
          <path d={areaD} fill="url(#interactiveChartGrad)" />

          {/* Smooth Bezier line curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowFilter)"
            vectorEffect="non-scaling-stroke"
          />

          {/* Vertical dynamic crosshair tracking mouse */}
          {activePt && (
            <line
              x1={activePt.x}
              y1={0}
              x2={activePt.x}
              y2={height}
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.85"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Subtle point markers */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === activeIndex ? 6.5 : 2.5}
              fill={i === activeIndex ? '#ffffff' : '#6366f1'}
              stroke="#6366f1"
              strokeWidth={i === activeIndex ? 3 : 1}
              style={{ transition: 'r 0.15s ease, fill 0.15s ease' }}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Glowing pulse halo around hovered point */}
          {activePt && (
            <circle
              cx={activePt.x}
              cy={activePt.y}
              r="12"
              fill="rgba(99, 102, 241, 0.25)"
              className="pulse-halo"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Dynamic floating tooltip that tracks hovered point */}
        {activePt && (
          <div
            className="chart-dynamic-tooltip"
            style={{
              left: `${(activePt.x / width) * 100}%`,
              transform: `translate(${activePt.x > width * 0.72 ? '-100%' : activePt.x < width * 0.28 ? '0%' : '-50%'}, -105%)`,
              top: `${Math.max(10, activePt.y - 10)}px`,
            }}
          >
            <div className="tooltip-date-row">
              <span className="tooltip-live-dot" />
              <span>{activePt.fullDate}</span>
            </div>
            <div className="tooltip-metric-row">
              <b className="tooltip-metric-val">{activePt.formatted}</b>
              <span className={`tooltip-trend ${activePt.delta.startsWith('-') ? 'down' : 'up'}`}>
                {activePt.delta}
              </span>
            </div>
            <div className="tooltip-orders-info">
              <span>{activePt.orders} campus orders</span>
            </div>
          </div>
        )}

        <div className="chart-x-labels">
          {points.filter((_, idx) => idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1).map((pt, i) => (
            <span key={i}>{pt.date}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const isAdmin = user.role === 'admin'
  const visibleNav = isAdmin ? nav : sellerNav
  const [active, setActive] = useState('Overview')
  const [period, setPeriod] = useState('30 days')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [products, setProducts] = useState(initialProducts)
  const [ordersList, setOrdersList] = useState(getInitialOrders)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast] = useState('')
  const [notifications, setNotifications] = useState(false)
  const firstName = (user?.name || user?.email?.split('@')[0] || 'User').trim().split(/\s+/)[0] || 'User'
  const initials = ((user?.name || user?.email || 'U').trim().split(/\s+/).map(s => s[0]).slice(0, 2).join('') || 'U').toUpperCase()

  const activeOrdersCount = useMemo(() => {
    return ordersList.filter(o => o.status === 'Processing' || o.status === 'Ready for pickup').length
  }, [ordersList])

  const dynamicNav = useMemo(() => {
    return visibleNav.map(item => {
      if (item.label === 'Orders') {
        return { ...item, count: activeOrdersCount > 0 ? String(activeOrdersCount) : (ordersList.length > 0 ? String(ordersList.length) : undefined) }
      }
      return item
    })
  }, [visibleNav, activeOrdersCount, ordersList.length])

  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => `${o.id} ${o.buyer} ${o.item} ${o.status} ${o.pickupLocation || ''}`.toLowerCase().includes(search.toLowerCase()))
  }, [ordersList, search])

  const filteredProducts = useMemo(() => {
    return products.filter(p => `${p.name} ${p.category} ${p.description || ''}`.toLowerCase().includes(search.toLowerCase()))
  }, [products, search])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(''), 4500)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersList))
    } catch {}
  }, [ordersList])

  useEffect(() => {
    let live = true
    productApi('/').then(({ products: saved = [] }) => {
      if (!live) return
      const mapped = saved.map(product => {
        const [mark, tone] = categoryArt[product.category] || ['🎓', 'lilac']
        return { id: product._id, name: product.name, category: product.category, price: product.price, description: product.description, sales: 0, stock: 'Available', mark, tone, date: new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), isOwner: true }
      })
      if (mapped.length > 0) {
        setProducts(current => [...mapped, ...current.filter(item => !mapped.some(savedProduct => savedProduct.id === item.id))])
      }
    }).catch(() => {})
    return () => { live = false }
  }, [user.id])

  useEffect(() => {
    let live = true
    orderApi('/').then(({ orders: saved = [] }) => {
      if (!live || !saved.length) return
      const mapped = saved.map(o => ({
        id: o.orderNumber || `#SM-${String(o._id).slice(-4)}`,
        mongoId: o._id,
        buyer: o.buyerName || user?.name || 'You',
        initials: (o.buyerName || user?.name || 'You').slice(0, 2).toUpperCase(),
        color: 'violet',
        item: o.item,
        category: o.category || 'Campus essentials',
        date: o.date || new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        amount: formatINR(o.amount),
        status: o.status || 'Processing',
        pickupLocation: o.pickupLocation || 'Central Campus Library (Desk 3)',
      }))
      setOrdersList(current => {
        const existing = new Set(current.map(c => c.id))
        const fresh = mapped.filter(m => !existing.has(m.id))
        return [...fresh, ...current]
      })
    }).catch(() => {})
    return () => { live = false }
  }, [user.id])

  async function logout() {
    try { await api('/logout', { method: 'POST' }) } catch {}
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    onLogout()
  }

  async function deleteProduct(productId) {
    if (!window.confirm('Are you sure you want to remove this product from your catalog?')) return
    try {
      if (!String(productId).startsWith('sample-')) {
        await productApi(`/${productId}`, { method: 'DELETE' })
      }
      setProducts(current => current.filter(p => p.id !== productId))
      setToast('Product removed from catalog.')
    } catch (err) {
      setToast(err.message || 'Could not delete product.')
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    setSavingProduct(true)
    try {
      const payload = { name: String(fd.get('name')), category: String(fd.get('category')), price: Number(fd.get('price')), description: String(fd.get('description') || '') }
      const { product } = await productApi('/', { method: 'POST', body: JSON.stringify(payload) })
      const [mark, tone] = categoryArt[product.category] || ['🎓', 'lilac']
      const created = { id: product._id, name: product.name, category: product.category, price: product.price, description: product.description, sales: 0, stock: 'Available', mark, tone, date: 'Just now', isOwner: true }
      setProducts(current => [created, ...current])
      setAddOpen(false); setActive('My products'); setSearch(''); setToast('Your product is live on your catalog.')
    } catch (error) { setToast(error.message) }
    finally { setSavingProduct(false) }
  }

  async function handleCreateOrder(product) {
    if (product.isOwner) {
      setToast('This is your own listing! You can view and manage it from My Products.')
      return
    }
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `#SM-${randomSuffix}`
    const newOrder = {
      id: orderNumber,
      buyer: user?.name || 'You',
      initials,
      color: 'violet',
      item: product.name,
      category: product.category || 'Campus essentials',
      date: 'Just now',
      amount: formatINR(product.price),
      status: 'Processing',
      pickupLocation: 'Central Campus Library (Desk 3)',
    }

    setOrdersList(prev => [newOrder, ...prev])
    setToast({
      message: `Added to collection! Order ${orderNumber} created for "${product.name}".`,
      action: () => setActive('Orders'),
      actionLabel: 'View in Orders',
    })

    try {
      const res = await orderApi('/', {
        method: 'POST',
        body: JSON.stringify({
          item: product.name,
          category: product.category,
          price: product.price,
          productId: product.id,
          buyerName: user?.name,
          buyerEmail: user?.email,
          pickupLocation: 'Central Campus Library (Desk 3)',
        }),
      })
      if (res?.order) {
        newOrder.mongoId = res.order._id
        newOrder.id = res.order.orderNumber || newOrder.id
      }
    } catch (err) {
      console.warn('Saved order locally:', err.message)
    }
  }

  async function updateOrderStatus(orderId, nextStatus) {
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null)
    }
    setToast(`Order ${orderId} marked as ${nextStatus}.`)
    const target = ordersList.find(o => o.id === orderId)
    if (target?.mongoId) {
      try {
        await orderApi(`/${target.mongoId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: nextStatus }),
        })
      } catch {}
    }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}><div className="sidebar-brand"><Brand/><button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <button className="store-switcher"><div className="store-avatar">{firstName.slice(0, 1).toUpperCase()}</div><span className="store-name"><b>{firstName}’s store</b><small>Student creator</small></span><ChevronDown size={15}/></button>
      <p className="nav-label">{isAdmin ? 'ADMIN WORKSPACE' : 'MY SELLER PANEL'}</p><nav className="main-nav">{dynamicNav.map(item => <button key={item.label} className={`nav-item ${active === item.label ? 'nav-active' : ''}`} onClick={() => { setActive(item.label); setSearch(''); setMobileNav(false) }}><item.icon size={18}/><span>{item.label}</span>{item.label === 'My products' ? <small>{products.length}</small> : item.count && <small>{item.count}</small>}</button>)}</nav>
      <p className="nav-label tools-label">PREFERENCES</p><nav className="main-nav"><button className={`nav-item ${active === 'Settings' ? 'nav-active' : ''}`} onClick={() => {setActive('Settings');setMobileNav(false)}}><Settings size={18}/><span>Settings</span></button><button className="nav-item" onClick={() => setToast('Help center is ready to assist you.')}><LifeBuoy size={18}/><span>Help & support</span><ArrowUpRight className="external-icon" size={13}/></button></nav>
      <div className="sidebar-bottom"><div className="plan-card"><span className="plan-spark"><Sparkles size={15}/></span><b>Enjoying Student Mart?</b><p>Invite a friend and grow together.</p><button onClick={() => {navigator.clipboard?.writeText(window.location.origin);setToast('Your store link was copied.')}}>Invite a friend <ArrowRight size={14}/></button><span className="plan-decoration">✳</span></div><button className="profile-button" onClick={() => setMenuOpen(!menuOpen)}><span className="profile-avatar">{initials}</span><span className="profile-copy"><b>{user?.name || 'User'}</b><small>{user?.email}</small></span><MoreHorizontal size={18}/></button>{menuOpen && <div className="profile-menu"><button onClick={() => {setActive('Settings');setMenuOpen(false)}}><Settings size={15}/> Account settings</button><button onClick={logout}><LogOut size={15}/> Sign out</button></div>}</div>
    </aside>
    {mobileNav && <button className="mobile-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><b>{active}</b></div></div><div className="topbar-actions"><label className="global-search"><Search size={16}/><input aria-label="Search orders or products" placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd><Command size={11}/> K</kbd></label><ThemeToggle theme={theme} onToggle={onToggleTheme}/><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={()=>setNotifications(!notifications)}><Bell size={18}/><i/></button>{notifications && <div className="notification-popover"><b>You’re all caught up</b><span>New orders and updates will show here.</span></div>}</div><span className="topbar-divider"/><button className="top-user" onClick={()=>setMenuOpen(!menuOpen)}><span className="profile-avatar">{initials}</span><ChevronDown size={14}/></button></div></header>
      <div className="page-content">
        {active === 'Overview' || active === 'Analytics' ? (
          <Overview active={active} firstName={firstName} period={period} setPeriod={setPeriod} filteredOrders={filteredOrders} products={products} setActive={setActive} setAddOpen={setAddOpen} onSelectOrder={setSelectedOrder}/>
        ) : active === 'My products' ? (
          <ProductsView products={filteredProducts} onAdd={()=>setAddOpen(true)} search={search} onClearSearch={()=>setSearch('')} onDelete={deleteProduct} onLoadSamples={()=>setProducts(initialProducts)} onViewStorefront={()=>setActive('Storefront')}/>
        ) : active === 'Storefront' ? (
          <StorefrontView products={filteredProducts} onAdd={()=>setAddOpen(true)} onOrder={handleCreateOrder} orders={ordersList} onViewOrders={()=>setActive('Orders')}/>
        ) : active === 'Orders' ? (
          <OrdersView orders={ordersList} search={search} onClearSearch={()=>setSearch('')} onUpdateStatus={updateOrderStatus} onViewStorefront={()=>setActive('Storefront')} onSelectOrder={setSelectedOrder}/>
        ) : active === 'Customers' ? (
          <CustomersView/>
        ) : active === 'Settings' ? (
          <SettingsView user={user} onLogout={logout}/>
        ) : (
          <Overview active="Overview" firstName={firstName} period={period} setPeriod={setPeriod} filteredOrders={filteredOrders} products={products} setActive={setActive} setAddOpen={setAddOpen} onSelectOrder={setSelectedOrder}/>
        )}
      </div>
    </main>
    {addOpen && <div className="modal-backdrop" onClick={()=>setAddOpen(false)}><form className="product-modal" onSubmit={saveProduct} onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">GROW YOUR STORE</span><h3>Add a student product</h3></div><button type="button" className="icon-button" onClick={()=>setAddOpen(false)} aria-label="Close"><X size={18}/></button></div><label className="field-label">Product name<input name="name" required minLength="2" maxLength="120" placeholder="e.g. Data Structures study notes"/></label><label className="field-label">Category<select name="category">{productCategories.map(category=><option key={category}>{category}</option>)}</select></label><label className="field-label">Price (₹ INR)<input name="price" type="number" min="1" max="1000000" required placeholder="499"/></label><label className="field-label">Description <span className="optional-label">Optional</span><textarea name="description" maxLength="280" rows="3" placeholder="Condition, edition, what's included…"/></label><button className="primary-button" type="submit" disabled={savingProduct}>{savingProduct ? <span className="spinner"/> : <><Plus size={16}/> Add to storefront</>}</button></form></div>}
    <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateOrderStatus} />
    {toast && (
      <div className="toast">
        <span><Check size={15}/></span>
        <span>{typeof toast === 'string' ? toast : toast.message}</span>
        {typeof toast === 'object' && toast.action && (
          <button type="button" className="toast-action-btn" onClick={toast.action}>
            {toast.actionLabel || 'View'}
          </button>
        )}
      </div>
    )}
  </div>
}

function StorefrontView({ products, onAdd, onOrder, orders, onViewOrders }) {
  return (
    <Suspense fallback={<div className="storefront-loading">Preparing your campus collection…</div>}>
      <StudentStorefront
        products={products}
        onAdd={onAdd}
        onOrder={onOrder}
        orders={orders}
        onViewOrders={onViewOrders}
      />
    </Suspense>
  )
}

function Overview({ active, firstName, period, setPeriod, filteredOrders, products, setActive, setAddOpen, onSelectOrder }) {
  const [selectedMetric, setSelectedMetric] = useState('Revenue')
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()
  return <>
    <div className="welcome-row"><div><div className="date-line"><span className="live-dot"/>YOUR STORE IS LOOKING GOOD <span className="date-separator">·</span> {today}</div><h1>{active === 'Analytics' ? 'Your numbers, at a glance.' : <>Good morning, {firstName}<span className="wave">✳</span></>}</h1><p className="welcome-sub">{active === 'Analytics' ? 'A closer look at how your ideas are doing.' : 'Here’s what’s happening with your store today.'}</p></div><button className="primary-button add-product" onClick={()=>setAddOpen(true)}><Plus size={17}/> Add a product</button></div>
    <div className="stats-grid">
      <StatCard icon={CreditCard} label="Total revenue" value="₹28,640" delta="12.8%" comparison="vs last month" color="violet" direction="up"/>
      <StatCard icon={ShoppingBag} label="Total orders" value={filteredOrders.length} delta="live" comparison="in your collection" color="blue" direction="up"/>
      <StatCard icon={Users} label="Customers" value="132" delta="4.3%" comparison="vs last month" color="green" direction="up"/>
      <StatCard icon={Box} label="Products listed" value={products.length} delta="live" comparison="in your catalog" color="amber" direction="flat"/>
    </div>
    <section className="dashboard-grid"><div className="panel revenue-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>{selectedMetric} over time</h2><span className="live-tag"><span/> LIVE</span></div><p>Track how your campus store is growing.</p></div><div className="panel-controls"><div className="metric-select" aria-label="Select metric">{['Revenue', 'Orders'].map(m=><button key={m} className={selectedMetric===m?'metric-active':''} onClick={()=>setSelectedMetric(m)}>{m}</button>)}</div><label className="select-shell"><select aria-label="Time period" value={period} onChange={e=>setPeriod(e.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select><ChevronDown size={14}/></label></div></div><div className="chart-total"><b>{selectedMetric === 'Revenue' ? (period === '7 days' ? '₹28,640' : period === '90 days' ? '₹89,200' : '₹28,640') : (period === '7 days' ? '26 orders' : period === '90 days' ? '512 orders' : '184 orders')}</b><span className="chart-growth"><ArrowUpRight size={14}/> 12.8%</span><small>compared to last {period === '7 days' ? 'week' : 'month'}</small></div><AreaChart period={period} metric={selectedMetric}/></div>
      <div className="panel product-panel"><div className="panel-heading"><div><h2>Student essentials</h2><p>What’s on your shelf today.</p></div><button className="round-arrow" aria-label="View products" onClick={()=>setActive('My products')}><ArrowRight size={16}/></button></div><div className="top-products">{products.slice(0,4).map((p,i)=><div className="top-product" key={p.id}><div className={`product-thumb ${p.tone}`}>{p.mark}</div><div className="top-product-info"><b>{p.name}</b><span>{p.category}</span></div><div className="top-product-price"><b>{formatINR(p.price)}</b><span className="product-rank">#{i+1}</span></div></div>)}</div><button className="view-all-button" onClick={()=>setActive('My products')}>View all products <ArrowRight size={14}/></button></div>
    </section>
    <section className="panel orders-panel"><div className="panel-heading orders-heading"><div><h2>Recent orders <span className="count-chip">{filteredOrders.length} in collection</span></h2><p>The latest activity from your store.</p></div><button className="outline-button" onClick={()=>setActive('Orders')}>View all orders <ArrowRight size={14}/></button></div><OrdersTable orders={filteredOrders.slice(0,4)} onSelectOrder={onSelectOrder} compact/></section>
    <div className="dashboard-footnote"><span><span className="live-dot"/> Your store is up to date</span><span>Last synced just now <span className="footnote-dot">·</span> <button onClick={()=>setActive('Settings')}>Store settings <ArrowUpRight size={12}/></button></span></div>
  </>
}

function StatCard({ icon: Icon, label, value, delta, comparison, color, direction }) {
  return <article className="stat-card"><div className="stat-top"><span className={`stat-icon ${color}`}><Icon size={17}/></span><button className="stat-more" aria-label={`${label} details`}><MoreHorizontal size={18}/></button></div><p className="stat-label">{label}</p><div className="stat-value-row"><b>{value}</b><span className={`stat-delta ${direction}`}>{direction==='up'?<ArrowUpRight size={13}/>:<Sparkles size={12}/>} {delta}</span></div><div className="stat-bottom"><span>{comparison}</span><span className="mini-sparkline"><svg viewBox="0 0 70 23" preserveAspectRatio="none"><polyline points={color==='amber'?'0,17 9,14 18,15 27,9 36,13 45,6 54,10 63,4 70,7':'0,19 8,15 16,17 25,9 34,13 43,6 52,10 61,4 70,7'} fill="none" stroke={color==='violet'?'#6f66de':color==='blue'?'#5185d6':color==='green'?'#36aa82':'#df9a49'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div></article>
}

function OrdersTable({ orders: list, compact = false, onSelectOrder }) {
  if (!list.length) return <div className="empty-state"><div><Search size={19}/></div><b>No orders found</b><span>Try adjusting your search or add items from the storefront.</span></div>
  return <div className="table-scroll"><table className="orders-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th>{!compact&&<th>ACTION</th>}</tr></thead><tbody>{list.map(o=><tr key={o.id}><td className="order-id"><button type="button" className="order-id-link" onClick={() => onSelectOrder?.(o)} title="Click to view campus slip">{o.id}</button></td><td><span className="buyer-cell"><i className={`buyer-avatar ${o.color || 'lavender'}`}>{o.initials || 'ST'}</i>{o.buyer}</span></td><td>{o.item}</td><td className="date-cell">{o.date}</td><td className="amount-cell">{o.amount}</td><td><span className={`status status-${String(o.status || 'processing').toLowerCase().replace(/\s+/g, '-')}`}><i/>{o.status}</span></td>{!compact&&<td><button className="row-more" aria-label={`View slip for ${o.id}`} onClick={() => onSelectOrder?.(o)} title="View campus slip"><Eye size={15}/></button></td>}</tr>)}</tbody></table></div>
}

function ProductsView({ products, onAdd, search, onClearSearch, onDelete, onLoadSamples, onViewStorefront }) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const displayed = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory
      return matchesCat
    })
  }, [products, selectedCategory])

  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0)

  return (
    <>
      <div className="welcome-row subpage-title">
        <div>
          <div className="date-line">
            <span className="live-dot" /> YOUR CREATOR SPACE <span className="date-separator">·</span> CATALOG
          </div>
          <h1>
            My products <span className="count-heading">{products.length}</span>
          </h1>
          <p className="welcome-sub">
            Books, study resources, electronics, and campus essentials listed by you.
          </p>
        </div>
        <div className="subpage-actions">
          <button type="button" className="outline-button" onClick={onViewStorefront}>
            <Store size={15} /> View storefront
          </button>
          <button type="button" className="primary-button add-product" onClick={onAdd}>
            <Plus size={17} /> Add a product
          </button>
        </div>
      </div>

      <div className="catalog-stats-row">
        <div className="catalog-stat">
          <div className="catalog-stat-icon purple">
            <Package size={20} />
          </div>
          <div className="catalog-stat-info">
            <span>Listed items</span>
            <b>{products.length} products</b>
          </div>
        </div>
        <div className="catalog-stat">
          <div className="catalog-stat-icon green">
            <CreditCard size={20} />
          </div>
          <div className="catalog-stat-info">
            <span>Total catalog value</span>
            <b>{formatINR(totalValue)}</b>
          </div>
        </div>
        <div className="catalog-stat">
          <div className="catalog-stat-icon amber">
            <Sparkles size={20} />
          </div>
          <div className="catalog-stat-info">
            <span>Storefront visibility</span>
            <b className="stat-live-status">
              <span className="live-dot" /> Live & discoverable
            </b>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="category-tabs catalog-filter-tabs">
          {['All', ...productCategories].map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} {cat === 'All' ? `(${products.length})` : ''}
            </button>
          ))}
        </div>
        <div className="filter-right-actions">
          {products.length === 0 && (
            <button type="button" className="outline-button" onClick={onLoadSamples}>
              <Sparkles size={14} /> Load demo items
            </button>
          )}
          <button type="button" className="outline-button" onClick={() => alert('Catalog export ready: ' + products.length + ' items.')}>
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <section className="panel table-panel">
        {displayed.length > 0 ? (
          <div className="table-scroll">
            <table className="orders-table products-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>SALES</th>
                  <th>STATUS</th>
                  <th>ADDED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className="table-product">
                        <i className={`product-thumb ${p.tone}`}>{p.mark}</i>
                        <div>
                          <b>{p.name}</b>
                          {p.description && <small className="product-desc-line">{p.description}</small>}
                        </div>
                      </span>
                    </td>
                    <td><span className="count-chip">{p.category}</span></td>
                    <td className="amount-cell">{formatINR(p.price)}</td>
                    <td>{p.sales || 0}</td>
                    <td>
                      <span className={`stock-status ${p.stock === 'Low stock' ? 'low' : ''}`}>
                        <i /> {p.stock || 'Available'}
                      </span>
                    </td>
                    <td className="date-cell">{p.date}</td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn"
                          title="View on Storefront"
                          onClick={onViewStorefront}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          type="button"
                          className="table-action-btn btn-danger"
                          title="Remove product"
                          onClick={() => onDelete(p.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : search ? (
          <div className="empty-catalog-card">
            <div className="empty-icon-wrap">
              <Search size={32} />
            </div>
            <h3>No products found for “{search}”</h3>
            <p>We couldn't find any products matching your search term. Try searching for something else or clear the search filter.</p>
            <button type="button" className="outline-button" onClick={onClearSearch}>
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="empty-catalog-card">
            <div className="empty-icon-wrap">
              <Package size={34} />
            </div>
            <h3>Your campus catalog is empty</h3>
            <p>
              Turn your pre-loved textbooks, handwritten study notes, calculators, and college essentials into cash. Classmates can discover and purchase items directly through your storefront.
            </p>
            <div className="empty-actions">
              <button type="button" className="primary-button" onClick={onAdd}>
                <Plus size={16} /> Add your first product
              </button>
              <button type="button" className="outline-button" onClick={onLoadSamples}>
                <Sparkles size={15} /> Load 6 demo campus items
              </button>
            </div>
            <div className="catalog-tips">
              <div className="tip-item">
                <b>📚 Textbooks & Notes</b>
                <span>Senior year guides and exam solutions get picked up within days.</span>
              </div>
              <div className="tip-item">
                <b>⚡ Electronics & Tools</b>
                <span>Calculators, adapters, Arduino kits, and lab wear are always in demand.</span>
              </div>
              <div className="tip-item">
                <b>🤝 Campus Handoffs</b>
                <span>Meet securely between classes in the library or student cafeteria.</span>
              </div>
            </div>
          </div>
        )}

        <div className="table-pagination">
          <span>Showing <b>{displayed.length}</b> of <b>{products.length}</b> products</span>
          <div>
            <button className="pagination-button" aria-label="Previous page"><ChevronLeft size={16}/></button>
            <button className="pagination-button current-page">1</button>
            <button className="pagination-button" aria-label="Next page"><ChevronRight size={16}/></button>
          </div>
        </div>
      </section>

      <div className="page-note">
        <Sparkles size={15}/> Every listing helps another student find what they need.
      </div>
    </>
  )
}

function OrderModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="order-modal" onClick={e => e.stopPropagation()}>
        <div className="order-slip-header">
          <div>
            <div className="order-slip-badge">
              <Sparkles size={12} /> STUDENT MART · CAMPUS SLIP
            </div>
            <h3 style={{ margin: '8px 0 2px', fontSize: '18px', fontWeight: 800 }}>
              Order {order.id}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Recorded {order.date}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="order-slip-box">
          <div className="order-slip-row">
            <span>Item listing</span>
            <b>{order.item}</b>
          </div>
          <div className="order-slip-row">
            <span>Category</span>
            <b>{order.category || 'Campus essential'}</b>
          </div>
          <div className="order-slip-row">
            <span>Price / Amount</span>
            <b style={{ color: '#10b981', fontSize: '15px' }}>{order.amount}</b>
          </div>
          <div className="order-slip-row">
            <span>Buyer / Student</span>
            <b>{order.buyer}</b>
          </div>
          <div className="order-slip-row">
            <span>Campus Pickup Spot</span>
            <b>{order.pickupLocation || 'Central Campus Library (Desk 3)'}</b>
          </div>
          <div className="order-slip-row">
            <span>Current Status</span>
            <span className={`status status-${String(order.status || 'processing').toLowerCase().replace(/\s+/g, '-')}`}>
              <i /> {order.status}
            </span>
          </div>
        </div>

        <div className="campus-safety-note">
          <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <b>Campus Handoff Guidelines</b>
            <div>Meet during daylight in public university locations (Library foyer, Student Activity Center, or Department canteen). Review item condition before completing payment.</div>
          </div>
        </div>

        <div className="order-actions-bar">
          {order.status === 'Processing' && (
            <button
              type="button"
              className="primary-button"
              style={{ flex: 1 }}
              onClick={() => {
                onUpdateStatus(order.id, 'Ready for pickup')
              }}
            >
              Mark Ready for Pickup
            </button>
          )}
          {order.status === 'Ready for pickup' && (
            <button
              type="button"
              className="primary-button"
              style={{ flex: 1, background: '#16a34a' }}
              onClick={() => {
                onUpdateStatus(order.id, 'Completed')
              }}
            >
              Mark Completed (Handed Off)
            </button>
          )}
          {order.status === 'Completed' && (
            <button
              type="button"
              className="outline-button"
              style={{ flex: 1 }}
              onClick={() => {
                onUpdateStatus(order.id, 'Processing')
              }}
            >
              Reopen Order
            </button>
          )}
          <button type="button" className="outline-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function OrdersView({
  orders: allOrders,
  search,
  onClearSearch,
  onUpdateStatus,
  onViewStorefront,
  onSelectOrder,
}) {
  const [selectedStatus, setSelectedStatus] = useState('All')

  const processingCount = allOrders.filter(o => o.status === 'Processing').length
  const readyCount = allOrders.filter(o => o.status === 'Ready for pickup').length
  const completedCount = allOrders.filter(o => o.status === 'Completed').length
  const refundedCount = allOrders.filter(o => o.status === 'Refunded' || o.status === 'Cancelled').length

  const filtered = useMemo(() => {
    return allOrders.filter(o => {
      const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus
      const matchesSearch = !search || `${o.id} ${o.buyer} ${o.item} ${o.status} ${o.pickupLocation || ''}`.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [allOrders, selectedStatus, search])

  const totalValue = allOrders.reduce((acc, o) => {
    const num = Number(String(o.amount).replace(/[^0-9]/g, '')) || 0
    return acc + num
  }, 0)

  const handleExport = () => {
    const rows = [
      ['Order ID', 'Item', 'Category', 'Buyer', 'Amount', 'Status', 'Date', 'Pickup Location'],
      ...allOrders.map(o => [o.id, o.item, o.category || '', o.buyer, o.amount, o.status, o.date, o.pickupLocation || '']),
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `student_mart_orders_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="welcome-row subpage-title">
        <div>
          <div className="date-line">
            <span className="live-dot" /> YOUR CREATOR SPACE <span className="date-separator">·</span> CAMPUS ORDERS & COLLECTION
          </div>
          <h1>
            Orders & Collection <span className="count-heading">{allOrders.length}</span>
          </h1>
          <p className="welcome-sub">
            Track books and items added to your collection, campus handoffs, and fulfillment status.
          </p>
        </div>
        <div className="subpage-actions">
          <button type="button" className="outline-button" onClick={onViewStorefront}>
            <Store size={15} /> Browse Storefront
          </button>
          <button type="button" className="outline-button" onClick={handleExport}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="orders-summary">
        <div>
          <span>Total collection volume</span>
          <b>{allOrders.length} orders</b>
          <small><ArrowUpRight size={13} /> {formatINR(totalValue)} catalog total</small>
        </div>
        <div>
          <span>Processing</span>
          <b>{processingCount}</b>
          <small style={{ color: '#d97706' }}>Awaiting prep & packaging</small>
        </div>
        <div>
          <span>Ready for pickup</span>
          <b>{readyCount}</b>
          <small style={{ color: '#2563eb' }}>Campus handoff scheduled</small>
        </div>
        <div>
          <span>Completed</span>
          <b>{completedCount}</b>
          <small style={{ color: '#10b981' }}>Handed off successfully</small>
        </div>
      </div>

      <div className="filter-bar">
        <div className="category-tabs catalog-filter-tabs">
          {[
            { label: 'All', count: allOrders.length },
            { label: 'Processing', count: processingCount },
            { label: 'Ready for pickup', count: readyCount },
            { label: 'Completed', count: completedCount },
            ...(refundedCount > 0 ? [{ label: 'Refunded', count: refundedCount }] : []),
          ].map(tab => (
            <button
              key={tab.label}
              type="button"
              className={`category-tab ${selectedStatus === tab.label ? 'active' : ''}`}
              onClick={() => setSelectedStatus(tab.label)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="filter-right-actions">
          {search && (
            <button type="button" className="outline-button" onClick={onClearSearch}>
              <X size={13} /> Clear search “{search}”
            </button>
          )}
        </div>
      </div>

      <section className="panel table-panel">
        {filtered.length > 0 ? (
          <div className="table-scroll">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>BUYER / STUDENT</th>
                  <th>PRODUCT</th>
                  <th>PICKUP SPOT</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td className="order-id">
                      <button
                        type="button"
                        className="order-id-link"
                        onClick={() => onSelectOrder(o)}
                        title="Click to view campus handoff slip"
                      >
                        {o.id}
                      </button>
                    </td>
                    <td>
                      <span className="buyer-cell">
                        <i className={`buyer-avatar ${o.color || 'lavender'}`}>{o.initials || 'ST'}</i>
                        {o.buyer}
                      </span>
                    </td>
                    <td>
                      <span className="table-product">
                        <b>{o.item}</b>
                      </span>
                    </td>
                    <td>
                      <span className="pickup-cell">
                        <span className="location-pin">📍</span> {o.pickupLocation || 'Library Desk 3'}
                      </span>
                    </td>
                    <td className="date-cell">{o.date}</td>
                    <td className="amount-cell">{o.amount}</td>
                    <td>
                      <span className={`status status-${String(o.status || 'processing').toLowerCase().replace(/\s+/g, '-')}`}>
                        <i />
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn"
                          title="View Campus Slip"
                          onClick={() => onSelectOrder(o)}
                        >
                          <Eye size={13} /> Slip
                        </button>
                        {o.status === 'Processing' && (
                          <button
                            type="button"
                            className="table-action-btn"
                            title="Mark Ready for Campus Pickup"
                            onClick={() => onUpdateStatus(o.id, 'Ready for pickup')}
                            style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                          >
                            Ready
                          </button>
                        )}
                        {o.status === 'Ready for pickup' && (
                          <button
                            type="button"
                            className="table-action-btn"
                            title="Mark Handed Off & Completed"
                            onClick={() => onUpdateStatus(o.id, 'Completed')}
                            style={{ color: '#16a34a', borderColor: '#bbf7d0' }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-catalog-card">
            <div className="empty-icon-wrap">
              <ShoppingBag size={34} />
            </div>
            <h3>
              {search
                ? `No orders matching “${search}”`
                : selectedStatus !== 'All'
                ? `No ${selectedStatus.toLowerCase()} orders found`
                : 'No orders in your collection yet'}
            </h3>
            <p>
              {search
                ? 'Try a different search query or clear your filter.'
                : 'Browse our interactive 3D Campus Storefront rail to discover textbooks, notes, and essentials. When you click “Add to collection”, your order appears here.'}
            </p>
            <div className="empty-actions">
              {search ? (
                <button type="button" className="outline-button" onClick={onClearSearch}>
                  Clear search
                </button>
              ) : (
                <button type="button" className="primary-button" onClick={onViewStorefront}>
                  <Store size={16} /> Browse Campus Storefront
                </button>
              )}
            </div>
            <div className="catalog-tips">
              <div className="tip-item">
                <b>🏫 Campus Meetups</b>
                <span>Handoffs happen right at the Central Library or Student Activity Center.</span>
              </div>
              <div className="tip-item">
                <b>🛡️ Safe & Verified</b>
                <span>Inspect your book or device in person before completing the exchange.</span>
              </div>
              <div className="tip-item">
                <b>⚡ Instant Updates</b>
                <span>Track preparation, readiness, and completion right from this dashboard.</span>
              </div>
            </div>
          </div>
        )}

        <div className="table-pagination">
          <span>Showing <b>{filtered.length}</b> of <b>{allOrders.length}</b> orders</span>
          <div>
            <button className="pagination-button" aria-label="Previous page"><ChevronLeft size={16}/></button>
            <button className="pagination-button current-page">1</button>
            <button className="pagination-button" aria-label="Next page"><ChevronRight size={16}/></button>
          </div>
        </div>
      </section>

      <div className="page-note">
        <Sparkles size={15}/> Orders placed directly support fellow college students and sustainable reuse.
      </div>
    </>
  )
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
