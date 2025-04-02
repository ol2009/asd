'use client'

import { useState, useEffect } from 'react'
import { X, Edit, Award } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const EXP_PER_LEVEL = 100
const POINTS_PER_LEVEL = 100

// 등급별 아이콘 목록
const gradeIcons = {
    a: [
        '/images/icons/grade_a/Gemini_Generated_Image_m5pi0tm5pi0tm5pi.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_qlyrhlqlyrhlqlyr.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_a426uja426uja426.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_sjdbdnsjdbdnsjdb.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_vxm2apvxm2apvxm2.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_iwbdbxiwbdbxiwbd.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_rqt8yfrqt8yfrqt8.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_j52jawj52jawj52j.jpg',
        '/images/icons/grade_a/Gemini_Generated_Image_k96h4k96h4k96h4k.jpg',
    ],
    b: [
        '/images/icons/grade_b/Gemini_Generated_Image_vq6lkvq6lkvq6lkv.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_tot4sttot4sttot4.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_9pnx899pnx899pnx.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_9s9flc9s9flc9s9f.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_povwo1povwo1povw.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_cff3yscff3yscff3.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_ejn4o1ejn4o1ejn4.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_a0d0nfa0d0nfa0d0.jpg',
        '/images/icons/grade_b/Gemini_Generated_Image_xvxsc7xvxsc7xvxs.jpg',
    ],
    c: [
        '/images/icons/grade_c/Gemini_Generated_Image_jjrcwxjjrcwxjjrc.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_z1qxuqz1qxuqz1qx.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_att0bcatt0bcatt0.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_5xjksy5xjksy5xjk.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_a4bwnwa4bwnwa4bw.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_xk33imxk33imxk33.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_hv2vwdhv2vwdhv2v.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_kw130wkw130wkw13.jpg',
        '/images/icons/grade_c/Gemini_Generated_Image_43g92k43g92k43g9.jpg',
    ],
    d: [
        '/images/icons/grade_d/Gemini_Generated_Image_t4umtlt4umtlt4um.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_t3iddit3iddit3id.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_jzqdr4jzqdr4jzqd.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
        '/images/icons/grade_d/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
    ],
}

// 칭호 목록
const honorifics = [
    '열정 넘치는',
    '성실한',
    '똑똑한',
    '도전하는',
    '창의적인',
    '멋진',
    '친절한',
    '책임감 있는',
    '리더십 있는',
    '긍정적인'
]

// 학생 타입 정의
interface Student {
    id: string
    name: string
    number: number
    iconType?: string
    honorific?: string
    points?: number
    stats: {
        level: number
        exp: number
    }
}

