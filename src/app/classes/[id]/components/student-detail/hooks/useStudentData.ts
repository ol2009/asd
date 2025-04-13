'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Student, CompletedChallenge, CompletedMission, ReceivedCard, ChallengeStep } from '../types'

interface UseStudentDataProps {
    studentId: string | null
    classId: string | null
}

interface UseStudentDataReturn {
    student: Student | null
    completedChallenges: CompletedChallenge[]
    completedMissions: CompletedMission[]
    receivedCards: ReceivedCard[]
    purchasedItems: any[]
    challengesLoading: boolean
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
    const [completedChallenges, setCompletedChallenges] = useState<CompletedChallenge[]>([])
    const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([])
    const [receivedCards, setReceivedCards] = useState<ReceivedCard[]>([])
    const [purchasedItems, setPurchasedItems] = useState<any[]>([])

    const [challengesLoading, setChallengesLoading] = useState(true)
    const [missionsLoading, setMissionsLoading] = useState(true)
    const [cardsLoading, setCardsLoading] = useState(true)
    const [pointshopLoading, setPointshopLoading] = useState(true)

    useEffect(() => {
        // studentId나 classId가 없으면 데이터 로드하지 않음
        if (!studentId || !classId) {
            console.log('학생 ID 또는 클래스 ID가 없어 데이터를 로드하지 않습니다', { studentId, classId });
            return;
        }

        // 먼저 학생 정보를 로드
        const loadData = async () => {
            await loadStudentInfo();
            loadCompletedChallenges();
            loadCompletedMissions();
            loadReceivedCards();
            loadPurchasedItems();
        };

        loadData();
    }, [studentId, classId]);

