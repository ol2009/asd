'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, BookOpen, Sparkles, Award, Brain, Star, PenTool, Code, Coffee, Zap, Heart, Globe, Compass, Edit } from 'lucide-react'
import { toast } from 'sonner'
import AvatarRenderer from '@/components/Avatar'
import { parseAvatarString, createRandomNewbyAvatar, stringifyAvatar } from '@/lib/avatar'
import StudentDetailModal from '../../components/StudentDetailModal'

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
    avatar?: string
    completedQuests?: string[] // 완료된 퀘스트 ID 목록
    rewardCards?: string[] // 획득한 칭찬 카드 ID 목록
}

// 아이콘 타입 목록
const iconTypes = [
    'user', 'book', 'sparkles', 'award', 'brain',
    'star', 'pen', 'code', 'coffee', 'zap',
    'heart', 'globe', 'compass'
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

export default function StudentDetailPage() {
    const router = useRouter()
    const { id, studentId } = useParams() as { id: string, studentId: string }
    const [student, setStudent] = useState<Student | null>(null)
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    useEffect(() => {
        // 로그인 상태 확인
        const userData = localStorage.getItem('user')
        if (!userData) {
            window.location.href = '/login'
            return
        }
        setUser(JSON.parse(userData))

        // 학생 정보 가져오기
        const savedStudents = localStorage.getItem(`students_${id}`)
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

                    // 아바타가 없는 경우 초기 아바타 생성
                    if (!foundStudent.avatar) {
                        foundStudent.avatar = stringifyAvatar(createRandomNewbyAvatar())
                    }

                    setStudent(foundStudent)
                } else {
                    // 학생을 찾을 수 없는 경우
                    router.push(`/classes/${id}`)
                }
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error)
                router.push(`/classes/${id}`)
            }
        } else {
            // 학생 데이터가 없는 경우
            router.push(`/classes/${id}`)
        }
    }, [id, studentId, router])

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
        const savedStudents = localStorage.getItem(`students_${id}`)
        if (savedStudents) {
            try {
                const students = JSON.parse(savedStudents)
                const updatedStudents = students.map((s: Student) =>
                    s.id === updatedStudent.id ? updatedStudent : s
                )
                localStorage.setItem(`students_${id}`, JSON.stringify(updatedStudents))
            } catch (error) {
                console.error('학생 데이터 업데이트 오류:', error)
            }
        }
    }

    // 아이콘 렌더링 함수
    const renderIcon = (iconType: string, size = 6) => {
        switch (iconType) {
            case 'user': return <User className={`w-${size} h-${size}`} />
            case 'book': return <BookOpen className={`w-${size} h-${size}`} />
            case 'sparkles': return <Sparkles className={`w-${size} h-${size}`} />
            case 'award': return <Award className={`w-${size} h-${size}`} />
            case 'brain': return <Brain className={`w-${size} h-${size}`} />
            case 'star': return <Star className={`w-${size} h-${size}`} />
            case 'pen': return <PenTool className={`w-${size} h-${size}`} />
            case 'code': return <Code className={`w-${size} h-${size}`} />
            case 'coffee': return <Coffee className={`w-${size} h-${size}`} />
            case 'zap': return <Zap className={`w-${size} h-${size}`} />
            case 'heart': return <Heart className={`w-${size} h-${size}`} />
            case 'globe': return <Globe className={`w-${size} h-${size}`} />
            case 'compass': return <Compass className={`w-${size} h-${size}`} />
            default: return <User className={`w-${size} h-${size}`} />
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

    if (!student) {
        return (
            <div className="min-h-screen bg-[url('/images/backgrounds/fantasy-bg.jpg')] bg-cover bg-center relative">
                <div className="absolute inset-0 bg-[#0f172a]/70" />
                <div className="relative z-10 flex justify-center items-center h-screen">
                    <p className="text-white text-xl">학생 데이터를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    const roadmapProgress = calculateRoadmapProgress(student.stats.level)

    return (
        <div className="min-h-screen bg-[url('/images/backgrounds/fantasy-bg.jpg')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-[#0f172a]/70" />

            {/* 헤더 */}
            <header className="relative z-10 flex justify-between items-center px-4 py-3 bg-slate-800/60">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.push(`/classes/${id}`)}
                        className="p-2 rounded-full hover:bg-slate-700/80 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-2xl font-bold text-pink-300">학생 상세 정보</h1>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <span className="text-white">{user.name}님</span>
                    )}
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="relative z-10 container mx-auto py-6 px-4">
                {/* 학생 기본 정보 카드 */}
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* 아이콘 영역 - 아바타로 교체 */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                                {student.avatar ? (
                                    <AvatarRenderer avatar={student.avatar} size={96} />
                                ) : (
                                    renderIcon(student.iconType, 10)
                                )}
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(true)}
                                className="absolute bottom-0 right-0 p-1 bg-pink-500 rounded-full"
                                title="아이콘 변경"
                            >
                                <Edit className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* 학생 정보 */}
                        <div className="flex-1">
                            <div className="flex flex-col items-center md:items-start">
                                <div className="flex items-center gap-2">
                                    <span className="text-pink-500 text-lg font-bold">
                                        {student.honorific}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingHonorific(true)}
                                        className="p-1 hover:bg-slate-700 rounded"
                                        title="칭호 변경"
                                    >
                                        <Edit className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">{student.name}</h2>
                                <p className="text-gray-300 mb-2">{student.title}</p>
                                <div className="bg-slate-700 px-3 py-1 rounded-full text-white">
                                    레벨 {student.stats.level}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 학생 상세 모달 - 아바타 수정 기능 제공 */}
                <StudentDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    studentId={studentId}
                    classId={id}
                    initialTab="avatar"
                />

                {/* 아이콘 변경 모달 */}
                {isEditingIcon && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">아바타 수정</h3>
                            <p className="text-gray-300 mb-6">
                                학생의 아바타를 수정하려면 학생 상세 모달에서 변경해주세요.
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditingIcon(false);
                                        setIsDetailModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md"
                                >
                                    아바타 수정하기
                                </button>
                                <button
                                    onClick={() => setIsEditingIcon(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 칭호 변경 모달 */}
                {isEditingHonorific && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-white mb-4">칭호 변경</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {honorifics.map(honorific => (
                                    <button
                                        key={honorific}
                                        onClick={() => handleHonorificChange(honorific)}
                                        className={`w-full py-2 px-3 rounded-lg ${student.honorific === honorific ? 'bg-pink-500' : 'bg-slate-700'} hover:bg-pink-600 transition text-white`}
                                    >
                                        {honorific}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsEditingHonorific(false)}
                                className="w-full px-4 py-2 rounded-md bg-slate-700 text-white hover:bg-slate-600 transition"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                {/* 성장 로드맵 현황 */}
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">성장 로드맵 현황</h3>
                    <div className="mb-4">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-pink-400"
                                style={{ width: `${roadmapProgress.progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {roadmapSteps.map((step) => (
                            <div
                                key={step.id}
                                className={`p-3 rounded-lg border ${student.stats.level >= step.requiredLevel
                                    ? 'border-pink-500 bg-pink-500/20'
                                    : 'border-slate-600 bg-slate-700/30 opacity-60'
                                    }`}
                            >
                                <div className="font-bold text-white">{step.title}</div>
                                <div className="text-sm text-gray-300">Lv.{step.requiredLevel}+</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 완료 퀘스트 목록 */}
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">완료한 퀘스트</h3>
                    {student.completedQuests && student.completedQuests.length > 0 ? (
                        <div className="space-y-3">
                            {student.completedQuests.map(questId => {
                                const quest = getQuestById(questId)
                                return quest ? (
                                    <div key={questId} className="bg-slate-700/60 p-3 rounded-lg">
                                        <div className="font-medium text-white">{quest.title}</div>
                                        <div className="text-sm text-gray-300">{quest.description}</div>
                                    </div>
                                ) : null
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400">아직 완료한 퀘스트가 없습니다.</p>
                    )}
                </div>

                {/* 획득 칭찬카드 목록 */}
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">획득한 칭찬 카드</h3>
                    {student.rewardCards && student.rewardCards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.rewardCards.map(cardId => {
                                const card = getRewardCardById(cardId)
                                return card ? (
                                    <div key={cardId} className="bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-pink-500/50 p-4 rounded-lg">
                                        <div className="font-bold text-white mb-1">{card.title}</div>
                                        <div className="text-sm text-gray-300">{card.description}</div>
                                    </div>
                                ) : null
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400">아직 획득한 칭찬 카드가 없습니다.</p>
                    )}
                </div>
            </main>
        </div>
    )
} 