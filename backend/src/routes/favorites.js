const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../../src/middleware/auth')

// POST /api/favorites/toggle - 切换收藏状态
router.post('/toggle', auth, async (req, res) => {
  const { bookId } = req.body
  const userId = req.user.id

  try {
    // 检查是否已经收藏
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_bookId: { userId, bookId }
      }
    })

    if (existing) {
      // 如果已存在，则取消收藏
      await prisma.favorite.delete({
        where: { id: existing.id }
      })
      return res.status(200).json({ isFavorited: false, message: '已取消收藏' })
    } else {
      // 如果不存在，则新增收藏
      await prisma.favorite.create({
        data: { userId, bookId }
      })
      return res.status(200).json({ isFavorited: true, message: '收藏成功' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '操作失败' })
  }
})

// GET /api/favorites - 获取当前用户的所有收藏
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        book: true // 级联查出书籍详情，方便前端展示列表
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(favorites)
  } catch (error) {
    res.status(500).json({ error: '获取收藏列表失败' })
  }
})

module.exports = router