    const loadStudentInfo = async () => {
        try {
            console.log('학생 정보 로드 시작', { studentId, classId });

            if (!studentId || !classId) {
                console.log('유효한 학생 ID 또는 클래스 ID가 없습니다');
                setStudent(null);
                return;
            }

            // 1. 먼저 students_classId에서 학생 정보 찾기 시도
            const savedStudents = localStorage.getItem(`students_${classId}`);
            if (savedStudents) {
                try {
                    const students = JSON.parse(savedStudents);
                    if (Array.isArray(students)) {
                        const foundStudent = students.find(s => s.id && s.id.toString() === studentId.toString());

                        if (foundStudent) {
                            console.log('students_classId에서 학생 찾음', foundStudent);
                            setStudent(foundStudent);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('학생 데이터 파싱 오류:', err);
                }
            }

            // 2. class_classId에서 학생 정보 찾기
            const savedClass = localStorage.getItem(`class_${classId}`);
            if (savedClass) {
                try {
                    const classData = JSON.parse(savedClass);
                    if (classData && Array.isArray(classData.students)) {
                        const foundStudent = classData.students.find(
                            (s: any) => s.id && s.id.toString() === studentId.toString()
                        );

                        if (foundStudent) {
                            console.log('class_classId에서 학생 찾음', foundStudent);
                            setStudent(foundStudent);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('클래스 데이터 파싱 오류:', err);
                }
            }

            // 3. class-classId-students에서 찾기 (하이픈 형식)
            const hyphenStudents = localStorage.getItem(`class-${classId}-students`);
            if (hyphenStudents) {
                try {
                    const students = JSON.parse(hyphenStudents);
                    if (Array.isArray(students)) {
                        const foundStudent = students.find(
                            (s: any) => s.id && s.id.toString() === studentId.toString()
                        );

                        if (foundStudent) {
                            console.log('class-classId-students에서 학생 찾음', foundStudent);
                            setStudent(foundStudent);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('하이픈 형식 학생 데이터 파싱 오류:', err);
                }
            }

            console.log('학생 정보를 찾을 수 없음');
            setStudent(null);
        } catch (error) {
            console.error('학생 정보 로드 중 오류 발생:', error);
            toast.error('학생 정보를 불러오는 중 오류가 발생했습니다.');
            setStudent(null);
        }
    };

    const loadCompletedChallenges = () => {
        setChallengesLoading(true);
        try {
            console.log("챌린지 완료 정보 로드 시작", { studentId, classId });

            // 유효한 studentId가 없으면 빈 배열 반환
            if (!studentId) {
                console.log("유효한 학생 ID가 없습니다");
                setCompletedChallenges([]);
                setChallengesLoading(false);
                return;
            }

            // 1. 먼저 모든 챌린지 목록 가져오기
            const challengesString = localStorage.getItem(`challenges_${classId}`);
            if (!challengesString) {
                console.log("챌린지 데이터가 없습니다");
                setCompletedChallenges([]);
                setChallengesLoading(false);
                return;
            }

            const challenges = JSON.parse(challengesString);
            console.log(`${challenges.length}개의 챌린지 데이터 로드`);

            // 2. 학생이 참여한 챌린지 단계 정보 수집
            const completedChallenges: CompletedChallenge[] = [];
            const currentStudentId = studentId.toString(); // 문자열 확실히

            // 각 챌린지를 확인
            for (const challenge of challenges) {
                const completedSteps: ChallengeStep[] = [];
                let completedStepCount = 0;
                const totalSteps = challenge.steps.length;

                // 각 단계를 확인하여 학생이 완료한 단계 찾기
                for (const step of challenge.steps) {
                    // 챌린지 ID와 스텝 ID를 조합하여 고유한 키 생성
                    // 기존 방식 - 같은 번호의 스텝은 모든 챌린지에서 동일한 키를 사용함
                    // const stepKey = `challenge_${classId}_step_${step.id}_students`;

                    // 새로운 방식 - 챌린지 ID를 포함시켜 고유한 키 생성
                    const stepKey = `challenge_${classId}_${challenge.id}_step_${step.id}_students`;

                    // 이전 방식의 키도 확인 (이전 데이터와의 호환성 유지)
                    const oldStepKey = `challenge_${classId}_step_${step.id}_students`;

                    // 새 키 또는 이전 키로 데이터 로드
                    let studentsInStepString = localStorage.getItem(stepKey);

                    // 새 키에 데이터가 없으면 이전 키도 확인
                    if (!studentsInStepString) {
                        studentsInStepString = localStorage.getItem(oldStepKey);
                        // 이전 키에서 데이터를 찾았다면, 새 키 형식으로 마이그레이션
                        if (studentsInStepString) {
                            console.log(`이전 키 형식 데이터 발견: ${oldStepKey}, 새 키 형식으로 마이그레이션 중: ${stepKey}`);
                            localStorage.setItem(stepKey, studentsInStepString);
                        }
                    }

                    if (studentsInStepString) {
                        try {
                            const studentsInStep = JSON.parse(studentsInStepString);
                            console.log(`스텝 ${step.id} (챌린지 ${challenge.id}) 참여 학생들:`, studentsInStep);

                            // 배열인지 확인하고 현재 학생이 이 단계를 완료했는지 정확히 검증
                            if (Array.isArray(studentsInStep) &&
                                studentsInStep.length > 0 &&
                                studentsInStep.some(id => id.toString() === currentStudentId)) {

                                console.log(`학생 ${currentStudentId}가 챌린지 ${challenge.name}(ID: ${challenge.id})의 단계 ${step.goal} 완료함`);
                                completedStepCount++;
                                completedSteps.push({
                                    id: step.id,
                                    title: `${challenge.name} - ${step.goal}`,
                                    description: step.goal,
                                    completedAt: new Date().toISOString() // 정확한 날짜가 없으므로 현재 날짜 사용
                                });
                            } else {
                                console.log(`학생 ${currentStudentId}는 챌린지 ${challenge.name}(ID: ${challenge.id})의 단계 ${step.goal}를 완료하지 않음`);
                            }
                        } catch (error) {
                            console.error(`스텝 데이터 파싱 오류: ${stepKey}`, error);
                        }
                    } else {
                        console.log(`스텝 데이터 없음: ${stepKey} 및 ${oldStepKey}`);
                    }
                }

                // 모든 단계를 완료했을 때만 챌린지 정보 추가
                if (completedStepCount === totalSteps) {
                    console.log(`챌린지 ${challenge.name}(ID: ${challenge.id})의 모든 단계(${totalSteps}개)를 완료함`);
                    completedChallenges.push({
                        id: challenge.id,
                        title: challenge.name,
                        description: `최종 보상: ${challenge.rewardTitle || '없음'}`,
                        steps: completedSteps,
                        abilities: challenge.abilities,
                        rewards: {
                            exp: 200, // 챌린지 단계당 200 경험치 획득
                            gold: 0
                        },
                        timestamp: new Date().toISOString()
                    });
                } else if (completedStepCount > 0) {
                    // 일부 단계만 완료한 경우에도 챌린지 정보 추가
                    console.log(`챌린지 ${challenge.name}(ID: ${challenge.id})의 일부 단계만 완료(${completedStepCount}/${totalSteps})`);
                    completedChallenges.push({
                        id: challenge.id,
                        title: challenge.name,
                        description: `진행 중: ${completedStepCount}/${totalSteps} 단계 완료`,
                        steps: completedSteps,
                        abilities: challenge.abilities,
                        rewards: {
                            exp: 100, // 일부 완료 시 적은 경험치
                            gold: 0
                        },
                        timestamp: new Date().toISOString()
                    });
                } else {
                    console.log(`챌린지 ${challenge.name}(ID: ${challenge.id})의 단계를 하나도 완료하지 않음`);
                }
            }

            console.log(`${completedChallenges.length}개의 완료된 챌린지 발견`);
            setCompletedChallenges(completedChallenges);
        } catch (error) {
            console.error('챌린지 완료 데이터 로드 중 오류:', error);
            toast.error('챌린지 완료 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setChallengesLoading(false);
        }
    };

    const loadCompletedMissions = () => {
        setMissionsLoading(true);
        try {
            console.log("미션 완료 정보 로드 시작", { studentId, classId });

            // 미션 데이터 가져오기
            const missionsString = localStorage.getItem(`missions_${classId}`);
            if (!missionsString) {
                console.log("미션 데이터가 없습니다");
                setCompletedMissions([]);
                setMissionsLoading(false);
                return;
            }

            // 학생의 완료된 미션(업적) 가져오기
            const missionsAchievementsKey = `mission_achievements_${classId}`;
            const oldAchievementsKey = `achievements_${classId}`;

            let achievementsString = localStorage.getItem(missionsAchievementsKey);
            if (!achievementsString) {
                // 이전 키도 확인
                achievementsString = localStorage.getItem(oldAchievementsKey);
                if (!achievementsString) {
                    console.log("미션 달성 내역이 없습니다");
                    setCompletedMissions([]);
                    setMissionsLoading(false);
                    return;
                }

                // 이전 키에서 데이터를 찾았다면, 새 키 형식으로 마이그레이션
                console.log(`이전 키 형식 데이터 발견: ${oldAchievementsKey}, 새 키 형식으로 마이그레이션 중: ${missionsAchievementsKey}`);
                localStorage.setItem(missionsAchievementsKey, achievementsString);
            }

            const missions = JSON.parse(missionsString);
            const achievements = JSON.parse(achievementsString);

            console.log(`총 ${missions.length}개의 미션, ${achievements.length}개의 미션 달성 내역 로드`);

            // 현재 학생의 업적만 필터링
            const studentAchievements = achievements.filter((achievement: any) =>
                achievement.studentId.toString() === studentId?.toString()
            );

            console.log(`학생 ${studentId}의 미션 달성 내역: ${studentAchievements.length}개 발견`);

            // 업적에 대한 미션 정보 매핑
            const formattedMissions = studentAchievements.map((achievement: any) => {
                const mission = missions.find((m: any) => m.id === achievement.missionId);

                if (mission) {
                    console.log(`미션 정보 매핑: ${mission.name}`);
                } else {
                    console.log(`미션 ID ${achievement.missionId}에 해당하는 미션을 찾을 수 없음`);
                }

                return {
                    id: achievement.missionId,
                    title: mission?.name || '알 수 없는 미션',
                    description: mission?.condition || '알 수 없는 조건',
                    abilities: mission?.abilities || {
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false,
                        health: false,
                        communication: false
                    },
                    rewards: {
                        exp: 100,
                        gold: 0
                    },
                    timestamp: achievement.timestamp
                };
            });

            console.log(`${formattedMissions.length}개의 완료된 미션 정보 매핑 완료`);
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
            console.log("칭찬카드 정보 로드 시작", { studentId, classId });

            // 카드 데이터 가져오기
            const cardsString = localStorage.getItem(`praiseCards_${classId}`);
            if (!cardsString) {
                console.log("칭찬카드 데이터가 없습니다");
                setReceivedCards([]);
                setCardsLoading(false);
                return;
            }

            // 학생이 받은 카드 히스토리 가져오기
            const cardHistoryString = localStorage.getItem(`praiseCardHistory_${classId}`);
            if (!cardHistoryString) {
                console.log("칭찬카드 히스토리가 없습니다");
                setReceivedCards([]);
                setCardsLoading(false);
                return;
            }

            const cards = JSON.parse(cardsString);
            const cardHistory = JSON.parse(cardHistoryString);

            console.log(`총 ${cards.length}개의 카드, ${cardHistory.length}개의 카드 히스토리 로드`);
            console.log('카드 데이터 샘플:', cards[0]);
            console.log('카드 히스토리 샘플:', cardHistory[0]);

            // 현재 학생의 카드 히스토리만 필터링
            const studentCardHistory = cardHistory.filter((history: any) =>
                history.studentId.toString() === studentId?.toString()
            );

            console.log(`학생 ${studentId}의 카드 히스토리: ${studentCardHistory.length}개 발견`);

            // 히스토리에 대한 카드 정보 매핑
            const formattedCards = studentCardHistory.map((history: any) => {
                // cardId와 id를 모두 문자열로 변환하여 비교
                const card = cards.find((c: any) => String(c.id) === String(history.cardId));

                if (card) {
                    console.log(`카드 정보 매핑: ${card.name}`);
                } else {
                    console.log(`카드 ID ${history.cardId}에 해당하는 카드를 찾을 수 없음 (타입: ${typeof history.cardId})`);
                    console.log('사용 가능한 카드 ID 목록:', cards.map((c: any) => ({ id: c.id, type: typeof c.id })));
                }

                return {
                    id: history.id,
                    title: card?.name || '알 수 없는 카드',
                    message: card?.description || '설명 없음',
                    sender: card?.sender || '선생님',
                    abilities: card?.abilities || {
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false,
                        health: false,
                        communication: false
                    },
                    rewards: {
                        exp: 50, // 칭찬카드 획득 시 기본 50 경험치
                        gold: 0
                    },
                    timestamp: history.issuedAt || new Date().toISOString()
                };
            });

            console.log(`${formattedCards.length}개의 받은 칭찬카드 정보 매핑 완료`);
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
            // 1. students_${classId} 저장소 업데이트
            const storedStudents = localStorage.getItem(`students_${classId}`);
            if (storedStudents) {
                const students = JSON.parse(storedStudents);
                const studentIndex = students.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    students[studentIndex].points = points;
                    localStorage.setItem(`students_${classId}`, JSON.stringify(students));
                    console.log(`students_${classId} 포인트 업데이트 완료: ${points}G`);
                }
            }

            // 2. class_${classId} 저장소 업데이트
            const storedClass = localStorage.getItem(`class_${classId}`);
            if (storedClass) {
                const updatedClass = JSON.parse(storedClass);
                const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    // 학생 포인트 업데이트
                    updatedClass.students[studentIndex].points = points;
                    localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));
                    console.log(`class_${classId} 포인트 업데이트 완료: ${points}G`);
                }
            }

            // 3. class-${classId}-students 저장소 업데이트 (하이픈 형식)
            const classStudents = localStorage.getItem(`class-${classId}-students`);
            if (classStudents) {
                const students = JSON.parse(classStudents);
                const studentIndex = students.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    students[studentIndex].points = points;
                    localStorage.setItem(`class-${classId}-students`, JSON.stringify(students));
                    console.log(`class-${classId}-students 포인트 업데이트 완료: ${points}G`);
                }
            }

            // 4. 전역 classes 저장소 업데이트
            const classes = localStorage.getItem('classes');
            if (classes) {
                const allClasses = JSON.parse(classes);
                const classIndex = allClasses.findIndex((c: any) => c.id === classId);

                if (classIndex !== -1) {
                    const studentIndex = allClasses[classIndex].students?.findIndex((s: Student) => s.id === student.id);
                    if (studentIndex !== -1) {
                        allClasses[classIndex].students[studentIndex].points = points;
                        localStorage.setItem('classes', JSON.stringify(allClasses));
                        console.log(`전역 classes 포인트 업데이트 완료: ${points}G`);
                    }
                }
            }

            // 상태 업데이트
            setStudent({ ...student, points });
            console.log(`학생 상태 포인트 업데이트 완료: ${points}G`);
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
        completedChallenges,
        completedMissions,
        receivedCards,
        purchasedItems,
        challengesLoading,
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