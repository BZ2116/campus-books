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
      include: {
        seller: { 
          select: { studentId: true, nickname: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 调试用：在后端终端看一眼到底查出来几条
    console.log("查询到的书籍数量:", books.length);
    
    // 明确指定返回 200 状态码
    return res.status(200).json(books); 
  } catch (e) {
    console.error("管理后台查询失败:", e);
    res.status(500).json({ error: '获取数据失败' });
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