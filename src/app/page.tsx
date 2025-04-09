'use client'

import React, { useEffect, useState } from 'react'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Star, Award, MapPin, Target, Gift, TrendingUp } from 'lucide-react'

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
      // 현재 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 로그인 페이지로 이동
  const goToLogin = () => {
    // router.push 대신 직접 URL 변경 사용
    window.location.href = '/login'
  }

  // 학급관리 페이지로 이동
  const goToClasses = () => {
    if (user) {
      // router.push 대신 직접 URL 변경 사용
      window.location.href = '/classes'
    } else {
      // router.push 대신 직접 URL 변경 사용
      window.location.href = '/login'
    }
  }

  const features = [
    {
      icon: <MapPin className="w-12 h-12 text-blue-600" />,
      title: "성장 로드맵",
      description: "학생들의 장기적인 목표를 설정하고 단계별 진행 과정을 체계적으로 관리할 수 있습니다."
    },
    {
      icon: <Target className="w-12 h-12 text-purple-600" />,
      title: "미션",
      description: "학생들이 도전할 수 있는 다양한 미션을 생성하고 달성 시 레벨과 포인트를 획득할 수 있습니다."
    },
    {
      icon: <Star className="w-12 h-12 text-yellow-600" />,
      title: "칭찬 카드",
      description: "학생들의 성취와 노력을 칭찬 카드로 기록하여 긍정적인 피드백을 제공합니다."
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-600" />,
      title: "레벨 시스템",
      description: "레벨업을 통해 학생들의 성장 과정을 시각적으로 확인할 수 있습니다."
    },
    {
      icon: <Gift className="w-12 h-12 text-pink-600" />,
      title: "포인트 상점",
      description: "학생들이 획득한 포인트로 쿠폰이나 상품을 구매할 수 있는 동기부여 시스템입니다."
    }
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
      <main className="relative z-10 flex flex-col items-center px-4 py-8">
        {/* 첫 번째 섹션 - 히어로 영역 */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between mb-16 mt-8">
          <div className="text-left md:w-1/2 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl mb-8 md:mb-0">
            <h2 className="text-4xl font-bold text-blue-800 mb-4">상태창</h2>
            <p className="text-xl text-slate-700 mb-8">
              학생들이 자신의 성장을 눈에 담을 수 있게 해주세요!<br />
              성장하는 즐거움을 함께 나누는 교육 플랫폼입니다.
            </p>
            <Button
              onClick={goToClasses}
              className="px-6 py-5 text-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              {user ? '학급 관리하기' : '모험 시작하기'}
            </Button>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
              <div className="absolute inset-2 rounded-full bg-white/80 backdrop-blur flex items-center justify-center">
                <Award className="w-32 h-32 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 두 번째 섹션 - 기능 소개 */}
        <div className="w-full max-w-6xl bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl mb-16">
          <h3 className="text-3xl font-bold text-blue-800 mb-8 text-center">주요 기능</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2 text-center">{feature.title}</h4>
                <p className="text-slate-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 세 번째 섹션 - 레벨업과 포인트 시스템 */}
        <div className="w-full max-w-5xl bg-gradient-to-r from-blue-500/70 to-purple-500/70 backdrop-blur-sm rounded-xl p-8 shadow-xl mb-10">
          <div className="text-center text-white">
            <h3 className="text-3xl font-bold mb-6">레벨업과 포인트 시스템으로<br />학습 동기부여를 제공하세요!</h3>
            <p className="text-lg mb-8">
              미션을 달성하고 로드맵을 완료하면서 레벨업! 성장 시스템을 통해 성취감을 얻고,<br />
              획득한 포인트로 다양한 보상을 구매해보세요.
            </p>
            <Button
              onClick={goToClasses}
              className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-blue-50"
            >
              지금 시작하기
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
