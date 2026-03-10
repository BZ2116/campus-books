import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'


export default function Register() {

  const [form, setForm] = useState({ studentId: '', email: '', password: '', nickname: '', department: '', qq: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useStore()
  const navigate = useNavigate()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.error || '注册失败')
    } finally {
      setLoading(false)
    }

  }

  const fields = [
    { key: 'studentId', label: '学号', placeholder: '请输入学号', type: 'text' },
    { key: 'email', label: '邮箱', placeholder: '请输入校园邮箱', type: 'email' },
    { key: 'password', label: '密码', placeholder: '请设置密码（至少6位）', type: 'password' },
    { key: 'nickname', label: '昵称', placeholder: '你的昵称', type: 'text' },
    { key: 'department', label: '学院', placeholder: '如：计算机学院', type: 'text' },
    { key: 'qq', label: 'QQ号', placeholder: '请输入QQ号方便买家联系', type: 'text' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 900 }}>注册账号 📚</h2>
        <p style={{ color: '#888', marginBottom: 28, fontSize: 14 }}>加入校园书市，让书籍流转起来</p>
        {error && <div style={{ background: '#fff0f0', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                placeholder={f.placeholder} type={f.type} required={f.key !== 'department'} />
            </div>
          ))}


          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: '#ff6b35', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer'
          }}>{loading ? '注册中...' : '立即注册'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
          已有账号？<Link to="/login" style={{ color: '#ff6b35', fontWeight: 600 }}>立即登录</Link>
        </p>

      </div>

    </div>

  )

}
