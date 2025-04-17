'use client'

import React, { useEffect } from 'react';
import { CompletedChallenge, ChallengeStep } from '../types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import { CalendarIcon, CheckCircle, Trophy } from 'lucide-react';

// 타입 정의
type Ability = 'intelligence' | 'diligence' | 'creativity' | 'personality' | 'health' | 'communication';

// 능력치 한글 매핑
const abilityKoreanNames: Record<Ability, string> = {
    intelligence: '지력',
    diligence: '성실성',
    creativity: '창의력',
    personality: '인성',
    health: '체력',
    communication: '의사소통'
};

// 상수 정의
const EXP_PER_STEP = 200; // 챌린지 단계당 경험치
const GOLD_PER_STEP = 200; // 챌린지 단계당 골드
const MAX_STEP_NUMBER = 10; // 최대 단계 번호 (이 이상은 비정상적 값으로 간주)

// 특정 챌린지의 기본 단계 수 설정 (폴백 값으로만 사용)
const DEFAULT_CHALLENGE_STEPS: Record<string, number> = {
    '환로': 2,
    '왕되기': 2,
    '역사탐험가': 3,
    '수학신': 3
};

// 챌린지 완료 상태 설정을 위한 로컬 스토리지 키
const CHALLENGE_CONFIG_KEY = 'challenge_steps_config';
const CHALLENGE_COMPLETION_RECORDS_KEY = 'challenge_completion_records';

interface Props {
    completedChallenges: CompletedChallenge[];
    isLoading: boolean;
}

