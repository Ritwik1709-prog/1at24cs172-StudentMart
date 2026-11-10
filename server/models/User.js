import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required() { return !this.googleId }, select: false },
  googleId: { type: String, unique: true, sparse: true, select: false },
  role: { type: String, enum: ['admin', 'seller'], default: 'seller', required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
