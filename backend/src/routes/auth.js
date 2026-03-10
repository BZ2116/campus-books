const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

// 注册
router.post('/register', async (req, res) => {
  try {
    const { studentId, email, password, nickname, department, campus } = req.body
    if (!studentId || !email || !password || !nickname) {
      return res.status(400).json({ error: '请填写完整信息' })
    }
    const exists = await prisma.user.findFirst({
      where: { OR: [{ studentId }, { email }] }
    })
    if (exists) return res.status(400).json({ error: '学号或邮箱已注册' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { studentId, email, passwordHash, nickname, department, campus }
    })
    const token = jwt.sign({ id: user.id, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, nickname: user.nickname, email: user.email } })
  } catch (e) {
    res.status(500).json({ error: '注册失败', detail: e.message })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: '用户不存在' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: '密码错误' })

    const token = jwt.sign({ id: user.id, nickname: user.nickname }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, nickname: user.nickname, email: user.email, campus: user.campus } })
  } catch (e) {
    res.status(500).json({ error: '登录失败', detail: e.message })
  }
})

// 获取当前用户信息
router.get('/me', require('./../../src/middleware/auth'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nickname: true, email: true, studentId: true, department: true, campus: true, creditScore: true, createdAt: true }
    })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: '获取失败' })
  }
})

module.exports = router
