'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClassInfo {
    id: string
    name: string
    schoolName: string
    students: number
    createdAt: string
}

export default function ClassesPage() {
    const [user, setUser] = useState<any>(null)
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [isAddingClass, setIsAddingClass] = useState(false)
    const [newClass, setNewClass] = useState({
        name: '',
        schoolName: '',
    })
    const router = useRouter()

    useEffect(() => {
        // 로그인 상태 확인
        const userData = localStorage.getItem('user')
        if (!userData) {
            // 로그인되지 않은 경우 로그인 페이지로 이동
            window.location.href = '/login'
            return
        }

        setUser(JSON.parse(userData))

        // 로컬 스토리지에서 학급 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            setClasses(JSON.parse(savedClasses))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const handleAddClassSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!newClass.name || !newClass.schoolName) {
            alert('학교이름과 학급이름을 모두 입력해주세요.')
            return
        }

        // 새 학급 추가
        const newClassInfo: ClassInfo = {
            id: Date.now().toString(),
            name: newClass.name,
            schoolName: newClass.schoolName,
            students: 0,
            createdAt: new Date().toISOString()
        }

        const updatedClasses = [...classes, newClassInfo]
        setClasses(updatedClasses)

        // 로컬 스토리지에 저장
        localStorage.setItem('classes', JSON.stringify(updatedClasses))

        // 폼 초기화
        setNewClass({
            name: '',
            schoolName: ''
        })
        setIsAddingClass(false)
    }

    const handleDeleteClass = (id: string) => {
        const updatedClasses = classes.filter(c => c.id !== id)
        setClasses(updatedClasses)
        localStorage.setItem('classes', JSON.stringify(updatedClasses))
    }

    return (
        <div className="min-h-screen relative">
            <div className="absolute inset-0 bg-sky-50/60" />

            {/* 헤더 */}
            <header className="relative z-10 flex justify-between items-center px-4 py-3 bg-white/80 shadow-sm">
                <h1 className="text-2xl font-bold text-blue-600">상태창</h1>
                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <span className="text-slate-700">{user.name}님</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                            >
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="relative z-10 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-800">학급 관리</h2>
                    <button
                        onClick={() => setIsAddingClass(true)}
                        className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
                        학급 추가
                    </button>
                </div>

                {/* 학급 추가 폼 */}
                {isAddingClass && (
                    <div className="mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">새 학급 추가</h3>
                        <form onSubmit={handleAddClassSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="schoolName" className="block text-sm font-medium text-slate-700 mb-1">
                                    학교이름
                                </label>
                                <input
                                    id="schoolName"
                                    value={newClass.schoolName}
                                    onChange={(e) => setNewClass({ ...newClass, schoolName: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: 한국초등학교"
                                />
                            </div>
                            <div>
                                <label htmlFor="className" className="block text-sm font-medium text-slate-700 mb-1">
                                    학급이름
                                </label>
                                <input
                                    id="className"
                                    value={newClass.name}
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="예: 1학년 1반"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingClass(false)}
                                    className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                                >
                                    추가
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 학급 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.length > 0 ? (
                        classes.map((classInfo) => (
                            <div key={classInfo.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-800">{classInfo.name}</h3>
                                        <p className="text-slate-600 mt-1">{classInfo.schoolName}</p>
                                        <p className="text-slate-600 mt-1">학생 {classInfo.students}명</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClass(classInfo.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        삭제
                                    </button>
                                </div>
                                <button
                                    onClick={() => router.push(`/classes/${classInfo.id}`)}
                                    className="mt-4 w-full px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                >
                                    상세 보기
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <p className="text-xl mb-2">등록된 학급이 없습니다</p>
                            <p>새 학급을 추가해보세요</p>
                        </div>
                    )}
                </div>
            </main>

            {/* 하단 네비게이션 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-3 gap-4 py-4">
                        <button
                            onClick={() => router.push('/')}
                            className="flex flex-col items-center text-slate-600"
                        >
                            <span className="text-lg mb-1">🏠</span>
                            <span className="text-sm">홈</span>
                        </button>
                        <button
                            onClick={() => router.push('/classes')}
                            className="flex flex-col items-center text-blue-600"
                        >
                            <span className="text-lg mb-1">👨‍👩‍👧‍👦</span>
                            <span className="text-sm">학급 관리</span>
                        </button>
                        <button
                            onClick={() => router.push('/profile')}
                            className="flex flex-col items-center text-slate-600"
                        >
                            <span className="text-lg mb-1">👤</span>
                            <span className="text-sm">프로필</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 