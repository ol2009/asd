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

// 성장 몬스터 이미지 경로
const growMonImages = {
    egg: [
        '/images/icons/growmon/egg/egg1.jpg',
        '/images/icons/growmon/egg/egg2.jpg',
        '/images/icons/growmon/egg/egg3.jpg',
        '/images/icons/growmon/egg/egg4.jpg',
    ],
    sogymon: [
        '/images/icons/growmon/sogymon/sogy1.jpg',
        '/images/icons/growmon/sogymon/sogy2_sorogon.jpg',
    ],
    fistmon: [
        '/images/icons/growmon/fistmon/fist1_firefist.jpg',
        '/images/icons/growmon/fistmon/fist2_orafist.jpg',
    ],
    dakomon: [
        '/images/icons/growmon/dakomon/dako1.jpg?v=2',
        '/images/icons/growmon/dakomon/dako2_magicion.jpg',
    ],
    cloudmon: [
        '/images/icons/growmon/cloudmon/cloud1.jpg',
        '/images/icons/growmon/cloudmon/cloud2.jpg',
    ],
}

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

// 레벨에 따른 진화 단계 결정
const getEvolutionStage = (level: number): 'egg' | 'stage1' | 'stage2' => {
    if (level < 1) return 'egg';
    if (level < 5) return 'stage1';
    return 'stage2';
}

// 이미지 경로에서 몬스터 타입 추출
const getMonsterTypeFromPath = (imagePath: string): 'sogymon' | 'fistmon' | 'dakomon' | 'cloudmon' | null => {
    if (imagePath.includes('sogymon')) return 'sogymon';
    if (imagePath.includes('fistmon')) return 'fistmon';
    if (imagePath.includes('dakomon')) return 'dakomon';
    if (imagePath.includes('cloudmon')) return 'cloudmon';
    return null;
}

// 알 이미지에서 랜덤 몬스터 선택
const getRandomMonsterType = (): 'sogymon' | 'fistmon' | 'dakomon' | 'cloudmon' => {
    const types: ('sogymon' | 'fistmon' | 'dakomon' | 'cloudmon')[] = ['sogymon', 'fistmon', 'dakomon', 'cloudmon'];
    return types[Math.floor(Math.random() * types.length)];
}

// 몬스터 진화 처리 함수
const evolveMonster = (student: any, currentLevel: number, newLevel: number): string => {
    const currentIcon = student.iconType || '';
    console.log(`몬스터 진화 체크 - 현재 아이콘: ${currentIcon}`);

    // 현재 진화 단계와 새 진화 단계 확인
    const currentStage = getEvolutionStage(currentLevel);
    const newStage = getEvolutionStage(newLevel);

    console.log(`진화 단계 변화: ${currentStage} -> ${newStage}`);

    // 진화가 필요 없는 경우
    if (currentStage === newStage) {
        return currentIcon;
    }

    // 알에서 1단계 진화 (레벨 0 -> 레벨 1)
    if (currentStage === 'egg' && newStage === 'stage1') {
        const monsterType = getRandomMonsterType();
        const newIcon = growMonImages[monsterType][0]; // 첫 번째 진화 형태
        console.log(`알에서 진화: ${currentIcon} -> ${newIcon} (${monsterType})`);
        return newIcon;
    }

    // 1단계에서 2단계 진화 (레벨 4 -> 레벨 5)
    if (currentStage === 'stage1' && newStage === 'stage2') {
        // 현재 몬스터 타입 확인
        const monsterType = getMonsterTypeFromPath(currentIcon);
        if (!monsterType) {
            console.log('몬스터 타입을 식별할 수 없어 진화할 수 없습니다.');
            return currentIcon;
        }

        const newIcon = growMonImages[monsterType][1]; // 두 번째 진화 형태
        console.log(`2단계 진화: ${currentIcon} -> ${newIcon}`);
        return newIcon;
    }

    return currentIcon;
};

export default function PraiseCardsPage() {
    const params = useParams()
    const router = useRouter()
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

            // 경험치, 레벨, 포인트가 없으면 초기화
            if (!student.stats) {
                student.stats = { level: 0, exp: 0 };
            }
            if (!student.stats.exp) {
                student.stats.exp = 0;
            }
            if (student.stats.level === undefined) {
                student.stats.level = 0;
            }
            if (!student.points) {
                student.points = 0;
            }

            // 현재 레벨과 경험치 기록
            const currentLevel = student.stats.level;
            const currentExp = student.stats.exp;
            console.log(`현재 상태: Lv.${currentLevel}, Exp ${currentExp}, 포인트 ${student.points}`);

            // 요구사항에 맞게 직접 레벨 1 증가
            const newLevel = currentLevel + 1;

            // 경험치 추가 (로직 유지를 위해)
            student.stats.exp += expToAdd;

            // 레벨 설정
            student.stats.level = newLevel;

            // 포인트 지급 (레벨 1당 100포인트)
            student.points += POINTS_PER_LEVEL;

            console.log(`레벨업! Lv.${currentLevel} → Lv.${newLevel}, 포인트 +${POINTS_PER_LEVEL}`);

            // 몬스터 진화 처리
            let evolutionMessage = '';
            const oldIcon = student.iconType;
            const newIcon = evolveMonster(student, currentLevel, newLevel);

            // 아이콘이 변경되었다면 업데이트
            if (oldIcon !== newIcon) {
                student.iconType = newIcon;

                // 진화 메시지 생성
                if (getEvolutionStage(currentLevel) === 'egg') {
                    const monsterType = getMonsterTypeFromPath(newIcon);
                    const monsterNames: Record<string, string> = {
                        'sogymon': '소기몬',
                        'fistmon': '파이어피스트',
                        'dakomon': '다코몬',
                        'cloudmon': '클라우드몬'
                    };
                    evolutionMessage = `${student.name} 학생의 알이 ${monsterNames[monsterType || 'sogymon']}으로 부화했습니다!`;
                } else {
                    const monsterType = getMonsterTypeFromPath(newIcon);
                    const evolvedNames: Record<string, string> = {
                        'sogymon': '소로곤',
                        'fistmon': '오라피스트',
                        'dakomon': '매지션',
                        'cloudmon': '클라우드몬 2단계'
                    };
                    evolutionMessage = `${student.name} 학생의 몬스터가 ${evolvedNames[monsterType || 'sogymon']}으로 진화했습니다!`;
                }
                console.log(`몬스터 진화: ${oldIcon} -> ${newIcon}`);
                console.log(`진화 메시지: ${evolutionMessage}`);
            }

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
                toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`, {
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

                // 진화 메시지 표시 (3초 후)
                if (evolutionMessage) {
                    setTimeout(() => {
                        toast.success(evolutionMessage, {
                            id: `${baseToastId}-evolution`,
                            duration: 4000
                        });
                    }, 3000);
                }
            } else {
                // 경험치만 획득한 경우
                toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`, {
                    id: `exp-${student.id}-${Date.now()}`,
                    duration: 3000
                });
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
                                                                {renderStudentIcon(student.iconType)}
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
                                                    {renderStudentIcon(student.iconType)}
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
                            <h3 className="text-xl font-bold text-slate-800 mb-4">칭찬카드 삭제</h3>
                            <p className="text-slate-600 mb-6">
                                "{selectedCard.name}" 칭찬카드를 정말 삭제하시겠습니까?<br />
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