import { useState, useEffect, useCallback } from 'react'

// 대한민국 중심 좌표 (기본값)
const DEFAULT_CENTER = {
  lat: 36.5,
  lng: 127.5
}

export default function useUserLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('pending') // pending, granted, denied

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation이 지원되지 않는 브라우저입니다.')
      setPermissionStatus('denied')
      return null
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        setPermissionStatus('granted')
        setError(null)
      },
      (err) => {
        console.error('위치 추적 오류:', err.message)
        setError(err.message)
        setPermissionStatus('denied')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )

    return watchId
  }, [])

  const stopWatching = useCallback((watchId) => {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // 초기 위치 한 번 가져오기
  const getCurrentPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation이 지원되지 않습니다.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const loc = { lat: latitude, lng: longitude }
          setLocation(loc)
          setPermissionStatus('granted')
          resolve(loc)
        },
        (err) => {
          setError(err.message)
          setPermissionStatus('denied')
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }, [])

  return {
    location,
    error,
    permissionStatus,
    defaultCenter: DEFAULT_CENTER,
    startWatching,
    stopWatching,
    getCurrentPosition
  }
}
