'use client'

import React from 'react'
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

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function ClassDetailLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()
    const classId = params.id as string

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
        window.location.href = '/login'
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
            isActive: pathname === `/classes/${classId}/roadmap` || pathname.startsWith(`/classes/${classId}/roadmap/`)
        },
        {
            name: '미션',
            href: `/classes/${classId}/missions`,
            icon: <Target className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/missions` || pathname.startsWith(`/classes/${classId}/missions/`)
        },
        {
            name: '칭찬 카드',
            href: `/classes/${classId}/cards`,
            icon: <Gift className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/cards` || pathname.startsWith(`/classes/${classId}/cards/`)
        },
        {
            name: '포인트 상점 관리',
            href: `/classes/${classId}/pointshop`,
            icon: <ShoppingBag className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/pointshop` || pathname.startsWith(`/classes/${classId}/pointshop/`)
        },
        {
            name: '학급 설정',
            href: `/classes/${classId}/settings`,
            icon: <Settings className="w-5 h-5" />,
            isActive: pathname === `/classes/${classId}/settings` || pathname.startsWith(`/classes/${classId}/settings/`)
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
                    <p className="text-sm text-slate-500 mt-1">학급 관리 시스템</p>
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
                        className="flex items-center gap-3 px-4 py-2 w-full text-slate-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                        <LogOut size={20} className="text-blue-500" />
                        <span>로그아웃</span>
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