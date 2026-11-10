import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.js'

const email = 'vaida.ri1709@gmail.com'
const name = 'Ritwik Vaida'
const password = process.env.ADMIN_INITIAL_PASSWORD
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/

if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before provisioning the administrator account.')
if (!passwordPattern.test(password || '')) {
  throw new Error('Set ADMIN_INITIAL_PASSWORD to 8–72 characters with uppercase, lowercase, and a number.')
}

try {
  await mongoose.connect(process.env.MONGODB_URI)
  const passwordHash = await bcrypt.hash(password, 12)
  await User.updateMany({ role: 'admin', email: { $ne: email } }, { $set: { role: 'seller' } })
  await User.findOneAndUpdate(
    { email },
    { $set: { name, password: passwordHash, role: 'admin' } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  )
  console.log(`Administrator account provisioned for ${email}.`)
} finally {
  await mongoose.disconnect()
}
