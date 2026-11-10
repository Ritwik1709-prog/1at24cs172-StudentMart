import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const administratorEmail = (process.env.ADMIN_EMAIL || 'vaida.ri1709@gmail.com').toLowerCase()

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = req.cookies?.student_mart_session || bearerToken

  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.sub || decoded.id
    next()
  } catch {
    res.clearCookie('student_mart_session', cookieOptions())
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}

export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('role email')
    if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' })
    if (user.role !== 'admin' || (administratorEmail && user.email !== administratorEmail)) {
      return res.status(403).json({ message: 'Administrator access is required.' })
    }
    req.userRole = user.role
    next()
  } catch (error) {
    next(error)
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

