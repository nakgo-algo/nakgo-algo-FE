import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ''
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY || ''
const REDIRECT_URI = window.location.origin

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 카카오 SDK 로드 + 리다이렉트 코드 처리
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js'
    script.async = true
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized() && KAKAO_JS_KEY) {
        window.Kakao.init(KAKAO_JS_KEY)
      }
      handleKakaoRedirect()
    }
    script.onerror = () => handleKakaoRedirect()
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [])

  // 카카오 리다이렉트 후 code 파라미터 처리
  const handleKakaoRedirect = async () => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // URL에서 code 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname)

      try {
        // code → access_token 교환
        const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: KAKAO_REST_KEY,
            redirect_uri: REDIRECT_URI,
            code,
          }),
        })
        const tokenData = await tokenRes.json()

        if (tokenData.access_token) {
          // 백엔드에 access_token 전달 → JWT 발급
          const data = await api.post('/auth/kakao', {
            accessToken: tokenData.access_token,
          })
          api.setToken(data.token)
          setUser({ ...data.user, provider: 'kakao' })
        }
      } catch (err) {
        console.error('[Auth] 카카오 로그인 처리 실패:', err)
      }
      setIsLoading(false)
      return
    }

    // code가 없으면 기존 토큰 확인
    checkLoginStatus()
  }

  // 저장된 토큰으로 로그인 상태 복원
  const checkLoginStatus = async () => {
    const token = api.getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const data = await api.get('/auth/verify')
      setUser({ ...data.user, provider: 'kakao' })
    } catch {
      api.clearToken()
    }
    setIsLoading(false)
  }

  // 카카오 로그인 (리다이렉트 방식)
  const loginWithKakao = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`
    window.location.href = kakaoAuthUrl
  }

  // 데모 로그인 (로컬만, JWT 없음)
  const loginDemo = () => {
    const demoUser = {
      id: 'demo_' + Date.now(),
      nickname: '낚시인' + Math.floor(Math.random() * 1000),
      profileImage: null,
      provider: 'demo',
    }
    setUser(demoUser)
    return demoUser
  }

  // 로그아웃
  const logout = async () => {
    if (api.getToken()) {
      try {
        await api.post('/auth/logout')
      } catch {}
    }
    api.clearToken()
    setUser(null)
  }

  // 프로필 업데이트
  const updateProfile = async (updates) => {
    if (updates.nickname && api.getToken()) {
      try {
        const data = await api.put('/profile/nickname', { nickname: updates.nickname })
        setUser((prev) => ({ ...prev, ...data }))
        return
      } catch {}
    }
    setUser((prev) => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        loginWithKakao,
        loginDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
