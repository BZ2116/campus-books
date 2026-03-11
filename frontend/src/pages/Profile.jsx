import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function Profile() {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const [myBooks, setMyBooks] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts') 

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    
    const fetchData = async () => {
      setLoading(true)
      try {
        // 并行请求：发布的书 和 收藏的书
        const [booksRes, favsRes] = await Promise.all([
          api.get('/books', { params: { limit: 100 } }),
          api.get('/favorites')
        ])
        
        setMyBooks(booksRes.data.books.filter(b => b.sellerId === user.id))
        // 注意：收藏接口返回的通常是 [{id, book: {...}}, ...]，我们需要提取里面的 book
        setFavorites(favsRes.data.map(f => f.book))
      } catch (e) {
        console.error("加载数据失败", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, navigate])

  const handleLogout = () => { logout(); navigate('/login') }

  // 渲染书籍列表的通用组件（内部逻辑复用）
  const renderBookList = (list, emptyMsg) => {
    if (list.length === 0) return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', background: '#fff', borderRadius: 12 }}>
        <div style={{ fontSize: 40 }}>📭</div>
        <div style={{ marginTop: 8 }}>{emptyMsg}</div>
      </div>
    )

    return (
      <div style={{ display: 'grid', gap: 10 }}>
        {list.map(book => (
          <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 32 }}>{book.coverUrl ? <img src={book.coverUrl} style={{width: 32, height: 42, objectFit: 'cover', borderRadius: 4}} /> : '📚'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{book.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{book.condition} · {book.pickupLocation || '校内'}</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ff6b35' }}>¥{book.price}</div>
                <div style={{ fontSize: 11, color: book.status === 'AVAILABLE' ? '#16a34a' : '#aaa', textAlign: 'right', marginTop: 2 }}>
                  {book.status === 'AVAILABLE' ? '在售' : '已处理'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* 用户信息卡片 (保持不变) */}
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{user?.nickname}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
             <span style={{ fontSize: 12, color: '#aaa' }}>信用分: {user?.creditScore}</span>
             <Link to="/edit-profile" style={{ color: '#ff6b35', fontSize: 12, textDecoration: 'none' }}>编辑资料</Link>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>退出登录</button>
      </div>

      {/* 新增：标签切换导航 */}
      <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #eee', marginBottom: 20, padding: '0 10px' }}>
        <button 
          onClick={() => setActiveTab('posts')}
          style={{ 
            padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, color: activeTab === 'posts' ? '#ff6b35' : '#888',
            borderBottom: activeTab === 'posts' ? '3px solid #ff6b35' : '3px solid transparent'
          }}
        >
          我发布的 ({myBooks.length})
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          style={{ 
            padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 15, fontWeight: 700, color: activeTab === 'favorites' ? '#ff6b35' : '#888',
            borderBottom: activeTab === 'favorites' ? '3px solid #ff6b35' : '3px solid transparent'
          }}
        >
          我的收藏 ({favorites.length})
        </button>
      </div>

      {/* 发布按钮容器 */}
      {activeTab === 'posts' && (
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Link to="/publish" style={{ background: '#ff6b35', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>+ 发布新书</Link>
        </div>
      )}

      {/* 内容区域 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>加载中...</div>
      ) : (
        activeTab === 'posts' 
          ? renderBookList(myBooks, '还没有发布书籍')
          : renderBookList(favorites, '还没有收藏任何书籍')
      )}
    </div>
  )
}
