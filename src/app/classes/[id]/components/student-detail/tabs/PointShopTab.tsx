'use client'

import { useState } from 'react'
import { ShoppingBag, Tag, Award } from 'lucide-react'
import { Avatar, AvatarItem, AvatarRarity } from '@/lib/avatar'
import { AvatarItemRenderer } from '@/components/Avatar'
import { toast } from 'sonner'

// 포인트 상점 아이템 타입
export enum PointShopItemType {
    AVATAR = 'avatar',
    CLASS = 'class'
}

// 포인트 상점 아이템 인터페이스
export interface PointShopItem {
    id: string
    name: string
    description?: string
    price: number
    type: PointShopItemType
    avatarItem?: {
        imagePath: string
        name: string
        type: string
        rarity: AvatarRarity
    }
}

// 구매 내역 인터페이스
export interface PurchaseHistory {
    item: PointShopItem
    date: string
}

// 포인트 상점 탭 속성
interface PointShopTabProps {
    student: any
    pointShopItems: PointShopItem[]
    purchaseHistory: PurchaseHistory[]
    onItemPurchase: (item: PointShopItem) => void
}

const PointShopTab: React.FC<PointShopTabProps> = ({
    student,
    pointShopItems,
    purchaseHistory,
    onItemPurchase
}) => {
    // 포인트 상점 서브탭 (아바타 상품/학급 상품/구매 내역)
    const [pointShopSubTab, setPointShopSubTab] = useState<'avatar' | 'class' | 'history'>('avatar')

    // 상점 아이템 구매 함수
    const handlePurchaseItem = (item: PointShopItem) => {
        // 포인트가 부족한 경우
        if ((student.points || 0) < item.price) {
            toast.error('골드가 부족합니다.')
            return
        }

        onItemPurchase(item)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">골드 상점</h3>
                <div className="text-yellow-600 font-medium">
                    보유 골드: {student.points || 0} G
                </div>
            </div>

            {/* 탭 내 서브탭 (아바타 상품 목록/학급 상품 목록/구매 내역) */}
            <div className="flex border-b border-gray-200 mb-3">
                <button
                    onClick={() => setPointShopSubTab('avatar')}
                    className={`py-2 px-4 text-sm font-medium ${pointShopSubTab === 'avatar'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                        }`}
                >
                    아바타 상품
                </button>
                <button
                    onClick={() => setPointShopSubTab('class')}
                    className={`py-2 px-4 text-sm font-medium ${pointShopSubTab === 'class'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                        }`}
                >
                    학급 상품
                </button>
                <button
                    onClick={() => setPointShopSubTab('history')}
                    className={`py-2 px-4 text-sm font-medium ${pointShopSubTab === 'history'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                        }`}
                >
                    구매 내역
                </button>
            </div>

            {/* 아바타 상품 목록 */}
            {pointShopSubTab === 'avatar' && (
                <div className="grid grid-cols-2 gap-2 p-1">
                    {pointShopItems
                        .filter(item => item.type === PointShopItemType.AVATAR)
                        .map(item => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col"
                            >
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 border border-gray-200 rounded-md bg-blue-50 overflow-hidden mr-2">
                                        {item.avatarItem && (
                                            <AvatarItemRenderer
                                                imagePath={item.avatarItem.imagePath}
                                                name={item.avatarItem.name}
                                                size={40}
                                                rarity={item.avatarItem.rarity}
                                                showRarityBadge={true}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">{item.name}</h4>
                                        <div className="flex items-center">
                                            <Tag className="h-3 w-3 text-gray-500 mr-1" />
                                            <span className="text-xs text-gray-600">
                                                {item.avatarItem?.type === 'head' && '머리'}
                                                {item.avatarItem?.type === 'body' && '몸통'}
                                                {item.avatarItem?.type === 'hat' && '모자'}
                                                {item.avatarItem?.type === 'weapon' && '무기'}
                                            </span>
                                            <span className={`ml-2 text-xs ${item.avatarItem?.rarity === AvatarRarity.COMMON ? 'text-gray-500' :
                                                item.avatarItem?.rarity === AvatarRarity.RARE ? 'text-blue-500 font-medium' :
                                                    item.avatarItem?.rarity === AvatarRarity.EPIC ? 'text-purple-500 font-medium' :
                                                        'text-yellow-500 font-medium'
                                                }`}>
                                                {item.avatarItem?.rarity === AvatarRarity.COMMON && '일반'}
                                                {item.avatarItem?.rarity === AvatarRarity.RARE && '레어'}
                                                {item.avatarItem?.rarity === AvatarRarity.EPIC && '에픽'}
                                                {item.avatarItem?.rarity === AvatarRarity.LEGENDARY && '레전더리'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="font-medium text-yellow-600">{item.price} G</span>
                                    <button
                                        onClick={() => handlePurchaseItem(item)}
                                        disabled={(student.points || 0) < item.price}
                                        className={`px-3 py-1 text-xs rounded ${(student.points || 0) >= item.price
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        구매하기
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* 학급 상품 목록 */}
            {pointShopSubTab === 'class' && (
                <div className="grid grid-cols-2 gap-2 p-1">
                    {pointShopItems
                        .filter(item => item.type === PointShopItemType.CLASS)
                        .map(item => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col"
                            >
                                <div className="flex items-center mb-2">
                                    <div className="w-10 h-10 border border-gray-200 rounded-md bg-yellow-50 flex items-center justify-center mr-2">
                                        <Award className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium">{item.name}</h4>
                                        <div className="flex items-center">
                                            <span className="text-xs text-gray-600">
                                                {item.description || '학급 아이템'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="font-medium text-yellow-600">{item.price} G</span>
                                    <button
                                        onClick={() => handlePurchaseItem(item)}
                                        disabled={(student.points || 0) < item.price}
                                        className={`px-3 py-1 text-xs rounded ${(student.points || 0) >= item.price
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        구매하기
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* 구매 내역 */}
            {pointShopSubTab === 'history' && (
                <div className="divide-y divide-gray-200">
                    {purchaseHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            구매 내역이 없습니다.
                        </div>
                    ) : (
                        purchaseHistory.map((purchase, index) => (
                            <div key={index} className="py-3 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="w-9 h-9 rounded bg-blue-50 border border-blue-100 flex items-center justify-center mr-3">
                                        <ShoppingBag className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-medium">{purchase.item.name}</h5>
                                        <span className="text-xs text-gray-500">
                                            {new Date(purchase.date).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-yellow-600">
                                    -{purchase.item.price} G
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default PointShopTab 