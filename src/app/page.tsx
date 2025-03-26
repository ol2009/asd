'use client'

import React, { useEffect, useState } from 'react'
import Image from "next/image"

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
        // 로그인된 상태면 학급관리 페이지로 리디렉션
        window.location.href = '/classes'
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }, [])

  // 로그아웃 함수
  const handleLogout = () => {
    try {
      localStorage.removeItem('user')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 로그인 페이지로 이동
  const goToLogin = () => {
    window.location.href = '/login'
  }

  // 학급관리 페이지로 이동
  const goToClasses = () => {
    if (user) {
      window.location.href = '/classes'
    } else {
      window.location.href = '/login'
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
    <div className="min-h-screen bg-[url('/images/backgrounds/fantasy-bg.jpg')] bg-cover bg-center relative overflow-hidden">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 w-full h-full opacity-70">
        <div className="absolute inset-0 bg-[#0f172a]/60" />
      </div>

      {/* 상단 네비게이션 */}
      <header className="relative z-10 flex justify-between items-center px-4 py-3">
        <h1 className="text-2xl font-bold text-pink-300">상태창</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-white">{user.name}님</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md bg-slate-800/80 text-white hover:bg-slate-700/80 transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={goToLogin}
            className="px-4 py-2 rounded-md bg-slate-800/80 text-white hover:bg-slate-700/80 transition"
          >
            로그인
          </button>
        )}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-pink-300 mb-3">상태창</h2>
          <p className="text-lg text-slate-200">
            성장의 모든 순간을 한눈에!<br />
            학생들의 성장을 완성하자!
          </p>
          <button
            onClick={goToClasses}
            className="mt-6 px-6 py-3 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition"
          >
            {user ? '학급 관리하기' : '모험 시작하기'}
          </button>
        </div>

        {/* 스탯 카드 */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-6 w-[300px] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">{user ? user.name : 'OOO'}의 상태창</h3>
            <span className="text-pink-300">Lv. 12</span>
          </div>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200">{stat.label}</span>
                  <span className="text-slate-300">{stat.value}/{stat.maxValue}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-400"
                    style={{ width: `${(stat.value / stat.maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 py-4">
            <button className="flex flex-col items-center text-pink-400">
              <span className="text-lg mb-1">🏠</span>
              <span className="text-sm">홈</span>
            </button>
            <button
              onClick={goToClasses}
              className="flex flex-col items-center text-white"
            >
              <span className="text-lg mb-1">👨‍👩‍👧‍👦</span>
              <span className="text-sm">학급 관리</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <span className="text-lg mb-1">👤</span>
              <span className="text-sm">프로필</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
