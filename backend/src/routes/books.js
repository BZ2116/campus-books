const router = require('express').Router()
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')
const axios = require('axios')


// 获取书籍列表
router.get('/', async (req, res) => {
  try {
    const { search, category, campus, page = 1, limit = 20 } = req.query
    const where = { status: 'AVAILABLE' }
    if (category && category !== '全部') where.category = category
    if (campus) where.campus = campus
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { seller: { select: { nickname: true, campus: true, creditScore: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit)
      }),
      prisma.book.count({ where })
    ])
    res.json({ books, total, page: Number(page) })
  } catch (e) {
    res.status(500).json({ error: '获取失败', detail: e.message })
  }
})

// 获取单本书籍详情
router.get('/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { id: true, nickname: true, campus: true, department: true, creditScore: true } } }
    })
    if (!book) return res.status(404).json({ error: '书籍不存在' })
    await prisma.book.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } })
    res.json(book)
  } catch (e) {
    res.status(500).json({ error: '获取失败' })
  }
})



// 发布书籍
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { isbn, title, author, publisher, coverUrl, price, originalPrice, condition, category, tags, description, campus, pickupLocation } = req.body
    if (!title || !price || !condition || !category || !campus) {
      return res.status(400).json({ error: '请填写完整信息' })
    }
    const book = await prisma.book.create({
      data: {
        sellerId: req.user.id,
        isbn, title, author, publisher, coverUrl,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        condition, category,
        tags: tags || [],
        description, campus, pickupLocation
      }
    })
    res.json(book)
  } catch (e) {
    res.status(500).json({ error: '发布失败', detail: e.message })
  }
})

// 下架书籍
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const book = await prisma.book.findUnique({ where: { id: req.params.id } })
    if (!book) return res.status(404).json({ error: '书籍不存在' })
    if (book.sellerId !== req.user.id) return res.status(403).json({ error: '无权操作' })
    await prisma.book.update({ where: { id: req.params.id }, data: { status: 'SOLD' } })
    res.json({ message: '已下架' })
  } catch (e) {
    res.status(500).json({ error: '操作失败' })
  }
})

module.exports = router