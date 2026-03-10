import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function EditProfile() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()

  const [nickname, setNickname] = useState(user.nickname || '')
  const [email, setEmail] = useState(user.email || '')
  const [QQ, setQQ] = useState(user.QQ || '')
  const [department, setDepartment] = useState(user.department || '')
  const [campus, setCampus] = useState(user.campus || '')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await api.put('/auth/profile', {
        nickname,
        email,
        QQ,
        department,
        campus
      })

      setUser(res.data.user)
      alert('修改成功')
      navigate('/profile')
    } catch {
      alert('修改失败')
    }
  }

  // 返回按钮处理
  const handleBack = () => {
    navigate('/profile')
  }

  return (
    <div style={styles.container}>
      {/* 简约卡片 */}
      <div style={styles.card}>
        {/* 头部：返回按钮 + 标题 */}
        <div style={styles.header}>
          <button onClick={handleBack} style={styles.backButton}>
            ← 返回
          </button>
          <h2 style={styles.title}>编辑个人资料</h2>
          <div style={{ width: 48 }} /> {/* 占位，保持标题居中 */}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 昵称 */}
          <div style={styles.field}>
            <label style={styles.label}>昵称</label>
            <input
              style={styles.input}
              placeholder="你的昵称"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </div>

          {/* 邮箱 */}
          <div style={styles.field}>
            <label style={styles.label}>邮箱</label>
            <input
              style={styles.input}
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* QQ */}
          <div style={styles.field}>
            <label style={styles.label}>QQ</label>
            <input
              style={styles.input}
              placeholder="QQ号"
              value={QQ}
              onChange={e => setQQ(e.target.value)}
            />
          </div>

          {/* 院系 */}
          <div style={styles.field}>
            <label style={styles.label}>院系</label>
            <input
              style={styles.input}
              placeholder="所在院系"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            />
          </div>

          {/* 校区 */}
          <div style={styles.field}>
            <label style={styles.label}>校区</label>
            <input
              style={styles.input}
              placeholder="所在校区"
              value={campus}
              onChange={e => setCampus(e.target.value)}
            />
          </div>

          {/* 按钮组 */}
          <div style={styles.buttonGroup}>
            <button type="button" onClick={handleBack} style={styles.cancelButton}>
              取消
            </button>
            <button type="submit" style={styles.saveButton}>
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ========== 样式对象 ==========
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #f6f9fc 0%, #e9f1f8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '32px',
    boxShadow: '0 20px 40px -12px rgba(0,20,30,0.25), 0 8px 24px -6px rgba(0,40,60,0.15)',
    padding: '32px 28px',
    backdropFilter: 'blur(2px)',
    transition: 'transform 0.2s ease'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#3b6e8f',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 12px 8px 8px',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background 0.2s',
    ':hover': {
      background: '#f0f5fa'
    }
  },
  title: {
    margin: 0,
    fontSize: '1.7rem',
    fontWeight: '600',
    color: '#1a3b4e',
    letterSpacing: '-0.3px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2c4c64',
    marginLeft: '6px',
    letterSpacing: '0.2px'
  },
  input: {
    padding: '14px 18px',
    border: '1.5px solid #dae6ed',
    borderRadius: '24px',
    fontSize: '1rem',
    backgroundColor: '#f9fcff',
    transition: 'all 0.2s ease',
    outline: 'none',
    color: '#1e2f3a',
    '::placeholder': {
      color: '#9bb4c5',
      fontWeight: '300'
    },
    ':focus': {
      borderColor: '#ff8a5c',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 4px rgba(255, 107, 53, 0.15)'
    }
  },
  buttonGroup: {
    display: 'flex',
    gap: '14px',
    marginTop: '16px'
  },
  cancelButton: {
    flex: 1,
    padding: '14px 10px',
    border: '1.5px solid #cbdbe6',
    borderRadius: '40px',
    backgroundColor: 'transparent',
    color: '#3a5b70',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#ecf3f8',
      borderColor: '#9fb7c7'
    }
  },
  saveButton: {
    flex: 1,
    padding: '14px 10px',
    border: 'none',
    borderRadius: '40px',
    background: 'linear-gradient(135deg, #ff7e4a 0%, #ff5c2c 100%)',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 8px 18px -6px #ff6b35',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'linear-gradient(135deg, #ff9155 0%, #ff6b3a 100%)',
      boxShadow: '0 10px 22px -4px #ff6b35',
      transform: 'scale(1.02)'
    },
    ':active': {
      transform: 'scale(0.98)',
      boxShadow: '0 4px 12px -2px #ff6b35'
    }
  }
}

// 由于上面使用了伪类样式，我们需要让它们生效
// 在React行内样式中 :hover 不会直接生效，所以需要动态处理或用CSS模块。
// 但当前结构我们可以稍微优化：将需要hover的样式通过 state 管理? 
// 更简单：使用 styled-components 或保留为普通css。
// 不过为了保持纯粹的行内样式示例，上述 :hover 实际上不会生效。
// 为了让代码立即可用且样式漂亮，建议将这部分样式写入一个单独的CSS文件，或者用内联style搭配状态模拟。
// 但根据你的要求“给我修改一下样式”，我认为提供视觉上清晰的设计方案更重要。
// 此处我调整写法：删除不生效的 :hover ，改用静态颜色，但依然美观。如果你希望交互动效，可以用styled或css module。
// 为了完善，这里用静态样式，但依然非常清新。
}

// 修正：因为上面用了 :hover 在对象里，这在普通内联样式中无效，我重新提供修正后的style对象（无伪类），以保证视觉效果完全可用且无bug。
// 重新定义 styles，移除所有伪类键，保留静态美观样式。
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #f6f9fc 0%, #e9f1f8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  },
  card: {
    maxWidth: '520px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '32px',
    boxShadow: '0 20px 40px -12px rgba(0,20,30,0.25), 0 8px 24px -6px rgba(0,40,60,0.15)',
    padding: '32px 28px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#3b6e8f',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 12px 8px 8px',
    borderRadius: '40px'
  },
  title: {
    margin: 0,
    fontSize: '1.7rem',
    fontWeight: '600',
    color: '#1a3b4e',
    letterSpacing: '-0.3px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2c4c64',
    marginLeft: '6px',
    letterSpacing: '0.2px'
  },
  input: {
    padding: '14px 18px',
    border: '1.5px solid #dae6ed',
    borderRadius: '24px',
    fontSize: '1rem',
    backgroundColor: '#f9fcff',
    outline: 'none',
    color: '#1e2f3a'
  },
  buttonGroup: {
    display: 'flex',
    gap: '14px',
    marginTop: '16px'
  },
  cancelButton: {
    flex: 1,
    padding: '14px 10px',
    border: '1.5px solid #cbdbe6',
    borderRadius: '40px',
    backgroundColor: 'transparent',
    color: '#3a5b70',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  saveButton: {
    flex: 1,
    padding: '14px 10px',
    border: 'none',
    borderRadius: '40px',
    background: 'linear-gradient(135deg, #ff7e4a 0%, #ff5c2c 100%)',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 8px 18px -6px #ff6b35'
  }
}
