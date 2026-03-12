import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store'

export default function EditProfile() {

    const { user, setUser } = useStore()
    const navigate = useNavigate()

    const [nickname, setNickname] = useState(user.nickname || '')
    const [email, setEmail] = useState(user.email || '')
    const [qq, setQq] = useState(user.qq || '')
    const [department, setDepartment] = useState(user.department || '')
    const [isbn, setIsbn] = useState(book.isbn || '')
    const [coverUrl, setCoverUrl] = useState(book.coverUrl || '')


    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await api.put('/auth/profile', {
                nickname,
                email,
                qq,
                department,
            })
            const updatedUser = res.data
            setUser(updatedUser)
            alert('修改成功')
            navigate('/profile')
        } catch (err) {
            console.error(err)
            alert('修改失败')
        }

    }

    return (
        <div style={{
            maxWidth: 520,
            margin: '40px auto'
        }}>

            <div style={{
                background: '#1a1a2e',
                borderRadius: 16,
                padding: '28px 32px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
            }}>

                <h2 style={{
                    color: '#fff',
                    fontWeight: 800,
                    marginBottom: 24
                }}>
                    修改个人信息
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 13 }}>昵称</label>
                        <input
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 13 }}>邮箱</label>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 13 }}>QQ</label>
                        <input
                            value={qq}
                            onChange={e => setQq(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 13 }}>院系</label>
                        <input
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            style={inputStyle}
                        />
                    </div>



                    <div style={{
                        display: 'flex',
                        gap: 10,
                        marginTop: 10
                    }}>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                background: '#ff6b35',
                                color: '#fff',
                                padding: 12,
                                border: 'none',
                                borderRadius: 10,
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            保存修改
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: '1px solid #555',
                                color: '#aaa',
                                padding: 12,
                                borderRadius: 10,
                                cursor: 'pointer'
                            }}
                        >
                            取消
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    marginTop: 4,
    borderRadius: 8,
    border: '1px solid #444',
    background: '#0f0f1a',
    color: '#fff',
    fontSize: 14,
    outline: 'none'
}


