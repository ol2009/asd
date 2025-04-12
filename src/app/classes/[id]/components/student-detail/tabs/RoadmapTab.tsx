'use client'

import { Loader2 } from 'lucide-react'
import { CompletedRoadmap } from '../types'

interface RoadmapTabProps {
    completedRoadmaps: CompletedRoadmap[]
    isLoading: boolean
}

const RoadmapTab: React.FC<RoadmapTabProps> = ({ completedRoadmaps, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <p className="ml-2 text-gray-500">로드맵 데이터 로딩 중...</p>
            </div>
        )
    }

    if (completedRoadmaps.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">완료한 로드맵이 없습니다.</p>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">완료한 로드맵</h3>

            <div className="grid grid-cols-1 gap-4">
                {completedRoadmaps.map((roadmap) => (
                    <div
                        key={roadmap.id}
                        className="bg-indigo-50 border border-indigo-100 rounded-lg p-4"
                    >
                        <h4 className="font-medium text-indigo-800 text-lg">{roadmap.title}</h4>
                        <p className="text-indigo-600 mt-1">{roadmap.description}</p>

                        {/* 스텝 목록 */}
                        <div className="mt-3 space-y-3">
                            {roadmap.steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className="bg-white border border-indigo-100 rounded-lg p-3"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </div>
                                        <h5 className="font-medium ml-2">{step.title}</h5>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 ml-8">{step.description}</p>

                                    {/* 완료 날짜 */}
                                    <p className="text-xs text-gray-500 mt-2 ml-8">
                                        완료일: {step.completedAt && new Date(step.completedAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 보상 정보 */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span>
                                +{roadmap.rewards?.gold || 0} G
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                                +{roadmap.rewards?.exp || 0} EXP
                            </span>
                        </div>

                        {/* 능력치 정보 */}
                        {(roadmap.abilities?.intelligence ||
                            roadmap.abilities?.diligence ||
                            roadmap.abilities?.creativity ||
                            roadmap.abilities?.personality) && (
                                <div className="mt-3 pt-3 border-t border-indigo-100">
                                    <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {roadmap.abilities?.intelligence && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                지력 +1
                                            </span>
                                        )}
                                        {roadmap.abilities?.diligence && (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                성실성 +1
                                            </span>
                                        )}
                                        {roadmap.abilities?.creativity && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                창의력 +1
                                            </span>
                                        )}
                                        {roadmap.abilities?.personality && (
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                인성 +1
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* 완료 시간 */}
                        <div className="mt-3 text-right">
                            <p className="text-xs text-gray-500">
                                {roadmap.timestamp && new Date(roadmap.timestamp).toLocaleDateString('ko-KR', {
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

export default RoadmapTab 