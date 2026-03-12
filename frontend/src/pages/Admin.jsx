import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function Admin() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/')
      return
    }
    fetchAdminData()
  }, [user])

  const fetchAdminData = async () => {
    if (books.status !== 'AVAILABLE') {
      alert('该书籍已被预约，无法强制下架')
      return
    }

    if (!window.confirm('确定要强行下架该书籍吗？')) return

    try {
      await api.delete(`/admin/books/${book.id}`)

      // 更新本地状态
      setBooks(prev => prev.filter(b => b.id !== book.id))

      alert('下架成功')

    } catch {
      alert('下架失败')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定要强行下架该书籍吗？')) return
    await api.delete(`/admin/books/${id}`)
    setBooks(books.filter(b => b.id !== id))
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>加载管理数据...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>
        🛡️ 平台管理后台
      </h2>

      <table style={{
        width: '100%',
        background: '#fff',
        borderRadius: 12,
        borderCollapse: 'collapse',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>

        <thead style={{ background: '#f8f9fa' }}>
          <tr>
            <th style={tdStyle}>封面</th>
            <th style={tdStyle}>书名</th>
            <th style={tdStyle}>发布者学号</th>
            <th style={tdStyle}>价格</th>
            <th style={tdStyle}>状态</th>
            <th style={tdStyle}>操作</th>
          </tr>
        </thead>

        <tbody>
          {books.map(b => (
            <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>

              <td style={tdStyle}>
                <img
                  src={b.coverUrl}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                />
              </td>

              <td style={tdStyle}>
                {b.title}
              </td>

              <td style={tdStyle}>
                {b.seller?.studentId || '未知'}
              </td>

              <td style={tdStyle}>
                ¥{b.price}
              </td>

              <td style={tdStyle}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: b.status === 'AVAILABLE'
                    ? '#e6fffa'
                    : '#fff7e6',
                  color: b.status === 'AVAILABLE'
                    ? '#0c9'
                    : '#fa8c16'
                }}>
                  {b.status === 'AVAILABLE'
                    ? '可预约'
                    : '已被预约'}
                </span>
              </td>

              <td style={tdStyle}>
                <button
                  disabled={b.status !== 'AVAILABLE'}
                  onClick={() => handleDelete(b)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    fontWeight: 600,
                    background: b.status === 'AVAILABLE'
                      ? '#fff1f0'
                      : '#f5f5f5',
                    color: b.status === 'AVAILABLE'
                      ? '#e53e3e'
                      : '#999',
                    cursor: b.status === 'AVAILABLE'
                      ? 'pointer'
                      : 'not-allowed'
                  }}
                >
                  强行下架
                </button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}

const tdStyle = { padding: '12px 15px', textAlign: 'left', fontSize: 14 }
