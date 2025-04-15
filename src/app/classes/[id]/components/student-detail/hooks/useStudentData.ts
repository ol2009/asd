'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Student, CompletedChallenge, CompletedMission, ReceivedCard, ChallengeStep } from '../types'
import { calculateLevelFromExp } from '@/lib/types'

// 학생 능력치 인터페이스
interface StudentAbilities {
    intelligence?: boolean
    diligence?: boolean
    creativity?: boolean
    personality?: boolean
    health?: boolean
    communication?: boolean
}

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
    updateStudentExpAndLevel: (studentId: string, expToAdd: number, abilities?: StudentAbilities, goldToAdd?: number) => Student | null
}

// 상수 값을 훅 내부에서 사용할 수 있도록 추가
const POINTS_PER_LEVEL = 100; // 레벨업 시 획득 포인트

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

            // 챌린지 단계 관련 모든 키를 로깅하여 디버깅에 도움이 되도록 함
            console.log('학생 ID:', currentStudentId);

            // 모든 키 형식을 로깅하여 어떤 형식이 사용되고 있는지 확인
            const allKeys = Object.keys(localStorage).filter(key =>
                key.includes(`challenge_${classId}`) ||
                key.includes(`challenge_step_${classId}`)
            );
            console.log('챌린지 관련 localStorage 키들:', allKeys);

            // 각 챌린지를 확인
            for (const challenge of challenges) {
                const completedSteps: ChallengeStep[] = [];
                let completedStepCount = 0;
                let lastCompletedDate = '';
                const totalSteps = challenge.steps.length;

                console.log(`챌린지 검사: ${challenge.name} (ID: ${challenge.id}), 총 ${totalSteps}단계`);

                // 각 단계를 확인하여 학생이 완료한 단계 찾기
                for (const step of challenge.steps) {
                    // 챌린지 ID와 스텝 ID를 조합하여 고유한 키 생성
                    // 모든 가능한 키 형식을 확인

                    // 1. 표준 형식 - challenge_${classId}_${challengeId}_step_${step.id}_students
                    const primaryKey = `challenge_${classId}_${challenge.id}_step_${step.id}_students`;

                    // 2. 이전 형식 - challenge_${classId}_step_${step.id}_students
                    const oldStepKey = `challenge_${classId}_step_${step.id}_students`;

                    // 3. 다른 형식 - challenge_step_${classId}_${challengeId}_${step.id}
                    const alternateKey = `challenge_step_${classId}_${challenge.id}_${step.id}`;

                    // 4. 레거시 형식 - roadmap_step_${classId}_${challengeId}_${step.id}
                    const legacyKey = `roadmap_step_${classId}_${challenge.id}_${step.id}`;

                    // 모든 키 형식 로깅
                    console.log('검색할 키 형식들:', { primaryKey, oldStepKey, alternateKey, legacyKey });

                    // 모든 키를 확인하고 데이터 로드
                    let studentsInStepString = localStorage.getItem(primaryKey);
                    let sourceKey = primaryKey;

                    if (!studentsInStepString) {
                        studentsInStepString = localStorage.getItem(oldStepKey);
                        if (studentsInStepString) sourceKey = oldStepKey;
                    }

                    if (!studentsInStepString) {
                        studentsInStepString = localStorage.getItem(alternateKey);
                        if (studentsInStepString) sourceKey = alternateKey;
                    }

                    if (!studentsInStepString) {
                        studentsInStepString = localStorage.getItem(legacyKey);
                        if (studentsInStepString) sourceKey = legacyKey;
                    }

                    // 어느 곳에서든 데이터를 찾았다면 모든 형식에 저장
                    if (studentsInStepString) {
                        console.log(`단계 데이터 발견: ${sourceKey}`);

                        // 모든 형식에 일관되게 저장 (마이그레이션)
                        localStorage.setItem(primaryKey, studentsInStepString);
                        localStorage.setItem(oldStepKey, studentsInStepString);
                        localStorage.setItem(alternateKey, studentsInStepString);

                        console.log(`단계 데이터 마이그레이션: ${sourceKey} → 모든 형식`);
                    }

                    if (studentsInStepString) {
                        try {
                            const studentsInStep = JSON.parse(studentsInStepString);
                            console.log(`스텝 ${step.id} (챌린지 ${challenge.id}) 데이터 소스:`,
                                localStorage.getItem(primaryKey) ? 'primaryKey' :
                                    localStorage.getItem(oldStepKey) ? 'oldStepKey' :
                                        localStorage.getItem(alternateKey) ? 'alternateKey' :
                                            localStorage.getItem(legacyKey) ? 'legacyKey' : '알 수 없음');
                            console.log(`스텝 ${step.id} (챌린지 ${challenge.id}) 참여 학생들 (${studentsInStep.length}명):`, studentsInStep);

                            // 배열인지 확인하고 현재 학생이 이 단계를 완료했는지 정확히 검증
                            const hasCompleted = Array.isArray(studentsInStep) &&
                                studentsInStep.length > 0 &&
                                studentsInStep.some(id => id && id.toString() === currentStudentId);

                            console.log(`학생 ${currentStudentId}의 단계 완료 여부:`, hasCompleted ? '완료' : '미완료');

                            if (hasCompleted) {
                                console.log(`학생 ${currentStudentId}가 챌린지 ${challenge.name}(ID: ${challenge.id})의 단계 ${step.goal} 완료함`);
                                completedStepCount++;

                                // 완료 날짜 - 로컬 스토리지에서 스텝 완료 시간 데이터가 있으면 사용, 없으면 현재 시간
                                const completionDateKey = `challenge_${classId}_${challenge.id}_step_${step.id}_${currentStudentId}_completedAt`;
                                let completedAt = localStorage.getItem(completionDateKey);

                                if (!completedAt) {
                                    completedAt = new Date().toISOString();
                                    // 없으면 현재 시간으로 저장
                                    localStorage.setItem(completionDateKey, completedAt);
                                }

                                // 가장 최근에 완료한 단계의 날짜를 기억
                                if (!lastCompletedDate || completedAt > lastCompletedDate) {
                                    lastCompletedDate = completedAt;
                                }

                                // 단계 설명에 구체적인 목표 내용 포함
                                const stepNumber = step.id.replace(/\D/g, '');
                                // 단계 번호가 너무 크거나 없으면 배열의 인덱스 + 1을 사용
                                const stepIndex = challenge.steps.findIndex((s: any) => s.id === step.id);
                                let actualStepNumber: number;

                                // 추출한 번호가 있고 합리적인 크기면 사용, 그렇지 않으면 인덱스 사용
                                if (stepNumber && parseInt(stepNumber) > 0 && parseInt(stepNumber) < 100) {
                                    actualStepNumber = parseInt(stepNumber);
                                } else {
                                    actualStepNumber = stepIndex + 1; // 인덱스는 0부터 시작하므로 +1
                                }

                                completedSteps.push({
                                    id: step.id,
                                    title: `${actualStepNumber}단계`,
                                    description: step.goal,
                                    completedAt: completedAt
                                });
                            } else {
                                console.log(`학생 ${currentStudentId}는 챌린지 ${challenge.name}(ID: ${challenge.id})의 단계 ${step.goal}를 완료하지 않음`);
                            }
                        } catch (error) {
                            console.error(`스텝 데이터 파싱 오류: ${primaryKey}`, error);
                        }
                    } else {
                        console.log(`스텝 데이터 없음: ${primaryKey} 및 ${oldStepKey}, ${alternateKey}, ${legacyKey}`);
                    }
                }

                // 하나 이상의 단계를 완료했을 때 챌린지 정보 추가
                if (completedStepCount > 0) {
                    // 모든 단계를 완료한 경우 vs 일부 단계만 완료한 경우
                    const isFullyCompleted = completedStepCount === totalSteps;

                    console.log(`챌린지 ${challenge.name}(ID: ${challenge.id})의 ${completedStepCount}/${totalSteps} 단계를 완료함`);

                    // 완료한 단계 수를 정확히 표시하기 위해 단계 개수를 로깅
                    console.log(`완료한 단계: ${completedSteps.length}개, 카운터 값: ${completedStepCount}개`);

                    // 단계 수 일치 여부를 확인하고 로깅
                    if (completedSteps.length !== completedStepCount) {
                        console.warn(`경고: 완료된 단계 수 불일치! completedSteps: ${completedSteps.length}, completedStepCount: ${completedStepCount}`);
                        // 불일치 문제 수정: 실제 completedSteps 배열의 길이를 사용하여 표시 내용 결정
                        completedStepCount = completedSteps.length;
                    }

                    // 마지막으로 완료한 단계의 정보를 명확히 표시
                    const lastCompletedStep = completedSteps[completedSteps.length - 1];
                    const descriptionText = isFullyCompleted
                        ? `최종 보상: ${challenge.rewardTitle || '없음'}`
                        : `완료한 단계: ${completedStepCount}/${totalSteps}단계`;

                    console.log(`챌린지 ${challenge.name}에 대해 진행 정보 생성`, {
                        completedStepCount,
                        totalSteps,
                        description: descriptionText
                    });

                    completedChallenges.push({
                        id: challenge.id,
                        title: challenge.name,
                        description: descriptionText,
                        steps: completedSteps.sort((a, b) =>
                            // 단계별로 정렬 - id 기준으로 오름차순 정렬 (1단계, 2단계, ... 순서대로)
                            Number(a.id.replace(/\D/g, '') || 0) - Number(b.id.replace(/\D/g, '') || 0)
                        ),
                        abilities: challenge.abilities,
                        rewards: {
                            exp: isFullyCompleted ? 200 : 100, // 모두 완료 시 더 많은 경험치
                            gold: 0
                        },
                        timestamp: lastCompletedDate || new Date().toISOString()
                    });
                } else {
                    console.log(`챌린지 ${challenge.name}(ID: ${challenge.id})의 단계를 하나도 완료하지 않음`);
                }
            }

            // 최신순으로 정렬 (timestamp 기준)
            completedChallenges.sort((a, b) =>
                (b.timestamp || '').localeCompare(a.timestamp || '')
            );

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

    /**
     * 학생의 경험치와 레벨을 업데이트하는 함수
     * @param studentId 학생 ID
     * @param expToAdd 추가할 경험치
     * @param abilities 증가시킬 능력치 (선택 사항)
     * @param goldToAdd 추가할 골드 (선택 사항, 기본값 0)
     * @returns 업데이트된 학생 객체 또는 null (실패 시)
     */
    const updateStudentExpAndLevel = (
        studentId: string,
        expToAdd: number,
        abilities?: StudentAbilities,
        goldToAdd: number = 0
    ): Student | null => {
        try {
            if (!classId) {
                console.error('클래스 ID가 없습니다.');
                return null;
            }

            // 학생 정보 가져오기
            const studentsJson = localStorage.getItem(`students_${classId}`);
            if (!studentsJson) {
                console.error('학생 데이터를 찾을 수 없습니다.');
                return null;
            }

            const students = JSON.parse(studentsJson);
            const studentIndex = students.findIndex((s: Student) => s.id === studentId);

            if (studentIndex === -1) {
                console.error('해당 학생을 찾을 수 없습니다.');
                return null;
            }

            const student = students[studentIndex];
            console.log('업데이트 전 학생 상태:', JSON.stringify(student, null, 2));

            // 학생 데이터 구조 표준화
            if (!student.stats) {
                student.stats = {
                    level: 1,
                    exp: 0
                };
            }

            // exp 필드가 숫자인지 확인하고 아니면 초기화
            if (typeof student.stats.exp !== 'number') {
                console.warn('학생의 경험치가 숫자가 아닙니다. 0으로 초기화합니다.', student.stats.exp);
                student.stats.exp = 0;
            }

            // 현재 레벨과 경험치 기록 (변화 감지용)
            const currentLevel = student.stats.level;
            const currentExp = student.stats.exp;

            // 새로운 경험치 계산
            const newExp = currentExp + expToAdd;

            // 새로운 레벨 계산
            const { level: newLevel } = calculateLevelFromExp(newExp);

            // 경험치 업데이트
            student.stats.exp = newExp;
            student.stats.level = newLevel;

            // 골드 추가 (미션 보상)
            if (goldToAdd > 0) {
                student.points = (student.points || 0) + goldToAdd;
                console.log(`미션 완료 보상: ${goldToAdd} 골드 지급`);
            }

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
            if (abilities) {
                if (abilities.intelligence) {
                    student.abilities.intelligence = (student.abilities.intelligence || 1) + 1;
                    abilitiesChanged = true;
                }
                if (abilities.diligence) {
                    student.abilities.diligence = (student.abilities.diligence || 1) + 1;
                    abilitiesChanged = true;
                }
                if (abilities.creativity) {
                    student.abilities.creativity = (student.abilities.creativity || 1) + 1;
                    abilitiesChanged = true;
                }
                if (abilities.personality) {
                    student.abilities.personality = (student.abilities.personality || 1) + 1;
                    abilitiesChanged = true;
                }
                if (abilities.health) {
                    student.abilities.health = (student.abilities.health || 1) + 1;
                    abilitiesChanged = true;
                }
                if (abilities.communication) {
                    student.abilities.communication = (student.abilities.communication || 1) + 1;
                    abilitiesChanged = true;
                }
            }

            // 레벨업 시 포인트 지급
            if (newLevel > currentLevel) {
                const levelsGained = newLevel - currentLevel;
                const pointsToAdd = levelsGained * POINTS_PER_LEVEL;
                student.points = (student.points || 0) + pointsToAdd;

                console.log(`레벨업! Lv.${currentLevel} -> Lv.${newLevel}, 포인트 +${pointsToAdd}`);

                // 레벨업 토스트 메시지
                toast.success(`${student.name} 학생이 레벨업했습니다! Lv.${currentLevel} → Lv.${newLevel} (보상: ${pointsToAdd}G 지급)`);
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

            // 현재 컴포넌트 상태 업데이트
            if (student.id === studentId) {
                setStudent({ ...student });
            }

            // 경험치 획득 메시지
            if (expToAdd > 0) {
                const abilityTexts = [];
                if (abilities?.intelligence) abilityTexts.push("지력 +1");
                if (abilities?.diligence) abilityTexts.push("성실성 +1");
                if (abilities?.creativity) abilityTexts.push("창의력 +1");
                if (abilities?.personality) abilityTexts.push("인성 +1");
                if (abilities?.health) abilityTexts.push("체력 +1");
                if (abilities?.communication) abilityTexts.push("의사소통 +1");

                const abilitiesText = abilityTexts.length > 0 ? ` (${abilityTexts.join(', ')})` : '';
                toast.success(`${student.name} 학생이 ${expToAdd} EXP를 획득했습니다!${abilitiesText}`);
            }

            return student;
        } catch (error) {
            console.error('학생 경험치/레벨 업데이트 중 오류:', error);
            toast.error('학생 정보를 업데이트하는 중 오류가 발생했습니다.');
            return null;
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
        deleteStudent,
        updateStudentExpAndLevel
    };
} 