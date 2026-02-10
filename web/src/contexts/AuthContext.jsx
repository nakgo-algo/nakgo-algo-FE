import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// 카카오 SDK 초기화
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 카카오 SDK 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js'
    script.async = true
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized() && KAKAO_JS_KEY) {
        window.Kakao.init(KAKAO_JS_KEY)
        console.log('Kakao SDK initialized')
      }
      checkLoginStatus()
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 로그인 상태 확인 (새로고침 시 리셋)
  const checkLoginStatus = () => {
    // localStorage 사용 안 함 - 새로고침 시 리셋
    setIsLoading(false)
  }

  // 카카오 로그인
  const loginWithKakao = () => {
    return new Promise((resolve, reject) => {
      if (!window.Kakao) {
        // 카카오 SDK 없으면 데모 로그인
        const demoUser = {
          id: 'demo_' + Date.now(),
          nickname: '낚시인' + Math.floor(Math.random() * 1000),
          profileImage: null,
          provider: 'demo'
        }
        setUser(demoUser)
        resolve(demoUser)
        return
      }

      window.Kakao.Auth.login({
        success: (authObj) => {
          // 사용자 정보 가져오기
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res) => {
              const kakaoUser = {
                id: res.id,
                nickname: res.properties?.nickname || '사용자',
                profileImage: res.properties?.profile_image || null,
                provider: 'kakao'
              }
              setUser(kakaoUser)
              resolve(kakaoUser)
            },
            fail: (error) => {
              console.error('Failed to get user info:', error)
              reject(error)
            }
          })
        },
        fail: (error) => {
          console.error('Kakao login failed:', error)
          reject(error)
        }
      })
    })
  }

  // 데모 로그인 (테스트용)
  const loginDemo = () => {
    const demoUser = {
      id: 'demo_' + Date.now(),
      nickname: '낚시인' + Math.floor(Math.random() * 1000),
      profileImage: null,
      provider: 'demo'
    }
    setUser(demoUser)
    return demoUser
  }

  // 로그아웃
  const logout = () => {
    if (window.Kakao?.Auth?.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        console.log('Kakao logout')
      })
    }
    setUser(null)
  }

  // 프로필 업데이트
  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
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
        updateProfile
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
