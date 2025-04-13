'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save, LogOut, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import AvatarRenderer from '@/components/Avatar'

// 미션 타입 정의
interface Mission {
    id: string
    name: string
    condition: string
    achievers: string[] // 미션 달성자 ID 목록
    createdAt: string
    abilities?: {
        intelligence?: boolean // 지력
        diligence?: boolean    // 성실성
        creativity?: boolean   // 창의력
        personality?: boolean  // 인성
        health?: boolean       // 체력
        communication?: boolean // 의사소통
    }
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
    abilities?: {
        intelligence?: number
        diligence?: number
        creativity?: number
        personality?: number
        health?: number
        communication?: number
    }
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

interface MissionAchievement {
    studentId: string
    missionId: string
    timestamp: string
}

// 능력치 설명 상수
const abilityDescriptions = {
    intelligence: "지식정보처리 역량. 정보를 수용, 분석하고 새로운 지식으로 재구성하는 힘.",
    diligence: "자기관리 역량과 관련. 자기 주도적으로 목표를 향해 꾸준히 나아갈 줄 아는, 맡은 바를 이행하는 성실한 태도.",
    creativity: "창의적 사고 역량과 심미적 감성 역량이 관련. 문제를 새롭게 바라보고 아름답게 표현하는 능력.",
    personality: "공동체 역량과 관련된 능력. 책임감을 가지고, 타인을 배려하며, 정의롭고 윤리적인 판단을 할 수 있는 능력",
    health: "자기관리 역량과 관련. 건강하고 안전한 삶을 위해 자기 몸을 가꿀 수 있는 능력.",
    communication: "의사소통 역량과 관련. 남의 의견을 경청하고 자신의 의견을 표현할 줄 알며 협력적으로 소통하는 능력."
}

export default function MissionsPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params?.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [missions, setMissions] = useState<Mission[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
    const [isMissionDetailModalOpen, setIsMissionDetailModalOpen] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [isAddAchieverModalOpen, setIsAddAchieverModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [recentAchievements, setRecentAchievements] = useState<MissionAchievement[]>([])
    const [notifications, setNotifications] = useState<{
        id: string;
        type: 'exp' | 'levelup' | 'evolution' | 'points';
        message: string;
        studentId: string;
        expanded: boolean;
        timestamp: number;
    }[]>([])

    // 미션 폼 데이터
    const [formData, setFormData] = useState<{
        name: string,
        condition: string,
        abilities: {
            intelligence: boolean,
            diligence: boolean,
            creativity: boolean,
            personality: boolean,
            health: boolean,
            communication: boolean
        }
    }>({
        name: '',
        condition: '',
        abilities: {
            intelligence: false,
            diligence: false,
            creativity: false,
            personality: false,
            health: false,
            communication: false
        }
    })

    // 학생 아바타 렌더링 함수
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
                // 학생 데이터 파싱
                const parsedStudents = JSON.parse(savedStudents);

                // 학생 ID를 기준으로 중복 제거
                const uniqueStudentsMap = new Map();
                parsedStudents.forEach((student: Student) => {
                    if (!uniqueStudentsMap.has(student.id)) {
                        uniqueStudentsMap.set(student.id, student);
                    }
                });

                // Map에서 중복이 제거된 학생 배열 생성
                const uniqueStudents = Array.from(uniqueStudentsMap.values());
                console.log(`학생 목록 로드: 원본 ${parsedStudents.length}명, 중복 제거 후 ${uniqueStudents.length}명`);

                setStudents(uniqueStudents);
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error)
                setStudents([])
            }
        } else {
            setStudents([])
        }

        // 최근 미션 달성 내역 가져오기
        const savedAchievements = localStorage.getItem(`mission_achievements_${classId}`)
        if (savedAchievements) {
            try {
                setRecentAchievements(JSON.parse(savedAchievements))
            } catch (error) {
                console.error('미션 달성 내역 데이터 파싱 오류:', error)
                setRecentAchievements([])
            }
        } else {
            setRecentAchievements([])
            localStorage.setItem(`mission_achievements_${classId}`, JSON.stringify([]))
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
            condition: '',
            abilities: {
                intelligence: false,
                diligence: false,
                creativity: false,
                personality: false,
                health: false,
                communication: false
            }
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
            createdAt: new Date().toISOString(),
            abilities: formData.abilities
        }

        // 새 미션을 배열의 맨 앞에 추가하여 최신순으로 표시
        const updatedMissions = [newMission, ...missions]
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

        // 학생에게 경험치 부여 및 능력치 증가
        updateStudentExpAndLevel(studentId, EXP_FOR_MISSION, currentMissions[missionIndex].abilities)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`missions_${classId}`, JSON.stringify(currentMissions))

        // 미션 달성 내역에 추가
        const newAchievement: MissionAchievement = {
            studentId,
            missionId,
            timestamp: new Date().toISOString()
        }

        const updatedAchievements = [newAchievement, ...recentAchievements].slice(0, 30) // 최대 30개 항목 유지
        setRecentAchievements(updatedAchievements)
        localStorage.setItem(`mission_achievements_${classId}`, JSON.stringify(updatedAchievements))

        toast.success('미션 달성자로 등록되었습니다.')
        setIsAddAchieverModalOpen(false)
    }

    // 학생의 경험치와 레벨을 업데이트하는 함수
    const updateStudentExpAndLevel = (studentId: string, expToAdd: number, missionAbilities?: {
        intelligence?: boolean
        diligence?: boolean
        creativity?: boolean
        personality?: boolean
        health?: boolean
        communication?: boolean
    }) => {
        try {
            // 학생 정보 가져오기
            const studentsJson = localStorage.getItem(`students_${classId}`);
            if (!studentsJson) {
                console.error('학생 데이터를 찾을 수 없습니다.');
                return;
            }

            const students = JSON.parse(studentsJson);
            const studentIndex = students.findIndex((s: Student) => s.id === studentId);

            if (studentIndex === -1) {
                console.error('해당 학생을 찾을 수 없습니다.');
                return;
            }

            const student = students[studentIndex];
            console.log('업데이트 전 학생 상태:', JSON.stringify(student, null, 2));

            // 현재 레벨과 경험치 기록 (변화 감지용)
            const currentLevel = student.stats.level;
            const currentExp = student.stats.exp;

            // 새로운 경험치 계산
            const newExp = currentExp + expToAdd;

            // 새로운 레벨 계산
            const newLevel = Math.floor(newExp / EXP_PER_LEVEL) + 1;

            // 경험치 업데이트
            student.stats.exp = newExp;
            student.stats.level = newLevel;

            // 학생이 abilities 객체를 가지고 있지 않으면 초기화
            if (!student.abilities) {
                student.abilities = {
                    intelligence: 1,
                    diligence: 1,
                    creativity: 1,
                    personality: 1,
                    health: 1,
                    communication: 1
                };
            }

            // 능력치 증가 (미션에서 선택된 능력치가 있는 경우)
            let abilitiesChanged = false;
            if (missionAbilities) {
                if (missionAbilities.intelligence) {
                    student.abilities.intelligence = (student.abilities.intelligence || 1) + 1;
                    abilitiesChanged = true;
                }
                if (missionAbilities.diligence) {
                    student.abilities.diligence = (student.abilities.diligence || 1) + 1;
                    abilitiesChanged = true;
                }
                if (missionAbilities.creativity) {
                    student.abilities.creativity = (student.abilities.creativity || 1) + 1;
                    abilitiesChanged = true;
                }
                if (missionAbilities.personality) {
                    student.abilities.personality = (student.abilities.personality || 1) + 1;
                    abilitiesChanged = true;
                }
                if (missionAbilities.health) {
                    student.abilities.health = (student.abilities.health || 1) + 1;
                    abilitiesChanged = true;
                }
                if (missionAbilities.communication) {
                    student.abilities.communication = (student.abilities.communication || 1) + 1;
                    abilitiesChanged = true;
                }
            }

            // 레벨업 시 포인트 지급
            if (newLevel > currentLevel) {
                const levelsGained = newLevel - currentLevel;
                const pointsToAdd = levelsGained * POINTS_PER_LEVEL;

                student.points = (student.points || 0) + pointsToAdd;
                console.log(`레벨업! Lv.${currentLevel} -> Lv.${newLevel} (${pointsToAdd} 포인트 지급)`);
            }

            // 학생 아이콘이 없는 경우 기본 아이콘 설정
            if (!student.iconType) {
                student.iconType = '/images/icons/student_icon_1.png';
            }

            console.log('업데이트 후 학생 상태:', JSON.stringify(student, null, 2));

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
                                abilities: student.abilities,
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
                            abilities: student.abilities,
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
                        abilities: student.abilities,
                        points: student.points,
                        iconType: student.iconType
                    };
                }

                return updatedStudents;
            });

            // 알림 메시지 추가
            const baseId = `${student.id}-${Date.now()}`;
            const newNotifications: {
                id: string;
                type: 'exp' | 'levelup' | 'points';
                message: string;
                studentId: string;
                expanded: boolean;
                timestamp: number;
            }[] = [];

            // 경험치 획득 알림
            let expMessage = `${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`;

            // 능력치 증가 정보 추가
            if (abilitiesChanged && missionAbilities) {
                const abilityChanges = [];
                if (missionAbilities.intelligence) abilityChanges.push("지력 +1");
                if (missionAbilities.diligence) abilityChanges.push("성실성 +1");
                if (missionAbilities.creativity) abilityChanges.push("창의력 +1");
                if (missionAbilities.personality) abilityChanges.push("인성 +1");
                if (missionAbilities.health) abilityChanges.push("체력 +1");
                if (missionAbilities.communication) abilityChanges.push("의사소통 +1");

                if (abilityChanges.length > 0) {
                    expMessage += ` (${abilityChanges.join(', ')})`;
                }
            }

            newNotifications.push({
                id: `${baseId}-exp`,
                type: 'exp',
                message: expMessage,
                studentId: student.id,
                expanded: false,
                timestamp: Date.now()
            });

            // 레벨업 발생 시 추가 알림
            if (newLevel > currentLevel) {
                // 레벨업 알림
                newNotifications.push({
                    id: `${baseId}-levelup`,
                    type: 'levelup',
                    message: `${student.name} 학생이 Lv.${currentLevel}에서 Lv.${newLevel}로 레벨업했습니다!`,
                    studentId: student.id,
                    expanded: false,
                    timestamp: Date.now() + 100
                });

                // 포인트 획득 알림
                const levelsGained = newLevel - currentLevel;
                newNotifications.push({
                    id: `${baseId}-points`,
                    type: 'points',
                    message: `${student.name} 학생에게 ${levelsGained * POINTS_PER_LEVEL} 포인트가 지급되었습니다!`,
                    studentId: student.id,
                    expanded: false,
                    timestamp: Date.now() + 200
                });
            }

            // 알림 추가 및 자동 제거 (60초 후)
            setNotifications(prev => {
                const updated = [...prev, ...newNotifications];
                return updated.sort((a, b) => b.timestamp - a.timestamp);
            });

            console.log(`학생 업데이트 완료: Lv.${student.stats.level}, Exp ${student.stats.exp}, 포인트 ${student.points}`);
            if (abilitiesChanged) {
                console.log(`학생 능력치 업데이트: `, student.abilities);
            }
        } catch (error) {
            console.error('학생 경험치 및 레벨 업데이트 중 오류 발생:', error);
        }
    }

    // 알림 확장/축소 토글
    const toggleNotificationExpand = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id
                    ? { ...notif, expanded: !notif.expanded }
                    : notif
            )
        );
    };

    // 알림 삭제
    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // 60초 후 자동으로 알림 제거
    useEffect(() => {
        const now = Date.now();
        const timeouts = notifications.map(notification => {
            const timeLeft = 60000 - (now - notification.timestamp);
            if (timeLeft <= 0) {
                return setTimeout(() => {
                    removeNotification(notification.id);
                }, 0);
            }
            return setTimeout(() => {
                removeNotification(notification.id);
            }, timeLeft);
        });

        return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, [notifications]);

    // 폼 입력값 변경 핸들러
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // 능력치 토글 핸들러
    const handleAbilityToggle = (ability: string) => {
        setFormData(prev => ({
            ...prev,
            abilities: {
                ...prev.abilities,
                [ability]: !prev.abilities[ability as keyof typeof prev.abilities]
            }
        }))
    }

    // handleDeleteMission 함수 수정
    const handleDeleteMission = (missionId: string) => {
        try {
            // 미션 목록에서 현재 미션 제거
            const updatedMissions = missions.filter(mission => mission.id !== missionId);
            setMissions(updatedMissions);

            // 로컬 스토리지 업데이트
            localStorage.setItem(`missions_${classId}`, JSON.stringify(updatedMissions));

            // 모달 닫기
            setIsMissionDetailModalOpen(false);
            setSelectedMission(null);
            setIsDeleteConfirmOpen(false);

            // 성공 메시지
            toast.success('미션이 삭제되었습니다.');
        } catch (error) {
            console.error('미션 삭제 중 오류 발생:', error);
            toast.error('미션 삭제 중 오류가 발생했습니다.');
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">로딩 중...</div>
    }

    return (
        <div className="min-h-screen relative">
            {/* 배경 이미지 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/backgrounds/sky-bg.jpg")' }}></div>

            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-300/30 to-white/20"></div>

            {/* 알림 영역 */}
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm">
                {notifications.length > 0 && (
                    <div className="flex flex-col items-end space-y-2">
                        {notifications.map((notification, index) => {
                            // 알림 타입에 따른 스타일 설정
                            const bgColor = notification.type === 'exp'
                                ? 'bg-green-100 border-green-500'
                                : notification.type === 'levelup'
                                    ? 'bg-blue-100 border-blue-500'
                                    : notification.type === 'evolution'
                                        ? 'bg-purple-100 border-purple-500'
                                        : 'bg-yellow-100 border-yellow-500';

                            const textColor = notification.type === 'exp'
                                ? 'text-green-700'
                                : notification.type === 'levelup'
                                    ? 'text-blue-700'
                                    : notification.type === 'evolution'
                                        ? 'text-purple-700'
                                        : 'text-yellow-700';

                            // 겹쳐보이는 효과 (확장되지 않았을 때)
                            const stackStyle = !notification.expanded && index !== 0
                                ? { marginTop: '-40px', zIndex: notifications.length - index }
                                : { zIndex: notifications.length - index };

                            return (
                                <div
                                    key={notification.id}
                                    className={`border-l-4 rounded-md shadow-md transition-all duration-300 ${bgColor}`}
                                    style={stackStyle}
                                >
                                    <div
                                        className={`flex justify-between items-center p-3 cursor-pointer ${textColor}`}
                                        onClick={() => toggleNotificationExpand(notification.id)}
                                    >
                                        <div className="flex items-center">
                                            {notification.type === 'exp' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {notification.type === 'levelup' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {notification.type === 'evolution' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            )}
                                            {notification.type === 'points' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <div className={`truncate ${notification.expanded ? 'max-w-xs' : 'max-w-[180px]'}`}>
                                                {notification.message}
                                            </div>
                                        </div>
                                        <button
                                            className="ml-2 text-slate-400 hover:text-slate-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
                    <div className="mb-8 bg-white/40 backdrop-blur-sm p-6 rounded-xl shadow-md">
                        <h1 className="text-2xl font-bold text-blue-800">미션 관리</h1>
                        <p className="text-slate-700">학생들의 미션 달성을 관리하고 기록하세요.</p>
                    </div>

                    {/* 메인 콘텐츠 - 그리드로 나눔 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 미션 목록 */}
                        <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-800">미션 목록</h2>
                                <button
                                    onClick={handleOpenAddModal}
                                    className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    새 미션 추가
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {missions.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50/40 backdrop-blur-sm rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-slate-700">아직 등록된 미션이 없습니다.</p>
                                        <p className="text-slate-500 text-sm mt-1">위의 버튼을 눌러 미션을 추가해보세요.</p>
                                    </div>
                                ) : (
                                    // 최신순으로 정렬하여 표시
                                    [...missions]
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .map((mission) => (
                                            <div
                                                key={mission.id}
                                                className="bg-blue-50/40 hover:bg-blue-100/50 border border-blue-100/30 rounded-lg p-5 shadow-sm cursor-pointer transition-shadow"
                                                onClick={() => handleMissionClick(mission)}
                                            >
                                                <div className="flex items-center mb-3">
                                                    <h3 className="font-bold text-blue-700 text-lg flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {mission.name}
                                                    </h3>
                                                </div>
                                                <p className="text-slate-700 text-sm line-clamp-2">{mission.condition}</p>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>

                        {/* 최근 미션 달성 내역 */}
                        <div className="bg-white/30 backdrop-blur-sm rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-blue-800 mb-6">최근 달성 내역</h2>

                            {recentAchievements.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50/40 backdrop-blur-sm rounded-lg">
                                    <p className="text-slate-700">아직 미션 달성 내역이 없습니다.</p>
                                    <p className="text-slate-500 text-sm mt-1">학생들이 미션을 달성하면 이곳에 기록됩니다.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {recentAchievements.map((achievement, idx) => {
                                        const student = students.find(s => s.id === achievement.studentId);
                                        const mission = missions.find(m => m.id === achievement.missionId);

                                        if (!student || !mission) return null;

                                        const date = new Date(achievement.timestamp);
                                        const formattedDate = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;

                                        return (
                                            <div
                                                key={`${achievement.studentId}-${achievement.missionId}-${achievement.timestamp}`}
                                                className="bg-white/60 border border-blue-100/50 rounded-lg p-3 shadow-sm flex items-center"
                                            >
                                                <div className="w-10 h-10 rounded-full overflow-hidden relative bg-blue-50/60 flex-shrink-0">
                                                    {renderStudentAvatar(student)}
                                                </div>
                                                <div className="ml-3 flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-slate-800">{student.name}</span>
                                                            <span className="ml-2 text-xs text-blue-600">{student.honorific}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{formattedDate}</span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className="text-sm text-slate-600 truncate block">
                                                            미션 <span className="font-medium text-blue-700">"{mission.name}"</span> 달성
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 미션 추가 모달 */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                            {/* 닫기 버튼 */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-600">새 미션 추가</h2>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

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

                                    {/* 관련 능력치 선택 */}
                                    <div>
                                        <label className="block text-slate-700 font-medium mb-1">
                                            관련 능력치 선택
                                        </label>
                                        <p className="text-xs text-slate-500 mb-2">학생이 미션을 달성할 때 선택한 능력치가 1씩 증가합니다.</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleAbilityToggle('intelligence')}
                                                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${formData.abilities.intelligence
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-blue-600 border border-blue-200'
                                                    }`}
                                            >
                                                {formData.abilities.intelligence && (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                <span>지력</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAbilityToggle('diligence')}
                                                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${formData.abilities.diligence
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white text-green-600 border border-green-200'
                                                    }`}
                                            >
                                                {formData.abilities.diligence && (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                <span>성실성</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAbilityToggle('creativity')}
                                                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${formData.abilities.creativity
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white text-purple-600 border border-purple-200'
                                                    }`}
                                            >
                                                {formData.abilities.creativity && (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                <span>창의력</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAbilityToggle('personality')}
                                                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${formData.abilities.personality
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-white text-red-600 border border-red-200'
                                                    }`}
                                            >
                                                {formData.abilities.personality && (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                <span>인성</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAbilityToggle('health')}
                                                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${formData.abilities.health
                                                    ? 'bg-yellow-600 text-white'
                                                    : 'bg-white text-yellow-600 border border-yellow-200'
                                                    }`}
                                            >
                                                {formData.abilities.health && (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                <span>체력</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAbilityToggle('communication')}
                                                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg ${formData.abilities.communication
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white text-indigo-600 border border-indigo-200'
                                                    }`}
                                            >
                                                {formData.abilities.communication && (
                                                    <Check className="w-4 h-4 mr-1" />
                                                )}
                                                <span>의사소통</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                        <h4 className="text-xs font-medium text-gray-500 mb-1">선택한 능력치 설명:</h4>
                                        <div className="space-y-2 text-xs text-gray-600">
                                            {formData.abilities.intelligence && (
                                                <p><span className="font-semibold text-blue-600">지력:</span> {abilityDescriptions.intelligence}</p>
                                            )}
                                            {formData.abilities.diligence && (
                                                <p><span className="font-semibold text-green-600">성실성:</span> {abilityDescriptions.diligence}</p>
                                            )}
                                            {formData.abilities.creativity && (
                                                <p><span className="font-semibold text-purple-600">창의력:</span> {abilityDescriptions.creativity}</p>
                                            )}
                                            {formData.abilities.personality && (
                                                <p><span className="font-semibold text-red-600">인성:</span> {abilityDescriptions.personality}</p>
                                            )}
                                            {formData.abilities.health && (
                                                <p><span className="font-semibold text-yellow-600">체력:</span> {abilityDescriptions.health}</p>
                                            )}
                                            {formData.abilities.communication && (
                                                <p><span className="font-semibold text-indigo-600">의사소통:</span> {abilityDescriptions.communication}</p>
                                            )}
                                            {!Object.values(formData.abilities).some(v => v) && (
                                                <p className="italic">능력치를 선택하면 설명이 표시됩니다.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="py-2 px-4 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-md transition flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            미션 저장하기
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 미션 상세 모달 */}
                {isMissionDetailModalOpen && selectedMission && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto relative">
                            {/* 닫기 버튼 */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-blue-600">{selectedMission.name}</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setIsDeleteConfirmOpen(true)}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100/50 transition-colors"
                                        title="미션 삭제"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setIsMissionDetailModalOpen(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* 미션 제목 및 정보 */}
                            <div className="mt-4 mb-6 p-4 bg-blue-50/60 rounded-lg">
                                <h3 className="font-semibold text-blue-700 mb-2">미션 달성 조건</h3>
                                <p className="text-slate-700 whitespace-pre-wrap">{selectedMission.condition}</p>

                                {/* 관련 능력치 표시 */}
                                {selectedMission.abilities && (
                                    Object.keys(selectedMission.abilities).some(key => selectedMission.abilities?.[key as keyof typeof selectedMission.abilities]) && (
                                        <div className="mt-4 flex flex-wrap gap-1">
                                            <span className="text-xs text-gray-500">획득 능력치:</span>
                                            <div className="flex gap-1">
                                                {selectedMission.abilities.intelligence && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">지력 +1</span>
                                                )}
                                                {selectedMission.abilities.diligence && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">성실성 +1</span>
                                                )}
                                                {selectedMission.abilities.creativity && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">창의력 +1</span>
                                                )}
                                                {selectedMission.abilities.personality && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">인성 +1</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* 미션 달성자 섹션 */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        미션 달성자
                                    </h3>
                                    <button
                                        onClick={handleOpenAddAchieverModal}
                                        className="px-3 py-1 bg-blue-100/70 text-blue-700 rounded hover:bg-blue-200/70 transition-colors text-sm flex items-center gap-1"
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
                                                    key={`${selectedMission?.id}-${student.id}-${achieverId}`}
                                                    className="bg-white/60 border border-blue-100/50 rounded-lg p-2 flex items-center shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-blue-50/60">
                                                            {renderStudentAvatar(student)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-blue-600 font-medium">{student.honorific}</span>
                                                            <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                                        </div>
                                                    </div>
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
                                missionId={selectedMission.id}
                                onSubmit={(studentIds) => {
                                    // 모든 학생에 대한 미션 달성 내역 한 번에 생성
                                    const allNewAchievements: MissionAchievement[] = [];

                                    // 모든 학생에 대해 반복
                                    studentIds.forEach(studentId => {
                                        // 미션 달성 내역 생성
                                        const newAchievement: MissionAchievement = {
                                            studentId,
                                            missionId: selectedMission.id,
                                            timestamp: new Date().toISOString()
                                        };
                                        allNewAchievements.push(newAchievement);

                                        // 미션 객체에 학생 추가
                                        const currentMissions = [...missions];
                                        const missionIndex = currentMissions.findIndex(m => m.id === selectedMission.id);

                                        if (missionIndex === -1) return;

                                        // 달성자 목록이 없으면 초기화
                                        if (!currentMissions[missionIndex].achievers) {
                                            currentMissions[missionIndex].achievers = [];
                                        }

                                        // 이미 달성자에 포함되어 있는지 확인
                                        if (currentMissions[missionIndex].achievers?.includes(studentId)) {
                                            console.log(`학생 ${studentId}는 이미 미션 ${selectedMission.id} 달성자입니다.`);
                                            return; // 이 학생은 건너뜀
                                        }

                                        // 달성자에 추가
                                        currentMissions[missionIndex].achievers!.push(studentId);

                                        // 학생에게 경험치 부여 및 능력치 증가
                                        updateStudentExpAndLevel(studentId, EXP_FOR_MISSION, currentMissions[missionIndex].abilities);

                                        // 미션 정보 업데이트
                                        setMissions(currentMissions);
                                        localStorage.setItem(`missions_${classId}`, JSON.stringify(currentMissions));
                                    });

                                    if (allNewAchievements.length > 0) {
                                        // 모든 새 달성 내역을 기존 달성 내역 앞에 추가하고 최대 30개 유지
                                        const updatedAchievements = [...allNewAchievements, ...recentAchievements].slice(0, 30);
                                        setRecentAchievements(updatedAchievements);
                                        localStorage.setItem(`mission_achievements_${classId}`, JSON.stringify(updatedAchievements));

                                        toast.success(`${allNewAchievements.length}명의 학생이 미션 달성자로 등록되었습니다.`);
                                    }

                                    setIsAddAchieverModalOpen(false);
                                }}
                                onCancel={() => setIsAddAchieverModalOpen(false)}
                                renderStudentAvatar={renderStudentAvatar}
                            />
                        </div>
                    </div>
                )}

                {/* 미션 삭제 확인 모달 */}
                {isDeleteConfirmOpen && selectedMission && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-red-600 mb-3">⚠️ 미션 삭제</h3>
                            <p className="text-slate-700 mb-6">
                                <strong>{selectedMission.name}</strong> 미션을 정말 삭제하시겠습니까?
                                이 작업은 되돌릴 수 없습니다.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md mr-2"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => handleDeleteMission(selectedMission.id)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
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

// 달성자 추가 폼 컴포넌트
interface AddAchieverFormProps {
    students: Student[]
    existingAchieverIds: string[]
    missionId: string
    onSubmit: (studentIds: string[]) => void
    onCancel: () => void
    renderStudentAvatar: (student: any) => React.ReactNode
}

function AddAchieverForm({ students, existingAchieverIds, missionId, onSubmit, onCancel, renderStudentAvatar }: AddAchieverFormProps) {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

    // 중복 제거 및 이미 달성자인 학생들 제외
    const uniqueStudentIds = new Set<string>();
    const eligibleStudents = students
        .filter(student => {
            // 중복된 학생 필터링 (같은 ID를 가진 학생은 한 번만 포함)
            if (uniqueStudentIds.has(student.id)) {
                return false;
            }

            // 이미 달성자인 학생 필터링
            if (existingAchieverIds.includes(student.id)) {
                return false;
            }

            uniqueStudentIds.add(student.id);
            return true;
        });

    console.log("중복 제거 후 유효한 학생 수:", eligibleStudents.length);

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
                            {eligibleStudents.map((student) => (
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
                                                {renderStudentAvatar(student)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-blue-600">{student.honorific}</span>
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