export function ChallengeTab({ completedChallenges, isLoading }: Props) {
    // 날짜 기준으로 정렬 (최신순)
    const sortedChallenges = React.useMemo(() => {
        return [...completedChallenges].sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [completedChallenges]);

    // 전체 데이터 디버깅을 위한 useEffect 추가
    useEffect(() => {
        console.log("ChallengeTab - 전체 챌린지 데이터:", completedChallenges);

        // 각 챌린지의 단계 수 로깅
        completedChallenges.forEach(challenge => {
            console.log(`챌린지 [${challenge.title}] 원본 단계 정보:`, {
                id: challenge.id,
                steps: challenge.steps,
                stepsLength: challenge.steps?.length,
                단계ID목록: challenge.steps?.map(s => s.id),
                rawData: challenge
            });
        });

        // 챌린지 설정 정보 로드
        try {
            let storedChallengeConfigs = localStorage.getItem(CHALLENGE_CONFIG_KEY);
            let configData: Record<string, number> = {}; // 명시적으로 타입 지정하여 타입 오류 해결

            if (storedChallengeConfigs) {
                configData = JSON.parse(storedChallengeConfigs);
                console.log('로드된 챌린지 단계 설정:', configData);
            } else {
                // 기본 설정 저장 (처음 실행 시)
                localStorage.setItem(CHALLENGE_CONFIG_KEY, JSON.stringify(DEFAULT_CHALLENGE_STEPS));
                configData = DEFAULT_CHALLENGE_STEPS;
                console.log('기본 챌린지 단계 설정 저장됨:', DEFAULT_CHALLENGE_STEPS);
            }

            // 새로운 챌린지는 기존 설정에 추가 - 단, 강제로 3단계로 설정하지 않음
            let configUpdated = false;

            // 자동 추가는 기본 설정에 있는 챌린지에만 적용
            completedChallenges.forEach(challenge => {
                if (challenge.title && !configData[challenge.title] && DEFAULT_CHALLENGE_STEPS[challenge.title]) {
                    // 기본 설정에 있는 챌린지만 자동 등록
                    configData[challenge.title] = DEFAULT_CHALLENGE_STEPS[challenge.title];
                    configUpdated = true;
                    console.log(`챌린지 [${challenge.title}] 자동 등록, 기본 설정 사용: ${configData[challenge.title]}단계`);
                }
            });

            // 설정이 업데이트되었으면 저장
            if (configUpdated) {
                localStorage.setItem(CHALLENGE_CONFIG_KEY, JSON.stringify(configData));
                console.log('업데이트된 챌린지 설정 저장됨:', configData);
            }
        } catch (err) {
            console.error('챌린지 설정 로드 오류:', err);
        }
    }, [completedChallenges]);

    if (isLoading) {
        return <div className="flex justify-center p-4">로딩 중...</div>;
    }

    if (sortedChallenges.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <p className="mb-2">완료한 챌린지가 없습니다.</p>
                <p className="text-sm">챌린지를 완료하면 경험치와 능력치를 획득할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* 챌린지 별로 그룹화하여 표시 */}
            {sortedChallenges.map((challenge) => {
                // 챌린지 steps 데이터가 없으면 빈 배열로 처리
                if (!challenge.steps || !Array.isArray(challenge.steps)) {
                    console.error(`챌린지 [${challenge.title}]의 steps 데이터가 없거나 배열이 아닙니다.`, challenge);
                    return null; // 잘못된 데이터는 렌더링하지 않음
                }

                // 사용자 정의 챌린지 설정 로드
                let userDefinedSteps: Record<string, number> = {};
                try {
                    const storedConfig = localStorage.getItem(CHALLENGE_CONFIG_KEY);
                    if (storedConfig) {
                        userDefinedSteps = JSON.parse(storedConfig);
                    }
                } catch (err) {
                    console.error('챌린지 설정 로드 오류:', err);
                }

                // 총 단계 수 결정 로직 개선
                // 1. 기본적으로 challenge.steps.length를 사용
                // 2. 단계 번호(stepNumber)가 있는 경우, 가장 큰 stepNumber 값을 사용
                // 3. 만약 challenge 객체에 totalSteps 속성이 직접 있다면 그 값을 우선 사용
                // 4. localStorage에 사용자 정의 설정이 있다면 해당 값 사용

                // 단계 번호 기반 계산
                const maxStepNumberFromData = challenge.steps.reduce((max, step) => {
                    const stepNum = getSafeStepNumber(step);
                    return stepNum > max ? stepNum : max;
                }, 0);

                // 총 단계 수 결정 (여러 소스에서 가장 신뢰할 수 있는 값 선택)
                let totalSteps = 0;

                // 우선순위 1: challenge.totalSteps가 있으면 사용
                if (challenge.totalSteps && typeof challenge.totalSteps === 'number' && challenge.totalSteps > 0) {
                    totalSteps = challenge.totalSteps;
                    console.log(`챌린지 [${challenge.title}] - totalSteps 속성 사용: ${totalSteps}`);
                }
                // 우선순위 2: 사용자 정의 설정이 있으면 사용
                else if (userDefinedSteps[challenge.title] && userDefinedSteps[challenge.title] > 0) {
                    totalSteps = userDefinedSteps[challenge.title];
                    console.log(`챌린지 [${challenge.title}] - 사용자 정의 설정 사용: ${totalSteps}`);
                }
                // 우선순위 3: 기본 설정이 있으면 사용
                else if (DEFAULT_CHALLENGE_STEPS[challenge.title] && DEFAULT_CHALLENGE_STEPS[challenge.title] > 0) {
                    totalSteps = DEFAULT_CHALLENGE_STEPS[challenge.title];
                    console.log(`챌린지 [${challenge.title}] - 기본 설정 사용: ${totalSteps}`);
                }
                // 우선순위 4: maxStepNumberFromData가 있고 1보다 크면 사용
                else if (maxStepNumberFromData > 1) {
                    totalSteps = maxStepNumberFromData;
                    console.log(`챌린지 [${challenge.title}] - 최대 단계 번호 사용: ${totalSteps}`);
                }
                // 우선순위 5: steps.length가 0보다 크면 사용
                else if (challenge.steps.length > 0) {
                    totalSteps = challenge.steps.length;
                    console.log(`챌린지 [${challenge.title}] - steps 배열 길이 사용: ${totalSteps}`);
                }

                // 임의로 단계를 변경하지 않고, 교사가 설정한 단계 수 존중
                // 알고 있는 챌린지(환로, 왕되기, 역사탐험가 등)만 기본값 사용

                console.log(`최종 계산된 총 단계 수 [${challenge.title}]: ${totalSteps} (원본 steps.length: ${challenge.steps.length}, 최대 stepNumber: ${maxStepNumberFromData})`);

                // 각 단계에 completedAt이 있는지 확실히 검증하여 완료된 단계만 필터링
                const completedSteps = challenge.steps.filter(step => {
                    // 완료된 날짜가 유효한지 확인 (null, undefined, 빈 문자열이 아니어야 함)
                    const isCompleted = step && step.completedAt && step.completedAt.trim && step.completedAt.trim() !== '';

                    if (!isCompleted) {
                        console.log(`단계 [${step?.id || 'unknown'}]는 completedAt이 없어 완료되지 않은 것으로 판단됨`, step);
                    }

                    return isCompleted;
                });

                console.log(`챌린지 [${challenge.title}] - 총 단계 수: ${totalSteps}, 완료된 단계 수: ${completedSteps.length}`);

                // 빈 단계를 제거하고 단계 번호를 안전하게 계산
                const stepsWithSafeNumber = completedSteps
                    .filter(step => step !== null && step !== undefined)
                    .map(step => {
                        const safeNumber = getSafeStepNumber(step);
                        return {
                            ...step,
                            safeStepNumber: safeNumber
                        };
                    });

                // 단계 번호로 정렬
                const sortedSteps = [...stepsWithSafeNumber].sort((a, b) =>
                    a.safeStepNumber - b.safeStepNumber
                );

                // 중복 없는 완료된 단계 번호 목록
                const uniqueCompletedStepNumbers = [...new Set(
                    sortedSteps.map(step => step.safeStepNumber)
                )].sort((a, b) => a - b);

                // 마지막 단계 번호 확인
                const highestCompletedStep = uniqueCompletedStepNumbers.length > 0
                    ? Math.max(...uniqueCompletedStepNumbers)
                    : 0;

                // 체계적으로 능력치 정보 파싱
                const abilities = parseAbilities(challenge);

                // 완료 여부 판단 - 심층 디버깅 로그 추가
                const completedStepCount = uniqueCompletedStepNumbers.length;

                // 총 획득 골드 계산
                const totalEarnedGold = uniqueCompletedStepNumbers.reduce((total, stepNum) => {
                    return total + (GOLD_PER_STEP * stepNum);
                }, 0);

                // 총 획득 경험치 계산
                const totalEarnedExp = uniqueCompletedStepNumbers.reduce((total, stepNum) => {
                    return total + (EXP_PER_STEP * stepNum);
                }, 0);

                // 추가 골드 보상이 있으면 합산
                const additionalGold = challenge.rewards?.gold || 0;
                const finalTotalGold = totalEarnedGold + additionalGold;

                // 요구사항 2: 칭호 획득 여부를 통한 챌린지 완료 판단
                // 칭호가 있고 rewardTitle이 있으면 챌린지가 완료된 것으로 판단
                const hasRewardTitle = !!challenge.rewardTitle && challenge.rewardTitle.trim() !== '';

                // 챌린지 완료 조건:
                // 1. 칭호가 있는 경우: 챌린지가 자동으로 완료로 간주됨 (요구 사항대로)
                // 2. 칭호가 없는 경우: 
                //    a. 전체 단계를 모두 완료했거나 (completedAllSteps)
                //    b. 마지막 단계를 완료했을 때 (completedLastStep)
                const completedAllSteps = completedStepCount === totalSteps && totalSteps > 0;
                const completedLastStep = highestCompletedStep === totalSteps && totalSteps > 0;

                // 새로운 완료 조건에 따라 챌린지 완료 여부 결정
                const isFullyCompleted =
                    // 조건 1: 칭호 획득 + 최소 마지막 단계 완료 시
                    (hasRewardTitle && highestCompletedStep === totalSteps) ||
                    // 조건 2: 마지막 단계를 완료했거나 모든 단계를 완료했을 때만
                    (completedAllSteps || completedLastStep);

                // 강화된 디버깅 로그
                console.log(`챌린지 [${challenge.title}] 완료 여부 상세 검증:`, {
                    챌린지ID: challenge.id,
                    완료된_단계수: completedStepCount,
                    총_단계수: totalSteps,
                    완료된_단계번호: uniqueCompletedStepNumbers,
                    최대_완료_단계번호: highestCompletedStep,
                    칭호보상: challenge.rewardTitle,
                    칭호획득완료조건: hasRewardTitle && highestCompletedStep === totalSteps,
                    마지막단계완료여부: completedLastStep,
                    모든단계완료여부: completedAllSteps,
                    최종_완료여부: isFullyCompleted,
                    칭호표시여부: isFullyCompleted && challenge.rewardTitle && (completedLastStep || completedAllSteps),
                    완료배지조건: `isFullyCompleted && isLastStepOfChallenge && totalSteps > 1`,
                    단계별_경험치: `${EXP_PER_STEP} * 단계번호`,
                    총_획득_경험치: totalEarnedExp,
                    단계별_골드: `${GOLD_PER_STEP} * 단계번호`,
                    총_획득_골드: totalEarnedGold,
                    추가_골드: additionalGold,
                    최종_골드: finalTotalGold
                });

                // 챌린지 완료 정보 기록 (나중에 활용 가능)
                if (isFullyCompleted) {
                    try {
                        // 완료된 챌린지 기록
                        const completionRecordsKey = CHALLENGE_COMPLETION_RECORDS_KEY;
                        const storedRecords = localStorage.getItem(completionRecordsKey);
                        let completionRecords: Record<string, any> = storedRecords ? JSON.parse(storedRecords) : {};

                        // 이미 기록된 경우 중복 저장 방지
                        if (!completionRecords[challenge.id]) {
                            completionRecords[challenge.id] = {
                                title: challenge.title,
                                completedAt: new Date().toISOString(),
                                rewardTitle: challenge.rewardTitle
                            };
                            localStorage.setItem(completionRecordsKey, JSON.stringify(completionRecords));
                            console.log(`챌린지 [${challenge.title}] 완료 정보 저장됨`);
                        }
                    } catch (err) {
                        console.error('챌린지 완료 정보 저장 오류:', err);
                    }
                }

                // 칭호 표시 로직 강화 - 마지막 단계를 완료했거나 모든 단계를 완료한 경우만 칭호 표시
                // 칭호가 있고, 실제로 챌린지가 완료된 경우에만 칭호 표시
                const showHonorific = isFullyCompleted && challenge.rewardTitle && (completedLastStep || completedAllSteps);

                return (
                    <div key={challenge.id} className="mb-6">
                        {/* 각 단계별 카드 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {sortedSteps.map((step, index) => {
                                // 안전한 단계 번호
                                const stepNumber = step.safeStepNumber;

                                // 현재 단계가 챌린지의 마지막 단계인지 확인 (단계 번호가 총 단계 수와 같은지)
                                const isLastStepOfChallenge = stepNumber === totalSteps;

                                // 현재 단계가 정렬된 완료 단계 목록에서 마지막인지 확인
                                const isLastCompletedStep = index === sortedSteps.length - 1;

                                // 마지막 단계이고 챌린지가 완료된 것으로 판단되었을 때만 완료 배지 표시
                                // 추가 조건: 해당 단계가 전체 단계 수와 같아야 함 (총 단계 수는 1보다 커야 함)
                                const showCompletionBadge = isFullyCompleted && isLastStepOfChallenge && totalSteps > 1;

                                // 경험치 계산 - 단계별 경험치 계산
                                const calculatedExp = EXP_PER_STEP * stepNumber;

                                // 골드 계산 - 각 단계별 골드 보상 (단계 번호 * 200 골드)
                                const earnedGold = GOLD_PER_STEP * stepNumber;

                                // 진행상태 표시를 위한 계산 - 마지막 단계가 완료되었으면 전체 완료로 표시
                                const displayStepCount = completedLastStep ? totalSteps : completedStepCount;

                                return (
                                    <Card key={step.id} className={`overflow-hidden border-0 ${showCompletionBadge ? 'shadow-md ring-1 ring-amber-200' : 'shadow-sm'}`}>
                                        <CardHeader className={`py-2 px-3 text-white ${showCompletionBadge ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
                                            <div className="flex flex-col">
                                                {/* 챌린지 제목 - 가장 먼저 표시 */}
                                                <h3 className="font-bold text-lg flex items-center">
                                                    {challenge.title}
                                                    {showCompletionBadge && (
                                                        <span className="ml-2 flex items-center text-sm bg-white/20 px-2 py-0.5 rounded">
                                                            <Trophy className="w-3 h-3 mr-1" />
                                                            완료
                                                        </span>
                                                    )}
                                                </h3>
                                                {/* 단계 달성 정보 */}
                                                <div className="flex items-center text-sm">
                                                    {showCompletionBadge ? (
                                                        <div className="flex items-center">
                                                            <Trophy className="w-4 h-4 text-yellow-300 mr-1" />
                                                            <span>마지막 단계 완료! 챌린지 성공</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <CheckCircle className="w-4 h-4 text-white mr-1" />
                                                            <span>
                                                                {stepNumber}단계 달성
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            {/* 단계 목표 */}
                                            <p className="text-sm text-gray-700 mb-2">
                                                {step.description}
                                            </p>

                                            {/* 보상 정보 */}
                                            <div className={`rounded p-2 border mt-1 ${showCompletionBadge ? 'bg-amber-50 border-amber-200' : 'bg-yellow-50 border-yellow-100'}`}>
                                                {/* 능력치 */}
                                                {abilities.length > 0 && (
                                                    <p className="text-xs font-medium text-purple-700">
                                                        능력치: {abilities.map(ability =>
                                                            `${ability} +${stepNumber}`
                                                        ).join(', ')}
                                                    </p>
                                                )}

                                                {/* 경험치 표시 */}
                                                <p className="text-xs font-medium text-amber-700">
                                                    경험치 +{calculatedExp}
                                                </p>

                                                {/* 총 획득 경험치와 골드 (마지막 단계에만 표시) */}
                                                {isLastCompletedStep && (
                                                    <p className="text-xs font-medium text-yellow-700 mt-1">
                                                        획득 골드: +{totalEarnedGold}G
                                                    </p>
                                                )}

                                                {/* 칭호 (마지막 단계와 모든 단계 완료의 경우만) */}
                                                {showHonorific && (
                                                    <p className={`text-xs font-medium mt-1 pt-1 border-t ${showCompletionBadge ? 'text-orange-700 border-amber-200' : 'text-purple-700 border-yellow-200'}`}>
                                                        획득 칭호: {challenge.rewardTitle}
                                                    </p>
                                                )}
                                            </div>

                                            {/* 날짜 */}
                                            {step.completedAt && (
                                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                                    {dayjs(step.completedAt).format('YYYY.MM.DD')} 완료
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// 안전한 단계 번호를 추출하는 함수
function getSafeStepNumber(step: ChallengeStep): number {
    try {
        // stepNumber 필드가 있고 합리적인 범위 내에 있으면 사용
        if (typeof step.stepNumber === 'number' &&
            step.stepNumber > 0 &&
            step.stepNumber <= MAX_STEP_NUMBER) {
            return step.stepNumber;
        }

        // 타이틀에서 번호 추출 시도
        if (step.title) {
            const titleMatch = step.title.match(/(\d+)/);
            if (titleMatch && parseInt(titleMatch[1]) > 0 && parseInt(titleMatch[1]) <= MAX_STEP_NUMBER) {
                return parseInt(titleMatch[1]);
            }
        }

        // ID에서 추출 시도
        if (step.id) {
            const extractedNumber = step.id.replace(/\D/g, '');
            if (extractedNumber &&
                parseInt(extractedNumber) > 0 &&
                parseInt(extractedNumber) <= MAX_STEP_NUMBER) {
                return parseInt(extractedNumber);
            }
        }

        // 모든 시도가 실패하면 기본값 1 반환
        return 1;
    } catch (error) {
        console.error("단계 번호 추출 중 오류:", error);
        return 1; // 오류 발생시 기본값
    }
}

// 챌린지에서 능력치 정보 추출하는 함수
function parseAbilities(challenge: CompletedChallenge): string[] {
    try {
        if (!challenge.abilities) return [];

        return Object.entries(challenge.abilities)
            .filter(([_, value]) => !!value)
            .map(([key]) => abilityKoreanNames[key as Ability] || key);
    } catch (error) {
        console.error("능력치 파싱 중 오류:", error);
        return [];
    }
} 