'use client'

import React, { useEffect } from 'react';
import { CompletedChallenge, ChallengeStep } from '../types';
import { Loader2, LineChart } from 'lucide-react';

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

        // 챌린지 설정 정보 로드
        try {
            let storedChallengeConfigs = localStorage.getItem(CHALLENGE_CONFIG_KEY);
            let configData: Record<string, number> = {};

            if (storedChallengeConfigs) {
                configData = JSON.parse(storedChallengeConfigs);
                console.log('로드된 챌린지 단계 설정:', configData);
            } else {
                // 기본 설정 저장 (처음 실행 시)
                localStorage.setItem(CHALLENGE_CONFIG_KEY, JSON.stringify(DEFAULT_CHALLENGE_STEPS));
                configData = DEFAULT_CHALLENGE_STEPS;
                console.log('기본 챌린지 단계 설정 저장됨:', DEFAULT_CHALLENGE_STEPS);
            }
        } catch (err) {
            console.error('챌린지 설정 로드 오류:', err);
        }
    }, [completedChallenges]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <p className="ml-2 text-gray-500">챌린지 데이터 로딩 중...</p>
            </div>
        );
    }

    if (sortedChallenges.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">완료한 챌린지가 없습니다.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">완료한 챌린지</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedChallenges.map((challenge) => {
                    // 챌린지 steps 데이터가 없으면 빈 배열로 처리
                    if (!challenge.steps || !Array.isArray(challenge.steps)) {
                        return null;
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

                    // 단계 번호 기반 계산
                    const maxStepNumberFromData = challenge.steps.reduce((max, step) => {
                        const stepNum = getSafeStepNumber(step);
                        return stepNum > max ? stepNum : max;
                    }, 0);

                    // 총 단계 수 결정
                    let totalSteps = 0;
                    if (challenge.totalSteps && typeof challenge.totalSteps === 'number' && challenge.totalSteps > 0) {
                        totalSteps = challenge.totalSteps;
                    } else if (userDefinedSteps[challenge.title] && userDefinedSteps[challenge.title] > 0) {
                        totalSteps = userDefinedSteps[challenge.title];
                    } else if (DEFAULT_CHALLENGE_STEPS[challenge.title] && DEFAULT_CHALLENGE_STEPS[challenge.title] > 0) {
                        totalSteps = DEFAULT_CHALLENGE_STEPS[challenge.title];
                    } else if (maxStepNumberFromData > 1) {
                        totalSteps = maxStepNumberFromData;
                    } else if (challenge.steps.length > 0) {
                        totalSteps = challenge.steps.length;
                    }

                    // 완료된 단계 필터링
                    const completedSteps = challenge.steps.filter(step => {
                        return step && step.completedAt && step.completedAt.trim && step.completedAt.trim() !== '';
                    });

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

                    // 완료 여부 판단
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

                    // 칭호 획득 여부
                    const hasRewardTitle = !!challenge.rewardTitle && challenge.rewardTitle.trim() !== '';

                    // 챌린지 완료 조건
                    const completedAllSteps = completedStepCount === totalSteps && totalSteps > 0;
                    const completedLastStep = highestCompletedStep === totalSteps && totalSteps > 0;

                    const isFullyCompleted =
                        (hasRewardTitle && highestCompletedStep === totalSteps) ||
                        (completedAllSteps || completedLastStep);

                    // 칭호 표시 조건
                    const showHonorific = isFullyCompleted && challenge.rewardTitle && (completedLastStep || completedAllSteps);

                    // 표시할 마지막 챌린지 단계 (가장 높은 단계)
                    const lastStep = sortedSteps.length > 0 ? sortedSteps[sortedSteps.length - 1] : null;
                    if (!lastStep) return null;

                    const stepNumber = lastStep.safeStepNumber;
                    const isLastStepOfChallenge = stepNumber === totalSteps;
                    const showCompletionBadge = isFullyCompleted && isLastStepOfChallenge && totalSteps > 1;

                    return (
                        <div
                            key={challenge.id}
                            className="bg-orange-50 border border-orange-100 rounded-lg p-3"
                        >
                            <div className="flex items-start">
                                <div className="bg-orange-200 text-orange-700 p-1.5 rounded-full mr-2">
                                    <LineChart className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <h4 className="font-medium text-orange-800">{challenge.title}</h4>
                                        {showCompletionBadge && (
                                            <span className="ml-2 flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                                <LineChart className="w-3 h-3 mr-1" />
                                                완료
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-orange-600 mt-1">{lastStep.description}</p>

                                    {/* 보상 정보 */}
                                    <div className="flex items-center mt-2 text-xs">
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                            +{finalTotalGold} G
                                        </span>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            +{totalEarnedExp} EXP
                                        </span>
                                    </div>

                                    {/* 능력치 정보 */}
                                    {abilities.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-orange-100">
                                            <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {challenge.abilities?.intelligence && (
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                        지력 +{stepNumber}
                                                    </span>
                                                )}
                                                {challenge.abilities?.diligence && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                        성실성 +{stepNumber}
                                                    </span>
                                                )}
                                                {challenge.abilities?.creativity && (
                                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                        창의력 +{stepNumber}
                                                    </span>
                                                )}
                                                {challenge.abilities?.personality && (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                        인성 +{stepNumber}
                                                    </span>
                                                )}
                                                {challenge.abilities?.health && (
                                                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-orange-700 rounded-full mr-1"></span>
                                                        체력 +{stepNumber}
                                                    </span>
                                                )}
                                                {challenge.abilities?.communication && (
                                                    <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-cyan-700 rounded-full mr-1"></span>
                                                        의사소통 +{stepNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 칭호 표시 */}
                                    {showHonorific && (
                                        <div className="mt-2 pt-2 border-t border-orange-100">
                                            <p className="text-xs text-purple-700">
                                                획득 칭호: {challenge.rewardTitle}
                                            </p>
                                        </div>
                                    )}

                                    {/* 완료 시간 */}
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        {new Date(challenge.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
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