'use client'

import { Loader2 } from 'lucide-react'
import { CompletedMission } from '../types'

interface MissionTabProps {
    completedMissions: CompletedMission[]
    isLoading: boolean
}

const MissionTab: React.FC<MissionTabProps> = ({ completedMissions, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <p className="ml-2 text-gray-500">미션 데이터 로딩 중...</p>
            </div>
        )
    }

    if (completedMissions.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">완료한 미션이 없습니다.</p>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">완료한 미션</h3>

            <div className="grid grid-cols-1 gap-2">
                {completedMissions.map((mission) => (
                    <div
                        key={mission.id}
                        className="bg-blue-50 border border-blue-100 rounded-lg p-3"
                    >
                        <h4 className="font-medium text-blue-800">{mission.name}</h4>
                        <p className="text-sm text-blue-600 mt-1">{mission.condition}</p>

                        {/* 보상 정보 */}
                        <div className="flex items-center mt-2 text-xs">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                +{mission.rewards?.gold || 0} G
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                +{mission.rewards?.exp || 0} EXP
                            </span>
                        </div>

                        {/* 능력치 정보 */}
                        {(mission.abilities?.intelligence ||
                            mission.abilities?.diligence ||
                            mission.abilities?.creativity ||
                            mission.abilities?.personality) && (
                                <div className="mt-2 pt-2 border-t border-blue-100">
                                    <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {mission.abilities?.intelligence && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                지력 +1
                                            </span>
                                        )}
                                        {mission.abilities?.diligence && (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                성실성 +1
                                            </span>
                                        )}
                                        {mission.abilities?.creativity && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                창의력 +1
                                            </span>
                                        )}
                                        {mission.abilities?.personality && (
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                인성 +1
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* 획득 시간 */}
                        <div className="mt-2 text-right">
                            <p className="text-xs text-gray-500">
                                {mission.timestamp && new Date(mission.timestamp).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MissionTab 