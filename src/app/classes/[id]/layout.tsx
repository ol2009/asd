'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Home,
    Users,
    BookOpen,
    Settings,
    LogOut,
    Map,
    Award,
    Target,
    Gift
} from 'lucide-react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function ClassDetailLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

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
                    <Link
                        href={`/classes/${pathname.split('/')[2]}`}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-blue-100"
                    >
                        <Users size={20} className="text-blue-500" />
                        <span>학생목록</span>
                    </Link>
                    <Link
                        href={`/classes/${pathname.split('/')[2]}/roadmap`}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-blue-100"
                    >
                        <Map size={20} className="text-blue-500" />
                        <span>성장로드맵</span>
                    </Link>
                    <Link
                        href={`/classes/${pathname.split('/')[2]}/missions`}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-blue-100"
                    >
                        <Target size={20} className="text-blue-500" />
                        <span>미션 관리</span>
                    </Link>
                    <Link
                        href={`/classes/${pathname.split('/')[2]}/cards`}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-blue-100"
                    >
                        <Gift size={20} className="text-blue-500" />
                        <span>칭찬카드 관리</span>
                    </Link>
                    <Link
                        href={`/classes/${pathname.split('/')[2]}/settings`}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-blue-100"
                    >
                        <Settings size={20} className="text-blue-500" />
                        <span>학급 설정</span>
                    </Link>
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