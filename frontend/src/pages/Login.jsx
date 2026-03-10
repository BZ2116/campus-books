import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 900 }}>欢迎回来 👋</h2>
        <p style={{ color: '#888', marginBottom: 28, fontSize: 14 }}>登录你的校园书市账号</p>
        {error && <div style={{ background: '#fff0f0', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>邮箱</label>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}
              placeholder="请输入邮箱" type="email" required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>密码</label>
            <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}
              placeholder="请输入密码" type="password" required />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#ff6b35', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer'
          }}>{loading ? '登录中...' : '登录'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
          还没有账号？<Link to="/register" style={{ color: '#ff6b35', fontWeight: 600 }}>立即注册</Link>
        </p>
      </div>
    </div>
  )
}
