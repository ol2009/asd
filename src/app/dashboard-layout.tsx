'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Users,
    BookOpen,
    Settings,
    LogOut
} from 'lucide-react'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const isActive = (path: string) => {
        if (path === '/classes' && pathname.startsWith('/classes')) {
            return true
        }
        return pathname === path
    }

    return (
        <div className="flex h-screen bg-slate-900">
            {/* 사이드바 */}
            <div className="w-64 bg-slate-800 text-white p-4">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-pink-400">상태창</h1>
                    <p className="text-sm text-gray-400 mt-1">학급 관리 시스템</p>
                </div>

                <nav className="space-y-2">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 
                            ${isActive('/') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}
                    >
                        <Home size={20} />
                        <span>홈</span>
                    </Link>
                    <Link
                        href="/classes"
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 
                            ${isActive('/classes') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}
                    >
                        <Users size={20} />
                        <span>학급 관리</span>
                    </Link>
                    <Link
                        href="/quests"
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 
                            ${isActive('/quests') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}
                    >
                        <BookOpen size={20} />
                        <span>퀘스트</span>
                    </Link>
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 
                            ${isActive('/settings') ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-slate-700'}`}
                    >
                        <Settings size={20} />
                        <span>설정</span>
                    </Link>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    >
                        <LogOut size={20} />
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