interface StudentDetailModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string | null
    classId: string | null
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, studentId, classId }) => {
    const [student, setStudent] = useState<Student | null>(null)
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'missions' | 'cards'>('roadmaps')
    const [selectedGrade, setSelectedGrade] = useState<'a' | 'b' | 'c' | 'd'>('a')

    // 학생 완료 항목 데이터
    const [completedRoadmaps, setCompletedRoadmaps] = useState<{
        roadmapId: string
        stepId: string
        roadmapName: string
        stepGoal: string
    }[]>([])
    const [completedMissions, setCompletedMissions] = useState<{
        id: string
        name: string
        condition: string
    }[]>([])
    const [receivedCards, setReceivedCards] = useState<{
        id: string
        cardId: string
        cardName: string
        cardDescription: string
        issuedAt: number
    }[]>([])

    // 로딩 상태
    const [roadmapsLoading, setRoadmapsLoading] = useState(true)
    const [missionsLoading, setMissionsLoading] = useState(true)
    const [cardsLoading, setCardsLoading] = useState(true)

    useEffect(() => {
        if (isOpen && studentId) {
            loadStudentInfo()
            loadCompletedRoadmaps()
            loadCompletedMissions()
            loadReceivedCards()
        }
    }, [isOpen, studentId, classId])

    const loadStudentInfo = () => {
        try {
            const classesJson = localStorage.getItem('classes')
            if (!classesJson) {
                toast.error('클래스 정보를 불러올 수 없습니다.')
                return
            }

            const classes = JSON.parse(classesJson)
            const currentClass = classes.find((cls: any) => cls.id === classId)
            if (!currentClass) {
                toast.error('현재 클래스를 찾을 수 없습니다.')
                return
            }

            const foundStudent = currentClass.students.find((s: any) => s.id === studentId)
            if (!foundStudent) {
                toast.error('학생 정보를 찾을 수 없습니다.')
                return
            }

            setStudent(foundStudent)
        } catch (error) {
            console.error('학생 정보 로드 중 오류 발생:', error)
            toast.error('학생 정보를 불러오는 중 오류가 발생했습니다.')
        }
    }

    const loadCompletedRoadmaps = async () => {
        setRoadmapsLoading(true)
        try {
            const roadmapsJson = localStorage.getItem(`roadmaps_${classId}`)
            if (!roadmapsJson) {
                setCompletedRoadmaps([])
                return
            }

            const roadmaps = JSON.parse(roadmapsJson)
            const completed: any[] = []

            roadmaps.forEach((roadmap: any) => {
                if (roadmap.steps) {
                    roadmap.steps.forEach((step: any) => {
                        if (step.students && step.students.includes(studentId)) {
                            completed.push({
                                roadmapId: roadmap.id,
                                stepId: step.id,
                                roadmapName: roadmap.name,
                                stepGoal: step.goal
                            })
                        }
                    })
                }
            })

            setCompletedRoadmaps(completed)
        } catch (error) {
            console.error('로드맵 정보 로드 중 오류 발생:', error)
            toast.error('로드맵 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setRoadmapsLoading(false)
        }
    }

    const loadCompletedMissions = async () => {
        setMissionsLoading(true)
        try {
            const missionsJson = localStorage.getItem(`missions_${classId}`)
            if (!missionsJson) {
                setCompletedMissions([])
                return
            }

            const missions = JSON.parse(missionsJson)
            const completed = missions
                .filter((mission: any) =>
                    mission.achievers && mission.achievers.includes(studentId)
                )
                .map((mission: any) => ({
                    id: mission.id,
                    name: mission.name,
                    condition: mission.condition
                }))

            setCompletedMissions(completed)
        } catch (error) {
            console.error('미션 정보 로드 중 오류 발생:', error)
            toast.error('미션 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setMissionsLoading(false)
        }
    }

    const loadReceivedCards = async () => {
        setCardsLoading(true)
        try {
            const cardsJson = localStorage.getItem(`praise_cards_${classId}`)
            const historyJson = localStorage.getItem(`praise_cards_history_${classId}`)

            if (!cardsJson || !historyJson) {
                setReceivedCards([])
                return
            }

            const cards = JSON.parse(cardsJson)
            const histories = JSON.parse(historyJson)

            // 이 학생이 받은 모든 카드 이력 찾기
            const studentHistories = histories.filter((history: any) =>
                history.studentId === studentId
            )

            // 각 이력에 카드 정보를 매핑
            const received = studentHistories.map((history: any) => {
                const card = cards.find((c: any) => c.id === history.cardId)
                return {
                    id: history.id,
                    cardId: history.cardId,
                    cardName: card ? card.name : '알 수 없는 카드',
                    cardDescription: card ? card.description : '',
                    issuedAt: history.issuedAt || Date.now()
                }
            })

            setReceivedCards(received)
        } catch (error) {
            console.error('칭찬카드 정보 로드 중 오류 발생:', error)
            toast.error('칭찬카드 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setCardsLoading(false)
        }
    }

    // 아이콘 변경 함수
    const handleIconChange = (iconType: string) => {
        if (!student) return

        try {
            // 로컬 스토리지에서 클래스 정보 로드
            const classesJson = localStorage.getItem('classes')
            if (!classesJson) return

            const classes = JSON.parse(classesJson)
            const classIndex = classes.findIndex((cls: any) => cls.id === classId)
            if (classIndex === -1) return

            const studentIndex = classes[classIndex].students.findIndex(
                (s: any) => s.id === studentId
            )
            if (studentIndex === -1) return

            // 학생 아이콘 업데이트
            classes[classIndex].students[studentIndex].iconType = iconType

            // 클래스 정보 저장
            localStorage.setItem('classes', JSON.stringify(classes))

            // 로컬 상태 업데이트
            setStudent({
                ...student,
                iconType
            })

            // 아이콘 변경 모달 닫기
            setIsEditingIcon(false)

            toast.success('학생 아이콘이 변경되었습니다.', {
                style: { opacity: 1, backgroundColor: 'white', border: '1px solid #E2E8F0' }
            })
        } catch (error) {
            console.error('아이콘 변경 중 오류 발생:', error)
            toast.error('아이콘을 변경하는 중 오류가 발생했습니다.')
        }
    }

    // 칭호 변경 함수
    const handleHonorificChange = (honorific: string) => {
        if (!student) return

        try {
            // 로컬 스토리지에서 클래스 정보 로드
            const classesJson = localStorage.getItem('classes')
            if (!classesJson) return

            const classes = JSON.parse(classesJson)
            const classIndex = classes.findIndex((cls: any) => cls.id === classId)
            if (classIndex === -1) return

            const studentIndex = classes[classIndex].students.findIndex(
                (s: any) => s.id === studentId
            )
            if (studentIndex === -1) return

            // 학생 칭호 업데이트
            classes[classIndex].students[studentIndex].honorific = honorific

            // 클래스 정보 저장
            localStorage.setItem('classes', JSON.stringify(classes))

            // 로컬 상태 업데이트
            setStudent({
                ...student,
                honorific
            })

            // 칭호 변경 모달 닫기
            setIsEditingHonorific(false)

            toast.success('학생 칭호가 변경되었습니다.', {
                style: { opacity: 1, backgroundColor: 'white', border: '1px solid #E2E8F0' }
            })
        } catch (error) {
            console.error('칭호 변경 중 오류 발생:', error)
            toast.error('칭호를 변경하는 중 오류가 발생했습니다.')
        }
    }

    // 아이콘 렌더링 헬퍼 함수
    const renderIcon = (iconType: string | undefined, size: number = 24) => {
        if (!iconType) {
            return <div className="bg-blue-100 w-full h-full" />
        }

        return (
            <div className="relative w-full h-full">
                <Image
                    src={iconType}
                    alt="학생 아이콘"
                    fill
                    className="object-cover"
                />
            </div>
        )
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

    // 경험치바 계산
    const expPercentage = ((student.stats.exp % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100
    const remainingExp = EXP_PER_LEVEL - (student.stats.exp % EXP_PER_LEVEL)

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-auto">
                {/* 상단 헤더 및 닫기 버튼 */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-700">학생 상세 정보</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 transition"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 좌측: 학생 프로필 정보 */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm p-6">
                            {/* 프로필 섹션 */}
                            <div className="flex flex-col items-center">
                                {/* 프로필 아이콘 */}
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        {renderIcon(student.iconType, 32)}
                                    </div>
                                    <button
                                        onClick={() => setIsEditingIcon(true)}
                                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
                                        title="아이콘 변경"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* 학생 이름 및 기본 정보 */}
                                <h3 className="text-xl font-bold text-blue-800 mb-1">{student.name}</h3>
                                <p className="text-slate-500 mb-2">{student.number}번</p>

                                {/* 칭호 표시 및 수정 버튼 */}
                                <div className="flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full mb-6">
                                    <span className="font-medium">{student.honorific || '칭호 없음'}</span>
                                    <button
                                        onClick={() => setIsEditingHonorific(true)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                        title="칭호 변경"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* 레벨 및 경험치 정보 */}
                                <div className="w-full mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md font-bold">
                                                Lv. {student.stats.level}
                                            </div>
                                        </div>
                                        <span className="text-sm text-slate-600">
                                            {student.stats.exp % EXP_PER_LEVEL} / {EXP_PER_LEVEL} EXP
                                        </span>
                                    </div>

                                    {/* 경험치 진행 바 */}
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                            style={{ width: `${expPercentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1">
                                        다음 레벨까지 {remainingExp} EXP 필요
                                    </div>
                                </div>

                                {/* 포인트 표시 */}
                                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-yellow-800">보유 포인트</span>
                                        <span className="text-xl font-bold text-yellow-600">{student.points || 0} P</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 탭으로 구분된 로드맵, 미션, 칭찬카드 정보 */}
                    <div className="md:col-span-2">
                        {/* 탭 선택 버튼 */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'roadmaps'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('roadmaps')}
                            >
                                성장 로드맵
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'missions'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('missions')}
                            >
                                완료한 미션
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'cards'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('cards')}
                            >
                                받은 칭찬카드
                            </button>
                        </div>

                        {/* 탭 콘텐츠 영역 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 h-[500px] overflow-y-auto">
                            {/* 로드맵 탭 */}
                            {activeTab === 'roadmaps' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">완료한 성장 로드맵</h3>

                                    {roadmapsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">로드맵 데이터 로딩 중...</p>
                                        </div>
                                    ) : completedRoadmaps.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">완료한 로드맵 단계가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {completedRoadmaps.map((item, index) => (
                                                <div
                                                    key={`${item.roadmapId}-${item.stepId}`}
                                                    className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start"
                                                >
                                                    <div className="bg-green-200 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-green-800">{item.roadmapName}</h4>
                                                        <p className="text-sm text-green-700 mt-1">{item.stepGoal}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 미션 탭 */}
                            {activeTab === 'missions' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">완료한 미션</h3>

                                    {missionsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">미션 데이터 로딩 중...</p>
                                        </div>
                                    ) : completedMissions.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">완료한 미션이 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {completedMissions.map((mission) => (
                                                <div
                                                    key={mission.id}
                                                    className="bg-blue-50 border border-blue-100 rounded-lg p-4"
                                                >
                                                    <h4 className="font-medium text-blue-800">{mission.name}</h4>
                                                    <p className="text-sm text-blue-600 mt-1">{mission.condition}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 칭찬카드 탭 */}
                            {activeTab === 'cards' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">받은 칭찬카드</h3>

                                    {cardsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">칭찬카드 데이터 로딩 중...</p>
                                        </div>
                                    ) : receivedCards.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">받은 칭찬카드가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {receivedCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className="bg-purple-50 border border-purple-100 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="bg-purple-200 text-purple-700 p-2 rounded-full mr-3">
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-purple-800">{card.cardName}</h4>
                                                            <p className="text-sm text-purple-600 mt-1">{card.cardDescription}</p>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {new Date(card.issuedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 아이콘 변경 모달 */}
                {isEditingIcon && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-blue-700">아이콘 변경</h3>
                                <button
                                    onClick={() => setIsEditingIcon(false)}
                                    className="p-1 rounded-full hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* 등급 선택 탭 */}
                            <div className="flex border-b border-gray-200 mb-4">
                                {['a', 'b', 'c', 'd'].map((grade) => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGrade(grade as 'a' | 'b' | 'c' | 'd')}
                                        className={`px-4 py-2 font-medium ${selectedGrade === grade
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {grade.toUpperCase()} 등급
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {gradeIcons[selectedGrade].map((iconPath) => (
                                    <button
                                        key={iconPath}
                                        onClick={() => handleIconChange(iconPath)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${student?.iconType === iconPath
                                                ? 'border-blue-500 ring-2 ring-blue-300'
                                                : 'border-transparent hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={iconPath}
                                                alt="아이콘 선택"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => setIsEditingIcon(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md mr-2"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 칭호 변경 모달 */}
                {isEditingHonorific && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-blue-700">칭호 변경</h3>
                                <button
                                    onClick={() => setIsEditingHonorific(false)}
                                    className="p-1 rounded-full hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {honorifics.map((honorific) => (
                                    <button
                                        key={honorific}
                                        onClick={() => handleHonorificChange(honorific)}
                                        className={`py-2 px-3 rounded-lg transition-colors ${student.honorific === honorific
                                                ? 'bg-blue-600 text-white font-medium'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                            }`}
                                    >
                                        {honorific}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => setIsEditingHonorific(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md mr-2"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentDetailModal 