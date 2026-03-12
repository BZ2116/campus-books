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
  const [isFavorited, setIsFavorited] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    price: '',
    condition: '',
    description: '',
    pickupLocation: ''
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get(`/books/${id}`).then(res => {
      setBook(res.data)
      setIsFavorited(res.data.isFavorited || false)

      setEditData({
        price: res.data.price,
        condition: res.data.condition,
        description: res.data.description || '',
        pickupLocation: res.data.pickupLocation || ''
      })

    }).finally(() => setLoading(false))
  }, [id])

  // 新增：处理收藏/取消收藏
  const handleToggleFavorite = async () => {
    if (!user) { navigate('/login'); return }
    try {
      const res = await api.post('/favorites/toggle', { bookId: id })
      setIsFavorited(res.data.isFavorited)

      if (res.data.isFavorited) {
        setMsg('❤️ 已加入收藏夹')
        setTimeout(() => setMsg(''), 2000)
      }
    } catch (e) {
      console.error('收藏操作失败', e)
    }
  }

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

  const handleSaveEdit = async () => {

    try {

      const res = await api.put(`/books/${id}`, editData)

      setBook(res.data)

      setEditing(false)

      setMsg('✅ 修改成功')

    } catch (e) {

      setMsg('❌ 修改失败')

    }

  }
  const handleRemove = async () => {

    if (!window.confirm('确定要下架这本书吗？')) return

    try {

      await api.delete(`/books/${id}`)

      alert('书籍已下架')

      navigate('/')

    } catch {

      alert('下架失败')

    }

  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>加载中...</div>
  if (!book) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>书籍不存在</div>

  return (

    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', fontSize: 14, marginBottom: 16, fontWeight: 600 }}>← 返回列表</button>

      <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap' }}>

        {/* 左侧：书籍封面区域 - 优化图片显示 */}
        <div style={{
          background: '#f8f8f8',
          width: '320px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderRight: '1px solid #f0f0f0'
        }}>
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '450px',
                // 关键修改：使用 contain 确保图片不被裁切
                objectFit: 'contain',
                padding: '20px'
              }}
            />
          ) : (
            <div style={{ fontSize: 100 }}>📚</div>
          )}
        </div>

        {/* 右侧：书籍详情区域 */}
        <div style={{ padding: '40px', flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ background: '#fff0e8', color: '#ff6b35', fontSize: 12, padding: '4px 12px', borderRadius: 50, fontWeight: 700 }}>{book.category}</span>
            <span style={{ background: '#f0f9ff', color: '#0284c7', fontSize: 12, padding: '4px 12px', borderRadius: 50, fontWeight: 700 }}>{book.condition}</span>
            {book.tags?.map(t => <span key={t} style={{ background: '#f5f5f5', color: '#666', fontSize: 12, padding: '4px 12px', borderRadius: 50 }}>#{t}</span>)}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10
          }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a2e' }}>
              {book.title}
            </h1>

            <button
              onClick={handleToggleFavorite}
              style={{
                background: isFavorited ? '#fff1f0' : '#f5f5f5',
                border: `1px solid ${isFavorited ? '#ffa39e' : '#e8e8e8'}`,
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 20,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: isFavorited ? '0 2px 8px rgba(255,77,79,0.2)' : 'none'
              }}
              title={isFavorited ? "取消收藏" : "加入收藏"}
            >
              <span style={{
                transform: isFavorited ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}>
                {isFavorited ? '❤️' : '🤍'}
              </span>
            </button>
          </div>
          <p style={{ color: '#666', fontSize: 15, marginBottom: 6 }}>{book.author} 著 · {book.publisher}</p>
          <p style={{ color: '#aaa', fontSize: 13, marginBottom: 24 }}>条形码 (ISBN): {book.isbn || '暂无'}</p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 30 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#ff6b35' }}>¥{book.price}</span>
            {book.originalPrice && <span style={{ fontSize: 18, color: '#bbb', textDecoration: 'line-through' }}>¥{book.originalPrice}</span>}
          </div>

          {/* 信息网格*/}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 30 }}>
            {[
              ['🐧 卖家QQ', book.seller?.qq || '未填写'],
              ['🏫 取货地点', book.pickupLocation || '面议'],
              ['👁 浏览次数', `${book.views} 次`],
              ['⏰ 发布时间', new Date(book.createdAt).toLocaleDateString()]
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#f9f9f9', borderRadius: 10, padding: '12px 16px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{v}</div>
              </div>
            ))}
          </div>

          {book.description && (
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>书籍描述</div>
              <p style={{ color: '#444', fontSize: 14, lineHeight: 1.8, background: '#fffaf8', padding: '16px', borderRadius: 12, border: '1px dashed #ffd8c2' }}>
                {book.description}
              </p>
            </div>
          )}

          {/* 卖家卡片 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30, padding: '16px', background: '#f0f4ff', borderRadius: 14 }}>
            <div style={{ width: 48, height: 48, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>👤</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{book.seller?.nickname}</div>
              <div style={{ fontSize: 12, color: '#667eea' }}>{book.seller?.department} 信用分 {book.seller?.creditScore}</div>
            </div>
          </div>

          {msg && <div style={{ padding: '14px', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600, textAlign: 'center', background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', border: '1px solid currentColor' }}>{msg}</div>}

          {book.seller?.id === user?.id && (

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>

              <button
                onClick={() => setEditing(true)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                ✏️ 编辑信息
              </button>

              <button
                onClick={handleRemove}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 10,
                  border: 'none',
                  background: '#f87171',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                📴 下架书籍
              </button>

            </div>

          )}
          {book.status === 'AVAILABLE' ? (

            <button
              onClick={handleReserve}
              disabled={reserving || book.seller?.id === user?.id}
              style={{
                width: '100%', padding: '18px', background: '#ff6b35', color: '#fff',
                border: 'none', borderRadius: 12, fontSize: 17, fontWeight: 800, cursor: 'pointer',
                transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(255,107,53,0.3)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {reserving ? '正在预约...' : book.seller?.id === user?.id ? '这是您发布的书籍' : '📅 立即预约取货'}
            </button>
          ) : (
            <div style={{ width: '100%', padding: '18px', background: '#e5e7eb', color: '#9ca3af', borderRadius: 12, fontSize: 17, fontWeight: 800, textAlign: 'center' }}>
              {book.status === 'RESERVED' ? '已被预约' : '已售出'}
            </div>
          )}

        </div>
      </div>
      {
        editing && (

          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>

            <div style={{
              background: '#fff',
              padding: 30,
              borderRadius: 16,
              width: 400
            }}>

              <h3 style={{ marginBottom: 20 }}>编辑书籍</h3>

              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                价格
              </label>
              <input
                value={editData.price}
                onChange={e => setEditData({ ...editData, price: e.target.value })}
                style={inputStyle}
              />

              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                成色
              </label>
              <input
                value={editData.condition}
                onChange={e => setEditData({ ...editData, condition: e.target.value })}
                style={inputStyle}
              />

              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                取货地点
              </label>
              <input
                value={editData.pickupLocation}
                onChange={e => setEditData({ ...editData, pickupLocation: e.target.value })}
                style={inputStyle}
              />

              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                书籍描述
              </label>
              <textarea
                value={editData.description}
                onChange={e => setEditData({ ...editData, description: e.target.value })}
                style={{ ...inputStyle, height: 80 }}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>

                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    border: 'none',
                    background: '#ff6b35',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  保存修改
                </button>

                <button
                  onClick={() => setEditing(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    background: '#fff'
                  }}
                >
                  取消
                </button>

              </div>

            </div>

          </div>

        )
      }
    </div>

  )

}

const inputStyle = {
  width: '100%',
  padding: 10,
  border: '1px solid #ddd',
  borderRadius: 8,
  marginBottom: 10
}