// 공통 데이터 타입 정의

export interface ClassInfo {
    id: string;
    name: string;
    grade: string;
    subject: string;
    description: string;
    coverImage: string;
    students: Student[];
    createdAt: string;
    schoolName?: string;
}

export interface Student {
    id: string;
    number: number;
    name: string;
    honorific: string;
    stats: {
        level: number;
        exp?: number;
    };
    iconType: string;
    points?: number;
}

export interface Mission {
    id: string;
    name: string;
    condition: string;
    achievers: string[]; // 미션 달성자 ID 목록
    createdAt: string;
}

export interface MissionAchievement {
    studentId: string;
    missionId: string;
    timestamp: string;
}

export interface RoadmapStep {
    id: string;
    goal: string;
    students?: string[]; // 학생 ID 배열
}

export interface Roadmap {
    id: string;
    name: string;
    steps: RoadmapStep[];
    rewardTitle: string;
    icon: string;
    createdAt: string;
}

export interface PraiseCard {
    id: string;
    content: string;
    studentId: string;
    createdAt: string;
}

export interface PointShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    createdAt: string;
}

export interface PurchaseHistory {
    id: string;
    studentId: string;
    itemId: string;
    purchaseDate: string;
    used: boolean;
    usedDate?: string;
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