'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    Plus, ArrowLeft,
    LogOut, X
} from 'lucide-react'
import Link from 'next/link'
import AddStudentModal from './components/AddStudentModal'
import StudentDetailModal from './components/StudentDetailModal'

interface ClassInfo {
    id: string
    name: string
    grade: string
    subject: string
    description: string
    coverImage: string
    students: Student[]
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

// 이미지 아이콘 경로
const iconTypes = [
    '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
    '/images/icons/Gemini_Generated_Image_49lajh49lajh49la.jpg',
    '/images/icons/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
    '/images/icons/Gemini_Generated_Image_el7avsel7avsel7a.jpg',
    '/images/icons/Gemini_Generated_Image_eun2yveun2yveun2.jpg',
    '/images/icons/Gemini_Generated_Image_gf0wfdgf0wfdgf0w.jpg',
    '/images/icons/Gemini_Generated_Image_jzqdr4jzqdr4jzqd.jpg',
    '/images/icons/Gemini_Generated_Image_ogd5ztogd5ztogd5.jpg',
    '/images/icons/Gemini_Generated_Image_t3iddit3iddit3id.jpg',
    '/images/icons/Gemini_Generated_Image_t4umtlt4umtlt4um.jpg',
    '/images/icons/Gemini_Generated_Image_vl29o5vl29o5vl29.jpg',
    '/images/icons/Gemini_Generated_Image_xg0y2rxg0y2rxg0y.jpg'
]

// 칭호 목록 (전역으로 이동)
const honorifics = [
    '독서왕', '수학천재', '과학마니아', '영어고수', '역사박사',
    '체육특기생', '예술가', '코딩마법사', '토론왕', '리더십마스터',
    '창의왕', '성실상', '발표왕', '노력상', '협동왕'
]

export default function ClassDetailPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
    const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false)

    useEffect(() => {
        // 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        // 클래스 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses)
                const foundClass = classes.find((c: ClassInfo) => c.id === classId)

                if (foundClass) {
                    setClassInfo(foundClass)
                    // 학생 정보 가져오기
                    const savedStudents = localStorage.getItem(`students_${classId}`)
                    if (savedStudents) {
                        setStudents(JSON.parse(savedStudents))
                    } else {
                        // 데모 학생 데이터 (처음 방문 시)
                        const demoStudents = [
                            {
                                id: '1',
                                number: 1,
                                name: '김학생',
                                title: '반장',
                                honorific: '수학천재',
                                stats: {
                                    level: 7
                                },
                                iconType: 'sparkles'
                            },
                            {
                                id: '2',
                                number: 2,
                                name: '이영재',
                                title: '부반장',
                                honorific: '독서왕',
                                stats: {
                                    level: 5
                                },
                                iconType: 'book'
                            },
                            {
                                id: '3',
                                number: 3,
                                name: '박미래',
                                title: '학생',
                                honorific: '영어고수',
                                stats: {
                                    level: 6
                                },
                                iconType: 'globe'
                            }
                        ]
                        setStudents(demoStudents)
                        localStorage.setItem(`students_${classId}`, JSON.stringify(demoStudents))
                    }
                }
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error)
            }
        }
        setIsLoading(false)
    }, [classId, router])

    // 아이콘을 렌더링하는 함수
    const renderIcon = (iconType: string) => {
        // iconType이 기존 Lucide 아이콘 이름인 경우 (이전 데이터 호환성 유지)
        if (iconType.startsWith('user') || iconType.startsWith('book') || iconType.startsWith('sparkles') ||
            iconType.startsWith('award') || iconType.startsWith('brain') || iconType.startsWith('star') ||
            iconType.startsWith('pen') || iconType.startsWith('code') || iconType.startsWith('coffee') ||
            iconType.startsWith('zap') || iconType.startsWith('heart') || iconType.startsWith('globe') ||
            iconType.startsWith('compass')) {
            // 기존 아이콘 대신 기본 이미지 사용
            return (
                <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image
                        src={iconTypes[0]} // 기본 이미지
                        alt="Student avatar"
                        fill
                        className="object-cover"
                    />
                </div>
            )
        } else {
            // 이미지 경로인 경우
            return (
                <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image
                        src={iconType}
                        alt="Student avatar"
                        fill
                        className="object-cover"
                    />
                </div>
            )
        }
    }

    // 랭킹 순서로 정렬된 학생 목록 반환
    const getSortedStudents = () => {
        return students.sort((a, b) => b.stats.level - a.stats.level)
    }

    // 학생 클릭 핸들러 - 모달을 열도록 수정
    const handleStudentClick = (studentId: string) => {
        setSelectedStudentId(studentId)
        setIsStudentDetailModalOpen(true)
    }

    // 학생 추가 모달 닫기 핸들러
    const handleAddStudentModalClose = () => {
        setIsAddStudentModalOpen(false)
    }

    // 학생 상세 모달 닫기 핸들러
    const handleStudentDetailModalClose = () => {
        setIsStudentDetailModalOpen(false)
        setSelectedStudentId(null)
    }

    // 학생 추가 모달에서 제출 핸들러
    const handleStudentAdded = (newStudent: Student) => {
        // 학생 목록 상태 업데이트
        setStudents(prevStudents => {
            const updatedStudents = [...prevStudents, newStudent]
            return updatedStudents
        })

        // 클래스 정보에도 학생 추가
        if (classInfo) {
            const updatedClassInfo = {
                ...classInfo,
                students: [...classInfo.students, newStudent]
            }
            setClassInfo(updatedClassInfo)

            // 로컬 스토리지의 classes 업데이트
            const savedClasses = localStorage.getItem('classes')
            if (savedClasses) {
                try {
                    const classes = JSON.parse(savedClasses)
                    const updatedClasses = classes.map((c: ClassInfo) =>
                        c.id === classInfo.id ? updatedClassInfo : c
                    )
                    localStorage.setItem('classes', JSON.stringify(updatedClasses))
                } catch (error) {
                    console.error('클래스 데이터 업데이트 오류:', error)
                }
            }
        }
    }

    // 로그아웃 핸들러 추가
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen text-slate-700 p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">학급 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (!classInfo) {
        return (
            <div className="min-h-screen text-slate-700 p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">학급 정보를 찾을 수 없습니다.</p>
                    <Link href="/classes" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        학급 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-slate-700">
            {/* 뒤로가기 버튼 */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Link
                    href="/classes"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>학급 목록으로</span>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 학교 및 학급 정보 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h2 className="text-xl text-blue-600 font-medium">동두천신천초등학교</h2>
                            <h1 className="text-3xl font-bold text-slate-800 mt-1">{classInfo.name}</h1>
                        </div>
                        <div className="mt-2 md:mt-0 text-slate-500">
                            <p>학급운영일: {new Date(classInfo.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* 학생 목록 */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">학생 목록</h2>
                        <button
                            onClick={() => setIsAddStudentModalOpen(true)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            학생 추가
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getSortedStudents().map((student) => (
                            <div
                                key={student.id}
                                className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 cursor-pointer transition-colors duration-200"
                                onClick={() => handleStudentClick(student.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 overflow-hidden relative">
                                        {renderIcon(student.iconType)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-600 text-sm font-medium">{student.honorific}</span>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Lv.{student.stats.level}</span>
                                        </div>
                                        <h3 className="text-slate-800 font-medium">{student.name}</h3>
                                        <p className="text-slate-500 text-sm">{student.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 학생 추가 모달 */}
            <AddStudentModal
                classId={classId}
                isOpen={isAddStudentModalOpen}
                onClose={handleAddStudentModalClose}
                onStudentAdded={handleStudentAdded}
            />

            {/* 학생 상세 모달 */}
            {selectedStudentId && (
                <StudentDetailModal
                    classId={classId}
                    studentId={selectedStudentId}
                    isOpen={isStudentDetailModalOpen}
                    onClose={handleStudentDetailModalClose}
                />
            )}
        </div>
    )
} 