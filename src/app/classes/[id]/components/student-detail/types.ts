// 학생 상세 모달에서 사용할 인터페이스 및 타입 정의

// 학생 타입 정의
export interface Student {
    id: string;
    name: string;
    honorific?: string;
    stats: {
        level: number;
        exp: number;
    };
    points: number;
    abilities: {
        intelligence: number;
        diligence: number;
        creativity: number;
        personality: number;
        health?: number;       // 체력
        communication?: number; // 의사소통
    };
    avatar?: Avatar | null;
}

// 아바타 타입 정의
export interface Avatar {
    id: string;
    name: string;
    // 다른 아바타 관련 필드들...
}

// 모달 프롭스 타입 정의
export interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string | null;
    classId: string | null;
    initialTab?: TabType;
}

// 탭 타입
export type TabType = 'challenges' | 'missions' | 'cards' | 'pointshop' | 'avatar';

// 포인트샵 탭 타입
export type PointShopTabType = 'avatar_items' | 'class_items' | 'purchases';

// 능력치 정의
export interface AbilityFlags {
    intelligence?: boolean;
    diligence?: boolean;
    creativity?: boolean;
    personality?: boolean;
    health?: boolean;       // 체력
    communication?: boolean; // 의사소통
}

// 보상 정의
export interface Reward {
    exp: number;
    gold: number;
}

// 완료된 챌린지 스텝
export interface ChallengeStep {
    id: string;
    title: string;
    description: string;
    completedAt?: string;
    stepNumber?: number;
    safeStepNumber?: number;
}

// 완료된 챌린지
export interface CompletedChallenge {
    id: string;
    title: string;
    description: string;
    steps: ChallengeStep[];
    abilities?: AbilityFlags;
    rewards?: Reward;
    timestamp: string;
    rewardTitle?: string;
    totalSteps?: number;
}

// 기존 타입과의 호환성을 위한 타입 별칭
export type CompletedRoadmap = CompletedChallenge;
export type RoadmapStep = ChallengeStep;

// 완료된 미션
export interface CompletedMission {
    id: string;
    title: string;
    description: string;
    abilities?: AbilityFlags;
    rewards?: Reward;
    timestamp: string;
}

// 받은 칭찬 카드
export interface ReceivedCard {
    id: string;
    title: string;
    message: string;
    sender: string;
    abilities?: AbilityFlags;
    rewards?: Reward;
    timestamp: string;
}

// 아바타 아이템
export interface AvatarItem {
    id: string;
    name: string;
    imagePath: string;
    cost: number;
    type: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    description?: string;
}

// 구매한 아이템
export interface PurchasedItem {
    id: string;
    itemId: string;
    name: string;
    imagePath: string;
    cost: number;
    type: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    purchasedAt: string;
    isEquipped?: boolean;
}

// 공통 타입들은 더 추가될 수 있습니다. 