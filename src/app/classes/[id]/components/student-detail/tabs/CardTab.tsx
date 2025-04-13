'use client'

import { Award, Loader2 } from 'lucide-react'
import { ReceivedCard } from '../types'

interface CardTabProps {
    receivedCards: ReceivedCard[]
    isLoading: boolean
}

const CardTab: React.FC<CardTabProps> = ({ receivedCards, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <p className="ml-2 text-gray-500">칭찬카드 데이터 로딩 중...</p>
            </div>
        )
    }

    if (receivedCards.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">받은 칭찬카드가 없습니다.</p>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">받은 칭찬카드</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {receivedCards.map((card) => (
                    <div
                        key={card.id}
                        className="bg-purple-50 border border-purple-100 rounded-lg p-3"
                    >
                        <div className="flex items-start">
                            <div className="bg-purple-200 text-purple-700 p-1.5 rounded-full mr-2">
                                <Award className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-purple-800">{card.title}</h4>
                                <p className="text-sm text-purple-600 mt-1">{card.message}</p>

                                {/* 보상 정보 */}
                                <div className="flex items-center mt-2 text-xs">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                        +{card.rewards?.gold || 0} G
                                    </span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                        +{card.rewards?.exp || 0} EXP
                                    </span>
                                </div>

                                {/* 능력치 정보 */}
                                {(card.abilities?.intelligence ||
                                    card.abilities?.diligence ||
                                    card.abilities?.creativity ||
                                    card.abilities?.personality) && (
                                        <div className="mt-2 pt-2 border-t border-purple-100">
                                            <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {card.abilities?.intelligence && (
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                        지력 +1
                                                    </span>
                                                )}
                                                {card.abilities?.diligence && (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                        성실성 +1
                                                    </span>
                                                )}
                                                {card.abilities?.creativity && (
                                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                        창의력 +1
                                                    </span>
                                                )}
                                                {card.abilities?.personality && (
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                        인성 +1
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                <p className="text-xs text-gray-500 mt-2 text-right">
                                    {new Date(card.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CardTab 