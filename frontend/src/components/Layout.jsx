import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ReactComponent as Logo } from '../assets/campusbooks.svg'
import useStore from '../store'

export default function Layout() {
  const { user, logout } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: '#1a1a2e', color: '#fff', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <Link
          to="/"
          style={{
            color: '#ff6b35',
            fontWeight: 900,
            fontSize: 20,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Logo style={{ width: 24, height: 24 }} />
          校园书市
        </Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link to="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>首页</Link>

          {user ? (
            <>
              {/* --- 新增：管理员入口 --- */}
              {user.isAdmin && (
                <Link to="/admin" style={{
                  color: '#fbbf24', // 使用亮黄色区分普通链接
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  ⚙️ 管理后台
                </Link>
              )}
              {/* ----------------------- */}

              <Link to="/publish" style={{ color: '#ff6b35', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>+ 发布</Link>
              <Link to="/reservations" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>我的预约</Link>
              <Link to="/profile" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>{user.nickname}</Link>

              <button onClick={handleLogout} style={{
                background: 'transparent', border: '1px solid #555',
                color: '#ccc', padding: '4px 12px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, marginLeft: 8
              }}>退出</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>登录</Link>
              <Link to="/register" style={{
                background: '#ff6b35', color: '#fff', textDecoration: 'none',
                fontSize: 14, padding: '6px 16px', borderRadius: 6, fontWeight: 600
              }}>注册</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        <Outlet />
      </main>

      <footer style={{ background: '#1a1a2e', color: '#666', textAlign: 'center', padding: '16px', fontSize: 13 }}>
        © 2026 校园书市 · 让知识流转起来
      </footer>
    </div>
  )
}