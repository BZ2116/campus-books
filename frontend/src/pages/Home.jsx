import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['全部', '计算机', '数学', '英语', '物理', '经济管理', '考研资料']
const CONDITIONS = { '全新': '#4ade80', '九成新': '#60a5fa', '八成新': '#f7c948', '七成新': '#fb923c', '六成新': '#f87171' }

export default function Home() {
  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('全部')
  const [searchInput, setSearchInput] = useState('')

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = { page: 1, limit: 20 }
      if (category !== '全部') params.category = category
      if (search) params.search = search
      const res = await api.get('/books', { params })
      setBooks(res.data.books)
      setTotal(res.data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooks() }, [category, search])

  return (
    <div>
      {/* 搜索栏 */}
      <div style={{ background: '#1a1a2e', borderRadius: 12, padding: '28px 32px', marginBottom: 24, display: 'flex', gap: 12 }}>
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none', fontSize: 15, outline: 'none' }}
          placeholder="🔍 搜索书名、作者、标签..." />
        <button onClick={() => setSearch(searchInput)} style={{
          background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>搜索</button>
        {search && <button onClick={() => { setSearch(''); setSearchInput('') }} style={{
          background: '#555', color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 16px', fontSize: 14, cursor: 'pointer'
        }}>清除</button>}
      </div>

      {/* 分类 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '7px 18px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
            background: category === cat ? '#ff6b35' : '#fff',
            color: category === cat ? '#fff' : '#555',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>{cat}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888', alignSelf: 'center' }}>共 {total} 本书</span>
      </div>

      {/* 书籍列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>加载中...</div>
      ) : books.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ marginTop: 12 }}>暂无书籍，快去发布第一本吧！</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {books.map(book => (
            <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: '#fff', borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s',
                cursor: 'pointer'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ background: '#f0f4ff', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                  {book.coverUrl ? <img src={book.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📚'}
                  <span style={{
                    position: 'absolute', top: 8, left: 8, background: CONDITIONS[book.condition] || '#ccc',
                    color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4
                  }}>{book.condition}</span>
                </div>
                <div style={{
                  padding: '12px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</div>
                  <div style={{
                    fontSize: 12,
                    color: '#888',
                    marginBottom: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.author || '未知作者'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#ff6b35' }}>¥{book.price}</span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{book.campus}</span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#aaa',
                    marginTop: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.seller?.nickname} · 👁 {book.views}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}