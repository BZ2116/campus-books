const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../../src/middleware/auth') 

// 管理员权限校验中间件
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403).json({ error: '权限不足，仅限管理员访问' })
  }
}

// backend/routes/admin.js
router.get('/books', auth, adminOnly, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: {
        status: {
          in: ['AVAILABLE', 'RESERVED']
        }
      },
      include: {
        seller: { 
          select: { studentId: true, nickname: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log("查询到的书籍数量:", books.length)

    return res.status(200).json(books)
  } catch (e) {
    console.error("管理后台查询失败:", e)
    res.status(500).json({ error: '获取数据失败' })
  }
})
// DELETE /api/admin/books/:id - 管理员强行下架
router.delete('/books/:id', auth, adminOnly, async (req, res) => {
  try {

    const book = await prisma.book.findUnique({
      where: { id: req.params.id }
    })

    if (!book) {
      return res.status(404).json({ error: '书籍不存在' })
    }

    // 只允许下架 AVAILABLE
    if (book.status !== 'AVAILABLE') {
      return res.status(400).json({
        error: '该书已被预约或已完成交易，无法强制下架'
      })
    }

    await prisma.book.delete({
      where: { id: req.params.id }
    })

    res.json({ message: '下架成功' })

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '删除失败' })
  }
})

module.exports = router
