'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useParams } from 'next/navigation'
import {
    Home,
    Users,
    BookOpen,
    Settings,
    LogOut,
    Map,
    Award,
    Target,
    Gift,
    ShoppingBag
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function ClassDetailLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()
    const classId = params?.id as string
    const [loading, setLoading] = useState(false)

    // 로그인 상태 확인
    useEffect(() => {
        const checkSession = async () => {
            try {
                // 로컬스토리지에서 확인
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                if (isLoggedIn === 'true') {
                    return // 로컬 스토리지에 로그인 정보 있음
                }

                // Supabase 세션 확인
                const { data, error } = await supabase.auth.getSession()
                if (!data.session && !isLoggedIn) {
                    console.log('로그인 세션이 없습니다. 로그인 페이지로 이동합니다.')
                    // 직접 URL 이동을 사용해 리다이렉션 (router가 작동하지 않는 경우 대비)
                    window.location.href = '/login'
                }
            } catch (error) {
                console.error('세션 확인 오류:', error)
                // 오류 발생 시 로컬스토리지만 확인
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                if (!isLoggedIn) {
                    window.location.href = '/login'
                }
            }
        }

        checkSession()
    }, [])

    const handleLogout = async () => {
        try {
            setLoading(true)
            // Supabase로 로그아웃
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw error
            }

            // 기존 로컬스토리지 데이터 삭제 (호환성 유지)
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('user')

            // 직접 URL 이동을 사용해 리다이렉션 (router가 작동하지 않는 경우 대비)
            window.location.href = '/login'
        } catch (error) {
            console.error('로그아웃 오류:', error)
            // 에러 발생해도 로컬스토리지는 비우고 로그인 페이지로 이동
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('user')
            window.location.href = '/login'
        } finally {
            setLoading(false)
        }
    }

    const menus = [
        {
            name: '학생 관리',
            href: `/classes/${classId}`,
            icon: <BookOpen className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}`
        },
        {
            name: '성장 로드맵',
            href: `/classes/${classId}/roadmap`,
            icon: <Map className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/roadmap` || pathname?.startsWith(`/classes/${classId}/roadmap/`)
        },
        {
            name: '미션',
            href: `/classes/${classId}/missions`,
            icon: <Target className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/missions` || pathname?.startsWith(`/classes/${classId}/missions/`)
        },
        {
            name: '칭찬 카드',
            href: `/classes/${classId}/cards`,
            icon: <Gift className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/cards` || pathname?.startsWith(`/classes/${classId}/cards/`)
        },
        {
            name: '학급 골드 상점 관리',
            href: `/classes/${classId}/pointshop`,
            icon: <ShoppingBag className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/pointshop` || pathname?.startsWith(`/classes/${classId}/pointshop/`)
        },
        {
            name: '학급 설정',
            href: `/classes/${classId}/settings`,
            icon: <Settings className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/settings` || pathname?.startsWith(`/classes/${classId}/settings/`)
        }
    ]

    return (
        <div className="flex h-screen" style={{
            backgroundImage: "url('/images/backgrounds/sky-bg.jpg')",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            backgroundPosition: "center"
        }}>
            {/* 사이드바 */}
            <div className="w-64 bg-blue-50/90 backdrop-blur-sm text-slate-700 p-4 shadow-md">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-blue-600">상태창</h1>
                    <p className="text-sm text-slate-500 mt-1">학생들이 자신의 성장을<br />눈으로 확인하게 해주세요</p>
                </div>

                <nav className="space-y-2">
                    {menus.map((menu) => (
                        <Link
                            key={menu.name}
                            href={menu.href}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-blue-100"
                        >
                            {menu.icon}
                            <span>{menu.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center gap-3 px-4 py-2 w-full text-slate-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        <LogOut size={20} className="text-blue-500" />
                        <span>{loading ? '로그아웃 중...' : '로그아웃'}</span>
                    </button>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
} 