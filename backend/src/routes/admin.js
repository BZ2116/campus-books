const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../../src/middleware/auth') // 引入你的登录校验中间件

// 管理员权限校验中间件
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403).json({ error: '权限不足，仅限管理员访问' })
  }
}

// GET /api/admin/books - 获取全站所有书籍
router.get('/books', auth, adminOnly, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        seller: { // 确保这里和你的 Prisma 模型关联名一致
          select: { studentId: true, nickname: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(books)
  } catch (e) {
    res.status(500).json({ error: '获取数据失败' })
  }
})

// DELETE /api/admin/books/:id - 管理员强行下架
router.delete('/books/:id', auth, adminOnly, async (req, res) => {
  try {
    await prisma.book.delete({
      where: { id: req.params.id }
    })
    res.json({ message: '下架成功' })
  } catch (e) {
    res.status(500).json({ error: '删除失败' })
  }
})

module.exports = router