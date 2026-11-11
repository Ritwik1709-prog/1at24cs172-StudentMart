import { Router } from 'express'
import Order from '../models/Order.js'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({ buyerId: req.userId }).sort({ createdAt: -1 }).lean()
    res.json({ orders })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const item = typeof req.body.item === 'string' ? req.body.item.trim() : ''
    const category = typeof req.body.category === 'string' ? req.body.category.trim() : 'Campus essentials'
    const price = Number(req.body.price) || Number(req.body.amount) || 0
    const productId = typeof req.body.productId === 'string' ? req.body.productId : ''
    const pickupLocation = typeof req.body.pickupLocation === 'string' && req.body.pickupLocation.trim()
      ? req.body.pickupLocation.trim()
      : 'Central Campus Library (Desk 3)'

    if (!item) {
      return res.status(400).json({ message: 'Item name is required.' })
    }

    let buyerName = req.body.buyerName
    let buyerEmail = req.body.buyerEmail

    if (!buyerName || !buyerEmail) {
      const user = await User.findById(req.userId).lean()
      if (user) {
        buyerName = user.name || user.email.split('@')[0]
        buyerEmail = user.email
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `#SM-${randomSuffix}`

    const order = await Order.create({
      orderNumber,
      buyerId: req.userId,
      buyerName: buyerName || 'Student Member',
      buyerEmail: buyerEmail || 'student@campus.edu',
      productId,
      item,
      category,
      amount: price,
      status: 'Processing',
      pickupLocation,
      date: 'Just now',
    })

    res.status(201).json({ order })
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['Processing', 'Ready for pickup', 'Completed', 'Refunded', 'Cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' })
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, buyerId: req.userId },
      { status },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' })
    }

    res.json({ order })
  } catch (error) {
    next(error)
  }
})

export default router

