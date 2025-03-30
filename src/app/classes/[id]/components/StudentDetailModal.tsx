'use client'

import { useState, useEffect } from 'react'
import { X, Edit } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

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
    completedQuests?: string[] // 완료된 퀘스트 ID 목록
    rewardCards?: string[] // 획득한 칭찬 카드 ID 목록
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

// 칭호 목록
const honorifics = [
    '독서왕', '수학천재', '과학마니아', '영어고수', '역사박사',
    '체육특기생', '예술가', '코딩마법사', '토론왕', '리더십마스터',
    '창의왕', '성실상', '발표왕', '노력상', '협동왕'
]

// 퀘스트 목록 (데모용)
const quests = [
    { id: 'q1', title: '수학 문제 10개 풀기', description: '기초 수학 개념 이해하기' },
    { id: 'q2', title: '독서 일지 작성하기', description: '책을 읽고 느낀 점 기록하기' },
    { id: 'q3', title: '영어 단어 20개 외우기', description: '단어 테스트 통과하기' },
    { id: 'q4', title: '과학 실험 참여하기', description: '과학 원리 이해하기' },
    { id: 'q5', title: '체육 활동 참여하기', description: '팀워크 능력 향상' }
]

// 칭찬 카드 목록 (데모용)
const rewardCards = [
    { id: 'r1', title: '열심히 참여상', description: '수업에 적극 참여한 학생에게 주는 상' },
    { id: 'r2', title: '놀라운 아이디어상', description: '창의적인 아이디어를 제시한 학생에게 주는 상' },
    { id: 'r3', title: '친절한 도우미상', description: '친구들을 도와주는 학생에게 주는 상' },
    { id: 'r4', title: '끈기있는 도전자상', description: '어려움에 포기하지 않고 도전한 학생에게 주는 상' },
    { id: 'r5', title: '깔끔한 정리상', description: '자신의 물건과 주변을 잘 정리하는 학생에게 주는 상' }
]

// 성장 로드맵 단계 (데모용)
const roadmapSteps = [
    { id: 1, title: '입문자', description: '학습의 기본을 익히는 단계', requiredLevel: 1 },
    { id: 2, title: '탐험가', description: '다양한 지식을 탐험하는 단계', requiredLevel: 5 },
    { id: 3, title: '도전자', description: '새로운 도전에 나서는 단계', requiredLevel: 10 },
    { id: 4, title: '숙련자', description: '배운 지식을 숙련하는 단계', requiredLevel: 15 },
    { id: 5, title: '전문가', description: '특정 분야의 전문성을 갖추는 단계', requiredLevel: 20 }
]

interface StudentDetailModalProps {
    classId: string
    studentId: string
    isOpen: boolean
    onClose: () => void
}

