'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { CalendarIcon, School, Users, Calendar, Save, Check, ArrowLeft, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface ClassInfo {
    id: string
    name: string
    grade: string
    subject: string
    description: string
    coverImage: string
    schoolName: string
    startDate?: string
    endDate?: string
    students: any[]
    createdAt: string
}

export default function ClassSettingsPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params?.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)

    // 설정 양식 데이터
    const [formData, setFormData] = useState({
        school: '',
        name: '',
        startDate: '',
        endDate: ''
    })

    // 저장 상태 (변경 사항이 있는지 추적)
    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

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

                    // 폼 데이터 초기화
                    setFormData({
                        school: foundClass.schoolName || '',
                        name: foundClass.name || '',
                        startDate: foundClass.startDate || '',
                        endDate: foundClass.endDate || ''
                    })
                } else {
                    toast.error('클래스 정보를 찾을 수 없습니다')
                    router.push('/classes')
                }
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error)
                toast.error('데이터 로드 중 오류가 발생했습니다')
            }
        } else {
            toast.error('클래스 데이터가 없습니다')
            router.push('/classes')
        }

        setIsLoading(false)
    }, [classId, router])

    // 입력값 변경 핸들러
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setIsDirty(true)
        setSaveSuccess(false)
    }

    // 설정 저장 핸들러
    const handleSaveSettings = () => {
        if (!classInfo) return

        setIsSaving(true)

        try {
            // localStorage에서 모든 클래스 정보 가져오기
            const savedClasses = localStorage.getItem('classes')
            if (savedClasses) {
                const classes = JSON.parse(savedClasses)

                // 현재 클래스 정보 업데이트
                const updatedClasses = classes.map((c: ClassInfo) => {
                    if (c.id === classId) {
                        return {
                            ...c,
                            schoolName: formData.school,
                            name: formData.name,
                            startDate: formData.startDate,
                            endDate: formData.endDate
                        }
                    }
                    return c
                })

                // 업데이트된 정보 저장
                localStorage.setItem('classes', JSON.stringify(updatedClasses))

                // 현재 상태 업데이트
                setClassInfo({
                    ...classInfo,
                    schoolName: formData.school,
                    name: formData.name,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                })

                toast.success('학급 설정이 저장되었습니다')
                setIsDirty(false)
                setSaveSuccess(true)

                // 2초 후에 성공 표시 제거
                setTimeout(() => {
                    setSaveSuccess(false)
                }, 2000)
            }
        } catch (error) {
            console.error('설정 저장 오류:', error)
            toast.error('설정 저장 중 오류가 발생했습니다')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!classInfo) {
        return (
            <div className="p-8">
                <p className="text-red-600">클래스 정보를 찾을 수 없습니다.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative">
            {/* 배경 이미지 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/backgrounds/sky-bg.jpg")' }}></div>

            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-300/30 to-white/20"></div>

            {/* 콘텐츠 영역 */}
            <div className="relative z-10 min-h-screen p-6">
                {/* 헤더 */}
                <div className="bg-blue-500 shadow-md py-4 px-6 mb-6 -mx-6 flex justify-between items-center text-white">
                    <div className="flex items-center">
                        <Link href={`/classes/${classId}`} className="mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">학생 목록으로</h1>
                    </div>
                    <Link href="/login" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                    </Link>
                </div>

                {/* 헤더 영역 */}
                <div className="mb-8 bg-white/40 backdrop-blur-sm p-6 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold text-blue-800">학급 설정</h1>
                    <p className="text-slate-700">학급 정보를 관리할 수 있습니다.</p>
                </div>

                {/* 설정 카드 */}
                <div className="grid grid-cols-1 gap-6 max-w-3xl">

                    {/* 기본 정보 설정 */}
                    <Card className="bg-white/40 backdrop-blur-sm shadow-md p-6 rounded-xl">
                        <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                            <School className="w-5 h-5 mr-2 text-blue-700" />
                            학교 및 학급 정보
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="school" className="block text-slate-700 font-medium mb-1">
                                    학교 이름
                                </Label>
                                <Input
                                    id="school"
                                    name="school"
                                    value={formData.school}
                                    onChange={handleInputChange}
                                    placeholder="예: 서울중앙초등학교"
                                    className="border-slate-300"
                                />
                            </div>

                            <div>
                                <Label htmlFor="name" className="block text-slate-700 font-medium mb-1">
                                    학급 이름
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="예: 5학년 3반"
                                    className="border-slate-300"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* 학급 운영 기간 설정 */}
                    <Card className="bg-white/30 backdrop-blur-sm shadow-md p-6 rounded-xl">
                        <h2 className="text-xl font-semibold text-blue-800 mb-6 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-700" />
                            학급 운영 기간
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="startDate" className="block text-slate-700 font-medium mb-1">
                                    시작일
                                </Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="pl-10 border-slate-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="endDate" className="block text-slate-700 font-medium mb-1">
                                    종료일
                                </Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="pl-10 border-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 저장 버튼 */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveSettings}
                            disabled={isSaving || !isDirty}
                            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${!isDirty ? 'bg-gray-400 cursor-not-allowed' : saveSuccess ? 'bg-green-500/80 hover:bg-green-600/80' : 'bg-blue-500/80 hover:bg-blue-600/80'
                                } text-white`}
                        >
                            {isSaving ? (
                                <span>저장 중...</span>
                            ) : saveSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    저장됨
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    변경사항 저장
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 