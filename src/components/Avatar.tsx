'use client'

import React from 'react'
import Image from 'next/image'
import { Avatar, AvatarLayerType, AVATAR_LAYER_ORDER, parseAvatarString } from '@/lib/avatar'

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
            className={`relative ${className}`}
            style={{ width: size, height: size }}
        >
            {AVATAR_LAYER_ORDER.map(layerType => {
                const item = avatarData[layerType as keyof Avatar];
                if (!item) return null;

                return (
                    <div key={layerType} className="absolute inset-0">
                        <Image
                            src={item.imagePath}
                            alt={item.name}
                            width={size}
                            height={size}
                            className="w-full h-full object-contain"
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
}

export function AvatarItemRenderer({
    imagePath,
    name,
    size = 64,
    isSelected = false,
    onClick
}: AvatarItemRendererProps) {
    return (
        <div
            className={`relative cursor-pointer transition-all duration-200 
                ${isSelected ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'}`}
            style={{ width: size, height: size }}
            onClick={onClick}
        >
            <Image
                src={imagePath}
                alt={name}
                width={size}
                height={size}
                className="w-full h-full object-contain"
            />
        </div>
    );
} 