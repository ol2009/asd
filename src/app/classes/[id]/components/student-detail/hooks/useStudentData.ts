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

// 각 활동별 보상 정의
const MISSION_REWARDS = { exp: 100, gold: 100 };
const CHALLENGE_STEP_REWARDS = { exp: 200, gold: 0 }; // 챌린지 1단계당 보상
const PRAISE_CARD_REWARDS = { exp: 50, gold: 50 };

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

    const [statsLoading, setStatsLoading] = useState(true)
    const [stats, setStats] = useState<StudentStats>({
        totalExp: 0,
        abilities: {
            strength: 0,
            dexterity: 0,
            constitution: 0,
            intelligence: 0,
            wisdom: 0,
            charisma: 0
        }
    })

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

    // 학생 데이터와 완료된 챌린지 목록이 모두 로드된 경우, 스탯 계산
    useEffect(() => {
        if (student && completedChallenges.length > 0 && !statsLoading) {
            console.log('스탯 계산 시작...');

            // 초기 스탯 값 설정
            const initialStats: StudentStats = {
                totalExp: 0,
                abilities: {
                    strength: 0,
                    dexterity: 0,
                    constitution: 0,
                    intelligence: 0,
                    wisdom: 0,
                    charisma: 0
                }
            };

            // 모든 완료된 챌린지에서 스탯 합산
            const calculatedStats = completedChallenges.reduce((stats, challenge) => {
                // 경험치 합산
                stats.totalExp += challenge.rewards.exp;

                // 능력치 합산
                if (challenge.abilities) {
                    Object.entries(challenge.abilities).forEach(([ability, value]) => {
                        if (ability in stats.abilities) {
                            // 비정상적으로 큰 능력치 값 정규화
                            const normalizedValue = normalizeAbilityValue(value);
                            stats.abilities[ability as keyof Abilities] += normalizedValue;
                        }
                    });
                }
                return stats;
            }, initialStats);

            console.log('계산된 스탯:', calculatedStats);
            setStats(calculatedStats);
            setStatsLoading(false);
        }
    }, [student, completedChallenges, statsLoading]);

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
                                    completedAt: completedAt,
                                    // 실제 단계 번호 저장 - 1~10 범위로 제한
                                    stepNumber: Math.min(Math.max(1, actualStepNumber), 10)
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

                    // 단계 번호로 정렬
                    completedSteps.sort((a, b) => {
                        // 단계 번호가 1~10 범위를 벗어나지 않도록 보장
                        const aNumber = Math.min(Math.max(1, a.stepNumber || parseInt(a.id.replace(/\D/g, '')) || 1), 10);
                        const bNumber = Math.min(Math.max(1, b.stepNumber || parseInt(b.id.replace(/\D/g, '')) || 1), 10);
                        return aNumber - bNumber;
                    });

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

                    // 완료된 챌린지 정보 생성
                    const completedChallenge: CompletedChallenge = {
                        id: challenge.id,
                        title: challenge.name,
                        description: '',
                        steps: completedSteps,
                        abilities: challenge.abilities || {},
                        rewards: {
                            // 경험치는 고정된 값 (완료한 단계 수 * 200)을 사용
                            // 비정상적으로 큰 값은, 해당 값을 10으로 나누어 정규화
                            exp: normalizeLargeExp(CHALLENGE_STEP_REWARDS.exp * Math.min(completedStepCount, 10)),
                            gold: isFullyCompleted ? CHALLENGE_STEP_REWARDS.gold : 0 // 챌린지 완료시에만 골드 지급
                        },
                        timestamp: lastCompletedDate || new Date().toISOString()
                    };

                    completedChallenges.push(completedChallenge);
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

    // 비정상적으로 큰 경험치 값을 정규화하는 함수
    const normalizeLargeExp = (exp: number): number => {
        // 비정상적으로 큰 값(1000 이상)일 경우, 수정이 필요함을 로그로 남김
        if (exp >= 1000) {
            const normalizedExp = Math.round(exp / 10); // 10으로 나누어 정규화
            console.log(`경험치 정규화: ${exp} → ${normalizedExp}`);
            return normalizedExp;
        }
        return exp; // 정상 범위 내 값은 그대로 반환
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
                        exp: MISSION_REWARDS.exp,
                        gold: MISSION_REWARDS.gold
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
                        exp: PRAISE_CARD_REWARDS.exp,
                        gold: PRAISE_CARD_REWARDS.gold
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
            // 비정상적으로 큰 값이 입력되는 것을 방지
            const safeExpToAdd = Math.min(Math.max(0, expToAdd), 2000); // 최대 2000 경험치로 제한
            const safeGoldToAdd = Math.min(Math.max(0, goldToAdd), 1000); // 최대 1000 골드로 제한

            // 입력값이 제한되었는지 확인하고 로그 출력
            if (safeExpToAdd !== expToAdd) {
                console.warn(`경험치 값이 제한됨: ${expToAdd} → ${safeExpToAdd}`);
            }
            if (safeGoldToAdd !== goldToAdd) {
                console.warn(`골드 값이 제한됨: ${goldToAdd} → ${safeGoldToAdd}`);
            }

            // 디버깅: 어떤 함수가 호출했는지 추적
            console.log('[DEBUG] updateStudentExpAndLevel 호출됨:', {
                caller: new Error().stack?.split('\n')[2].trim(),
                studentId,
                expToAdd: safeExpToAdd, // 안전한 값 사용
                goldToAdd: safeGoldToAdd, // 안전한 값 사용
                abilities
            });

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
            console.log('[DEBUG] 업데이트 전 학생 상태:', {
                name: student.name,
                level: student.stats?.level,
                exp: student.stats?.exp,
                points: student.points
            });

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

            // 기존 경험치가 비정상적으로 크면 초기화
            if (currentExp > 10000) {
                console.warn(`비정상적으로 큰 경험치 값 감지: ${currentExp}, 0으로 초기화`);
                student.stats.exp = 0;
            }

            // 새로운 경험치 계산 (안전한 값 사용)
            const newExp = Math.min((student.stats.exp || 0) + safeExpToAdd, 10000); // 최대 10000으로 제한
            console.log('[DEBUG] 경험치 계산:', {
                currentExp: student.stats.exp,
                safeExpToAdd,
                newExp
            });

            // 새로운 레벨 계산
            const { level: newLevel } = calculateLevelFromExp(newExp);

            // 레벨이 비정상적으로 높으면 제한
            const safeNewLevel = Math.min(newLevel, 100); // 최대 레벨 100으로 제한

            // 경험치 업데이트
            student.stats.exp = newExp;
            student.stats.level = safeNewLevel;

            // 골드 추가 (미션/칭찬카드 보상) - 안전한 값 사용
            if (safeGoldToAdd > 0) {
                const oldPoints = student.points || 0;
                student.points = Math.min(oldPoints + safeGoldToAdd, 100000); // 최대 100000 포인트로 제한
                console.log(`[DEBUG] 골드 추가: ${oldPoints} + ${safeGoldToAdd} = ${student.points}`);
            } else {
                console.log('[DEBUG] 골드 추가 없음 (goldToAdd가 0이하)');
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
                // 각 능력치 값이 합리적인 범위를 벗어나지 않게 제한
                const MAX_ABILITY = 100; // 최대 능력치 값

                if (abilities.intelligence) {
                    const newVal = (student.abilities.intelligence || 1) + 1;
                    student.abilities.intelligence = Math.min(newVal, MAX_ABILITY);
                    abilitiesChanged = true;
                }
                if (abilities.diligence) {
                    const newVal = (student.abilities.diligence || 1) + 1;
                    student.abilities.diligence = Math.min(newVal, MAX_ABILITY);
                    abilitiesChanged = true;
                }
                if (abilities.creativity) {
                    const newVal = (student.abilities.creativity || 1) + 1;
                    student.abilities.creativity = Math.min(newVal, MAX_ABILITY);
                    abilitiesChanged = true;
                }
                if (abilities.personality) {
                    const newVal = (student.abilities.personality || 1) + 1;
                    student.abilities.personality = Math.min(newVal, MAX_ABILITY);
                    abilitiesChanged = true;
                }
                if (abilities.health) {
                    const newVal = (student.abilities.health || 1) + 1;
                    student.abilities.health = Math.min(newVal, MAX_ABILITY);
                    abilitiesChanged = true;
                }
                if (abilities.communication) {
                    const newVal = (student.abilities.communication || 1) + 1;
                    student.abilities.communication = Math.min(newVal, MAX_ABILITY);
                    abilitiesChanged = true;
                }
            }

            // 레벨업 시 포인트 지급
            if (safeNewLevel > currentLevel) {
                const levelsGained = safeNewLevel - currentLevel;
                const pointsToAdd = Math.min(levelsGained * POINTS_PER_LEVEL, 1000); // 최대 1000포인트로 제한
                student.points = Math.min((student.points || 0) + pointsToAdd, 100000); // 최대 100000 포인트로 제한

                console.log(`레벨업! Lv.${currentLevel} -> Lv.${safeNewLevel}, 포인트 +${pointsToAdd}`);

                // 레벨업 토스트 메시지
                toast.success(`${student.name} 학생이 레벨업했습니다! Lv.${currentLevel} → Lv.${safeNewLevel} (보상: ${pointsToAdd}G 지급)`);
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
            if (safeExpToAdd > 0) {
                const abilityTexts = [];
                if (abilities?.intelligence) abilityTexts.push("지력 +1");
                if (abilities?.diligence) abilityTexts.push("성실성 +1");
                if (abilities?.creativity) abilityTexts.push("창의력 +1");
                if (abilities?.personality) abilityTexts.push("인성 +1");
                if (abilities?.health) abilityTexts.push("체력 +1");
                if (abilities?.communication) abilityTexts.push("의사소통 +1");

                const abilitiesText = abilityTexts.length > 0 ? ` (${abilityTexts.join(', ')})` : '';
                const goldText = safeGoldToAdd > 0 ? `, ${safeGoldToAdd}G` : '';
                toast.success(`${student.name} 학생이 ${safeExpToAdd} EXP${goldText}를 획득했습니다!${abilitiesText}`);

                console.log('[DEBUG] 업데이트 완료된 학생 상태:', {
                    name: student.name,
                    level: student.stats.level,
                    exp: student.stats.exp,
                    points: student.points,
                    expAdded: safeExpToAdd,
                    goldAdded: safeGoldToAdd
                });
            }

            return student;
        } catch (error) {
            console.error('학생 경험치/레벨 업데이트 중 오류:', error);
            toast.error('학생 정보를 업데이트하는 중 오류가 발생했습니다.');
            return null;
        }
    };

    // 비정상적으로 큰 능력치 값을 정규화하는 함수
    const normalizeAbilityValue = (value: number): number => {
        // 비정상적으로 큰 값(10 이상)일 경우, 수정이 필요함을 로그로 남김
        if (value >= 10) {
            const normalizedValue = Math.round(value / 10); // 10으로 나누어 정규화
            console.log(`능력치 정규화: ${value} → ${normalizedValue}`);
            return normalizedValue;
        }
        return value; // 정상 범위 내 값은 그대로 반환
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