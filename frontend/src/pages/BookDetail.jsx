import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get(`/books/${id}`).then(res => setBook(res.data)).finally(() => setLoading(false))
  }, [id])

  const handleReserve = async () => {
    if (!user) { navigate('/login'); return }
    setReserving(true)
    try {
      const res = await api.post('/reservations', { bookId: id })
      setMsg(`✅ 预约成功！取货码：${res.data.pickupCode}，请截图保存`)
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.error || '预约失败'}`)
    } finally {
      setReserving(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>加载中...</div>
  if (!book) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>书籍不存在</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', fontSize: 14, marginBottom: 16 }}>← 返回</button>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ background: '#f0f4ff', width: 240, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, flexShrink: 0 }}>
            {book.coverUrl ? <img src={book.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📚'}
          </div>
          <div style={{ padding: '28px 32px', flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ background: '#fff0e8', color: '#ff6b35', fontSize: 12, padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>{book.category}</span>
              <span style={{ background: '#f0f9ff', color: '#0284c7', fontSize: 12, padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>{book.condition}</span>
              {book.tags?.map(t => <span key={t} style={{ background: '#f5f5f5', color: '#666', fontSize: 12, padding: '3px 10px', borderRadius: 50 }}>{t}</span>)}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, lineHeight: 1.4 }}>{book.title}</h1>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>{book.author} · {book.publisher}</p>
            <p style={{ color: '#aaa', fontSize: 13, marginBottom: 20 }}>ISBN: {book.isbn || '未填写'}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#ff6b35' }}>¥{book.price}</span>
              {book.originalPrice && <span style={{ fontSize: 16, color: '#aaa', textDecoration: 'line-through' }}>¥{book.originalPrice}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[['📍 校区', book.campus], ['🏫 取货地点', book.pickupLocation || '详询卖家'], ['👁 浏览', `${book.views} 次`], ['⏰ 发布', new Date(book.createdAt).toLocaleDateString()]].map(([k, v]) => (
                <div key={k} style={{ background: '#f9f9f9', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            {book.description && <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, marginBottom: 20, background: '#f9f9f9', padding: '12px 14px', borderRadius: 8 }}>💬 {book.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 14px', background: '#fff8f5', borderRadius: 10, border: '1px solid #ffe0d0' }}>
              <div style={{ fontSize: 28 }}>👤</div>
              <div>
                <div style={{ fontWeight: 700 }}>{book.seller?.nickname}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{book.seller?.department} · 信用 {book.seller?.creditScore}</div>
              </div>
            </div>
            {msg && <div style={{ padding: '12px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14, background: msg.startsWith('✅') ? '#f0fff4' : '#fff0f0', color: msg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{msg}</div>}
            {book.status === 'AVAILABLE' ? (
              <button onClick={handleReserve} disabled={reserving || book.seller?.id === user?.id} style={{
                width: '100%', padding: '14px', background: '#ff6b35', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer'
              }}>{reserving ? '预约中...' : '📅 立即预约取货'}</button>
            ) : (
              <div style={{ width: '100%', padding: '14px', background: '#f0f0f0', color: '#999', borderRadius: 10, fontSize: 16, fontWeight: 700, textAlign: 'center' }}>
                {book.status === 'RESERVED' ? '已被预约' : '已售出'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}