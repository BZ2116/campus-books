const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')

router.post('/register', async (req, res) => {
  try {
    const { studentId, email, password, nickname, department, qq } = req.body
    if (!studentId || !email || !password || !nickname) {
      return res.status(400).json({ error: '请填写完整信息' })
    }
    const exists = await prisma.user.findFirst({
      where: { OR: [{ studentId }, { email }] }
    })
    if (exists) return res.status(400).json({ error: '学号或邮箱已注册' })

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { studentId, email, passwordHash, nickname, department, qq }
    })

    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        qq: user.qq,
        isAdmin: user.isAdmin
      }
    })
  } catch (e) {
    res.status(500).json({ error: '注册失败', detail: e.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: '用户不存在' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: '密码错误' })

    const token = jwt.sign(
      { id: user.id, nickname: user.nickname, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        qq: user.qq,
        isAdmin: user.isAdmin
      }
    })
  } catch (e) {
    res.status(500).json({ error: '登录失败', detail: e.message })
  }
})

router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nickname: true,
        email: true,
        studentId: true,
        department: true,
        qq: true,
        isAdmin: true,
        creditScore: true,
        createdAt: true
      }
    })
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: '获取失败' })
  }
})

router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { nickname, email, qq, department } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        nickname,
        email,
        qq,
        department,
      },
      select: {
        id: true,
        studentId: true,
        nickname: true,
        email: true,
        qq: true,
        department: true,
        creditScore: true,
        isAdmin: true
      }
    })

    res.json({ user })

  } catch (err) {
    console.error(err)

    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0]

      if (field === 'email') {
        return res.status(400).json({ error: '该邮箱已被使用' })
      }
      if (field === 'studentId') {
        return res.status(400).json({ error: '学号已存在' })
      }
      return res.status(400).json({ error: '数据重复' })
    }

    res.status(500).json({ error: '服务器错误' })
  }
})

module.exports = router