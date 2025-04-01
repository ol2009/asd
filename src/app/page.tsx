'use client'

import React, { useEffect, useState } from 'react'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }, [])

  // 로그아웃 함수
  const handleLogout = () => {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('isLoggedIn')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 로그인 페이지로 이동
  const goToLogin = () => {
    router.push('/login')
  }

  // 학급관리 페이지로 이동
  const goToClasses = () => {
    if (user) {
      router.push('/classes')
    } else {
      router.push('/login')
    }
  }

  const stats = [
    { label: "레벨", value: 12, maxValue: 100 },
    { label: "수학", value: 80, maxValue: 100 },
    { label: "독서", value: 45, maxValue: 100 },
    { label: "운동능력", value: 70, maxValue: 100 },
    { label: "성실성", value: 60, maxValue: 100 },
  ]

  return (
    <div className="min-h-screen" style={{
      backgroundImage: "url('/images/backgrounds/sky-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      {/* 상단 네비게이션 */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-800">상태창</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-slate-700">{user.name}님</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-slate-700 border-slate-300 hover:bg-slate-100"
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <Button
            onClick={goToLogin}
            variant="outline"
            className="text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            로그인
          </Button>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl max-w-md">
          <h2 className="text-4xl font-bold text-blue-800 mb-4">상태창</h2>
          <p className="text-lg text-slate-600 mb-6">
            성장의 모든 순간을 한눈에!<br />
            학생들의 성장을 완성하자!
          </p>
          <Button
            onClick={goToClasses}
            className="px-6 py-5 text-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            {user ? '학급 관리하기' : '모험 시작하기'}
          </Button>
        </div>
      </main>
    </div>
  )
}
