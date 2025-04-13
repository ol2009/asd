'use client'

import { useState, useEffect } from 'react'
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
    // 아이템 타입 서브탭
    const [itemTypeTab, setItemTypeTab] = useState<AvatarLayerType>('head');
    // 내부 아바타 상태 (로컬 미리보기용)
    const [previewAvatar, setPreviewAvatar] = useState<Avatar | null>(currentAvatar);

    // 부모 컴포넌트에서 아바타가 변경될 때 내부 상태도 업데이트
    useEffect(() => {
        setPreviewAvatar(currentAvatar);
    }, [currentAvatar]);

    // 아바타 아이템 장착 함수
    const handleEquipItem = (item: AvatarItem) => {
        // 콘솔에 로그 추가
        console.log('아이템 장착:', item);
        console.log('현재 아바타 상태:', currentAvatar);

        // 현재 아바타가 없는 경우 기본 아바타 생성
        const baseAvatar = currentAvatar || {
            head: undefined as AvatarItem | undefined,
            body: undefined as AvatarItem | undefined,
            hat: undefined as AvatarItem | undefined,
            weapon: undefined as AvatarItem | undefined
        };

        // 아이템 타입에 따라 아바타에 장착
        const newAvatar: Avatar = {
            ...baseAvatar,
            [item.type]: item
        };

        // 로컬 미리보기 상태 업데이트
        setPreviewAvatar(newAvatar);

        // 아바타 변경 함수 호출 (부모 컴포넌트에 전달)
        onAvatarChange(newAvatar);

        // 사용자 피드백
        toast.success(`${item.name} 아이템을 장착했습니다.`);

        // 콘솔에 업데이트된 아바타 기록
        console.log('새 아바타 상태:', newAvatar);
    };

    // 아이템 타입에 따른 설명
    const getTypeLabel = (type: AvatarLayerType): string => {
        switch (type) {
            case 'head': return '머리';
            case 'body': return '몸통';
            case 'hat': return '모자';
            case 'weapon': return '무기';
            default: return '아이템';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">아바타 아이템</h3>
                <div className="text-gray-600 font-medium flex items-center gap-2">
                    {/* 현재 아바타 미리보기 */}
                    <div className="relative w-12 h-12">
                        {previewAvatar ? (
                            <AvatarRenderer avatar={previewAvatar} size={48} />
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 아이템 타입 필터 탭 */}
            <Tabs defaultValue="head" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="head" onClick={() => setItemTypeTab('head')}>
                        머리
                    </TabsTrigger>
                    <TabsTrigger value="body" onClick={() => setItemTypeTab('body')}>
                        몸통
                    </TabsTrigger>
                    <TabsTrigger value="hat" onClick={() => setItemTypeTab('hat')}>
                        모자
                    </TabsTrigger>
                    <TabsTrigger value="weapon" onClick={() => setItemTypeTab('weapon')}>
                        무기
                    </TabsTrigger>
                </TabsList>

                {/* 타입별 아이템 목록 */}
                {(['head', 'body', 'hat', 'weapon'] as AvatarLayerType[]).map(type => (
                    <TabsContent key={type} value={type}>
                        <div className="grid grid-cols-3 gap-2">
                            {ownedAvatarItems.filter(item => item.type === type).length === 0 ? (
                                <div className="col-span-3 text-center py-8 text-gray-500">
                                    보유한 {getTypeLabel(type)} 아이템이 없습니다.
                                </div>
                            ) : (
                                ownedAvatarItems
                                    .filter(item => item.type === type)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className={`relative bg-white border rounded-lg p-2 cursor-pointer transition-all ${previewAvatar?.[type]?.id === item.id
                                                ? 'border-blue-400 shadow-sm bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                                }`}
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
                                                        isSelected={previewAvatar?.[type]?.id === item.id}
                                                    />
                                                </div>

                                                {/* 현재 장착중인 아이템 표시 */}
                                                {(previewAvatar?.[type]?.id === item.id) && (
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
                                        </div>
                                    ))
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default AvatarTab 