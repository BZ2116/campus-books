const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../../src/middleware/auth')

router.post('/toggle', auth, async (req, res) => {
  const { bookId } = req.body
  const userId = req.user.id

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } }
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return res.status(200).json({ isFavorited: false, message: '已取消收藏' })
    } else {
      await prisma.favorite.create({ data: { userId, bookId } })
      return res.status(200).json({ isFavorited: true, message: '收藏成功' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '操作失败' })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { book: true },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(favorites)
  } catch (error) {
    res.status(500).json({ error: '获取收藏列表失败' })
  }
})

module.exports = router