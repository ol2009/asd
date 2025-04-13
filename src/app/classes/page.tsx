'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface ClassInfo {
    id: string
    name: string
    schoolName: string
    students: number
    createdAt: string
    startDate: string
}

export default function ClassesPage() {
    const [user, setUser] = useState<any>(null)
    const [classes, setClasses] = useState<ClassInfo[]>([])
    const [isAddingClass, setIsAddingClass] = useState(false)
    const [newClass, setNewClass] = useState({
        name: '',
        schoolName: '',
        startDate: new Date().toISOString().split('T')[0]
    })
    const [isSessionChecked, setIsSessionChecked] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // 로그인 상태 확인
        const checkLoginStatus = async () => {
            try {
                // 로컬스토리지 확인과 Supabase 세션 확인 병행
                const userData = localStorage.getItem('user')
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                const { data } = await supabase.auth.getSession()

                if (userData) {
                    setUser(JSON.parse(userData))
                }

                // 둘 다 없으면 로그인 페이지로 이동
                if (!isLoggedIn && !data.session) {
                    console.log('로그인 세션이 없습니다. 로그인 페이지로 이동합니다.')
                    window.location.href = '/login'
                    return false
                }

                return true
            } catch (error) {
                console.error('세션 확인 오류:', error)

                // 오류 발생시 로컬스토리지만 확인
                const userData = localStorage.getItem('user')
                const isLoggedIn = localStorage.getItem('isLoggedIn')

                if (userData) {
                    setUser(JSON.parse(userData))
                }

                if (!isLoggedIn) {
                    window.location.href = '/login'
                    return false
                }
                return true
            }
        }

        checkLoginStatus().then(isLoggedIn => {
            if (isLoggedIn) {
                loadClassData()
            }
        })
    }, [])

    // 클래스 데이터 로드 함수
    const loadClassData = () => {
        // 로컬 스토리지에서 학급 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            try {
                const parsedClasses = JSON.parse(savedClasses);

                // 각 클래스마다 학생 수를 계산하여 설정
                const classesWithStudentCount = parsedClasses.map((classData: any) => {
                    // students가 배열인 경우 길이를 사용하고, 숫자인 경우 그대로 사용
                    let studentCount = 0;

                    if (classData.students) {
                        if (Array.isArray(classData.students)) {
                            studentCount = classData.students.length;
                        } else if (typeof classData.students === 'number') {
                            studentCount = classData.students;
                        }
                    }

                    // 클래스 정보에서 students 객체 배열을 제거하고 학생 수만 포함
                    return {
                        ...classData,
                        students: studentCount
                    };
                });

                setClasses(classesWithStudentCount);
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error);
                setClasses([]);
            }
        }
    }

    const handleLogout = async () => {
        try {
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
            // 에러가 발생해도 로컬 스토리지는 비우고 로그인 페이지로 이동
            localStorage.removeItem('user')
            localStorage.removeItem('isLoggedIn')
            router.push('/login')
        }
    }

    const handleAddClassSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!newClass.name || !newClass.schoolName || !newClass.startDate) {
            alert('학교이름, 학급이름, 운영 시작일을 모두 입력해주세요.')
            return
        }

        // 새 학급 추가
        const newClassInfo: ClassInfo = {
            id: Date.now().toString(),
            name: newClass.name,
            schoolName: newClass.schoolName,
            students: 0,
            createdAt: new Date().toISOString(),
            startDate: newClass.startDate
        }

        const updatedClasses = [...classes, newClassInfo]
        setClasses(updatedClasses)

        // 로컬 스토리지에 저장
        localStorage.setItem('classes', JSON.stringify(updatedClasses))

        // 학생 데이터용 빈 배열도 초기화
        localStorage.setItem(`students_${newClassInfo.id}`, JSON.stringify([]))

        // 폼 초기화
        setNewClass({
            name: '',
            schoolName: '',
            startDate: new Date().toISOString().split('T')[0]
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
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                                    학급 운영 시작일
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    value={newClass.startDate}
                                    onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
    )
} 