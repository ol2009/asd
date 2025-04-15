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

    // 누적 능력치 계산 함수 추가
    const calculateCumulativeAbilities = (challenge: CompletedChallenge, currentStepIndex: number) => {
        // 챌린지에 능력치가 없으면 빈 객체 반환
        if (!challenge.abilities) return {};

        // 누적 능력치를 저장할 객체
        const cumulativeAbilities: Record<string, number> = {};

        // 현재 단계까지 능력치 누적
        for (const ability in challenge.abilities) {
            if (challenge.abilities[ability as Ability]) {
                // 단계 수만큼 능력치 누적 (현재 단계 인덱스 + 1)
                cumulativeAbilities[ability] = (currentStepIndex + 1);
            }
        }

        return cumulativeAbilities;
    };

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
                const completedSteps = challenge.steps || [];

                // 해당 챌린지의 능력치
                const abilities = challenge.abilities
                    ? Object.entries(challenge.abilities)
                        .filter(([_, value]) => value)
                        .map(([ability]) => abilityKoreanNames[ability as Ability] || ability)
                    : [];

                // 전체 단계 수 확인
                const totalSteps = challenge.steps?.length || completedSteps.length;

                // 마지막 단계 여부 및 챌린지 완료 여부 확인
                const isFullyCompleted = completedSteps.length === totalSteps;
                const showHonorific = isFullyCompleted && (challenge as any).rewardTitle;

                return (
                    <div key={challenge.id} className="mb-6">
                        {/* 챌린지 제목 */}
                        <h3 className="text-lg font-bold text-blue-700 mb-3">{challenge.title}</h3>

                        {/* 각 단계별 카드 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {completedSteps.map((step, index) => {
                                // 단계 번호 계산
                                let stepNumber = index + 1;
                                if (step.title) {
                                    const match = step.title.match(/(\d+)단계/);
                                    if (match && match[1]) {
                                        const num = parseInt(match[1]);
                                        if (num > 0 && num < 100) {
                                            stepNumber = num;
                                        }
                                    }
                                }

                                // 마지막 단계 여부 확인
                                const isLastStep = index === completedSteps.length - 1;
                                const isFullyCompleted = completedSteps.length === totalSteps;
                                const showHonorific = isFullyCompleted && (challenge as any).rewardTitle;

                                return (
                                    <Card key={step.id} className="overflow-hidden border-0 shadow-sm">
                                        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 py-2 px-3 text-white">
                                            <div className="flex items-center">
                                                <CheckCircle className="w-4 h-4 text-white mr-2" />
                                                <span className="font-medium">{stepNumber}단계 달성!</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3">
                                            {/* 단계 목표 */}
                                            <p className="text-sm font-medium text-gray-700 mb-2">
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
                                                {(() => {
                                                    // 현재 단계까지의 누적 능력치 계산
                                                    // 배열 인덱스가 아닌 실제 단계 번호(stepNumber)를 기준으로 계산
                                                    const realIndex = stepNumber - 1; // 예: "2단계"면 stepNumber=2 -> realIndex=1
                                                    const cumulativeAbilities = calculateCumulativeAbilities(challenge, realIndex);

                                                    return Object.keys(cumulativeAbilities).length > 0 && (
                                                        <p className="text-xs font-medium text-purple-700">
                                                            능력치: {Object.entries(cumulativeAbilities)
                                                                .filter(([_, count]) => count > 0)
                                                                .map(([key, count]) => `${abilityKoreanNames[key as Ability]} +${count}`)
                                                                .join(', ')}
                                                        </p>
                                                    );
                                                })()}

                                                {/* 경험치 */}
                                                <p className="text-xs font-medium text-amber-700">
                                                    경험치 +200
                                                    {challenge.rewards && challenge.rewards.gold && challenge.rewards.gold > 0 && `, 골드 +${challenge.rewards.gold}`}
                                                </p>

                                                {/* 칭호 (마지막 단계와 모든 단계 완료의 경우만) */}
                                                {showHonorific && (
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