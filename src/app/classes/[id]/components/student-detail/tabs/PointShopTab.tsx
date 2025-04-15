'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingBag, Tag, Award, Check, X, Palette, Ticket, User, Crown, Shirt, Sword } from 'lucide-react'
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
    itemType?: string
    icon?: React.ReactNode
    avatarItem?: {
        imagePath: string
        name: string
        type: string
        rarity: AvatarRarity
    }
}

// 구매 내역 인터페이스
export interface PurchaseHistory {
    id: string
    item: PointShopItem
    date: string
    used?: boolean
    usedDate?: string | null
}

// 기본 아바타 아이템 목록
const defaultAvatarItems: PointShopItem[] = [
    {
        id: 'avatar_head',
        name: '랜덤 머리 스타일',
        description: '다양한 캐릭터의 머리 스타일 중 하나를 랜덤으로 획득합니다.',
        price: 300,
        type: PointShopItemType.AVATAR,
        itemType: 'head',
        avatarItem: {
            imagePath: '',
            name: '랜덤 머리 스타일',
            type: 'head',
            rarity: AvatarRarity.COMMON
        }
    },
    {
        id: 'avatar_hat',
        name: '랜덤 모자',
        description: '다양한 종류의 모자 중 하나를 랜덤으로 획득합니다.',
        price: 300,
        type: PointShopItemType.AVATAR,
        itemType: 'hat',
        avatarItem: {
            imagePath: '',
            name: '랜덤 모자',
            type: 'hat',
            rarity: AvatarRarity.COMMON
        }
    },
    {
        id: 'avatar_body',
        name: '랜덤 의상',
        description: '다양한 종류의 의상 중 하나를 랜덤으로 획득합니다.',
        price: 300,
        type: PointShopItemType.AVATAR,
        itemType: 'body',
        avatarItem: {
            imagePath: '',
            name: '랜덤 의상',
            type: 'body',
            rarity: AvatarRarity.COMMON
        }
    },
    {
        id: 'avatar_weapon',
        name: '랜덤 무기',
        description: '다양한 종류의 무기 중 하나를 랜덤으로 획득합니다.',
        price: 300,
        type: PointShopItemType.AVATAR,
        itemType: 'weapon',
        avatarItem: {
            imagePath: '',
            name: '랜덤 무기',
            type: 'weapon',
            rarity: AvatarRarity.COMMON
        }
    }
];

// 포인트 상점 탭 속성
interface PointShopTabProps {
    studentId: string
    classId: string
    studentPoints: number
    onItemPurchase: (item: PointShopItem) => void
}

