'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
    Avatar,
    AvatarLayerType,
    AVATAR_LAYER_ORDER,
    parseAvatarString,
    AvatarItem as AvatarItemType,
    AvatarRarity,
    RARITY_NAMES,
    RARITY_BORDER_CLASSES,
    getAvatarItemDisplayName
} from '@/lib/avatar'

interface AvatarRendererProps {
    avatar: Avatar | string;
    size?: number;
    className?: string;
}

export default function AvatarRenderer({
    avatar,
    size = 64,
    className = ''
}: AvatarRendererProps) {
    // 문자열인 경우 파싱
    const avatarData = typeof avatar === 'string' ? parseAvatarString(avatar) : avatar;

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {AVATAR_LAYER_ORDER.map(layerType => {
                const item = avatarData[layerType as keyof Avatar];
                if (!item) return null;

                return (
                    <div key={layerType} className="absolute inset-0 flex items-center justify-center">
                        <Image
                            src={item.imagePath}
                            alt={item.name}
                            width={size}
                            height={size}
                            className="w-full h-full object-contain object-center"
                        />
                    </div>
                );
            })}
        </div>
    );
}

// 학생 카드에서 사용하는 더 큰 버전의 아바타 렌더러
export function LargeAvatarRenderer({
    avatar,
    size = 120,
    className = ''
}: AvatarRendererProps) {
    return (
        <AvatarRenderer
            avatar={avatar}
            size={size}
            className={`rounded-lg ${className}`}
        />
    );
}

// 인벤토리에서 사용할 아바타 아이템 렌더러
interface AvatarItemRendererProps {
    imagePath: string;
    name: string;
    size?: number;
    isSelected?: boolean;
    onClick?: () => void;
    rarity?: AvatarRarity; // 희귀도 추가
    showRarityBadge?: boolean; // 희귀도 배지 표시 여부
    itemId?: string; // 아이템 ID 추가
}

// 희귀도에 따른 배지 색상 클래스
const RARITY_BADGE_CLASSES = {
    [AvatarRarity.COMMON]: 'rarity-common',
    [AvatarRarity.RARE]: 'rarity-rare',
    [AvatarRarity.EPIC]: 'rarity-epic',
    [AvatarRarity.LEGENDARY]: 'rarity-legendary',
    [AvatarRarity.MYTHIC]: 'rarity-mythic'
};

export function AvatarItemRenderer({
    imagePath,
    name,
    size = 64,
    isSelected = false,
    onClick,
    rarity = AvatarRarity.COMMON,
    showRarityBadge = true,
    itemId
}: AvatarItemRendererProps) {
    // 희귀도에 따른 테두리 스타일
    const rarityBorderClass = RARITY_BORDER_CLASSES[rarity];
    const [displayName, setDisplayName] = useState(name);

    // itemId가 있으면 커스텀 이름이 있는지 확인
    useEffect(() => {
        if (!itemId) return;

        const checkCustomName = () => {
            try {
                const customNamesStr = localStorage.getItem('avatarCustomNames');
                if (customNamesStr) {
                    const customNames = JSON.parse(customNamesStr) as Record<string, string>;
                    if (customNames[itemId]) {
                        setDisplayName(customNames[itemId]);
                    } else {
                        setDisplayName(name);
                    }
                }
            } catch (error) {
                console.error('이름 로드 오류:', error);
            }
        };

        // 초기 로드
        checkCustomName();

        // 로컬 스토리지 변경 이벤트 리스너
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'avatarCustomNames') {
                checkCustomName();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [itemId, name]);

    return (
        <div
            className={`relative flex items-center justify-center cursor-pointer transition-all duration-200 rounded-md overflow-hidden
                ${isSelected ? 'scale-105' : 'hover:scale-105'}
                ${rarityBorderClass}`}
            style={{ width: size, height: size }}
            onClick={onClick}
            title={`${displayName} [${RARITY_NAMES[rarity]}]`}
        >
            {/* 희귀도 배지 (선택적) - 숫자 제거 */}
            {showRarityBadge && rarity > AvatarRarity.COMMON && (
                <div className={`rarity-badge ${RARITY_BADGE_CLASSES[rarity]}`} title={RARITY_NAMES[rarity]}>
                    {/* {rarity} - 숫자 제거 */}
                </div>
            )}

            <Image
                src={imagePath}
                alt={displayName}
                width={size}
                height={size}
                className="w-full h-full object-contain object-center"
            />
        </div>
    );
} 