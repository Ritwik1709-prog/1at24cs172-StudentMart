import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { cookieOptions, requireAuth } from '../middleware/auth.js'

const router = Router()
const administratorEmail = (process.env.ADMIN_EMAIL || 'vaida.ri1709@gmail.com').toLowerCase()
const emailPattern = /^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2,})?$/i
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/
const googleClient = new OAuth2Client()

function isValidEduEmail(email) {
  if (typeof email !== 'string') return false
  const trimmed = email.trim().toLowerCase()
  if (administratorEmail && trimmed === administratorEmail) return true
  return emailPattern.test(trimmed)
}

function publicUser(user) {
  const role = (administratorEmail && user.email === administratorEmail) ? 'admin' : (user.role || 'seller')
  return { id: user._id, name: user.name, email: user.email, role, createdAt: user.createdAt }
}

function issueSession(res, user) {
  const token = jwt.sign(
    { id: String(user._id), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user._id), expiresIn: '7d' }
  )
  res.cookie('student_mart_session', token, cookieOptions())
  return token
}

router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' })
    }
    if (!isValidEduEmail(email) || email.length > 254) {
      return res.status(400).json({ message: 'Please enter a valid student email address ending with .edu (e.g. you@college.edu).' })
    }
    if (!passwordPattern.test(password)) {
      return res.status(400).json({ message: 'Password must be 8–72 characters and include an uppercase letter, lowercase letter, and a number.' })
    }
    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const role = (administratorEmail && email === administratorEmail) ? 'admin' : 'seller'
    const hash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hash, role })
    const token = issueSession(res, user)
    res.status(201).json({ user: publicUser(user), token })
  } catch (error) { next(error) }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!isValidEduEmail(email) || !password || password.length > 72) {
      return res.status(400).json({ message: 'Enter a valid .edu email address and password.' })
    }
    const user = await User.findOne({ email }).select('+password')
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' })
    }
    if (administratorEmail && email === administratorEmail && user.role !== 'admin') {
      user.role = 'admin'
      await user.save()
    }
    const token = issueSession(res, user)
    res.json({ user: publicUser(user), token })
  } catch (error) { next(error) }
})

router.post('/google', async (req, res, next) => {
  try {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return res.status(503).json({ message: 'Google sign-in needs a Google Web Client ID in .env.' })
    const credential = typeof req.body.credential === 'string' ? req.body.credential : ''
    if (!credential || credential.length > 10000) return res.status(400).json({ message: 'Google did not return a valid sign-in credential.' })

    let ticket
    try {
      ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId })
    } catch {
      return res.status(401).json({ message: 'Google could not verify this sign-in. Please try again.' })
    }
    const claims = ticket.getPayload()
    if (!claims?.sub || !claims.email || claims.email_verified !== true) {
      return res.status(401).json({ message: 'Use a Google account with a verified email address.' })
    }

    const email = claims.email.trim().toLowerCase()
    if (!isValidEduEmail(email)) {
      return res.status(403).json({ message: 'Only Google accounts with a .edu college email address are allowed.' })
    }
    let user = await User.findOne({ email }).select('+googleId')
    if (user?.googleId && user.googleId !== claims.sub) {
      return res.status(409).json({ message: 'This email is already linked to a different Google account.' })
    }
    if (!user) {
      let name = claims.name?.trim().slice(0, 80) || email.split('@')[0]
      if (name.length < 2) name = 'Google User'
      user = await User.create({ name, email, googleId: claims.sub, role: email === administratorEmail ? 'admin' : 'seller' })
    } else if (!user.googleId || (email === administratorEmail && user.role !== 'admin')) {
      if (!user.googleId) user.googleId = claims.sub
      if (email === administratorEmail) user.role = 'admin'
      await user.save()
    }

    const token = issueSession(res, user)
    res.json({ user: publicUser(user), token })
  } catch (error) { next(error) }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('student_mart_session', cookieOptions())
  res.json({ message: 'You have been signed out.' })
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' })
    res.json({ user: publicUser(user) })
  } catch (error) { next(error) }
})

export default router
