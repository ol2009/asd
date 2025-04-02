'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Award, X, Check, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

interface PraiseCard {
    id: number
    name: string
    description: string
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
]

// 학생 아바타 아이콘 렌더링
const renderStudentIcon = (iconType: string) => {
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

// 칭찬카드 부여 기록 인터페이스
interface PraiseCardHistory {
    id: string
    cardId: string
    studentId: string
    issuedAt: string  // 카드 발급 시간
}

// 상수 값을 추가
const EXP_PER_LEVEL = 100 // 레벨업에 필요한 경험치
const EXP_FOR_PRAISE_CARD = 50 // 칭찬 카드 획득 시 획득 경험치
const POINTS_PER_LEVEL = 100 // 레벨업 시 획득 포인트

export default function PraiseCardsPage() {
    const params = useParams()
    const classId = params.id as string
    const [praiseCards, setPraiseCards] = useState<PraiseCard[]>([])
    const [newCard, setNewCard] = useState<{ name: string, description: string }>({ name: '', description: '' })
    const [selectedCard, setSelectedCard] = useState<PraiseCard | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showStudentSelectModal, setShowStudentSelectModal] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [praiseCardHistories, setPraiseCardHistories] = useState<PraiseCardHistory[]>([])

    // 학생 목록 불러오기
    useEffect(() => {
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (savedStudents) {
            try {
                setStudents(JSON.parse(savedStudents))
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error)
                setStudents([])
            }
        }

        // 칭찬카드 부여 기록 불러오기
        const savedHistories = localStorage.getItem(`praiseCardHistories_${classId}`)
        if (savedHistories) {
            try {
                setPraiseCardHistories(JSON.parse(savedHistories))
            } catch (error) {
                console.error('칭찬카드 기록 파싱 오류:', error)
                setPraiseCardHistories([])
            }
        } else {
            setPraiseCardHistories([])
        }
    }, [classId])

    // 칭찬카드 목록 불러오기
    useEffect(() => {
        // 로컬 스토리지에서 칭찬카드 가져오기
        const savedCards = localStorage.getItem(`praiseCards_${classId}`)
        if (savedCards) {
            try {
                setPraiseCards(JSON.parse(savedCards))
            } catch (error) {
                console.error('칭찬카드 데이터 파싱 오류:', error)
                setPraiseCards([])
            }
        } else {
            // 임시 데이터 (처음 방문 시)
            const dummyData: PraiseCard[] = [
                { id: 1, name: '열심히 참여해요', description: '수업에 적극적으로 참여한 학생에게 주는 카드입니다.' },
                { id: 2, name: '과제 완료', description: '모든 과제를 기한 내에 제출한 학생에게 주는 카드입니다.' },
                { id: 3, name: '팀워크 장인', description: '팀 활동에서 협력을 잘한 학생에게 주는 카드입니다.' },
            ]
            setPraiseCards(dummyData)
            localStorage.setItem(`praiseCards_${classId}`, JSON.stringify(dummyData))
        }
    }, [classId])

    // 칭찬카드 추가
    const handleAddCard = () => {
        if (!newCard.name.trim()) return

        const newPraiseCard = {
            id: Date.now(),
            ...newCard
        }

        const updatedCards = [...praiseCards, newPraiseCard]
        setPraiseCards(updatedCards)
        localStorage.setItem(`praiseCards_${classId}`, JSON.stringify(updatedCards))

        setNewCard({ name: '', description: '' })
        setShowAddModal(false)
    }

    // 칭찬카드 선택
    const handleCardClick = (card: PraiseCard) => {
        setSelectedCard(card)
        setShowDetailModal(true)
    }

    // 학생에게 칭찬카드 주기 버튼 클릭
    const handleOpenStudentSelectModal = () => {
        setSelectedStudents([])
        setShowStudentSelectModal(true)
        setShowDetailModal(false)
    }

    // 학생 선택 토글
    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId)
            } else {
                return [...prev, studentId]
            }
        })
    }

    // 칭찬카드 발급 확정
    const handleGiveCard = () => {
        if (!selectedCard || selectedStudents.length === 0) {
            toast.error('카드와 학생을 모두 선택해주세요.')
            return
        }

        const now = new Date().toISOString()

        // 선택된 학생들에게 칭찬 카드 발급
        const newHistoryItems = selectedStudents.map(studentId => {
            const student = students.find(s => s.id === studentId)
            return {
                id: `${Date.now()}_${studentId}`,
                cardId: selectedCard.id.toString(),
                studentId,
                issuedAt: now
            }
        })

        // 카드 발급 이력 업데이트
        const updatedHistory = [...praiseCardHistories, ...newHistoryItems]
        setPraiseCardHistories(updatedHistory)
        localStorage.setItem(`praiseCardHistories_${classId}`, JSON.stringify(updatedHistory))

        // 각 학생에게 경험치 부여
        selectedStudents.forEach(studentId => {
            updateStudentExpAndLevel(studentId, EXP_FOR_PRAISE_CARD)
        })

        // 선택 초기화
        setSelectedStudents([])
        setShowStudentSelectModal(false)
        toast.success(`${selectedStudents.length}명의 학생에게 '${selectedCard.name}' 카드가 발급되었습니다.`)
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

    // 검색어에 맞는 학생만 필터링
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.number.toString().includes(searchTerm)
    )

    return (
        <div className="p-6 min-h-screen" style={{
            backgroundImage: "url('/images/backgrounds/sky-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
        }}>
            {/* 헤더 영역 */}
            <div className="flex flex-col space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-blue-900">칭찬카드 관리</h1>
                <p className="text-slate-600">학급 반 칭찬카드 관리 페이지입니다.</p>
            </div>

            {/* 컨트롤 영역 */}
            <div className="flex justify-end mb-6">
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <PlusCircle className="w-4 h-4 mr-2" /> 칭찬카드 추가
                </Button>
            </div>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {praiseCards.map((card) => (
                    <Card
                        key={card.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-blue-100"
                        onClick={() => handleCardClick(card)}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center text-blue-800">
                                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                                {card.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-slate-600">{card.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 칭찬카드 추가 모달 */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        <h2 className="text-2xl font-bold text-blue-600 mb-6">칭찬카드 추가</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="card-name" className="block text-slate-700 font-medium mb-1">칭찬카드 이름</Label>
                                <Input
                                    id="card-name"
                                    placeholder="칭찬카드 이름을 입력하세요"
                                    value={newCard.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCard({ ...newCard, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <Label htmlFor="card-description" className="block text-slate-700 font-medium mb-1">칭찬카드 설명</Label>
                                <textarea
                                    id="card-description"
                                    placeholder="칭찬카드에 대한 설명을 입력하세요"
                                    value={newCard.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCard({ ...newCard, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowAddModal(false)}
                                className="border-gray-300 text-gray-700"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleAddCard}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                추가
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 칭찬카드 상세 모달 */}
            {showDetailModal && selectedCard && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        <h2 className="text-2xl font-bold text-blue-600 mb-6">칭찬카드 상세</h2>

                        <div className="py-4">
                            <div className="flex items-center mb-4">
                                <Award className="w-6 h-6 mr-2 text-yellow-500" />
                                <h3 className="text-xl font-semibold text-blue-800">{selectedCard.name}</h3>
                            </div>
                            <p className="text-slate-600 mb-6">{selectedCard.description}</p>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowDetailModal(false)}
                                className="border-gray-300 text-gray-700"
                            >
                                닫기
                            </Button>
                            <Button
                                onClick={handleOpenStudentSelectModal}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                칭찬카드 주기
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 학생 선택 모달 */}
            {showStudentSelectModal && selectedCard && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={() => setShowStudentSelectModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>

                        <h2 className="text-2xl font-bold text-blue-600 mb-2">칭찬카드 주기</h2>
                        <p className="text-slate-600 mb-6">
                            <span className="text-blue-800 font-semibold">{selectedCard.name}</span> 칭찬카드를 줄 학생을 선택하세요
                        </p>

                        {/* 검색창 */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="학생 이름이나 번호로 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 py-2 w-full border border-gray-300 rounded"
                            />
                        </div>

                        {/* 학생 선택 목록 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto mb-6">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleStudentSelection(student.id)}
                                        className={`flex items-center p-3 rounded-lg cursor-pointer border transition-colors ${selectedStudents.includes(student.id)
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                                            {renderStudentIcon(student.iconType)}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-gray-500 text-sm">{student.number}번</span>
                                                    <h4 className="font-medium">{student.name}</h4>
                                                </div>
                                                {selectedStudents.includes(student.id) && (
                                                    <Check className="text-blue-500" size={20} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 text-gray-500">
                                    검색 결과가 없습니다
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {selectedStudents.length}명의 학생 선택됨
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowStudentSelectModal(false)}
                                    className="border-gray-300 text-gray-700"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleGiveCard}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    disabled={selectedStudents.length === 0}
                                >
                                    선택한 학생에게 주기
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 