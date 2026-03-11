import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'


// 本地库
const LOCAL_BOOKS = {
  // 计算机类
  '9787111128069': { title: '数据结构（C语言版）', author: '严蔚敏', publisher: '清华大学出版社' },
  '9787302423287': { title: '操作系统：精髓与设计原理', author: 'William Stallings', publisher: '清华大学出版社' },
  '9787111215400': { title: '计算机网络：自顶向下方法', author: 'James F. Kurose', publisher: '机械工业出版社' },
  '9787302590804': { title: '机器学习', author: '周志华', publisher: '清华大学出版社' },
  '9787111650942': { title: '深度学习', author: 'Ian Goodfellow', publisher: '人民邮电出版社' },
  '9787115428028': { title: 'Python编程：从入门到实践', author: 'Eric Matthes', publisher: '人民邮电出版社' },
  '9787121362217': { title: '算法（第4版）', author: 'Robert Sedgewick', publisher: '电子工业出版社' },
  '9787111544937': { title: 'Java核心技术 卷I', author: 'Cay S. Horstmann', publisher: '机械工业出版社' },
  '9787115533661': { title: 'JavaScript高级程序设计（第4版）', author: 'Nicholas C. Zakas', publisher: '人民邮电出版社' },
  '9787111637928': { title: '数据库系统概念（第7版）', author: 'Abraham Silberschatz', publisher: '机械工业出版社' },
  // 数学类
  '9787040396638': { title: '高等数学（第七版）上册', author: '同济大学数学系', publisher: '高等教育出版社' },
  '9787040396645': { title: '高等数学（第七版）下册', author: '同济大学数学系', publisher: '高等教育出版社' },
  '9787040321999': { title: '线性代数（第六版）', author: '同济大学数学系', publisher: '高等教育出版社' },
  '9787040279658': { title: '概率论与数理统计（第四版）', author: '盛骤', publisher: '高等教育出版社' },
  // 英语类
  '9787111336082': { title: '英语词汇的奥秘', author: '蒋争', publisher: '机械工业出版社' },
  '9787560054681': { title: '新概念英语1', author: 'L.G. Alexander', publisher: '外语教学与研究出版社' },
  '9787560054698': { title: '新概念英语2', author: 'L.G. Alexander', publisher: '外语教学与研究出版社' },
  // 考研类
  '9787560083575': { title: '考研英语词汇闪过', author: '朱伟', publisher: '世界图书出版公司' },
  '9787010196428': { title: '思想道德修养与法律基础', author: '本书编写组', publisher: '高等教育出版社' },
  '9787300270937': { title: '管理学（第13版）', author: 'Stephen P. Robbins', publisher: '中国人民大学出版社' },
  // 物理类
  '9787040393750': { title: '大学物理学（第四版）上册', author: '张三慧', publisher: '清华大学出版社' },
  '9787040393767': { title: '大学物理学（第四版）下册', author: '张三慧', publisher: '清华大学出版社' },
}




