const router = require('express').Router()
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

function genCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

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

router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { pickupCode } = req.body

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { book: true }
    })

    if (!reservation) return res.status(404).json({ error: '预约不存在' })
    if (reservation.pickupCode !== pickupCode) return res.status(400).json({ error: '取货码错误' })
    if (reservation.status !== 'PENDING') return res.status(400).json({ error: '预约状态异常' })

    // 更新预约状态
    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' }
    })

    // 更新书籍状态
    await prisma.book.update({
      where: { id: reservation.bookId },
      data: { status: 'SOLD' }
    })

    // 查询买卖双方
    const seller = await prisma.user.findUnique({
      where: { id: reservation.book.sellerId }
    })

    const buyer = await prisma.user.findUnique({
      where: { id: reservation.buyerId }
    })

    // ⭐ 计算信用（上限100）
    const newSellerCredit = Math.min(100, seller.creditScore + 2)
    const newBuyerCredit = Math.min(100, buyer.creditScore + 2)

    await prisma.user.update({
      where: { id: seller.id },
      data: { creditScore: newSellerCredit }
    })

    await prisma.user.update({
      where: { id: buyer.id },
      data: { creditScore: newBuyerCredit }
    })

    res.json({ message: '交易完成，双方信用 +2' })

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: '操作失败' })
  }
})

router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    console.log('=== 取消预约调试信息 ===')
    console.log('当前用户 ID (JWT):', req.user?.id || req.user?._id || 'undefined')
    console.log('要取消的预约 ID:', req.params.id)

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { book: true }
    })

    if (!reservation) return res.status(404).json({ error: '预约不存在' })

    if (String(reservation.buyerId) !== String(req.user?.id || req.user?._id)) {
      return res.status(403).json({ error: '无权操作' })
    }

    if (reservation.status !== 'PENDING') {
      return res.status(400).json({ error: '预约状态异常，无法取消' })
    }

    // ⭐ 计算预约时间
    const now = new Date()
    const createdAt = new Date(reservation.createdAt)

    const diffHours = (now - createdAt) / (1000 * 60 * 60)

    // ⭐ 超过3小时扣信用
    if (diffHours >= 3) {

      const seller = await prisma.user.findUnique({
        where: { id: reservation.book.sellerId }
      })

      const buyer = await prisma.user.findUnique({
        where: { id: reservation.buyerId }
      })

      const newSellerCredit = Math.max(0, seller.creditScore - 2)
      const newBuyerCredit = Math.max(0, buyer.creditScore - 2)

      await prisma.user.update({
        where: { id: seller.id },
        data: { creditScore: newSellerCredit }
      })

      await prisma.user.update({
        where: { id: buyer.id },
        data: { creditScore: newBuyerCredit }
      })
    }

    await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    })

    await prisma.book.update({
      where: { id: reservation.bookId },
      data: { status: 'AVAILABLE' }
    })

    res.json({
      message: diffHours >= 3
        ? '取消成功，双方信用 -2'
        : '取消成功'
    })

  } catch (e) {
    console.error('取消失败详情:', e.message)
    res.status(500).json({ error: '取消失败' })
  }
})

module.exports = router