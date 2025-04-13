// 공통 데이터 타입 정의

export interface ClassInfo {
    id: string;
    name: string;
    grade: string;
    subject: string;
    description: string;
    coverImage: string;
    schoolName?: string;
    createdAt: string;
    classId?: string;
}

export interface Student {
    id: string;
    name: string;
    number: number;
    classId: string;
    honorific?: string;
    iconType: number;
    avatar?: string;
    stats: {
        level: number;
        exp: number;
    };
    points: number;
}

export interface Mission {
    id: string;
    name: string;
    condition: string;
    achievers: string[];
    classId: string;
    createdAt: string;
}

export interface MissionAchievement {
    id: string;
    studentId: string;
    missionId: string;
    classId: string;
    timestamp: string;
}

export interface RoadmapStep {
    id: string;
    goal: string;
    students: string[];
}

export interface Roadmap {
    id: string;
    name: string;
    rewardTitle: string;
    icon: string;
    steps: RoadmapStep[];
    classId: string;
    createdAt: string;
}

export interface PraiseCard {
    id: string;
    content: string;
    studentId: string;
    classId: string;
    createdAt: string;
}

export interface PointShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    classId: string;
    createdAt: string;
}

export interface PurchaseHistory {
    id: string;
    studentId: string;
    itemId: string;
    quantity: number;
    classId: string;
    timestamp: string;
    purchaseDate?: string;
    used?: boolean;
    usedDate?: string | null;
}

export interface Notification {
    id: string;
    type: 'exp' | 'levelup' | 'evolution' | 'points';
    message: string;
    studentId: string;
    expanded: boolean;
    timestamp: number;
}

// 상수 정의
export const EXP_PER_LEVEL = 100; // 레벨업에 필요한 경험치
export const EXP_FOR_MISSION = 100; // 미션 완료 시 획득 경험치
export const EXP_FOR_ROADMAP_STEP = 100; // 로드맵 단계 완료 시 획득 경험치
export const POINTS_PER_LEVEL = 100; // 레벨업 시 획득 포인트 