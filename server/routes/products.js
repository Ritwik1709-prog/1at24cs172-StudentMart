import { Router } from 'express'
import Product from '../models/Product.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const categories = ['Textbooks', 'Notes & study guides', 'Stationery', 'Electronics', 'Project kits', 'Campus essentials']

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ ownerId: req.userId }).sort({ createdAt: -1 }).lean()
    res.json({ products })
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const category = typeof req.body.category === 'string' ? req.body.category : ''
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : ''
    const price = Number(req.body.price)
    if (name.length < 2 || name.length > 120) return res.status(400).json({ message: 'Product name must be between 2 and 120 characters.' })
    if (!categories.includes(category)) return res.status(400).json({ message: 'Choose a student marketplace category.' })
    if (!Number.isFinite(price) || price < 1 || price > 1000000) return res.status(400).json({ message: 'Price must be between ₹1 and ₹10,00,000.' })
    if (description.length > 280) return res.status(400).json({ message: 'Description must be 280 characters or fewer.' })
    const product = await Product.create({ ownerId: req.userId, name, category, price, description })
    res.status(201).json({ product })
  } catch (error) { next(error) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, ownerId: req.userId })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    res.json({ message: 'Product removed from your catalog.' })
  } catch (error) { next(error) }
})

export default router
