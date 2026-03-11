const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const auth = require('../../src/middleware/auth')

// POST /api/reviews - 提交评价
router.post('/', auth, async (req, res) => {
  const { reservationId, rating, comment } = req.body
  const reviewerId = req.user.id

  try {
    // 1. 查询订单信息，确认订单存在且操作人是买家或卖家
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    })

    if (!reservation) {
      return res.status(404).json({ error: '订单不存在' })
    }

    if (reservation.buyerId !== reviewerId && reservation.sellerId !== reviewerId) {
      return res.status(403).json({ error: '您无权评价此订单' })
    }

    // 2. 确定被评价人的 ID
    const reviewedId = reservation.buyerId === reviewerId ? reservation.sellerId : reservation.buyerId

    // 3. 计算信用分变动逻辑 (可自行调整规则)
    let scoreChange = 0
    if (rating >= 4) scoreChange = 2    // 好评加分
    if (rating <= 2) scoreChange = -5   // 差评扣分

    // 4. 使用事务同时写入评价并更新信用分
    await prisma.$transaction([
      prisma.review.create({
        data: {
          reservationId,
          reviewerId,
          reviewedId,
          rating,
          comment
        }
      }),
      prisma.user.update({
        where: { id: reviewedId },
        data: {
          creditScore: { increment: scoreChange }
        }
      })
    ])

    return res.status(200).json({ message: '评价成功' })
  } catch (error) {
    // 捕获唯一约束冲突，说明已经评价过了
    if (error.code === 'P2002') {
      return res.status(400).json({ error: '该订单已评价，请勿重复提交' })
    }
    console.error(error)
    res.status(500).json({ error: '评价提交失败' })
  }
})

module.exports = router