'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

// 아이콘 이미지 경로 불러오기
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

interface ClassInfo {
    id: string
    name: string
    grade: string
    subject: string
    description: string
    coverImage: string
    createdAt: string
}

interface RoadmapStep {
    id: string
    goal: string
}

interface Roadmap {
    id: string
    name: string
    steps: RoadmapStep[]
    rewardTitle: string
    rewardIcon: string
    createdAt: string
}

export default function RoadmapPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        steps: [
            { id: '1', goal: '' },
            { id: '2', goal: '' }
        ],
        rewardTitle: '',
        rewardIcon: iconTypes[0]
    })
    const [isIconSelectOpen, setIsIconSelectOpen] = useState(false)
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
    const [isRoadmapDetailModalOpen, setIsRoadmapDetailModalOpen] = useState(false)
    const [selectedRoadmapStepIndex, setSelectedRoadmapStepIndex] = useState<number | null>(null)
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
    const [studentsInClass, setStudentsInClass] = useState<any[]>([])
    const [studentsInSteps, setStudentsInSteps] = useState<{ [stepId: string]: string[] }>({})

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
                }
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error)
            }
        }

        // 로드맵 목록 정보 가져오기
        const savedRoadmaps = localStorage.getItem(`roadmaps_${classId}`)
        if (savedRoadmaps) {
            try {
                setRoadmaps(JSON.parse(savedRoadmaps))
            } catch (error) {
                console.error('로드맵 목록 데이터 파싱 오류:', error)
                setRoadmaps([])
            }
        } else {
            // 초기 로드맵 데이터가 없는 경우 빈 배열로 초기화
            setRoadmaps([])
            localStorage.setItem(`roadmaps_${classId}`, JSON.stringify([]))
        }

        setIsLoading(false)
    }, [classId, router])

    // 로드맵 단계 추가 폼 초기화
    const initAddForm = () => {
        setFormData({
            name: '',
            steps: [
                { id: '1', goal: '' },
                { id: '2', goal: '' }
            ],
            rewardTitle: '',
            rewardIcon: iconTypes[0]
        })
        setIsAddModalOpen(true)
    }

    // 폼 입력값 변경 핸들러
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // 단계 추가 핸들러 (폼에 새 단계 필드 추가)
    const handleAddStep = () => {
        const newStep = {
            id: Date.now().toString(),
            goal: ''
        };

        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));
    }

    // 로드맵 추가 처리
    const handleAddRoadmap = (e: React.FormEvent) => {
        e.preventDefault()

        const newRoadmap: Roadmap = {
            id: Date.now().toString(),
            name: formData.name,
            steps: formData.steps.map(step => ({
                id: step.id,
                goal: step.goal
            })),
            rewardTitle: formData.rewardTitle,
            rewardIcon: formData.rewardIcon,
            createdAt: new Date().toISOString()
        }

        // 새 로드맵 추가
        const updatedRoadmaps = [...roadmaps, newRoadmap]
        setRoadmaps(updatedRoadmaps)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`roadmaps_${classId}`, JSON.stringify(updatedRoadmaps))

        // 모달 닫기
        setIsAddModalOpen(false)
        toast.success('새 로드맵이 추가되었습니다')
    }

    // 로드맵 이름 변경 핸들러
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setFormData(prev => ({
            ...prev,
            name: value
        }))
    }

    // 단계별 목표 변경 핸들러
    const handleStepChange = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    return {
                        ...step,
                        [field]: value
                    }
                }
                return step
            })
        }));
    }

    // 단계 삭제 핸들러
    const handleRemoveStep = (index: number) => {
        if (formData.steps.length <= 2) {
            toast.error('로드맵은 최소 2단계 이상 있어야 합니다.')
            return
        }

        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }))
    }

    // 로드맵 클릭 핸들러 추가
    const handleRoadmapClick = (roadmapId: string) => {
        const roadmap = roadmaps.find(r => r.id === roadmapId)
        if (roadmap) {
            setSelectedRoadmap(roadmap)

            // 로드맵 단계별 학생 목록 불러오기
            const stepsStudents: { [stepId: string]: string[] } = {}
            roadmap.steps.forEach(step => {
                const savedStepStudents = localStorage.getItem(`roadmap_${classId}_step_${step.id}_students`)
                if (savedStepStudents) {
                    try {
                        stepsStudents[step.id] = JSON.parse(savedStepStudents)
                    } catch (error) {
                        console.error('단계별 학생 데이터 파싱 오류:', error)
                        stepsStudents[step.id] = []
                    }
                } else {
                    stepsStudents[step.id] = []
                }
            })
            setStudentsInSteps(stepsStudents)

            // 클래스의 모든 학생 목록 불러오기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (savedStudents) {
                try {
                    setStudentsInClass(JSON.parse(savedStudents))
                } catch (error) {
                    console.error('학생 데이터 파싱 오류:', error)
                    setStudentsInClass([])
                }
            } else {
                setStudentsInClass([])
            }

            setIsRoadmapDetailModalOpen(true)
        }
    }

    // 로드맵 단계에 학생 추가를 위한 모달 열기
    const handleAddStudentToStep = (stepIndex: number) => {
        setSelectedRoadmapStepIndex(stepIndex)
        setIsAddStudentModalOpen(true)
    }

    // 로드맵의 특정 단계에 학생 추가
    const handleAddStudentsToStep = (studentIds: string[]) => {
        if (!selectedRoadmap || selectedRoadmapStepIndex === null) return

        const step = selectedRoadmap.steps[selectedRoadmapStepIndex]

        // 이미 해당 단계 또는 그 이상 단계에 속한 학생은 제외
        const existingStudentIds: string[] = []

        // 현재 선택된 단계와 그 이상 단계에 있는 학생들 수집
        for (let i = selectedRoadmapStepIndex; i < selectedRoadmap.steps.length; i++) {
            const currentStepId = selectedRoadmap.steps[i].id
            if (studentsInSteps[currentStepId]) {
                existingStudentIds.push(...studentsInSteps[currentStepId])
            }
        }

        // 필터링된 학생 ID만 추가
        const filteredStudentIds = studentIds.filter(id => !existingStudentIds.includes(id))

        // 새 학생 추가
        const updatedStudentsInStep = [...(studentsInSteps[step.id] || []), ...filteredStudentIds]

        // 로컬 스토리지 업데이트
        localStorage.setItem(`roadmap_${classId}_step_${step.id}_students`, JSON.stringify(updatedStudentsInStep))

        // 상태 업데이트
        setStudentsInSteps({
            ...studentsInSteps,
            [step.id]: updatedStudentsInStep
        })

        setIsAddStudentModalOpen(false)
        toast.success('학생이 로드맵 단계에 추가되었습니다')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">학급 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (!classInfo) {
        return (
            <div className="min-h-screen p-8">
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
                    href={`/classes/${classId}`}
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>학급 페이지로</span>
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

                {/* 로드맵 목록 */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">성장 로드맵 관리</h2>
                        <button
                            onClick={initAddForm}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center gap-2 transition-colors duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            로드맵 추가
                        </button>
                    </div>

                    {/* 로드맵 목록 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {roadmaps.length > 0 ? (
                            roadmaps.map((roadmap) => (
                                <div
                                    key={roadmap.id}
                                    className="bg-white rounded-lg shadow-md p-5 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => handleRoadmapClick(roadmap.id)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full overflow-hidden relative">
                                            <Image
                                                src={roadmap.rewardIcon}
                                                alt={roadmap.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-blue-700">{roadmap.name}</h3>
                                            <p className="text-xs text-slate-500">보상: {roadmap.rewardTitle}</p>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex justify-between items-center text-sm text-slate-600 mb-1.5">
                                            <span>총 {roadmap.steps.length}단계</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-slate-500">
                                등록된 로드맵이 없습니다. 새 로드맵을 추가해보세요.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 로드맵 추가 모달 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        <h2 className="text-2xl font-bold text-blue-600 mb-6">새 로드맵 추가</h2>

                        <form onSubmit={handleAddRoadmap}>
                            <div className="space-y-6">
                                {/* 로드맵 이름 */}
                                <div>
                                    <label htmlFor="name" className="block text-slate-700 font-medium mb-1">로드맵 이름</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="예: 독서왕 도전, 수학 마스터 등"
                                        required
                                    />
                                </div>

                                {/* 단계별 목표 */}
                                <div>
                                    <h3 className="text-slate-700 font-medium mb-2">단계별 목표</h3>
                                    {formData.steps.map((step, index) => (
                                        <div key={step.id} className="mb-4 p-3 bg-blue-50 rounded-md">
                                            <div className="flex items-center justify-between mb-2">
                                                <label htmlFor={`step-${index}`} className="font-medium text-blue-600">
                                                    {index + 1}단계 목표
                                                </label>
                                                {index > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStep(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                id={`step-${index}`}
                                                value={step.goal}
                                                onChange={(e) => handleStepChange(index, 'goal', e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={`${index + 1}단계에서 달성해야 할 목표`}
                                                required
                                            />
                                        </div>
                                    ))}

                                    {/* 단계 추가 버튼 */}
                                    <button
                                        type="button"
                                        onClick={handleAddStep}
                                        className="w-full py-2 mt-2 border border-dashed border-blue-400 rounded-md text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        단계 추가하기
                                    </button>
                                </div>

                                {/* 보상 칭호 */}
                                <div>
                                    <label htmlFor="rewardTitle" className="block text-slate-700 font-medium mb-1">보상 칭호</label>
                                    <input
                                        type="text"
                                        id="rewardTitle"
                                        name="rewardTitle"
                                        value={formData.rewardTitle}
                                        onChange={(e) => setFormData({ ...formData, rewardTitle: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="예: 독서왕, 수학천재 등"
                                        required
                                    />
                                </div>

                                {/* 보상 아이콘 */}
                                <div>
                                    <label className="block text-slate-700 font-medium mb-1">보상 아이콘</label>
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={formData.rewardIcon}
                                                    alt="선택한 아이콘"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsIconSelectOpen(true)}
                                            className="px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                                        >
                                            아이콘 선택
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md mt-6 transition flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    로드맵 저장하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 아이콘 선택 모달 */}
            {isIconSelectOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={() => setIsIconSelectOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        <h2 className="text-xl font-bold text-blue-600 mb-4">아이콘 선택</h2>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {iconTypes.map((icon, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setFormData({ ...formData, rewardIcon: icon })
                                        setIsIconSelectOpen(false)
                                    }}
                                    className="cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                                >
                                    <div className="w-16 h-16 relative rounded-full overflow-hidden">
                                        <Image
                                            src={icon}
                                            alt={`아이콘 ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 로드맵 상세 모달 */}
            {isRoadmapDetailModalOpen && selectedRoadmap && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto relative">
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setIsRoadmapDetailModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        {/* 로드맵 제목 및 보상 정보 */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full overflow-hidden relative">
                                <Image
                                    src={selectedRoadmap.rewardIcon}
                                    alt={selectedRoadmap.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-blue-600">{selectedRoadmap.name}</h2>
                                <p className="text-slate-600">최종 보상 칭호: <span className="font-semibold text-blue-700">{selectedRoadmap.rewardTitle}</span></p>
                            </div>
                        </div>

                        {/* 단계별 정보 */}
                        <div className="space-y-6">
                            {selectedRoadmap.steps.map((step, index) => {
                                // 역순으로 표시 (높은 단계부터)
                                const reverseIndex = selectedRoadmap.steps.length - 1 - index
                                const stepData = selectedRoadmap.steps[reverseIndex]
                                const stepStudentIds = studentsInSteps[stepData.id] || []

                                return (
                                    <div key={stepData.id} className="border border-blue-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                                    {reverseIndex + 1}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">{stepData.goal}</h3>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold text-slate-700">
                                                    달성 학생
                                                    {stepStudentIds.length > 0 ?
                                                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                                            {stepStudentIds.length}명
                                                        </span> :
                                                        <span className="ml-2 bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                                                            0명
                                                        </span>
                                                    }
                                                </h4>
                                                <button
                                                    onClick={() => handleAddStudentToStep(reverseIndex)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
                                                >
                                                    <Plus className="w-3 h-3 inline mr-1" />
                                                    추가하기
                                                </button>
                                            </div>

                                            {stepStudentIds.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {stepStudentIds.map(studentId => {
                                                        const student = studentsInClass.find(s => s.id === studentId)
                                                        return student ? (
                                                            <div
                                                                key={studentId}
                                                                className="bg-white border border-blue-100 rounded-lg p-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="w-8 h-8 rounded-full overflow-hidden relative bg-blue-50">
                                                                    <Image
                                                                        src={student.iconType.startsWith('/') ? student.iconType : '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg'}
                                                                        alt={student.name}
                                                                        width={32}
                                                                        height={32}
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-blue-600 font-medium">{student.honorific || '초보자'}</span>
                                                                    <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                                                </div>
                                                            </div>
                                                        ) : null
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 text-sm italic">
                                                    아직 달성한 학생이 없습니다.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 로드맵 단계에 학생 추가 모달 */}
            {isAddStudentModalOpen && selectedRoadmap && selectedRoadmapStepIndex !== null && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={() => setIsAddStudentModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        <h2 className="text-xl font-bold text-blue-600 mb-4">
                            {selectedRoadmap.steps[selectedRoadmapStepIndex].goal} 달성 학생 추가
                        </h2>

                        <AddStudentsToStepForm
                            students={studentsInClass}
                            existingStudentIds={getExistingStudentIds(selectedRoadmap, selectedRoadmapStepIndex, studentsInSteps)}
                            onSubmit={handleAddStudentsToStep}
                            onCancel={() => setIsAddStudentModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// 이미 속한 학생 ID 가져오기 함수
function getExistingStudentIds(roadmap: Roadmap, stepIndex: number, studentsInSteps: { [stepId: string]: string[] }) {
    const existingStudentIds: string[] = []

    // 현재 선택된 단계와 그 이상 단계에 있는 학생들 수집
    for (let i = stepIndex; i < roadmap.steps.length; i++) {
        const currentStepId = roadmap.steps[i].id
        if (studentsInSteps[currentStepId]) {
            existingStudentIds.push(...studentsInSteps[currentStepId])
        }
    }

    return existingStudentIds
}

// 학생 추가 폼 컴포넌트
interface AddStudentsToStepFormProps {
    students: any[]
    existingStudentIds: string[]
    onSubmit: (studentIds: string[]) => void
    onCancel: () => void
}

function AddStudentsToStepForm({ students, existingStudentIds, onSubmit, onCancel }: AddStudentsToStepFormProps) {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

    // 이미 단계에 속한 학생들 제외한 목록
    const eligibleStudents = students.filter(student => !existingStudentIds.includes(student.id))

    const handleStudentToggle = (studentId: string) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId))
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(selectedStudentIds)
    }

    return (
        <form onSubmit={handleSubmit}>
            {eligibleStudents.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-600">추가할 수 있는 학생이 없습니다.</p>
                    <p className="text-sm text-slate-500 mt-1">모든 학생이 이미 이 단계 또는 더 높은 단계에 속해 있습니다.</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <p className="mb-2 text-sm text-slate-600">추가할 학생을 선택하세요</p>
                        <div className="max-h-64 overflow-y-auto p-2 border rounded-md">
                            {eligibleStudents.map(student => (
                                <div key={student.id} className="mb-2 last:mb-0">
                                    <label className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={() => handleStudentToggle(student.id)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                        />
                                        <span className="text-slate-800">{student.name}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{student.number}번</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={selectedStudentIds.length === 0}
                            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {selectedStudentIds.length}명 추가하기
                        </button>
                    </div>
                </>
            )}
        </form>
    )
} 