export default function StudentDetailModal({ classId, studentId, isOpen, onClose }: StudentDetailModalProps) {
    const [student, setStudent] = useState<Student | null>(null)
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)

    useEffect(() => {
        if (!isOpen || !studentId) return

        // 학생 정보 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (savedStudents) {
            try {
                const students = JSON.parse(savedStudents)
                const foundStudent = students.find((s: Student) => s.id === studentId)

                if (foundStudent) {
                    // 퀘스트와 칭찬카드 데이터가 없는 경우 초기화
                    if (!foundStudent.completedQuests) {
                        foundStudent.completedQuests = ['q1', 'q3'] // 데모 데이터
                    }
                    if (!foundStudent.rewardCards) {
                        foundStudent.rewardCards = ['r2', 'r5'] // 데모 데이터
                    }

                    setStudent(foundStudent)
                } else {
                    // 학생을 찾을 수 없는 경우
                    toast.error('학생 정보를 찾을 수 없습니다')
                    onClose()
                }
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error)
                toast.error('학생 데이터를 불러오는 중 오류가 발생했습니다')
                onClose()
            }
        } else {
            toast.error('학생 데이터를 찾을 수 없습니다')
            onClose()
        }
    }, [classId, studentId, isOpen, onClose])

    // 아이콘 변경 함수
    const handleIconChange = (newIconType: string) => {
        if (!student) return

        const updatedStudent = {
            ...student,
            iconType: newIconType
        }

        // 로컬 스토리지에서 학생 데이터 업데이트
        updateStudentInLocalStorage(updatedStudent)

        setStudent(updatedStudent)
        setIsEditingIcon(false)
        toast.success('아이콘이 변경되었습니다')
    }

    // 칭호 변경 함수
    const handleHonorificChange = (newHonorific: string) => {
        if (!student) return

        const updatedStudent = {
            ...student,
            honorific: newHonorific
        }

        // 로컬 스토리지에서 학생 데이터 업데이트
        updateStudentInLocalStorage(updatedStudent)

        setStudent(updatedStudent)
        setIsEditingHonorific(false)
        toast.success('칭호가 변경되었습니다')
    }

    // 로컬 스토리지에 학생 데이터 업데이트
    const updateStudentInLocalStorage = (updatedStudent: Student) => {
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (savedStudents) {
            try {
                const students = JSON.parse(savedStudents)
                const updatedStudents = students.map((s: Student) =>
                    s.id === updatedStudent.id ? updatedStudent : s
                )
                localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents))
            } catch (error) {
                console.error('학생 데이터 업데이트 오류:', error)
            }
        }
    }

    // 아이콘 렌더링 함수
    const renderIcon = (iconType: string, size = 6) => {
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

    // 로드맵 진행 상태 계산
    const calculateRoadmapProgress = (level: number) => {
        const currentStep = roadmapSteps.filter(step => level >= step.requiredLevel).pop()
        const nextStep = roadmapSteps.find(step => level < step.requiredLevel)

        return {
            currentStep,
            nextStep,
            progress: currentStep
                ? ((roadmapSteps.indexOf(currentStep) + 1) / roadmapSteps.length) * 100
                : 0
        }
    }

    // 해당 ID의 퀘스트 찾기
    const getQuestById = (questId: string) => {
        return quests.find(quest => quest.id === questId)
    }

    // 해당 ID의 칭찬 카드 찾기
    const getRewardCardById = (cardId: string) => {
        return rewardCards.find(card => card.id === cardId)
    }

    if (!isOpen) return null

    if (!student) {
        return (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto relative">
                    <p className="text-slate-700 text-xl">학생 데이터를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    const roadmapProgress = calculateRoadmapProgress(student.stats.level)

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto relative">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                <h2 className="text-2xl font-bold text-blue-600 mb-6">학생 상세 정보</h2>

                {/* 학생 기본 정보 카드 */}
                <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-6 mb-6 border border-blue-100 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* 아이콘 영역 */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 overflow-hidden">
                                {renderIcon(student.iconType, 10)}
                            </div>
                            <button
                                onClick={() => setIsEditingIcon(true)}
                                className="absolute bottom-0 right-0 p-1 bg-blue-500 rounded-full"
                                title="아이콘 변경"
                            >
                                <Edit className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* 학생 정보 */}
                        <div className="flex-1">
                            <div className="flex flex-col items-center md:items-start">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600 text-lg font-bold">
                                        {student.honorific}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingHonorific(true)}
                                        className="p-1 hover:bg-blue-100 rounded"
                                        title="칭호 변경"
                                    >
                                        <Edit className="w-4 h-4 text-slate-600" />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{student.name}</h2>
                                <p className="text-slate-600 mb-2">{student.title}</p>
                                <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-700">
                                    레벨 {student.stats.level}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 아이콘 변경 모달 */}
                {isEditingIcon && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">아이콘 변경</h3>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {iconTypes.map(iconType => (
                                    <button
                                        key={iconType}
                                        onClick={() => handleIconChange(iconType)}
                                        className={`w-full h-14 rounded-lg flex items-center justify-center overflow-hidden ${student.iconType === iconType ? 'ring-2 ring-blue-500' : ''} hover:ring-1 hover:ring-blue-300 transition`}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={iconType}
                                                alt="Student avatar option"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsEditingIcon(false)}
                                className="w-full px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                {/* 칭호 변경 모달 */}
                {isEditingHonorific && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">칭호 변경</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {honorifics.map(honorific => (
                                    <button
                                        key={honorific}
                                        onClick={() => handleHonorificChange(honorific)}
                                        className={`w-full py-2 px-3 rounded-lg ${student.honorific === honorific ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'} hover:bg-blue-300 transition`}
                                    >
                                        {honorific}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsEditingHonorific(false)}
                                className="w-full px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                {/* 성장 로드맵 현황 */}
                <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-6 mb-6 border border-blue-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">성장 로드맵 현황</h3>
                    <div className="mb-4">
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500"
                                style={{ width: `${roadmapProgress.progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {roadmapSteps.map((step) => (
                            <div
                                key={step.id}
                                className={`p-3 rounded-lg border ${student.stats.level >= step.requiredLevel
                                    ? 'border-blue-500 bg-blue-100'
                                    : 'border-slate-200 bg-white opacity-60'
                                    }`}
                            >
                                <div className="font-bold text-slate-800">{step.title}</div>
                                <div className="text-sm text-slate-600">Lv.{step.requiredLevel}+</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 완료 퀘스트 목록 */}
                <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-6 mb-6 border border-blue-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">완료한 퀘스트</h3>
                    {student.completedQuests && student.completedQuests.length > 0 ? (
                        <div className="space-y-3">
                            {student.completedQuests.map(questId => {
                                const quest = getQuestById(questId)
                                return quest ? (
                                    <div key={questId} className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="font-medium text-slate-800">{quest.title}</div>
                                        <div className="text-sm text-slate-600">{quest.description}</div>
                                    </div>
                                ) : null
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-500">아직 완료한 퀘스트가 없습니다.</p>
                    )}
                </div>

                {/* 획득 칭찬카드 목록 */}
                <div className="bg-blue-50/70 backdrop-blur-sm rounded-lg p-6 border border-blue-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">획득한 칭찬 카드</h3>
                    {student.rewardCards && student.rewardCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.rewardCards.map(cardId => {
                                const card = getRewardCardById(cardId)
                                return card ? (
                                    <div key={cardId} className="bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 p-4 rounded-lg shadow-sm">
                                        <div className="font-bold text-slate-800 mb-1">{card.title}</div>
                                        <div className="text-sm text-slate-600">{card.description}</div>
                                    </div>
                                ) : null
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-500">아직 획득한 칭찬 카드가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    )
} 