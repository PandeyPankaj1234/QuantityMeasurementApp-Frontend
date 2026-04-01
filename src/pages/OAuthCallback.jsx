import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const { saveSession } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const email = params.get('email')
    const name  = params.get('name') || email
    if (token) {
      saveSession({ token, email, name })
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-muted)' }}>
      Completing sign-in…
    </div>
  )
}
