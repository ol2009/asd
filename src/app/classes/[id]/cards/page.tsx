'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Award, X, Check, Search, ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import AvatarRenderer from '@/components/Avatar'
import { calculateLevelFromExp } from '@/lib/types'

interface PraiseCard {
    id: number
    name: string
    description: string
    abilities?: {
        intelligence?: boolean // 지력
        diligence?: boolean    // 성실성
        creativity?: boolean   // 창의력
        personality?: boolean  // 인성
        health?: boolean       // 체력
        communication?: boolean // 의사소통
    }
}

interface Student {
    id: string
    number: number
    name: string
    title: string
    honorific: string
    stats: {
        level: number
        exp?: number
    }
    iconType: string
    points?: number
}

// 이미지 아이콘 경로
const iconTypes = [
    '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
    '/images/icons/Gemini_Generated_Image_49lajh49lajh49la.jpg',
    '/images/icons/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
    '/images/icons/Gemini_Generated_Image_el7avsel7avsel7a.jpg',
]

// 학생 아바타 렌더링 함수 추가
const renderStudentAvatar = (student: any) => {
    if (student.avatar) {
        return <AvatarRenderer avatar={student.avatar} size={40} />
    } else if (student.iconType) {
        return (
            <div className="relative w-full h-full overflow-hidden rounded-full">
                <Image
                    src={student.iconType.startsWith('/') ? student.iconType : '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg'}
                    alt={student.name}
                    width={40}
                    height={40}
                    className="object-cover"
                />
            </div>
        )
    } else {
        return (
            <div className="relative w-full h-full overflow-hidden rounded-full bg-blue-100">
                <span className="absolute inset-0 flex items-center justify-center text-blue-500 font-bold">
                    {student.name?.charAt(0) || "?"}
                </span>
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
const EXP_FOR_PRAISE_CARD = 50 // 칭찬 카드 획득 시 획득 경험치
const POINTS_PER_LEVEL = 100 // 레벨업 시 획득 포인트

// 능력치 설명
const abilityDescriptions = {
    intelligence: "지식정보처리 역량. 정보를 수용, 분석하고 새로운 지식으로 재구성하는 힘.",
    diligence: "자기관리 역량과 관련. 자기 주도적으로 목표를 향해 꾸준히 나아갈 줄 아는, 맡은 바를 이행하는 성실한 태도.",
    creativity: "창의적 사고 역량과 심미적 감성 역량이 관련. 문제를 새롭게 바라보고 아름답게 표현하는 능력.",
    personality: "공동체 역량과 관련된 능력. 책임감을 가지고, 타인을 배려하며, 정의롭고 윤리적인 판단을 할 수 있는 능력",
    health: "자기관리 역량과 관련. 건강하고 안전한 삶을 위해 자기 몸을 가꿀 수 있는 능력.",
    communication: "의사소통 역량과 관련. 남의 의견을 경청하고 자신의 의견을 표현할 줄 알며 협력적으로 소통하는 능력."
}

export default function PraiseCardsPage() {
    const params = useParams()
    const router = useRouter()
    const classId = params?.id as string
    const [praiseCards, setPraiseCards] = useState<PraiseCard[]>([])
    const [newCard, setNewCard] = useState<{
        name: string,
        description: string,
        abilities: {
            intelligence: boolean,
            diligence: boolean,
            creativity: boolean,
            personality: boolean,
            health: boolean,       // 체력
            communication: boolean  // 의사소통
        }
    }>({
        name: '',
        description: '',
        abilities: {
            intelligence: false,
            diligence: false,
            creativity: false,
            personality: false,
            health: false,       // 체력
            communication: false  // 의사소통
        }
    })
    const [selectedCard, setSelectedCard] = useState<PraiseCard | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showStudentSelectModal, setShowStudentSelectModal] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [selectedStudents, setSelectedStudents] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [praiseCardHistories, setPraiseCardHistories] = useState<PraiseCardHistory[]>([])
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

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
        const savedHistories = localStorage.getItem(`praiseCardHistory_${classId}`)
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
            name: newCard.name,
            description: newCard.description,
            abilities: newCard.abilities
        }

        const updatedCards = [...praiseCards, newPraiseCard]
        setPraiseCards(updatedCards)
        localStorage.setItem(`praiseCards_${classId}`, JSON.stringify(updatedCards))

        setNewCard({
            name: '',
            description: '',
            abilities: {
                intelligence: false,
                diligence: false,
                creativity: false,
                personality: false,
                health: false,       // 체력
                communication: false  // 의사소통
            }
        })
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
        localStorage.setItem(`praiseCardHistory_${classId}`, JSON.stringify(updatedHistory))

        // 각 학생에게 경험치 및 능력치 부여
        selectedStudents.forEach(studentId => {
            updateStudentExpAndLevel(studentId, EXP_FOR_PRAISE_CARD, selectedCard.abilities)
        })

        // 선택 초기화
        setSelectedStudents([])
        setShowStudentSelectModal(false)
        toast.success(`${selectedStudents.length}명의 학생에게 '${selectedCard.name}' 카드가 발급되었습니다.`)
    }

    // 학생의 경험치와 레벨을 업데이트하는 함수
    const updateStudentExpAndLevel = (studentId: string, expToAdd: number, cardAbilities?: {
        intelligence?: boolean // 지력
        diligence?: boolean    // 성실성
        creativity?: boolean   // 창의력
        personality?: boolean  // 인성
        health?: boolean       // 체력
        communication?: boolean // 의사소통
    }) => {
        try {
            console.log(`학생 ID ${studentId}에게 ${expToAdd} 경험치 부여 시작`);

            // 1. students_classId에서 학생 정보 가져오기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (!savedStudents) {
                console.error('학생 데이터를 찾을 수 없습니다.');
                return;
            }

            const students = JSON.parse(savedStudents);
            const studentIndex = students.findIndex((s: Student) => s.id === studentId);

            if (studentIndex === -1) {
                console.error('학생을 찾을 수 없습니다.');
                return;
            }

            // 학생 데이터 업데이트
            const student = students[studentIndex];

            // 학생 데이터 정규화 확인
            if (!student.stats) {
                student.stats = { level: 1, exp: 0 };
            }

            // exp 필드가 숫자인지 확인하고 아니면 초기화
            if (typeof student.stats.exp !== 'number') {
                console.warn('학생의 경험치가 숫자가 아닙니다. 0으로 초기화합니다.', student.stats.exp);
                student.stats.exp = 0;
            }

            // 현재 레벨과 경험치 기록
            const currentLevel = student.stats.level;
            const currentExp = student.stats.exp;
            console.log(`현재 상태: Lv.${currentLevel}, Exp ${currentExp}, 포인트 ${student.points}`);

            // 요구사항에 맞게 직접 레벨 1 증가
            const { level: newLevel } = calculateLevelFromExp(currentExp + expToAdd);

            // 경험치 추가 (로직 유지를 위해)
            student.stats.exp += expToAdd;

            // 레벨 설정
            student.stats.level = newLevel;

            // 능력치 증가 (카드에 선택된 능력치가 있는 경우)
            let abilitiesChanged = false;
            if (cardAbilities) {
                if (cardAbilities.intelligence) {
                    student.stats.abilities.intelligence = (student.stats.abilities.intelligence || 1) + 1;
                    abilitiesChanged = true;
                }
                if (cardAbilities.diligence) {
                    student.stats.abilities.diligence = (student.stats.abilities.diligence || 1) + 1;
                    abilitiesChanged = true;
                }
                if (cardAbilities.creativity) {
                    student.stats.abilities.creativity = (student.stats.abilities.creativity || 1) + 1;
                    abilitiesChanged = true;
                }
                if (cardAbilities.personality) {
                    student.stats.abilities.personality = (student.stats.abilities.personality || 1) + 1;
                    abilitiesChanged = true;
                }
            }

            // 포인트 지급 (레벨 1당 100포인트)
            student.points += POINTS_PER_LEVEL;

            console.log(`레벨업! Lv.${currentLevel} → Lv.${newLevel}, 포인트 +${POINTS_PER_LEVEL}`);

            // 아이콘이 변경되었다면 업데이트
            let newIcon = student.iconType;

            // 1. students_classId 저장소 업데이트
            students[studentIndex] = student;
            localStorage.setItem(`students_${classId}`, JSON.stringify(students));
            console.log('students_classId 저장소 업데이트 완료');

            // 2. classes 저장소 업데이트
            const classesJson = localStorage.getItem('classes');
            if (classesJson) {
                const classes = JSON.parse(classesJson);
                const classIndex = classes.findIndex((c: any) => c.id === classId);

                if (classIndex !== -1) {
                    // 해당 클래스 내의 학생 찾기
                    const classStudents = classes[classIndex].students;

                    if (Array.isArray(classStudents)) {
                        const classStudentIndex = classStudents.findIndex((s: any) => s.id === studentId);

                        if (classStudentIndex !== -1) {
                            // 학생 데이터 업데이트
                            classes[classIndex].students[classStudentIndex] = {
                                ...classes[classIndex].students[classStudentIndex],
                                stats: student.stats,
                                points: student.points,
                                iconType: student.iconType
                            };

                            localStorage.setItem('classes', JSON.stringify(classes));
                            console.log('classes 저장소 업데이트 완료');
                        }
                    }
                }
            }

            // 3. class_classId 저장소 업데이트
            const classJson = localStorage.getItem(`class_${classId}`);
            if (classJson) {
                const classData = JSON.parse(classJson);

                if (classData.students && Array.isArray(classData.students)) {
                    const classStudentIndex = classData.students.findIndex((s: any) => s.id === studentId);

                    if (classStudentIndex !== -1) {
                        // 학생 데이터 업데이트
                        classData.students[classStudentIndex] = {
                            ...classData.students[classStudentIndex],
                            stats: student.stats,
                            points: student.points,
                            iconType: student.iconType
                        };

                        localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                        console.log('class_classId 저장소 업데이트 완료');
                    }
                }
            }

            // 현재 컴포넌트 상태에 반영된 학생 목록도 업데이트
            setStudents(prevStudents => {
                const updatedStudents = [...prevStudents];
                const stateStudentIndex = updatedStudents.findIndex(s => s.id === studentId);

                if (stateStudentIndex !== -1) {
                    updatedStudents[stateStudentIndex] = {
                        ...updatedStudents[stateStudentIndex],
                        stats: student.stats,
                        points: student.points,
                        iconType: student.iconType
                    };
                }

                return updatedStudents;
            });

            // 토스트 메시지 표시
            const baseToastId = `student-${student.id}-${Date.now()}`;

            if (newLevel > currentLevel) {
                // 경험치 획득 메시지 (먼저 표시)
                toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!${abilitiesChanged ? ' (능력치 증가)' : ''}`, {
                    id: `${baseToastId}-exp`,
                    duration: 3000
                });

                // 레벨업 메시지 (1초 후 표시)
                setTimeout(() => {
                    toast.success(`${student.name} 학생이 Lv.${currentLevel}에서 Lv.${newLevel}로 레벨업했습니다!`, {
                        id: `${baseToastId}-level`,
                        duration: 3000
                    });
                }, 1000);

                // 포인트 지급 메시지 (2초 후 표시)
                setTimeout(() => {
                    toast.success(`${student.name} 학생에게 ${POINTS_PER_LEVEL} 포인트가 지급되었습니다!`, {
                        id: `${baseToastId}-points`,
                        duration: 3000
                    });
                }, 2000);

                // 능력치 증가 메시지 (3초 후 표시)
                if (abilitiesChanged) {
                    setTimeout(() => {
                        const abilityTexts = [];
                        if (cardAbilities?.intelligence) abilityTexts.push("지력 +1");
                        if (cardAbilities?.diligence) abilityTexts.push("성실성 +1");
                        if (cardAbilities?.creativity) abilityTexts.push("창의력 +1");
                        if (cardAbilities?.personality) abilityTexts.push("인성 +1");

                        toast.success(
                            <div>
                                <p><strong>{student.name}</strong> 학생의 능력치가 상승했습니다!</p>
                                <p>{abilityTexts.join(', ')}</p>
                            </div>,
                            {
                                id: `${baseToastId}-abilities`,
                                duration: 3000
                            }
                        );
                    }, 3000);
                }
            } else {
                // 경험치만 획득한 경우
                toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`, {
                    id: `exp-${student.id}-${Date.now()}`,
                    duration: 3000
                });

                // 능력치 증가 메시지
                if (abilitiesChanged) {
                    setTimeout(() => {
                        const abilityTexts = [];
                        if (cardAbilities?.intelligence) abilityTexts.push("지력 +1");
                        if (cardAbilities?.diligence) abilityTexts.push("성실성 +1");
                        if (cardAbilities?.creativity) abilityTexts.push("창의력 +1");
                        if (cardAbilities?.personality) abilityTexts.push("인성 +1");

                        toast.success(
                            <div>
                                <p><strong>{student.name}</strong> 학생의 능력치가 상승했습니다!</p>
                                <p>{abilityTexts.join(', ')}</p>
                            </div>,
                            {
                                id: `abilities-${student.id}-${Date.now()}`,
                                duration: 3000
                            }
                        );
                    }, 1000);
                }
            }

            console.log(`학생 업데이트 완료: Lv.${student.stats.level}, Exp ${student.stats.exp}, 포인트 ${student.points}`);
        } catch (error) {
            console.error('학생 데이터 업데이트 오류:', error);
            toast.error('학생 데이터를 업데이트하는 중 오류가 발생했습니다.');
        }
    }

    // 검색어에 맞는 학생만 필터링
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.number.toString().includes(searchTerm)
    )

    // handleDeleteCard 함수 수정
    const handleDeleteCard = (cardId: number) => {
        try {
            // 카드 ID로 카드 데이터 찾기
            const updatedCards = praiseCards.filter(card => card.id !== cardId)
            setPraiseCards(updatedCards)
            localStorage.setItem(`praiseCards_${classId}`, JSON.stringify(updatedCards))

            // 해당 카드와 관련된 발급 기록도 모두 삭제
            const updatedHistories = praiseCardHistories.filter(history => Number(history.cardId) !== cardId)
            setPraiseCardHistories(updatedHistories)
            localStorage.setItem(`praiseCardHistory_${classId}`, JSON.stringify(updatedHistories))

            // 모달 닫기
            setShowDetailModal(false)
            setSelectedCard(null)
            setIsDeleteConfirmOpen(false)

            toast.success('칭찬 카드가 삭제되었습니다.')
        } catch (error) {
            console.error('칭찬 카드 삭제 중 오류 발생:', error)
            toast.error('칭찬 카드 삭제 중 오류가 발생했습니다.')
        }
    }

    // 능력치 토글 핸들러
    const handleAbilityToggle = (ability: string) => {
        setNewCard(prev => ({
            ...prev,
            abilities: {
                ...prev.abilities,
                [ability]: !prev.abilities[ability as keyof typeof prev.abilities]
            }
        }))
    }

    // 능력치 토글 버튼 UI (모달에 표시)
    const renderAbilityToggleButtons = () => (
        <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
                관련 능력치 선택
            </label>
            <p className="text-xs text-gray-500 mb-2">학생이 카드를 받을 때 선택한 능력치가 1씩 증가합니다.</p>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => handleAbilityToggle('intelligence')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${newCard.abilities.intelligence
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-200'
                        }`}
                >
                    {newCard.abilities.intelligence && (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    <span>지력</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleAbilityToggle('diligence')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${newCard.abilities.diligence
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-green-600 border border-green-200'
                        }`}
                >
                    {newCard.abilities.diligence && (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    <span>성실성</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleAbilityToggle('creativity')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${newCard.abilities.creativity
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-200'
                        }`}
                >
                    {newCard.abilities.creativity && (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    <span>창의력</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleAbilityToggle('personality')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${newCard.abilities.personality
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-red-600 border border-red-200'
                        }`}
                >
                    {newCard.abilities.personality && (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    <span>인성</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleAbilityToggle('health')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${newCard.abilities.health
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white text-yellow-600 border border-yellow-200'
                        }`}
                >
                    {newCard.abilities.health && (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    <span>체력</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleAbilityToggle('communication')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${newCard.abilities.communication
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-600 border border-indigo-200'
                        }`}
                >
                    {newCard.abilities.communication && (
                        <Check className="w-4 h-4 mr-1" />
                    )}
                    <span>의사소통</span>
                </button>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 mb-1">선택한 능력치 설명:</h4>
                <div className="space-y-2 text-xs text-gray-600">
                    {newCard.abilities.intelligence && (
                        <p><span className="font-semibold text-blue-600">지력:</span> {abilityDescriptions.intelligence}</p>
                    )}
                    {newCard.abilities.diligence && (
                        <p><span className="font-semibold text-green-600">성실성:</span> {abilityDescriptions.diligence}</p>
                    )}
                    {newCard.abilities.creativity && (
                        <p><span className="font-semibold text-purple-600">창의력:</span> {abilityDescriptions.creativity}</p>
                    )}
                    {newCard.abilities.personality && (
                        <p><span className="font-semibold text-red-600">인성:</span> {abilityDescriptions.personality}</p>
                    )}
                    {newCard.abilities.health && (
                        <p><span className="font-semibold text-yellow-600">체력:</span> {abilityDescriptions.health}</p>
                    )}
                    {newCard.abilities.communication && (
                        <p><span className="font-semibold text-indigo-600">의사소통:</span> {abilityDescriptions.communication}</p>
                    )}
                    {!Object.values(newCard.abilities).some(v => v) && (
                        <p className="italic">능력치를 선택하면 설명이 표시됩니다.</p>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen relative">
            {/* 배경 이미지 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/backgrounds/sky-bg.jpg")' }}></div>

            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-300/30 to-white/20"></div>

            {/* 콘텐츠 영역 */}
            <div className="relative z-10 min-h-screen">
                {/* 헤더 */}
                <div className="bg-blue-500 shadow-md py-4 px-6 flex justify-between items-center text-white">
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

                <div className="container mx-auto py-8 px-4">
                    {/* 페이지 제목과 설명 */}
                    <div className="mb-8 bg-white/40 backdrop-blur-sm p-6 rounded-xl shadow-md">
                        <h1 className="text-2xl font-bold text-blue-800">칭찬카드 관리</h1>
                        <p className="text-slate-700">학생들에게 칭찬카드를 발급하고 관리하세요.</p>

                        {/* 보상 정보 추가 */}
                        <div className="mt-4 flex items-center gap-2 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50">
                            <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="7" />
                                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-700">경험치 +50</span>
                            </div>
                            <div className="w-px h-4 bg-yellow-200/50"></div>
                            <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="8" />
                                    <path d="M12 8v8" />
                                    <path d="M8 12h8" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-700">골드 +50</span>
                            </div>
                        </div>
                    </div>

                    {/* 칭찬카드 목록 */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* 카드 목록 */}
                        <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-800">칭찬카드 종류</h2>
                                <Button onClick={() => setShowAddModal(true)} className="bg-blue-500/80 hover:bg-blue-600/80">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    새 카드 추가
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {praiseCards.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50/40 backdrop-blur-sm rounded-lg">
                                        <Award className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                                        <p className="text-slate-700">아직 등록된 칭찬카드가 없습니다.</p>
                                        <p className="text-slate-500 text-sm mt-1">위의 버튼을 눌러 칭찬카드를 추가해보세요.</p>
                                    </div>
                                ) : (
                                    praiseCards.map((card) => (
                                        <Card
                                            key={card.id}
                                            className="bg-blue-50/40 hover:bg-blue-100/50 border border-blue-100/30 cursor-pointer shadow-sm hover:shadow transition-all"
                                            onClick={() => handleCardClick(card)}
                                        >
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-blue-700 flex items-center">
                                                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                                                    {card.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="text-slate-700">{card.description}</CardDescription>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 최근 발급 내역 */}
                        <div className="bg-white/30 backdrop-blur-sm rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-blue-800 mb-6">최근 발급 내역</h2>

                            {praiseCardHistories.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/40 backdrop-blur-sm rounded-lg">
                                    <p className="text-slate-700">아직 칭찬카드를 발급한 내역이 없습니다.</p>
                                    <p className="text-slate-500 text-sm mt-1">학생들에게 칭찬카드를 발급해보세요.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {praiseCardHistories
                                        .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
                                        .slice(0, 10)
                                        .map(history => {
                                            const card = praiseCards.find(c => c.id.toString() === history.cardId)
                                            const student = students.find(s => s.id === history.studentId)

                                            if (!card || !student) return null

                                            return (
                                                <div key={history.id} className="bg-white/60 rounded-lg p-3 border border-blue-100/50 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-blue-50/60 rounded-full mr-3 overflow-hidden relative">
                                                                {renderStudentAvatar(student)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-blue-800">{student.name}</div>
                                                                <div className="text-xs text-blue-700">{student.honorific}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium text-blue-700">{card.name}</div>
                                                            <div className="text-xs text-slate-500">
                                                                {new Date(history.issuedAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 카드 추가 모달 */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-600">새 칭찬카드 추가</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="card-name">칭찬카드 이름</Label>
                                    <Input
                                        id="card-name"
                                        placeholder="열심히 했어요"
                                        value={newCard.name}
                                        onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="card-desc">설명</Label>
                                    <Input
                                        id="card-desc"
                                        placeholder="열심히 노력한 학생에게 주는 카드입니다."
                                        value={newCard.description}
                                        onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                                    />
                                </div>

                                {renderAbilityToggleButtons()}

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleAddCard}
                                        className="bg-blue-500/80 hover:bg-blue-600/80"
                                        disabled={!newCard.name || !newCard.description}
                                    >
                                        칭찬카드 추가
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 칭찬카드 상세/학생 선택 모달 */}
                {showDetailModal && selectedCard && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto relative">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-blue-600">{selectedCard.name}</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setIsDeleteConfirmOpen(true)}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100/50 transition-colors"
                                        title="칭찬카드 삭제"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 mb-6 p-4 bg-blue-50/60 rounded-lg">
                                <h3 className="font-semibold text-blue-700 mb-2">카드 설명</h3>
                                <p className="text-slate-700 whitespace-pre-wrap">{selectedCard.description}</p>

                                {/* 관련 능력치 표시 */}
                                {selectedCard.abilities && (
                                    Object.keys(selectedCard.abilities).some(key => selectedCard.abilities?.[key as keyof typeof selectedCard.abilities]) && (
                                        <div className="mt-4 flex flex-wrap gap-1">
                                            <span className="text-xs text-gray-500">획득 능력치:</span>
                                            <div className="flex gap-1">
                                                {selectedCard.abilities.intelligence && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">지력 +1</span>
                                                )}
                                                {selectedCard.abilities.diligence && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">성실성 +1</span>
                                                )}
                                                {selectedCard.abilities.creativity && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">창의력 +1</span>
                                                )}
                                                {selectedCard.abilities.personality && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">인성 +1</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleOpenStudentSelectModal}
                                    className="bg-blue-500/80 hover:bg-blue-600/80"
                                >
                                    <Award className="h-4 w-4 mr-2" />
                                    학생에게 카드 주기
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 학생 선택 모달 */}
                {showStudentSelectModal && selectedCard && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-600">학생 선택: {selectedCard.name}</h2>
                                <button
                                    onClick={() => {
                                        setShowStudentSelectModal(false)
                                        setSelectedStudents([])
                                    }}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* 검색창 */}
                            <div className="mb-6 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                <Input
                                    placeholder="학생 이름 검색"
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* 학생 목록 */}
                            <div className="grid gap-2 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                                {students
                                    .filter(student => student.name.includes(searchTerm))
                                    .map(student => (
                                        <div
                                            key={student.id}
                                            className={`
                                                p-3 rounded-lg border flex items-center justify-between cursor-pointer
                                                ${selectedStudents.includes(student.id)
                                                    ? 'bg-blue-50/60 border-blue-200/60'
                                                    : 'bg-white/60 border-slate-200/60 hover:border-blue-200/60'}
                                            `}
                                            onClick={() => toggleStudentSelection(student.id)}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-50/60 rounded-full mr-3 overflow-hidden relative">
                                                    {renderStudentAvatar(student)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-blue-800">{student.name}</div>
                                                    <div className="text-xs text-blue-700">{student.honorific}</div>
                                                </div>
                                            </div>
                                            {selectedStudents.includes(student.id) && (
                                                <Check className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                    ))}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleGiveCard}
                                    className="bg-blue-500/80 hover:bg-blue-600/80"
                                    disabled={selectedStudents.length === 0}
                                >
                                    {selectedStudents.length}명에게 카드 발급하기
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 칭찬카드 삭제 확인 모달 */}
                {isDeleteConfirmOpen && selectedCard && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-red-600 mb-3">⚠️ 칭찬카드 삭제</h3>
                            <p className="text-slate-700 mb-6">
                                &quot;{selectedCard.name}&quot; 칭찬카드를 정말 삭제하시겠습니까?<br />
                                이 작업은 되돌릴 수 없으며, 모든 발급 기록이 함께 삭제됩니다.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => handleDeleteCard(selectedCard.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 