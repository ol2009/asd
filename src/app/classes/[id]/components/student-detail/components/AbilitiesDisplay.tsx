'use client'

import { Cpu, Target } from 'lucide-react'
import { Student } from '../types'

interface AbilitiesDisplayProps {
    student: Student
}

const AbilitiesDisplay: React.FC<AbilitiesDisplayProps> = ({ student }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-3">학생 능력치</h3>

            <div className="space-y-3">
                {/* 지력 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Cpu className="w-4 h-4 text-blue-600 mr-1.5" />
                        <span className="text-sm text-blue-700">지력</span>
                    </div>
                    <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.intelligence || 1}</span>
                </div>

                {/* 성실성 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Target className="w-4 h-4 text-green-600 mr-1.5" />
                        <span className="text-sm text-green-700">성실성</span>
                    </div>
                    <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.diligence || 1}</span>
                </div>

                {/* 창의력 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.663 17h4.673M12 3v1M3.412 7l.7.7M20.588 7l-.7.7M12 21v-1M18.36 17A8 8 0 0 0 12 4a8 8 0 0 0-6.36 13" />
                        </svg>
                        <span className="text-sm text-purple-700">창의력</span>
                    </div>
                    <span className="text-sm font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.creativity || 1}</span>
                </div>

                {/* 인성 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        <span className="text-sm text-red-700">인성</span>
                    </div>
                    <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.personality || 1}</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    능력치는 로드맵, 미션 완료 및 칭찬카드를 통해 상승합니다.
                </p>
            </div>
        </div>
    )
}

export default AbilitiesDisplay 