'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Student, CompletedRoadmap, CompletedMission, ReceivedCard } from '../types'

interface UseStudentDataProps {
    studentId: string | null
    classId: string | null
}

interface UseStudentDataReturn {
    student: Student | null
    completedRoadmaps: CompletedRoadmap[]
    completedMissions: CompletedMission[]
    receivedCards: ReceivedCard[]
    purchasedItems: any[]
    roadmapsLoading: boolean
    missionsLoading: boolean
    cardsLoading: boolean
    pointshopLoading: boolean
    updateStudentName: (newName: string) => void
    updateStudentHonorific: (honorific: string) => void
    updateStudentPoints: (points: number) => void
    updateStudentAvatar: (avatarString: string) => boolean
    deleteStudent: () => Promise<boolean>
}

export function useStudentData({ studentId, classId }: UseStudentDataProps): UseStudentDataReturn {
    const [student, setStudent] = useState<Student | null>(null)
    const [completedRoadmaps, setCompletedRoadmaps] = useState<CompletedRoadmap[]>([])
    const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([])
    const [receivedCards, setReceivedCards] = useState<ReceivedCard[]>([])
    const [purchasedItems, setPurchasedItems] = useState<any[]>([])

    const [roadmapsLoading, setRoadmapsLoading] = useState(true)
    const [missionsLoading, setMissionsLoading] = useState(true)
    const [cardsLoading, setCardsLoading] = useState(true)
    const [pointshopLoading, setPointshopLoading] = useState(true)

    useEffect(() => {
        if (!studentId || !classId) return

        loadStudentInfo()
        loadCompletedRoadmaps()
        loadCompletedMissions()
        loadReceivedCards()
        loadPurchasedItems()
    }, [studentId, classId])

    const loadStudentInfo = () => {
        try {
            console.log('학생 정보 로드 시작', { studentId, classId });

            // 1. 먼저 students_classId에서 학생 정보 찾기 시도
            const savedStudents = localStorage.getItem(`students_${classId}`);
            if (savedStudents) {
                const students: Student[] = JSON.parse(savedStudents);
                const foundStudent = students.find(s => s.id === studentId);

                if (foundStudent) {
                    console.log('students_classId에서 학생 찾음', foundStudent);
                    setStudent(foundStudent);
                    return;
                }
            }

            // 2. class_classId에서 학생 정보 찾기
            const savedClass = localStorage.getItem(`class_${classId}`);
            if (savedClass) {
                const classData = JSON.parse(savedClass);
                const foundStudent = classData.students?.find((s: Student) => s.id === studentId);

                if (foundStudent) {
                    console.log('class_classId에서 학생 찾음', foundStudent);
                    setStudent(foundStudent);
                    return;
                }
            }

            console.log('학생 정보를 찾을 수 없음');
        } catch (error) {
            console.error('학생 정보 로드 중 오류 발생:', error);
            toast.error('학생 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    const loadCompletedRoadmaps = () => {
        setRoadmapsLoading(true);
        try {
            // 로드맵 데이터 가져오기
            const roadmapsString = localStorage.getItem(`roadmaps_${classId}`);
            if (!roadmapsString) {
                setCompletedRoadmaps([]);
                return;
            }

            // 학생의 완료된 로드맵 스텝 가져오기
            const completedStepsString = localStorage.getItem(`roadmap_completed_steps_${classId}`);
            if (!completedStepsString) {
                setCompletedRoadmaps([]);
                return;
            }

            const roadmaps = JSON.parse(roadmapsString);
            const completedSteps = JSON.parse(completedStepsString);

            // 현재 학생의 완료된 스텝만 필터링
            const studentCompletedSteps = completedSteps.filter((step: any) => step.studentId === studentId);

            // 완료된 스텝에 대한 로드맵 정보 매핑
            const formattedRoadmaps = studentCompletedSteps.map((completedStep: any) => {
                const roadmap = roadmaps.find((r: any) => r.id === completedStep.roadmapId);
                const step = roadmap?.steps.find((s: any) => s.id === completedStep.stepId);

                return {
                    roadmapId: completedStep.roadmapId,
                    stepId: completedStep.stepId,
                    roadmapName: roadmap ? roadmap.title : '알 수 없는 로드맵',
                    stepGoal: step ? step.goal : '알 수 없는 단계',
                    abilities: step?.abilities || {
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false
                    },
                    rewards: step?.rewards || {
                        exp: 0,
                        gold: 0
                    }
                };
            });

            setCompletedRoadmaps(formattedRoadmaps);
        } catch (error) {
            console.error('로드맵 데이터 로드 중 오류:', error);
            toast.error('로드맵 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setRoadmapsLoading(false);
        }
    };

    const loadCompletedMissions = () => {
        setMissionsLoading(true);
        try {
            // 미션 데이터 가져오기
            const missionsString = localStorage.getItem(`missions_${classId}`);
            if (!missionsString) {
                setCompletedMissions([]);
                return;
            }

            // 학생의 완료된 미션(업적) 가져오기
            const achievementsString = localStorage.getItem(`achievements_${classId}`);
            if (!achievementsString) {
                setCompletedMissions([]);
                return;
            }

            const missions = JSON.parse(missionsString);
            const achievements = JSON.parse(achievementsString);

            // 현재 학생의 업적만 필터링
            const studentAchievements = achievements.filter((achievement: any) => achievement.studentId === studentId);

            // 업적에 대한 미션 정보 매핑
            const formattedMissions = studentAchievements.map((achievement: any) => {
                const mission = missions.find((m: any) => m.id === achievement.missionId);

                return {
                    id: achievement.id,
                    name: mission?.name || '알 수 없는 미션',
                    condition: mission?.condition || '알 수 없는 조건',
                    timestamp: achievement.timestamp,
                    abilities: mission?.abilities || {
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false
                    },
                    rewards: mission?.rewards || {
                        exp: 0,
                        gold: 0
                    }
                };
            });

            setCompletedMissions(formattedMissions);
        } catch (error) {
            console.error('미션 데이터 로드 중 오류:', error);
            toast.error('미션 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setMissionsLoading(false);
        }
    };

    const loadReceivedCards = () => {
        setCardsLoading(true);
        try {
            // 카드 데이터 가져오기
            const cardsString = localStorage.getItem(`cards_${classId}`);
            if (!cardsString) {
                setReceivedCards([]);
                return;
            }

            // 학생이 받은 카드 히스토리 가져오기
            const cardHistoryString = localStorage.getItem(`card_history_${classId}`);
            if (!cardHistoryString) {
                setReceivedCards([]);
                return;
            }

            const cards = JSON.parse(cardsString);
            const cardHistory = JSON.parse(cardHistoryString);

            // 현재 학생의 카드 히스토리만 필터링
            const studentCardHistory = cardHistory.filter((history: any) => history.studentId === studentId);

            // 히스토리에 대한 카드 정보 매핑
            const formattedCards = studentCardHistory.map((history: any) => {
                const card = cards.find((c: any) => c.id === history.cardId);

                return {
                    id: history.id,
                    cardId: history.cardId,
                    cardName: card?.name || '알 수 없는 카드',
                    cardDescription: card?.description || '설명 없음',
                    issuedAt: history.issuedAt,
                    abilities: card?.abilities || {
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false
                    },
                    rewards: card?.rewards || {
                        exp: 0,
                        gold: 0
                    }
                };
            });

            setReceivedCards(formattedCards);
        } catch (error) {
            console.error('카드 데이터 로드 중 오류:', error);
            toast.error('카드 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setCardsLoading(false);
        }
    };

    const loadPurchasedItems = () => {
        setPointshopLoading(true);
        try {
            // 구매 내역 가져오기
            const savedPurchases = localStorage.getItem(`pointshop_purchases_${classId}_${studentId}`);
            if (savedPurchases) {
                setPurchasedItems(JSON.parse(savedPurchases));
            } else {
                setPurchasedItems([]);
            }
        } catch (error) {
            console.error('골드 상점 데이터 로드 중 오류:', error);
        } finally {
            setPointshopLoading(false);
        }
    };

    const updateStudentName = (newName: string) => {
        if (!student || !classId) return;

        try {
            // 기존 학생 데이터 가져오기
            const storedClass = localStorage.getItem(`class_${classId}`);
            if (!storedClass) return;

            const updatedClass = JSON.parse(storedClass);
            const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === student.id);

            if (studentIndex !== -1) {
                // 학생 이름 업데이트
                updatedClass.students[studentIndex].name = newName;
                localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));

                // 상태 업데이트
                setStudent({ ...student, name: newName });

                // 성공 메시지 표시
                toast.success("학생 이름이 변경되었습니다.");
            }
        } catch (error) {
            console.error('학생 이름 변경 중 오류:', error);
            toast.error('학생 이름을 변경하는 중 오류가 발생했습니다.');
        }
    };

    const updateStudentHonorific = (honorific: string) => {
        if (!student || !classId) return;

        try {
            // 로컬 스토리지에서 클래스 정보 가져오기
            const storedClass = localStorage.getItem(`class_${classId}`);
            if (!storedClass) return;

            const updatedClass = JSON.parse(storedClass);
            const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === student.id);

            if (studentIndex !== -1) {
                // 학생 칭호 업데이트
                updatedClass.students[studentIndex].honorific = honorific;
                localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));

                // 상태 업데이트
                setStudent({ ...student, honorific });

                // 성공 메시지 표시
                toast.success("학생 칭호가 변경되었습니다.");
            }
        } catch (error) {
            console.error('학생 칭호 변경 중 오류:', error);
            toast.error('학생 칭호를 변경하는 중 오류가 발생했습니다.');
        }
    };

    const updateStudentPoints = (points: number) => {
        if (!student || !classId) return;

        try {
            // 로컬 스토리지에서 클래스 정보 가져오기
            const storedClass = localStorage.getItem(`class_${classId}`);
            if (!storedClass) return;

            const updatedClass = JSON.parse(storedClass);
            const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === student.id);

            if (studentIndex !== -1) {
                // 학생 포인트 업데이트
                updatedClass.students[studentIndex].points = points;
                localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));

                // 상태 업데이트
                setStudent({ ...student, points });
            }
        } catch (error) {
            console.error('학생 포인트 업데이트 중 오류:', error);
            toast.error('포인트를 업데이트하는 중 오류가 발생했습니다.');
        }
    };

    const updateStudentAvatar = (avatarString: string): boolean => {
        if (!student || !classId) return false;

        try {
            console.log('아바타 업데이트 시작:', { studentId, avatarString });

            // 1. 먼저 students_${classId} 업데이트
            const storedStudents = localStorage.getItem(`students_${classId}`);
            if (storedStudents) {
                const students = JSON.parse(storedStudents);
                const studentIndex = students.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    students[studentIndex].avatar = avatarString;
                    localStorage.setItem(`students_${classId}`, JSON.stringify(students));
                    console.log('students_${classId} 업데이트 완료');
                }
            }

            // 2. class_${classId} 업데이트
            const storedClass = localStorage.getItem(`class_${classId}`);
            if (storedClass) {
                const classData = JSON.parse(storedClass);
                const studentIndex = classData.students?.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    classData.students[studentIndex].avatar = avatarString;
                    localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                    console.log('class_${classId} 업데이트 완료');
                }
            }

            // 3. class-${classId}-students 업데이트 (하이픈 형식)
            const classStudents = localStorage.getItem(`class-${classId}-students`);
            if (classStudents) {
                const students = JSON.parse(classStudents);
                const studentIndex = students.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    students[studentIndex].avatar = avatarString;
                    localStorage.setItem(`class-${classId}-students`, JSON.stringify(students));
                    console.log('class-${classId}-students 업데이트 완료');
                }
            }

            // 4. 전역 classes 업데이트
            const classes = localStorage.getItem('classes');
            if (classes) {
                const allClasses = JSON.parse(classes);
                const classIndex = allClasses.findIndex((c: any) => c.id === classId);

                if (classIndex !== -1) {
                    const studentIndex = allClasses[classIndex].students?.findIndex((s: Student) => s.id === student.id);
                    if (studentIndex !== -1) {
                        allClasses[classIndex].students[studentIndex].avatar = avatarString;
                        localStorage.setItem('classes', JSON.stringify(allClasses));
                        console.log('전역 classes 업데이트 완료');
                    }
                }
            }

            // 5. 학생 상태 업데이트 (동기적으로 수행)
            if (student) {
                setStudent({
                    ...student,
                    avatar: avatarString as any // 기존 avatar 타입과 호환되지 않는 문제를 any 타입으로 우회
                });
                console.log('학생 상태 업데이트 완료');
            }

            return true;
        } catch (error) {
            console.error('학생 아바타 업데이트 중 오류:', error);
            toast.error('아바타를 업데이트하는 중 오류가 발생했습니다.');
            return false;
        }
    };

    const deleteStudent = async (): Promise<boolean> => {
        if (!student || !classId) return false;

        try {
            // 학생 목록 가져오기
            const savedStudents = localStorage.getItem(`students_${classId}`);
            if (!savedStudents) {
                toast.error('학생 데이터를 찾을 수 없습니다.');
                return false;
            }

            let students: Student[] = JSON.parse(savedStudents);

            // 해당 학생 제거
            const updatedStudents = students.filter(s => s.id !== student.id);

            // 로컬 스토리지에 저장
            localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents));

            // 클래스 데이터에도 학생 정보 업데이트
            const classData = localStorage.getItem(`class_${classId}`);
            if (classData) {
                const classObj = JSON.parse(classData);
                classObj.students = updatedStudents;
                localStorage.setItem(`class_${classId}`, JSON.stringify(classObj));
            }

            // classes 데이터에도 학생 정보 업데이트
            const classes = localStorage.getItem('classes');
            if (classes) {
                const allClasses = JSON.parse(classes);
                const classIndex = allClasses.findIndex((c: any) => c.id === classId);

                if (classIndex !== -1) {
                    allClasses[classIndex].students = updatedStudents;
                    localStorage.setItem('classes', JSON.stringify(allClasses));
                }
            }

            toast.success(`${student.name} 학생이 삭제되었습니다.`);
            return true;
        } catch (error) {
            console.error('학생 삭제 중 오류 발생:', error);
            toast.error('학생 삭제 중 오류가 발생했습니다.');
            return false;
        }
    };

    return {
        student,
        completedRoadmaps,
        completedMissions,
        receivedCards,
        purchasedItems,
        roadmapsLoading,
        missionsLoading,
        cardsLoading,
        pointshopLoading,
        updateStudentName,
        updateStudentHonorific,
        updateStudentPoints,
        updateStudentAvatar,
        deleteStudent
    };
} 