export default function Publish() {
  const navigate = useNavigate()
  const { user } = useStore()

  // 1. 初始化表单，确保包含 coverUrl
  const [form, setForm] = useState({
    isbn: '', title: '', author: '', publisher: '', price: '',
    originalPrice: '', condition: '九成新', category: '计算机',
    tags: '', description: '', qq: user?.qq || '', pickupLocation: '',
    coverUrl: ''
  })
  const [isbnLoading, setIsbnLoading] = useState(false)
  const [isbnMsg, setIsbnMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false) // 图片上传状态
  const [error, setError] = useState('')

  if (!user) { navigate('/login'); return null }

  // 上传图片到 Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    formData.append('upload_preset', 'books-upload')

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dkm0g2s8q/image/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setForm(p => ({ ...p, coverUrl: data.secure_url }))
    } catch (e) {
      alert('图片上传失败，请检查网络')
    } finally {
      setUploading(false)
    }
  }
  const lookupISBN = async () => {
    if (!form.isbn) return
    setIsbnLoading(true)
    setIsbnMsg('')

    // 第一步：查本地库
    const local = LOCAL_BOOKS[form.isbn.trim()]
    if (local) {
      setForm(p => ({ ...p, ...local, coverUrl: p.coverUrl }))
      setIsbnMsg('✅ 识别成功，信息已自动填写')
      setIsbnLoading(false)
      return
    }
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${form.isbn}&key=AIzaSyC9c6vl-iFL8ivSepYaGgmSba-WPqrqSBw`
      )
      const data = await response.json()
      const book = data.items?.[0]?.volumeInfo
      if (book) {
        setForm(p => ({
          ...p,
          title: book.title || p.title,
          author: book.authors?.[0] || p.author,
          publisher: book.publisher || p.publisher,
          coverUrl: book.imageLinks?.thumbnail || p.coverUrl
        }))
        setIsbnMsg('✅ 识别成功，信息已自动填写')
      } else {
        setIsbnMsg('❌ 未找到该ISBN，请手动填写')
      }
    } catch (e) {
      setIsbnMsg('❌ 请求失败，请手动填写')
    } finally {
      setIsbnLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/books', { ...form, tags: form.tags.split(' ').filter(Boolean) })
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.error || '发布失败')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 900 }}>📚 发布闲置书籍</h2>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>书籍照片</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {form.coverUrl && <img src={form.coverUrl} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
            <input type="file" onChange={handleImageUpload} disabled={uploading} />
          </div>
          {uploading && <div style={{ fontSize: 12, color: '#ff6b35', marginTop: 4 }}>正在上传照片...</div>}
        </div>

        {/* ISBN */}
        <div style={{ background: '#fff8f5', border: '1px solid #ffe0d0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ff6b35', marginBottom: 10 }}>📱 ISBN自动识别</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={form.isbn} onChange={e => setForm(p => ({ ...p, isbn: e.target.value }))}
              style={{ ...inputStyle, flex: 1 }} placeholder="输入13位ISBN编号" />
            <button onClick={lookupISBN} disabled={isbnLoading} style={{
              background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'
            }}>{isbnLoading ? '查询中' : '自动识别'}</button>
          </div>
          {isbnMsg && <div style={{ fontSize: 12, marginTop: 8, color: isbnMsg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{isbnMsg}</div>}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: '#fff0f0', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}

          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>书名 *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} placeholder="书籍名称" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>作者</label>
                <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} style={inputStyle} placeholder="作者姓名" />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>出版社</label>
                <input value={form.publisher} onChange={e => setForm(p => ({ ...p, publisher: e.target.value }))} style={inputStyle} placeholder="出版社" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>售价 ¥ *</label>
                <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} style={inputStyle} placeholder="0.00" type="number" step="0.01" required />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>原价 ¥</label>
                <input value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} style={inputStyle} placeholder="0.00" type="number" step="0.01" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>品相 *</label>
                <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} style={inputStyle}>
                  {['全新', '九成新', '八成新', '七成新', '六成新'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>分类 *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                  {['计算机', '数学', '英语', '物理', '经济管理', '考研资料', '其他'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>联系 QQ *</label>
                <input
                  value={form.qq}
                  onChange={e => setForm(p => ({ ...p, qq: e.target.value }))}
                  style={inputStyle}
                  placeholder="请输入QQ号"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>取货地点 *</label>
                <input
                  value={form.pickupLocation}
                  onChange={e => setForm(p => ({ ...p, pickupLocation: e.target.value }))}
                  style={inputStyle}
                  placeholder="如：南区图书馆门口"
                  required
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>标签（空格分隔）</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} style={inputStyle} placeholder="如：408考研 数据结构 必备" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>书籍描述</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} placeholder="描述书籍品相、使用情况等..." rows={3} />
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '14px', background: '#ff6b35', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
            cursor: 'pointer', marginTop: 24
          }}>{submitting ? '发布中...' : '🚀 立即发布'}</button>
        </form>
      </div>
    </div>
  )
}