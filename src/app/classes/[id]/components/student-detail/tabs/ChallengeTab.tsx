'use client'

import React from 'react';
import { CompletedChallenge, ChallengeStep } from '../types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import { CalendarIcon, CheckCircle } from 'lucide-react';

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
const MAX_STEP_NUMBER = 10; // 최대 단계 번호 (이 이상은 비정상적 값으로 간주)

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
                // 실제 완료된 단계만 필터링
                const completedSteps = (challenge.steps || []).filter(step => step.completedAt);

                // 단계 번호로 정렬 (항상 합리적인 값만 사용하도록 보장)
                const sortedSteps = [...completedSteps]
                    .map(step => ({
                        ...step,
                        safeStepNumber: getSafeStepNumber(step)
                    }))
                    .sort((a, b) => a.safeStepNumber - b.safeStepNumber);

                // 체계적으로 능력치 정보 파싱
                const abilities = parseAbilities(challenge);

                // 전체 단계 수 확인
                const totalSteps = challenge.steps?.length || 0;

                // 마지막 단계 여부 및 챌린지 완료 여부 확인
                const isFullyCompleted = completedSteps.length > 0 && completedSteps.length === totalSteps;
                const showHonorific = isFullyCompleted && (challenge as any).rewardTitle;

                return (
                    <div key={challenge.id} className="mb-6">
                        {/* 각 단계별 카드 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {sortedSteps.map((step, index) => {
                                // 안전한 단계 번호
                                const stepNumber = step.safeStepNumber;

                                // 현재 단계가 마지막인지 확인
                                const isLastStep = index === sortedSteps.length - 1;

                                // 경험치 계산 - 10배로 표시되는 문제 수정을 위해 값 보정
                                // 실제 경험치 값을 구하기 위해 먼저 10으로 나누고 다시 계산
                                const calculatedExp = Math.min(EXP_PER_STEP * stepNumber, 2000);
                                const displayExp = calculatedExp / 10; // 경험치 값을 10으로 나눔

                                return (
                                    <Card key={step.id} className="overflow-hidden border-0 shadow-sm">
                                        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 py-2 px-3 text-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <CheckCircle className="w-4 h-4 text-white mr-2" />
                                                    <span className="font-medium">{stepNumber}단계 달성!</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            {/* 챌린지 제목 */}
                                            <p className="text-sm font-semibold text-blue-700 mb-2">
                                                {challenge.title}
                                            </p>

                                            {/* 단계 목표 */}
                                            <p className="text-sm text-gray-700 mb-2">
                                                {step.description}
                                            </p>

                                            {/* 날짜 */}
                                            {step.completedAt && (
                                                <p className="text-xs text-gray-500 mb-2 flex items-center">
                                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                                    {dayjs(step.completedAt).format('YYYY.MM.DD')} 완료
                                                </p>
                                            )}

                                            {/* 보상 정보 */}
                                            <div className="bg-yellow-50 rounded p-2 border border-yellow-100 mt-1">
                                                {/* 능력치 */}
                                                {abilities.length > 0 && (
                                                    <p className="text-xs font-medium text-purple-700">
                                                        능력치: {abilities.map(ability =>
                                                            `${ability} +${stepNumber}`
                                                        ).join(', ')}
                                                    </p>
                                                )}

                                                {/* 경험치 - 정확한 값으로 표시 */}
                                                <p className="text-xs font-medium text-amber-700">
                                                    경험치 +{displayExp}
                                                    {challenge.rewards && challenge.rewards.gold && challenge.rewards.gold > 0 &&
                                                        `, 골드 +${challenge.rewards.gold}`
                                                    }
                                                </p>

                                                {/* 칭호 (마지막 단계와 모든 단계 완료의 경우만) */}
                                                {showHonorific && isLastStep && (
                                                    <p className="text-xs font-medium text-purple-700 mt-1 pt-1 border-t border-yellow-200">
                                                        획득 칭호: {(challenge as any).rewardTitle}
                                                    </p>
                                                )}
                                            </div>
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