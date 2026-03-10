import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function EditProfile() {

  const { user, setUser } = useStore()
  const navigate = useNavigate()

  const [nickname, setNickname] = useState(user.nickname || '')
  const [email, setEmail] = useState(user.email || '')
  const [QQ, setQQ] = useState(user.QQ || '')
  const [department, setDepartment] = useState(user.department || '')
  const [campus, setCampus] = useState(user.campus || '')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await api.put('/auth/profile', {
        nickname,
        email,
        QQ,
        department,
        campus
      })

      setUser(res.data.user)

      alert('修改成功')

      navigate('/profile')
    } catch {
      alert('修改失败')
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20 }}>修改个人信息</h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>

        <input
          placeholder="昵称"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />

        <input
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="QQ"
          value={QQ}
          onChange={e => setQQ(e.target.value)}
        />

        <input
          placeholder="院系"
          value={department}
          onChange={e => setDepartment(e.target.value)}
        />

        <input
          placeholder="校区"
          value={campus}
          onChange={e => setCampus(e.target.value)}
        />

        <button
          style={{
            background: '#ff6b35',
            color: '#fff',
            padding: 10,
            border: 'none',
            borderRadius: 8
          }}
        >
          保存修改
        </button>

      </form>
    </div>
  )
}