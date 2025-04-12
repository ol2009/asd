'use client'

import { useState } from 'react'
import AvatarRenderer, { AvatarItemRenderer } from '@/components/Avatar'
import { Avatar, AvatarItem, AvatarRarity, AvatarLayerType } from '@/lib/avatar'
import { User, Crown } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

// 아바타 탭 속성
interface AvatarTabProps {
    student: any
    currentAvatar: Avatar | null
    ownedAvatarItems: AvatarItem[]
    onAvatarChange: (newAvatar: Avatar) => void
    onAvatarReset: () => void
}

const AvatarTab: React.FC<AvatarTabProps> = ({
    student,
    currentAvatar,
    ownedAvatarItems,
    onAvatarChange,
    onAvatarReset
}) => {
    // 아바타 탭 서브탭
    const [avatarSubTab, setAvatarSubTab] = useState<'customize' | 'items'>('customize')

    // 아바타 아이템 장착 함수
    const handleEquipItem = (item: AvatarItem) => {
        // 현재 아바타가 없는 경우 기본 아바타 생성
        const baseAvatar = currentAvatar || {
            head: undefined as AvatarItem | undefined,
            body: undefined as AvatarItem | undefined,
            hat: undefined as AvatarItem | undefined,
            weapon: undefined as AvatarItem | undefined
        }

        // 아이템 타입에 따라 아바타에 장착
        const newAvatar: Avatar = {
            ...baseAvatar,
            [item.type]: item
        }

        // 아바타 변경 함수 호출
        onAvatarChange(newAvatar)
        toast.success(`${item.name} 아이템을 장착했습니다.`)
    }

    // 아바타 아이템 해제 함수
    const handleUnequipItem = (type: string) => {
        if (!currentAvatar) return

        // 현재 아바타에서 해당 타입 아이템 제거
        const newAvatar: Avatar = {
            ...currentAvatar,
            [type]: undefined
        }

        // 아바타 변경 함수 호출
        onAvatarChange(newAvatar)
        toast.success(`${type === 'head' ? '머리' : type === 'body' ? '몸통' : type === 'hat' ? '모자' : '무기'} 아이템을 해제했습니다.`)
    }

    // 아바타 초기화 함수
    const handleResetAvatar = () => {
        // 아바타 초기화 함수 호출
        onAvatarReset()
        toast.success('아바타를 초기화했습니다.')
    }

    // 아바타 아이템 렌더링 함수
    const renderAvatarItemSection = (type: AvatarLayerType, label: string) => {
        const item = currentAvatar?.[type];

        return (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">{label}</h4>
                    {item && (
                        <button
                            onClick={() => handleUnequipItem(type)}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            해제
                        </button>
                    )}
                </div>
                <div className="flex items-center">
                    <div className="w-14 h-14 border border-gray-200 rounded-md bg-gray-50 overflow-hidden flex items-center justify-center">
                        {item ? (
                            <AvatarItemRenderer
                                imagePath={item.imagePath}
                                name={item.name}
                                size={52}
                                rarity={item.rarity}
                                showRarityBadge={true}
                            />
                        ) : (
                            <div className="text-xs text-gray-400">없음</div>
                        )}
                    </div>
                    <div className="ml-3">
                        <div className="text-sm">
                            {item?.name || "장착된 아이템 없음"}
                        </div>
                        {item && (
                            <div className={`text-xs ${item.rarity === AvatarRarity.COMMON ? 'text-gray-500' :
                                item.rarity === AvatarRarity.RARE ? 'text-blue-500' :
                                    item.rarity === AvatarRarity.EPIC ? 'text-purple-500' :
                                        'text-yellow-500'
                                }`}>
                                {item.rarity === AvatarRarity.COMMON && '일반'}
                                {item.rarity === AvatarRarity.RARE && '레어'}
                                {item.rarity === AvatarRarity.EPIC && '에픽'}
                                {item.rarity === AvatarRarity.LEGENDARY && '레전더리'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">아바타</h3>
                <div className="text-gray-600 font-medium">
                    {student.name}의 아바타
                </div>
            </div>

            {/* 아바타 탭 서브탭 (커스터마이징/아이템 목록) */}
            <Tabs defaultValue="customize" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="customize" onClick={() => setAvatarSubTab('customize')}>
                        커스터마이징
                    </TabsTrigger>
                    <TabsTrigger value="items" onClick={() => setAvatarSubTab('items')}>
                        보유 아이템
                    </TabsTrigger>
                </TabsList>

                {/* 아바타 커스터마이징 */}
                <TabsContent value="customize">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* 아바타 미리보기 */}
                        <div className="w-full md:w-1/3 flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                            <div className="w-32 h-32 bg-white rounded-full border-4 border-blue-200 overflow-hidden mb-3 flex items-center justify-center">
                                {currentAvatar ? (
                                    <AvatarRenderer avatar={currentAvatar} size={120} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">기본 아바타</span>
                                    </div>
                                )}
                            </div>
                            <h4 className="text-lg font-bold mb-1">{student.name}</h4>
                            <div className="text-sm text-gray-600 mb-3">Lv. {student.stats?.level || 1}</div>
                            <button
                                onClick={handleResetAvatar}
                                className="text-xs text-red-600 hover:text-red-700"
                            >
                                아바타 초기화
                            </button>
                        </div>

                        {/* 아바타 장착 아이템 */}
                        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {renderAvatarItemSection('head', '머리')}
                            {renderAvatarItemSection('body', '몸통')}
                            {renderAvatarItemSection('hat', '모자')}
                            {renderAvatarItemSection('weapon', '무기')}
                        </div>
                    </div>
                </TabsContent>

                {/* 보유 아이템 목록 */}
                <TabsContent value="items">
                    <div className="grid grid-cols-3 gap-2">
                        {ownedAvatarItems.length === 0 ? (
                            <div className="col-span-3 text-center py-10 text-gray-500">
                                보유한 아바타 아이템이 없습니다. 골드 상점에서 아이템을 구매해보세요!
                            </div>
                        ) : (
                            ownedAvatarItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
                                    onClick={() => handleEquipItem(item)}
                                >
                                    <div className="relative mb-1">
                                        <div className="w-full h-20 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                                            <AvatarItemRenderer
                                                imagePath={item.imagePath}
                                                name={item.name}
                                                size={64}
                                                rarity={item.rarity}
                                                showRarityBadge={false}
                                            />
                                        </div>

                                        {/* 현재 장착중인 아이템 표시 */}
                                        {(currentAvatar?.head?.id === item.id ||
                                            currentAvatar?.body?.id === item.id ||
                                            currentAvatar?.hat?.id === item.id ||
                                            currentAvatar?.weapon?.id === item.id) && (
                                                <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    <Crown className="w-3 h-3" />
                                                </div>
                                            )}

                                        {/* 아이템 희귀도 배지 */}
                                        <div className={`absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded-full ${item.rarity === AvatarRarity.COMMON ? 'bg-gray-200 text-gray-700' :
                                            item.rarity === AvatarRarity.RARE ? 'bg-blue-500 text-white' :
                                                item.rarity === AvatarRarity.EPIC ? 'bg-purple-500 text-white' :
                                                    'bg-yellow-500 text-white'
                                            }`}>
                                            {item.rarity === AvatarRarity.COMMON && '일반'}
                                            {item.rarity === AvatarRarity.RARE && '레어'}
                                            {item.rarity === AvatarRarity.EPIC && '에픽'}
                                            {item.rarity === AvatarRarity.LEGENDARY && '레전더리'}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium line-clamp-1">{item.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {item.type === 'head' && '머리'}
                                        {item.type === 'body' && '몸통'}
                                        {item.type === 'hat' && '모자'}
                                        {item.type === 'weapon' && '무기'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AvatarTab 