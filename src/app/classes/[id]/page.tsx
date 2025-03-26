'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    User, BookOpen, Sparkles, Award, Brain,
    Star, PenTool, Code, Coffee, Zap,
    Heart, Globe, Compass
} from 'lucide-react'

interface ClassInfo {
    id: string
    name: string
    schoolName: string
    students: number
    createdAt: string
}

interface Student {
    id: string
    number: number
    name: string
    title: string
    honorific: string
    stats: {
        level: number
    }
    iconType: string
}

// 아이콘 타입 목록
const iconTypes = [
    'user', 'book', 'sparkles', 'award', 'brain',
    'star', 'pen', 'code', 'coffee', 'zap',
    'heart', 'globe', 'compass'
]

// 칭호 목록 (전역으로 이동)
const honorifics = [
    '독서왕', '수학천재', '과학마니아', '영어고수', '역사박사',
    '체육특기생', '예술가', '코딩마법사', '토론왕', '리더십마스터',
    '창의왕', '성실상', '발표왕', '노력상', '협동왕'
]

export default function ClassDetailPage() {
    const router = useRouter()
    const { id } = useParams() as { id: string }
    const [user, setUser] = useState<any>(null)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [activeTab, setActiveTab] = useState('students')

    useEffect(() => {
        // 로그인 상태 확인
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login'
            return
        }
        setUser(JSON.parse(userData))

        // 학급 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            const classesData: ClassInfo[] = JSON.parse(savedClasses)
            const currentClass = classesData.find(c => c.id === id)
            if (currentClass) {
                setClassInfo(currentClass)
            } else {
                // 해당 ID의 학급을 찾을 수 없는 경우
                router.push('/classes')
            }
        }

        // 학생 목록 가져오기
        const savedStudents = localStorage.getItem(`students_${id}`)
        if (savedStudents) {
            try {
                const parsedStudents = JSON.parse(savedStudents)

                // honorific 속성이 없는 학생에게 추가
                const updatedStudents = parsedStudents.map((student: any) => {
                    if (!student.honorific) {
                        return {
                            ...student,
                            honorific: honorifics[Math.floor(Math.random() * honorifics.length)]
                        }
                    }
                    return student
                })

                setStudents(updatedStudents)
                // 업데이트된 데이터를 다시 저장
                localStorage.setItem(`students_${id}`, JSON.stringify(updatedStudents))
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error)
                // 오류 발생 시 새 데이터 생성
                const demoStudents = [
                    {
                        id: '1',
                        name: '김학생',
                        number: 1,
                        title: '초보자',
                        honorific: honorifics[Math.floor(Math.random() * honorifics.length)],
                        iconType: 'user',
                        stats: {
                            level: 12
                        }
                    },
                    {
                        id: '2',
                        name: '이학생',
                        number: 2,
                        title: '초보자',
                        honorific: honorifics[Math.floor(Math.random() * honorifics.length)],
                        iconType: 'book',
                        stats: {
                            level: 10
                        }
                    },
                    {
                        id: '3',
                        name: '박학생',
                        number: 3,
                        title: '초보자',
                        honorific: honorifics[Math.floor(Math.random() * honorifics.length)],
                        iconType: 'sparkles',
                        stats: {
                            level: 11
                        }
                    }
                ]
                setStudents(demoStudents)
                localStorage.setItem(`students_${id}`, JSON.stringify(demoStudents))
            }
        } else {
            // 아이콘 파일 목록 (정확한 경로 사용)
            const iconPaths = [
                '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
                '/images/icons/Gemini_Generated_Image_49lajh49lajh49la.jpg',
                '/images/icons/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
                '/images/icons/Gemini_Generated_Image_t4umtlt4umtlt4um.jpg',
                '/images/icons/Gemini_Generated_Image_jzqdr4jzqdr4jzqd.jpg',
                '/images/icons/Gemini_Generated_Image_t3iddit3iddit3id.jpg',
                '/images/icons/Gemini_Generated_Image_vl29o5vl29o5vl29.jpg',
                '/images/icons/Gemini_Generated_Image_xg0y2rxg0y2rxg0y.jpg',
                '/images/icons/Gemini_Generated_Image_el7avsel7avsel7a.jpg',
                '/images/icons/Gemini_Generated_Image_ogd5ztogd5ztogd5.jpg',
                '/images/icons/Gemini_Generated_Image_eun2yveun2yveun2.jpg',
                '/images/icons/Gemini_Generated_Image_gf0wfdgf0wfdgf0w.jpg'
            ]

            // 예시 학생 데이터
            const demoStudents: Student[] = [
                {
                    id: '1',
                    name: '김학생',
                    number: 1,
                    title: '초보자',
                    honorific: honorifics[Math.floor(Math.random() * honorifics.length)],
                    iconType: 'user',
                    stats: {
                        level: 12
                    }
                },
                {
                    id: '2',
                    name: '이학생',
                    number: 2,
                    title: '초보자',
                    honorific: honorifics[Math.floor(Math.random() * honorifics.length)],
                    iconType: 'book',
                    stats: {
                        level: 10
                    }
                },
                {
                    id: '3',
                    name: '박학생',
                    number: 3,
                    title: '초보자',
                    honorific: honorifics[Math.floor(Math.random() * honorifics.length)],
                    iconType: 'sparkles',
                    stats: {
                        level: 11
                    }
                }
            ]
            setStudents(demoStudents)
            localStorage.setItem(`students_${id}`, JSON.stringify(demoStudents))
        }
    }, [id, router])

    const handleLogout = () => {
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const handleStudentAdd = () => {
        // 추후 구현: 학생 추가 기능
        alert('학생 추가 기능은 추후 업데이트 예정입니다.')
    }

    // 학생 데이터를 생성하는 함수
    const generateDemoStudents = (count: number): Student[] => {
        const titles = ['초보자', '도전자', '숙련자', '전문가', '마스터']

        return Array.from({ length: count }, (_, i) => {
            const randomTitleIndex = Math.floor(Math.random() * titles.length)
            const randomIconIndex = Math.floor(Math.random() * iconTypes.length)
            const randomHonorificIndex = Math.floor(Math.random() * honorifics.length)

            return {
                id: `student-${i + 1}`,
                number: i + 1,
                name: `학생 ${i + 1}`,
                title: titles[randomTitleIndex],
                honorific: honorifics[randomHonorificIndex],
                iconType: iconTypes[randomIconIndex],
                stats: {
                    level: Math.floor(Math.random() * 10) + 1
                }
            }
        })
    }

    // 아이콘을 렌더링하는 함수
    const renderIcon = (iconType: string) => {
        switch (iconType) {
            case 'user': return <User className="w-6 h-6" />
            case 'book': return <BookOpen className="w-6 h-6" />
            case 'sparkles': return <Sparkles className="w-6 h-6" />
            case 'award': return <Award className="w-6 h-6" />
            case 'brain': return <Brain className="w-6 h-6" />
            case 'star': return <Star className="w-6 h-6" />
            case 'pen': return <PenTool className="w-6 h-6" />
            case 'code': return <Code className="w-6 h-6" />
            case 'coffee': return <Coffee className="w-6 h-6" />
            case 'zap': return <Zap className="w-6 h-6" />
            case 'heart': return <Heart className="w-6 h-6" />
            case 'globe': return <Globe className="w-6 h-6" />
            case 'compass': return <Compass className="w-6 h-6" />
            default: return <User className="w-6 h-6" />
        }
    }

    if (!classInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[url('/images/backgrounds/fantasy-bg.jpg')] bg-cover">
                <div className="text-white text-2xl">로딩 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[url('/images/backgrounds/fantasy-bg.jpg')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-[#0f172a]/70" />

            {/* 헤더 */}
            <header className="relative z-10 flex justify-between items-center px-4 py-3 bg-slate-800/60">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/classes')}
                        className="text-white hover:text-pink-300"
                    >
                        ← 뒤로
                    </button>
                    <h1 className="text-2xl font-bold text-pink-300">{classInfo.schoolName} {classInfo.name}</h1>
                </div>

                <div className="flex items-center gap-4">
                    {user && (
                        <>
                            <span className="text-white">{user.name}님</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-md bg-slate-700/80 text-white hover:bg-slate-600/80 transition"
                            >
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="relative z-10 flex">
                {/* 사이드바 */}
                <aside className="w-64 min-h-[calc(100vh-64px)] bg-slate-800/80 backdrop-blur-sm p-4">
                    <nav>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={`w-full text-left px-4 py-3 rounded-md transition ${activeTab === 'students' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                                >
                                    👨‍👩‍👧‍👦 학생 목록
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('roadmap')}
                                    className={`w-full text-left px-4 py-3 rounded-md transition ${activeTab === 'roadmap' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                                >
                                    🗺️ 성장 로드맵
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('quests')}
                                    className={`w-full text-left px-4 py-3 rounded-md transition ${activeTab === 'quests' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                                >
                                    ⚔️ 퀘스트 관리
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('rewards')}
                                    className={`w-full text-left px-4 py-3 rounded-md transition ${activeTab === 'rewards' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                                >
                                    🏅 칭찬 카드 관리
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full text-left px-4 py-3 rounded-md transition ${activeTab === 'settings' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                                >
                                    ⚙️ 학급 설정
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 p-6">
                    {activeTab === 'students' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">학생 목록</h2>
                                <button
                                    onClick={handleStudentAdd}
                                    className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition"
                                >
                                    학생 추가
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {students.map(student => (
                                    <div
                                        key={student.id}
                                        className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 hover:bg-slate-800/80 transition cursor-pointer"
                                        onClick={() => router.push(`/classes/${id}/students/${student.id}`)}
                                    >
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-white">
                                                {renderIcon(student.iconType)}
                                            </div>
                                            <div>
                                                <div className="flex flex-col">
                                                    <span className="text-pink-500 text-sm font-bold whitespace-nowrap">
                                                        {student.honorific} {student.title}
                                                    </span>
                                                    <h3 className="font-medium text-white">{student.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-300">레벨 {student.stats.level}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {students.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                                        <p className="text-xl mb-2">등록된 학생이 없습니다</p>
                                        <p>학생을 추가해보세요</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'roadmap' && (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold text-white mb-4">성장 로드맵</h2>
                            <p className="text-gray-300">이 기능은 아직 개발 중입니다 🚧</p>
                        </div>
                    )}

                    {activeTab === 'quests' && (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold text-white mb-4">퀘스트 관리</h2>
                            <p className="text-gray-300">이 기능은 아직 개발 중입니다 🚧</p>
                        </div>
                    )}

                    {activeTab === 'rewards' && (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold text-white mb-4">칭찬 카드 관리</h2>
                            <p className="text-gray-300">이 기능은 아직 개발 중입니다 🚧</p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold text-white mb-4">학급 설정</h2>
                            <p className="text-gray-300">이 기능은 아직 개발 중입니다 🚧</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
} 