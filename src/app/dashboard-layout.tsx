'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, LogOut, BookOpen, Settings, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname() || ''
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isAdminUser, setIsAdminUser] = useState(false)

    // 로그인 상태 확인
    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession()
            if (!data.session) {
                router.push('/login')
            } else {
                // 관리자 권한 확인
                setIsAdminUser(isAdmin())
            }
        }

        checkSession()
    }, [router])

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

            // 로그인 페이지로 리디렉션
            router.push('/login')
        } catch (error) {
            console.error('로그아웃 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    // 기본 메뉴
    const baseMenus = [
        {
            name: '홈',
            href: '/dashboard',
            icon: <Home className="w-5 h-5" />,
            isActive: pathname === '/dashboard'
        },
        {
            name: '학급 관리',
            href: '/classes',
            icon: <Users className="w-5 h-5" />,
            isActive: pathname === '/classes' || pathname.startsWith('/classes/')
        },
        {
            name: '퀘스트',
            href: '/quests',
            icon: <BookOpen className="w-5 h-5" />,
            isActive: pathname === '/quests' || pathname.startsWith('/quests/')
        },
        {
            name: '설정',
            href: '/settings',
            icon: <Settings className="w-5 h-5" />,
            isActive: pathname === '/settings' || pathname.startsWith('/settings/')
        }
    ]

    // 관리자용 메뉴
    const adminMenus = [
        {
            name: '아바타 아이템 관리',
            href: '/avatar-items',
            icon: <ImageIcon className="w-5 h-5" />,
            isActive: pathname === '/avatar-items' || pathname.startsWith('/avatar-items/')
        }
    ]

    // 표시할 메뉴 (관리자면 관리자용 메뉴 추가)
    const menus = isAdminUser ? [...baseMenus, ...adminMenus] : baseMenus

    return (
        <div className="flex min-h-screen" style={{
            backgroundImage: "url('/images/backgrounds/sky-bg.jpg')",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
            backgroundPosition: "center"
        }}>
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
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${menu.isActive
                                ? 'bg-blue-100 text-blue-600 font-medium'
                                : 'text-slate-600 hover:bg-blue-100'
                                }`}
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

            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
} 