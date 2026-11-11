import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  buyerName: { type: String, required: true, trim: true },
  buyerEmail: { type: String, required: true, trim: true },
  productId: { type: String, default: '' },
  item: { type: String, required: true, trim: true },
  category: { type: String, default: 'Campus essentials' },
  amount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Processing', 'Ready for pickup', 'Completed', 'Refunded', 'Cancelled'],
    default: 'Processing',
    index: true,
  },
  pickupLocation: { type: String, default: 'Central Campus Library (Desk 3)' },
  date: { type: String, default: () => 'Just now' },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)

