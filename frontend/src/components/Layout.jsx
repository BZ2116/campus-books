import { Outlet, Link, useNavigate } from 'react-router-dom'
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
        <Link to="/" style={{ color: '#ff6b35', fontWeight: 900, fontSize: 20, textDecoration: 'none' }}>
          📚 校园书市
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link to="/" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>首页</Link>
          {user ? (
            <>
              <Link to="/publish" style={{ color: '#ff6b35', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>+ 发布</Link>
              <Link to="/reservations" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>我的预约</Link>
              <Link to="/profile" style={{ color: '#ccc', textDecoration: 'none', fontSize: 14 }}>{user.nickname}</Link>
              <button onClick={handleLogout} style={{
                background: 'transparent', border: '1px solid #555',
                color: '#ccc', padding: '4px 12px', borderRadius: 6,
                cursor: 'pointer', fontSize: 13
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
        © 2024 校园书市 · 让知识流转起来
      </footer>
    </div>
  )
}