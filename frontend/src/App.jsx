import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BookDetail from './pages/BookDetail'
import Publish from './pages/Publish'
import Reservations from './pages/Reservations'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="book/:id" element={<BookDetail />} />
        <Route path="publish" element={<Publish />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}