'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

// 미션 타입 정의
interface Mission {
    id: string
    name: string
    condition: string
    achievers: string[] // 미션 달성자 ID 목록
    createdAt: string
}

// 학생 타입 정의
interface Student {
    id: string
    name: string
    number: string
    honorific: string
    iconType: string
    stats: {
        exp: number
        level: number
    }
    points: number
}

// 클래스 정보 타입 정의
interface ClassInfo {
    id: string
    name: string
    grade: string
    classNumber: string
}

// 상수 값을 추가
const EXP_PER_LEVEL = 100 // 레벨업에 필요한 경험치
const EXP_FOR_MISSION = 100 // 미션 완료 시 획득 경험치
const POINTS_PER_LEVEL = 100 // 레벨업 시 획득 포인트

export default function MissionsPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [missions, setMissions] = useState<Mission[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
    const [isMissionDetailModalOpen, setIsMissionDetailModalOpen] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [isAddAchieverModalOpen, setIsAddAchieverModalOpen] = useState(false)

    // 미션 폼 데이터
    const [formData, setFormData] = useState({
        name: '',
        condition: ''
    })

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

        // 미션 목록 가져오기
        const savedMissions = localStorage.getItem(`missions_${classId}`)
        if (savedMissions) {
            try {
                setMissions(JSON.parse(savedMissions))
            } catch (error) {
                console.error('미션 데이터 파싱 오류:', error)
                setMissions([])
            }
        } else {
            setMissions([])
            localStorage.setItem(`missions_${classId}`, JSON.stringify([]))
        }

        // 학생 목록 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (savedStudents) {
            try {
                setStudents(JSON.parse(savedStudents))
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error)
                setStudents([])
            }
        }

        setIsLoading(false)
    }, [classId, router])

    // 미션 클릭 핸들러
    const handleMissionClick = (mission: Mission) => {
        setSelectedMission(mission)
        setIsMissionDetailModalOpen(true)
    }

    // 미션 추가 모달 열기
    const handleOpenAddModal = () => {
        setFormData({
            name: '',
            condition: ''
        })
        setIsAddModalOpen(true)
    }

    // 미션 추가 처리
    const handleAddMission = (e: React.FormEvent) => {
        e.preventDefault()

        const newMission: Mission = {
            id: Date.now().toString(),
            name: formData.name,
            condition: formData.condition,
            achievers: [],
            createdAt: new Date().toISOString()
        }

        const updatedMissions = [...missions, newMission]
        setMissions(updatedMissions)
        localStorage.setItem(`missions_${classId}`, JSON.stringify(updatedMissions))

        setIsAddModalOpen(false)
        toast.success('새 미션이 추가되었습니다')
    }

    // 달성자 추가 모달 열기
    const handleOpenAddAchieverModal = () => {
        setIsAddAchieverModalOpen(true)
    }

    // 달성자 추가 처리
    const handleAddAchiever = (missionId: string, studentId: string) => {
        const currentMissions = [...missions]
        const missionIndex = currentMissions.findIndex(m => m.id === missionId)

        if (missionIndex === -1) return

        // 이미 달성자에 포함되어 있는지 확인
        if (currentMissions[missionIndex].achievers?.includes(studentId)) {
            toast.info('이미 미션을 달성한 학생입니다.')
            return
        }

        // 달성자 목록이 없으면 초기화
        if (!currentMissions[missionIndex].achievers) {
            currentMissions[missionIndex].achievers = []
        }

        // 달성자에 추가
        currentMissions[missionIndex].achievers!.push(studentId)
        setMissions(currentMissions)

        // 학생에게 경험치 부여
        updateStudentExpAndLevel(studentId, EXP_FOR_MISSION)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`missions_${classId}`, JSON.stringify(currentMissions))
        toast.success('미션 달성자로 등록되었습니다.')
        setIsAddAchieverModalOpen(false)
    }

    // 학생의 경험치와 레벨을 업데이트하는 함수
    const updateStudentExpAndLevel = (studentId: string, expToAdd: number) => {
        // 학생 목록 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (!savedStudents) return

        try {
            const students = JSON.parse(savedStudents)
            const studentIndex = students.findIndex((s: Student) => s.id === studentId)

            if (studentIndex === -1) return

            // 학생 데이터 업데이트
            const student = students[studentIndex]

            // 경험치가 없으면 초기화
            if (!student.stats.exp) {
                student.stats.exp = 0
            }

            // 포인트가 없으면 초기화
            if (!student.points) {
                student.points = 0
            }

            // 현재 레벨
            const currentLevel = student.stats.level

            // 경험치 추가
            student.stats.exp += expToAdd

            // 레벨업 계산
            const newLevel = Math.floor(student.stats.exp / EXP_PER_LEVEL) + 1

            // 학생 데이터 저장 (먼저 저장하여 UI 상태 업데이트)
            students[studentIndex] = student
            localStorage.setItem(`students_${classId}`, JSON.stringify(students))

            // 현재 컴포넌트 상태에 반영된 학생 목록도 업데이트
            setStudents(students)

            // 레벨업이 발생했는지 확인
            if (newLevel > currentLevel) {
                // 레벨 업데이트
                student.stats.level = newLevel

                // 레벨업 시 포인트 지급
                const levelsGained = newLevel - currentLevel
                student.points += levelsGained * POINTS_PER_LEVEL

                // 경험치 획득 메시지 (먼저 표시)
                const baseToastId = `student-${student.id}-${Date.now()}`;
                toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`, {
                    id: `${baseToastId}-exp`,
                    duration: 3000,
                    style: {
                        opacity: 1,
                        backgroundColor: '#fff',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }
                });

                // 레벨업 메시지 (1초 후 표시)
                setTimeout(() => {
                    toast.success(`${student.name} 학생이 Lv.${currentLevel}에서 Lv.${newLevel}로 레벨업했습니다!`, {
                        id: `${baseToastId}-level`,
                        duration: 3000,
                        style: {
                            opacity: 1,
                            backgroundColor: '#fff',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }
                    });
                }, 1000);

                // 포인트 지급 메시지 (2초 후 표시)
                setTimeout(() => {
                    toast.success(`${student.name} 학생에게 ${levelsGained * POINTS_PER_LEVEL} 포인트가 지급되었습니다!`, {
                        id: `${baseToastId}-points`,
                        duration: 3000,
                        style: {
                            opacity: 1,
                            backgroundColor: '#fff',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }
                    });
                }, 2000);
            } else {
                // 경험치만 획득한 경우
                toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`, {
                    id: `exp-${student.id}-${Date.now()}`,
                    duration: 3000,
                    style: {
                        opacity: 1,
                        backgroundColor: '#fff',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }
                });
            }
        } catch (error) {
            console.error('학생 데이터 업데이트 오류:', error)
            toast.error('학생 데이터를 업데이트하는 중 오류가 발생했습니다.')
        }
    }

    // 달성자 제거 처리
    const handleRemoveAchiever = (studentId: string) => {
        if (!selectedMission) return

        const updatedAchievers = selectedMission.achievers.filter(id => id !== studentId)
        const updatedMission = {
            ...selectedMission,
            achievers: updatedAchievers
        }

        // 미션 목록 업데이트
        const updatedMissions = missions.map(mission =>
            mission.id === selectedMission.id ? updatedMission : mission
        )

        setMissions(updatedMissions)
        setSelectedMission(updatedMission)
        localStorage.setItem(`missions_${classId}`, JSON.stringify(updatedMissions))

        toast.success('미션 달성자가 제거되었습니다')
    }

    // 폼 입력값 변경 핸들러
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Link href={`/classes/${classId}`} className="flex items-center text-blue-600 hover:underline mb-4">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            학급 페이지로
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800">미션 관리</h1>
                        {classInfo && (
                            <p className="text-slate-600 mt-1">
                                {classInfo.grade}학년 {classInfo.classNumber}반 미션 관리 페이지입니다.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        새 미션 추가
                    </button>
                </div>

                {/* 미션 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {missions.length > 0 ? (
                        missions.map((mission) => (
                            <div
                                key={mission.id}
                                className="bg-white rounded-lg shadow-md p-5 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleMissionClick(mission)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-blue-700 text-lg">{mission.name}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        달성자 {mission.achievers.length}명
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-2">{mission.condition}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-slate-500">
                            등록된 미션이 없습니다. 새 미션을 추가해보세요.
                        </div>
                    )}
                </div>

                {/* 미션 추가 모달 */}
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

                            <h2 className="text-2xl font-bold text-blue-600 mb-6">새 미션 추가</h2>

                            <form onSubmit={handleAddMission}>
                                <div className="space-y-6">
                                    {/* 미션 이름 */}
                                    <div>
                                        <label htmlFor="name" className="block text-slate-700 font-medium mb-1">미션 이름</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="예: 시험 100점 맞기, 발표 완벽하게 하기 등"
                                            required
                                        />
                                    </div>

                                    {/* 미션 달성 조건 */}
                                    <div>
                                        <label htmlFor="condition" className="block text-slate-700 font-medium mb-1">미션 달성 조건</label>
                                        <textarea
                                            id="condition"
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleFormChange}
                                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                                            placeholder="미션 달성을 위한 조건을 입력하세요."
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md mt-6 transition flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        미션 저장하기
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 미션 상세 모달 */}
                {isMissionDetailModalOpen && selectedMission && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto relative">
                            {/* 닫기 버튼 */}
                            <button
                                onClick={() => setIsMissionDetailModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>

                            {/* 미션 제목 및 정보 */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-blue-600">{selectedMission.name}</h2>
                                <div className="mt-4 mb-6 p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-semibold text-blue-700 mb-2">미션 달성 조건</h3>
                                    <p className="text-slate-700 whitespace-pre-wrap">{selectedMission.condition}</p>
                                </div>
                            </div>

                            {/* 미션 달성자 섹션 */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        미션 달성자
                                        {selectedMission.achievers.length > 0 && (
                                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                                {selectedMission.achievers.length}명
                                            </span>
                                        )}
                                    </h3>
                                    <button
                                        onClick={handleOpenAddAchieverModal}
                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        달성자 추가
                                    </button>
                                </div>

                                {/* 달성자 목록 */}
                                {selectedMission.achievers.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedMission.achievers.map(achieverId => {
                                            const student = students.find(s => s.id === achieverId)
                                            return student ? (
                                                <div
                                                    key={student.id}
                                                    className="bg-white border border-blue-100 rounded-lg p-2 flex items-center justify-between shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-blue-50">
                                                            <Image
                                                                src={student.iconType.startsWith('/') ? student.iconType : '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg'}
                                                                alt={student.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-blue-600 font-medium">{student.honorific || '초보자'}</span>
                                                            <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveAchiever(student.id)
                                                        }}
                                                        className="text-red-500 hover:text-red-600 p-1"
                                                        title="달성자 제거"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : null
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm italic py-4 text-center">
                                        아직 미션을 달성한 학생이 없습니다.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 달성자 추가 모달 */}
                {isAddAchieverModalOpen && selectedMission && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                            <button
                                onClick={() => setIsAddAchieverModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>

                            <h2 className="text-xl font-bold text-blue-600 mb-4">
                                미션 달성자 추가
                            </h2>

                            <AddAchieverForm
                                students={students}
                                existingAchieverIds={selectedMission.achievers}
                                onSubmit={(studentIds) => {
                                    studentIds.forEach(studentId => handleAddAchiever(selectedMission.id, studentId))
                                }}
                                onCancel={() => setIsAddAchieverModalOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// 달성자 추가 폼 컴포넌트
interface AddAchieverFormProps {
    students: Student[]
    existingAchieverIds: string[]
    onSubmit: (studentIds: string[]) => void
    onCancel: () => void
}

function AddAchieverForm({ students, existingAchieverIds, onSubmit, onCancel }: AddAchieverFormProps) {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

    // 이미 달성자인 학생들 제외
    const eligibleStudents = students.filter(student => !existingAchieverIds.includes(student.id))

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
                    <p className="text-sm text-slate-500 mt-1">모든 학생이 이미 미션을 달성했습니다.</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <p className="mb-2 text-sm text-slate-600">미션을 달성한 학생을 선택하세요</p>
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
                                        <div className="flex items-center gap-2 flex-1">
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
                                                <span className="text-xs text-blue-600">{student.honorific || '초보자'}</span>
                                                <span className="text-sm font-medium text-slate-800">{student.name}</span>
                                            </div>
                                        </div>
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