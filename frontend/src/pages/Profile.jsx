import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function Profile() {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const [myBooks, setMyBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/books', { params: { limit: 50 } }).then(res => {
      setMyBooks(res.data.books.filter(b => b.sellerId === user.id))
    }).finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{user?.nickname}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>退出登录</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>我发布的书籍 ({myBooks.length})</h3>
        <Link to="/publish" style={{ background: '#ff6b35', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>+ 发布新书</Link>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>加载中...</div> :
        myBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 40 }}>📭</div>
            <div style={{ marginTop: 8 }}>还没有发布书籍</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {myBooks.map(book => (
              <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 32 }}>📚</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{book.title}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{book.condition} · {book.campus}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#ff6b35' }}>¥{book.price}</div>
                    <div style={{ fontSize: 11, color: book.status === 'AVAILABLE' ? '#16a34a' : '#aaa', textAlign: 'right', marginTop: 2 }}>
                      {book.status === 'AVAILABLE' ? '在售' : book.status === 'RESERVED' ? '已预约' : '已售出'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      }
    </div>
  )
}