const PointShopTab: React.FC<PointShopTabProps> = ({
    studentId,
    classId,
    studentPoints,
    onItemPurchase
}) => {
    // 포인트 상점 서브탭 (아바타 상품/학급 상품/구매 내역)
    const [pointShopSubTab, setPointShopSubTab] = useState<'avatar' | 'class' | 'history'>('class')
    const [showUsedCoupons, setShowUsedCoupons] = useState<boolean>(false)
    const [items, setItems] = useState<PointShopItem[]>([])
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([])
    const [displayedPoints, setDisplayedPoints] = useState<number>(studentPoints)
    const [isPurchasing, setIsPurchasing] = useState<boolean>(false)

    // studentPoints가 변경되면 displayedPoints도 업데이트
    useEffect(() => {
        setDisplayedPoints(studentPoints);
    }, [studentPoints]);

    // 포인트샵 아이템 로드
    useEffect(() => {
        if (!classId) return

        console.log('PointShopTab이 마운트됨 - 클래스 ID:', classId);

        // 로컬 스토리지에서 포인트샵 아이템 가져오기
        try {
            const savedItems = localStorage.getItem(`pointshop_items_${classId}`) || '[]'
            let parsedItems = JSON.parse(savedItems)
            console.log('로드된 포인트샵 아이템:', parsedItems.length);

            // 아바타 아이템이 없는 경우 기본 아바타 아이템 추가
            const hasAvatarItems = parsedItems.some((item: PointShopItem) => item.type === PointShopItemType.AVATAR)
            if (!hasAvatarItems) {
                parsedItems = [...parsedItems, ...defaultAvatarItems]
                // 업데이트된 아이템 목록을 로컬 스토리지에 저장
                localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(parsedItems))
            }

            console.log('PointShopTab에 로드된 전체 아이템 수:', parsedItems.length);
            setItems(parsedItems)
        } catch (error) {
            console.error('포인트샵 아이템 로드 오류:', error)
            setItems([])
        }
    }, [classId])

    // 구매 내역 로드
    useEffect(() => {
        if (!classId || !studentId) return

        // 로컬 스토리지에서 구매 내역 가져오기
        try {
            const key = `pointshop_purchases_${classId}_${studentId}`
            const savedHistory = localStorage.getItem(key) || '[]'
            setPurchaseHistory(JSON.parse(savedHistory))
        } catch (error) {
            console.error('구매 내역 로드 오류:', error)
            setPurchaseHistory([])
        }
    }, [classId, studentId])

    // 상점 아이템 구매 함수
    const handlePurchaseItem = (item: PointShopItem) => {
        console.log('구매 시도 - 아이템:', item);
        console.log('학생 포인트:', displayedPoints, '아이템 가격:', item.price);
        console.log('아이템 타입:', item.type);

        // 이미 구매 중이면 중복 구매 방지
        if (isPurchasing) {
            console.log('이미 구매 처리 중입니다...');
            return;
        }

        // 포인트 검사를 제거하고 항상 구매 진행
        if (displayedPoints < item.price) {
            console.log('포인트가 부족합니다.');
            toast.error('골드가 부족합니다.');
            return;
        }

        // 구매 중 상태로 변경
        setIsPurchasing(true);

        // 즉시 UI에 포인트 차감 반영
        setDisplayedPoints(prevPoints => prevPoints - item.price);

        console.log('구매 진행 중...');
        // 실제 구매 처리를 위해 콜백 호출
        onItemPurchase(item);

        // 구매 완료 후 구매 중 상태 해제 (약간의 지연 추가)
        setTimeout(() => {
            setIsPurchasing(false);
        }, 1000);
    };

    // 쿠폰 사용 처리 함수 추가
    const handleUseCoupon = (purchaseId: string) => {
        try {
            // 쿠폰 사용 처리 로직
            const key = `pointshop_purchases_${classId}_${studentId}`;
            const savedPurchases = localStorage.getItem(key) || '[]';
            const purchases = JSON.parse(savedPurchases);

            // 구매 내역 업데이트
            const updatedPurchases = purchases.map((purchase: PurchaseHistory) => {
                if (purchase.id === purchaseId) {
                    return {
                        ...purchase,
                        used: true,
                        usedDate: new Date().toISOString()
                    };
                }
                return purchase;
            });

            // 로컬 스토리지에 저장
            localStorage.setItem(key, JSON.stringify(updatedPurchases));

            // 해당 쿠폰을 전체 구매 내역에서도 업데이트
            const allPurchasesKey = `purchase_history_${classId}`;
            const allPurchases = JSON.parse(localStorage.getItem(allPurchasesKey) || '[]');

            const updatedAllPurchases = allPurchases.map((purchase: any) => {
                if (purchase.id === purchaseId && purchase.studentId === studentId) {
                    return {
                        ...purchase,
                        used: true,
                        usedDate: new Date().toISOString()
                    };
                }
                return purchase;
            });

            localStorage.setItem(allPurchasesKey, JSON.stringify(updatedAllPurchases));

            // 구매 내역 상태 업데이트
            setPurchaseHistory(updatedPurchases);

            // 성공 메시지
            toast.success('쿠폰이 사용 완료 처리되었습니다!');
        } catch (error) {
            console.error('쿠폰 사용 처리 중 오류:', error);
            toast.error('쿠폰 사용 처리 중 오류가 발생했습니다.');
        }
    };

    // 필터링된 구매 내역 계산 - 아바타 아이템은 제외하고 표시
    const filteredPurchaseHistory = showUsedCoupons
        ? purchaseHistory.filter(purchase => purchase.item.type !== PointShopItemType.AVATAR && purchase.item.itemType !== 'avatar')
        : purchaseHistory.filter(purchase => !purchase.used && purchase.item.type !== PointShopItemType.AVATAR && purchase.item.itemType !== 'avatar')

    // 아이템 필터링
    const avatarItems = items.filter((item) =>
        item.type === PointShopItemType.AVATAR || item.itemType === 'avatar'
    )
    const classItems = items.filter((item) =>
        item.type === PointShopItemType.CLASS ||
        item.itemType === 'class' ||
        (!item.type && !item.avatarItem)
    )

    console.log('아바타 아이템 개수:', avatarItems.length);
    console.log('학급 쿠폰 아이템 개수:', classItems.length);

    // 필터링된 아이템 디버깅
    if (classItems.length === 0) {
        console.log('학급 쿠폰 아이템이 없습니다. 전체 아이템:', items);
    } else {
        console.log('학급 쿠폰 아이템 목록:', classItems);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-gray-800">골드 상점</h3>
                <div className="text-yellow-600 font-medium">
                    보유 골드: {displayedPoints} G
                </div>
            </div>

            {/* 탭 내 서브탭 (아바타 상품 목록/학급 상품 목록/구매 내역) */}
            <div className="flex border-b border-gray-200 mb-3">
                <button
                    onClick={() => setPointShopSubTab('class')}
                    className={`py-2 px-4 text-sm font-medium ${pointShopSubTab === 'class'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                        }`}
                >
                    학급 쿠폰
                </button>
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
                    onClick={() => setPointShopSubTab('history')}
                    className={`py-2 px-4 text-sm font-medium ${pointShopSubTab === 'history'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500'
                        }`}
                >
                    학급 쿠폰 보관함
                </button>
            </div>

            {/* 학급 쿠폰 상품 목록 */}
            {pointShopSubTab === 'class' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {classItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            사용 가능한 학급 쿠폰이 없습니다.
                        </div>
                    ) : (
                        classItems.map((item, index) => {
                            const canPurchase = displayedPoints >= item.price;

                            console.log(`Item ${item.name}: canPurchase=${canPurchase}, points=${displayedPoints}, price=${item.price}`);

                            return (
                                <div key={index} className="border rounded-lg p-3 bg-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mr-3">
                                                <ShoppingBag className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium">{item.name}</h5>
                                                <p className="text-xs text-gray-500">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm font-medium text-yellow-600">
                                            {item.price} G
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('클래스 쿠폰 구매 버튼 클릭:', item.id);
                                                handlePurchaseItem(item);
                                            }}
                                            disabled={isPurchasing || !canPurchase}
                                            className={`px-3 py-1 text-xs rounded-full ${isPurchasing || !canPurchase
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                                } text-white`}
                                        >
                                            {isPurchasing ? '구매 중...' : '구매하기'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* 아바타 상품 목록 */}
            {pointShopSubTab === 'avatar' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {avatarItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            사용 가능한 아바타 아이템이 없습니다.
                        </div>
                    ) : (
                        avatarItems.map((item, index) => {
                            const canPurchase = displayedPoints >= item.price;

                            console.log(`Item ${item.name}: canPurchase=${canPurchase}, points=${displayedPoints}, price=${item.price}`);

                            // 아이템 타입에 따라 적절한 아이콘 선택
                            const renderIcon = () => {
                                if (item.itemType === 'head' || item.avatarItem?.type === 'head') {
                                    return <User className="w-5 h-5 text-purple-500" />;
                                } else if (item.itemType === 'hat' || item.avatarItem?.type === 'hat') {
                                    return <Crown className="w-5 h-5 text-purple-500" />;
                                } else if (item.itemType === 'body' || item.avatarItem?.type === 'body') {
                                    return <Shirt className="w-5 h-5 text-purple-500" />;
                                } else if (item.itemType === 'weapon' || item.avatarItem?.type === 'weapon') {
                                    return <Sword className="w-5 h-5 text-purple-500" />;
                                }
                                return <ShoppingBag className="w-5 h-5 text-purple-500" />;
                            };

                            return (
                                <div key={index} className="border rounded-lg p-3 bg-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mr-3">
                                                {renderIcon()}
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium">{item.name}</h5>
                                                <p className="text-xs text-gray-500">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm font-medium text-yellow-600">
                                            {item.price} G
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('아바타 아이템 구매 버튼 클릭:', item.id);
                                                console.log('이벤트 객체:', e.type);
                                                handlePurchaseItem(item);
                                            }}
                                            disabled={isPurchasing || !canPurchase}
                                            className={`px-3 py-1 text-xs rounded-full ${isPurchasing || !canPurchase
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                                } text-white`}
                                        >
                                            {isPurchasing ? '구매 중...' : '구매하기'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* 내 쿠폰함 */}
            {pointShopSubTab === 'history' && (
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">보유 중인 쿠폰</h4>
                        <div>
                            <label className="inline-flex items-center text-xs">
                                <input
                                    type="checkbox"
                                    checked={showUsedCoupons}
                                    onChange={() => setShowUsedCoupons(!showUsedCoupons)}
                                    className="rounded text-blue-600 mr-1 h-3 w-3"
                                />
                                사용완료 쿠폰 보기
                            </label>
                        </div>
                    </div>

                    {filteredPurchaseHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                            {showUsedCoupons ?
                                "구매 내역이 없습니다." :
                                "사용 가능한 쿠폰이 없습니다."}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPurchaseHistory.map((purchase, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-3 ${purchase.used ? 'bg-gray-50' : 'bg-white'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                            <div className="w-9 h-9 rounded bg-blue-50 border border-blue-100 flex items-center justify-center mr-3">
                                                <ShoppingBag className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-medium flex items-center">
                                                    {purchase.item.name}
                                                    {purchase.used && (
                                                        <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                            사용완료
                                                        </span>
                                                    )}
                                                </h5>
                                                <p className="text-xs text-gray-500">
                                                    {purchase.item.description}
                                                </p>
                                                <div className="mt-1 flex text-xs text-gray-500">
                                                    <span className="mr-2">
                                                        구매일: {new Date(purchase.date).toLocaleDateString('ko-KR')}
                                                    </span>
                                                    {purchase.used && purchase.usedDate && (
                                                        <span>
                                                            사용일: {new Date(purchase.usedDate).toLocaleDateString('ko-KR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className="text-sm font-medium text-yellow-600 mb-1">
                                                {purchase.item.price} G
                                            </div>
                                            {!purchase.used ? (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                        사용 가능
                                                    </div>
                                                    <button
                                                        onClick={() => handleUseCoupon(purchase.id)}
                                                        className="px-3 py-1 text-xs rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                                    >
                                                        쿠폰 사용
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-3 py-1 text-xs rounded-full bg-gray-300 text-gray-600 cursor-not-allowed"
                                                >
                                                    사용 완료
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {purchaseHistory.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                            <p className="font-medium mb-1">쿠폰 사용 안내</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                                <li>구매한 쿠폰은 '쿠폰 사용' 버튼을 클릭하여 사용할 수 있습니다.</li>
                                <li>사용된 쿠폰은 재사용할 수 없습니다.</li>
                                <li>쿠폰 사용에 대한 자세한 내용은 선생님께 문의하세요.</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PointShopTab 