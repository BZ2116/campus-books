import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

const STATUS = {
  PENDING: { label: '待取货', color: '#f7c948', bg: '#fffbeb' },
  COMPLETED: { label: '已完成', color: '#16a34a', bg: '#f0fff4' },
  CANCELLED: { label: '已取消', color: '#dc2626', bg: '#fff0f0' }
}

export default function Reservations() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const [codeInput, setCodeInput] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/reservations/my').then(res => setList(res.data)).finally(() => setLoading(false))
  }, [])

  const handleComplete = async (id) => {
    try {
      await api.put(`/reservations/${id}/complete`, { pickupCode: codeInput })
      setMsg('✅ 交易完成！')
      setCompleting(null)
      const res = await api.get('/reservations/my')
      setList(res.data)
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.error || '操作失败'}`)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('确认取消预约？')) return
    try {
      await api.put(`/reservations/${id}/cancel`)
      const res = await api.get('/reservations/my')
      setList(res.data)
    } catch (e) {
      alert(e.response?.data?.error || '取消失败')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>加载中...</div>

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 900 }}>📅 我的预约</h2>

      {msg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
          background: msg.startsWith('✅') ? '#f0fff4' : '#fff0f0',
          color: msg.startsWith('✅') ? '#16a34a' : '#dc2626'
        }}>
          {msg}
        </div>
      )}

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', background: '#fff', borderRadius: 12 }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ marginTop: 12 }}>暂无预约记录</div>
        </div>
      ) : list.map(r => {
        const s = STATUS[r.status] || STATUS.PENDING
        const isBuyer = r.buyerId === user?.id   // true = 我是买家

        return (
          <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 36 }}>📚</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.book?.title}</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
                  {isBuyer ? `卖家：${r.seller?.nickname}` : `买家：${r.buyer?.nickname}`} · {r.book?.campus}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ background: s.bg, color: s.color, fontSize: 12, padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>{s.label}</span>
                  
                  {/* 【修复点】只有买家才显示取货码 */}
                  {isBuyer && r.pickupCode && (
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#ff6b35', fontWeight: 700 }}>
                      取货码：{r.pickupCode}
                    </span>
                  )}

                  <span style={{ fontSize: 12, color: '#aaa' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ fontSize: 20, fontWeight: 900, color: '#ff6b35' }}>¥{r.book?.price}</div>
            </div>

            {/* 操作按钮区 */}
            {r.status === 'PENDING' && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                
                {/* 卖家才能核销 */}
                {!isBuyer && completing !== r.id && (
                  <button
                    onClick={() => setCompleting(r.id)}
                    style={{ background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    核销取货码
                  </button>
                )}

                {/* 输入取货码区域（只有卖家点核销后出现） */}
                {completing === r.id && (
                  <>
                    <input
                      value={codeInput}
                      onChange={e => setCodeInput(e.target.value)}
                      placeholder="输入买家提供的取货码"
                      style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none', width: 180 }}
                    />
                    <button
                      onClick={() => handleComplete(r.id)}
                      style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
                    >
                      确认完成
                    </button>
                    <button
                      onClick={() => { setCompleting(null); setCodeInput('') }}
                      style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
                    >
                      取消
                    </button>
                  </>
                )}

                {/* 买家才能取消 */}
                {isBuyer && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
                  >
                    取消预约
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
