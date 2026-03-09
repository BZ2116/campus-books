const router = require('express').Router()
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

function genCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

// 发起预约
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { bookId, pickupTime } = req.body
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) return res.status(404).json({ error: '书籍不存在' })
    if (book.status !== 'AVAILABLE') return res.status(400).json({ error: '书籍已被预约' })
    if (book.sellerId === req.user.id) return res.status(400).json({ error: '不能预约自己的书籍' })

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const reservation = await prisma.reservation.create({
      data: {
        bookId, buyerId: req.user.id, sellerId: book.sellerId,
        pickupCode: genCode(),
        pickupTime: pickupTime ? new Date(pickupTime) : null,
        expiresAt
      }
    })
    await prisma.book.update({ where: { id: bookId }, data: { status: 'RESERVED' } })
    res.json(reservation)
  } catch (e) {
    res.status(500).json({ error: '预约失败', detail: e.message })
  }
})

// 获取我的预约列表
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] },
      include: {
        book: { select: { title: true, coverUrl: true, price: true, campus: true } },
        buyer: { select: { nickname: true } },
        seller: { select: { nickname: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reservations)
  } catch (e) {
    res.status(500).json({ error: '获取失败' })
  }
})

// 完成交易（核销取货码）
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { pickupCode } = req.body
    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } })
    if (!reservation) return res.status(404).json({ error: '预约不存在' })
    if (reservation.pickupCode !== pickupCode) return res.status(400).json({ error: '取货码错误' })
    if (reservation.status !== 'PENDING') return res.status(400).json({ error: '预约状态异常' })

    await prisma.reservation.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } })
    await prisma.book.update({ where: { id: reservation.bookId }, data: { status: 'SOLD' } })
    res.json({ message: '交易完成' })
  } catch (e) {
    res.status(500).json({ error: '操作失败' })
  }
})

// 取消预约
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: req.params.id } })
    if (!reservation) return res.status(404).json({ error: '预约不存在' })
    if (reservation.buyerId !== req.user.id) return res.status(403).json({ error: '无权操作' })

    await prisma.reservation.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } })
    await prisma.book.update({ where: { id: reservation.bookId }, data: { status: 'AVAILABLE' } })
    res.json({ message: '已取消' })
  } catch (e) {
    res.status(500).json({ error: '取消失败' })
  }
})

module.exports = router