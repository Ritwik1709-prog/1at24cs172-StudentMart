import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  category: { type: String, required: true, enum: ['Textbooks', 'Notes & study guides', 'Stationery', 'Electronics', 'Project kits', 'Campus essentials'] },
  price: { type: Number, required: true, min: 1, max: 1000000 },
  description: { type: String, trim: true, maxlength: 280, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)
