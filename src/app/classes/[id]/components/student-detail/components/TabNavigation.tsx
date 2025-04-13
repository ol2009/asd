'use client'

import { User, BookOpen, Target, Award, ShoppingCart } from 'lucide-react'
import { TabType } from '../types'

interface TabNavigationProps {
    activeTab: TabType
    onTabChange: (tab: TabType) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex border-b border-gray-200 mb-2 flex-wrap">
            <button
                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'challenges'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                onClick={() => onTabChange('challenges')}
            >
                <div className="flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    <span>챌린지</span>
                </div>
            </button>

            <button
                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'missions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                onClick={() => onTabChange('missions')}
            >
                <div className="flex items-center">
                    <Target className="w-3.5 h-3.5 mr-1" />
                    <span>미션</span>
                </div>
            </button>

            <button
                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'cards'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                onClick={() => onTabChange('cards')}
            >
                <div className="flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1" />
                    <span>칭찬카드</span>
                </div>
            </button>

            <button
                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'pointshop'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                onClick={() => onTabChange('pointshop')}
            >
                <div className="flex items-center">
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                    <span>골드 상점</span>
                </div>
            </button>

            <button
                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'avatar'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                onClick={() => onTabChange('avatar')}
            >
                <div className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    <span>아바타</span>
                </div>
            </button>
        </div>
    )
}

export default TabNavigation