'use client'

import { Cpu, Target, Activity, MessageCircle } from 'lucide-react'
import { Student } from '../types'

interface AbilitiesDisplayProps {
    student: Student
}

const AbilitiesDisplay: React.FC<AbilitiesDisplayProps> = ({ student }) => {
    // 능력치 설명
    const abilityDescriptions = {
        intelligence: "지식정보처리 역량. 정보를 수용, 분석하고 새로운 지식으로 재구성하는 힘.",
        diligence: "자기관리 역량과 관련. 자기 주도적으로 목표를 향해 꾸준히 나아갈 줄 아는, 맡은 바를 이행하는 성실한 태도.",
        creativity: "창의적 사고 역량과 심미적 감성 역량이 관련. 문제를 새롭게 바라보고 아름답게 표현하는 능력.",
        personality: "공동체 역량과 관련된 능력. 책임감을 가지고, 타인을 배려하며, 정의롭고 윤리적인 판단을 할 수 있는 능력",
        health: "자기관리 역량과 관련. 건강하고 안전한 삶을 위해 자기 몸을 가꿀 수 있는 능력.",
        communication: "의사소통 역량과 관련. 남의 의견을 경청하고 자신의 의견을 표현할 줄 알며 협력적으로 소통하는 능력."
    }

    // 능력치 랭크 계산 함수
    const calculateRank = (value: number = 1) => {
        if (value >= 26) return { rank: 'LEGEND', color: 'text-orange-500 font-extrabold animate-pulse' };
        if (value >= 21) return { rank: 'SS', color: 'text-purple-800 font-extrabold' };
        if (value >= 16) return { rank: 'S', color: 'text-purple-600 font-bold' };
        if (value >= 11) return { rank: 'A', color: 'text-red-600 font-bold' };
        if (value >= 6) return { rank: 'B', color: 'text-blue-600 font-medium' };
        return { rank: 'C', color: 'text-gray-800 font-normal' };
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">학생 능력치</h3>

            <div className="space-y-3">
                {/* 지력 */}
                <div className="flex items-center justify-between group relative">
                    <div className="flex items-center">
                        <Cpu className="w-4 h-4 text-blue-600 mr-1.5" />
                        <span className="text-sm text-blue-700">지력</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{student.abilities?.intelligence || 1}</span>
                        <span className={`text-sm ${calculateRank(student.abilities?.intelligence).color}`}>
                            {calculateRank(student.abilities?.intelligence).rank}
                        </span>
                    </div>

                    {/* 호버 시 설명 표시 */}
                    <div className="absolute left-0 -bottom-1 transform translate-y-full w-64 bg-white border border-blue-100 shadow-md rounded-md p-2 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600">{abilityDescriptions.intelligence}</p>
                    </div>
                </div>

                {/* 성실성 */}
                <div className="flex items-center justify-between group relative">
                    <div className="flex items-center">
                        <Target className="w-4 h-4 text-green-600 mr-1.5" />
                        <span className="text-sm text-green-700">성실성</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{student.abilities?.diligence || 1}</span>
                        <span className={`text-sm ${calculateRank(student.abilities?.diligence).color}`}>
                            {calculateRank(student.abilities?.diligence).rank}
                        </span>
                    </div>

                    {/* 호버 시 설명 표시 */}
                    <div className="absolute left-0 -bottom-1 transform translate-y-full w-64 bg-white border border-green-100 shadow-md rounded-md p-2 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600">{abilityDescriptions.diligence}</p>
                    </div>
                </div>

                {/* 창의력 */}
                <div className="flex items-center justify-between group relative">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.663 17h4.673M12 3v1M3.412 7l.7.7M20.588 7l-.7.7M12 21v-1M18.36 17A8 8 0 0 0 12 4a8 8 0 0 0-6.36 13" />
                        </svg>
                        <span className="text-sm text-purple-700">창의력</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{student.abilities?.creativity || 1}</span>
                        <span className={`text-sm ${calculateRank(student.abilities?.creativity).color}`}>
                            {calculateRank(student.abilities?.creativity).rank}
                        </span>
                    </div>

                    {/* 호버 시 설명 표시 */}
                    <div className="absolute left-0 -bottom-1 transform translate-y-full w-64 bg-white border border-purple-100 shadow-md rounded-md p-2 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600">{abilityDescriptions.creativity}</p>
                    </div>
                </div>

                {/* 인성 */}
                <div className="flex items-center justify-between group relative">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        <span className="text-sm text-red-700">인성</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{student.abilities?.personality || 1}</span>
                        <span className={`text-sm ${calculateRank(student.abilities?.personality).color}`}>
                            {calculateRank(student.abilities?.personality).rank}
                        </span>
                    </div>

                    {/* 호버 시 설명 표시 */}
                    <div className="absolute left-0 -bottom-1 transform translate-y-full w-64 bg-white border border-red-100 shadow-md rounded-md p-2 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600">{abilityDescriptions.personality}</p>
                    </div>
                </div>

                {/* 체력 */}
                <div className="flex items-center justify-between group relative">
                    <div className="flex items-center">
                        <Activity className="w-4 h-4 text-yellow-600 mr-1.5" />
                        <span className="text-sm text-yellow-700">체력</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{student.abilities?.health || 1}</span>
                        <span className={`text-sm ${calculateRank(student.abilities?.health).color}`}>
                            {calculateRank(student.abilities?.health).rank}
                        </span>
                    </div>

                    {/* 호버 시 설명 표시 */}
                    <div className="absolute left-0 -bottom-1 transform translate-y-full w-64 bg-white border border-yellow-100 shadow-md rounded-md p-2 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600">{abilityDescriptions.health}</p>
                    </div>
                </div>

                {/* 의사소통 */}
                <div className="flex items-center justify-between group relative">
                    <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 text-indigo-600 mr-1.5" />
                        <span className="text-sm text-indigo-700">의사소통</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{student.abilities?.communication || 1}</span>
                        <span className={`text-sm ${calculateRank(student.abilities?.communication).color}`}>
                            {calculateRank(student.abilities?.communication).rank}
                        </span>
                    </div>

                    {/* 호버 시 설명 표시 */}
                    <div className="absolute left-0 -bottom-1 transform translate-y-full w-64 bg-white border border-indigo-100 shadow-md rounded-md p-2 z-10 hidden group-hover:block">
                        <p className="text-xs text-gray-600">{abilityDescriptions.communication}</p>
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    능력치는 챌린지, 미션 완료 및 칭찬카드를 통해 상승합니다.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    각 능력치 위에 마우스를 올리면 상세 설명이 표시됩니다.
                </p>
            </div>
        </div>
    )
}

export default AbilitiesDisplay 