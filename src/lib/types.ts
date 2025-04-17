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

export interface ChallengeStep {
    id: string;
    title: string;
    description: string;
}

export interface Challenge {
    id: string;
    name: string;
    steps: ChallengeStep[];
    rewardTitle: string;
    icon: string;
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
// 레벨업에 필요한 경험치는 이제 함수로 계산 (N * 100)
// 레벨 1에서 레벨 2가 되기 위한 기본 경험치 값
export const BASE_EXP_LEVEL_1 = 100;

// 각 활동별 보상 정의
export const MISSION_REWARDS = {
    exp: 100,  // 미션 완료 시 획득 경험치
    gold: 100  // 미션 완료 시 획득 골드
};

export const CHALLENGE_STEP_REWARDS = {
    exp: 200,  // 챌린지 단계 완료 시 획득 경험치
    gold: 200  // 챌린지 단계 완료 시 획득 골드
};

export const PRAISE_CARD_REWARDS = {
    exp: 50,   // 칭찬 카드 획득 시 획득 경험치
    gold: 50   // 칭찬 카드 획득 시 획득 골드
};

export const EXP_FOR_ROADMAP_STEP = CHALLENGE_STEP_REWARDS.exp; // 이전 상수와의 호환성을 위한 상수 별칭

// 레벨별 필요 경험치 계산 함수
// 레벨 N에서 N+1이 되기 위한 경험치는 N * 100
export function getExpRequiredForLevel(level: number): number {
    return level * 100;
}

// 총 경험치에서 레벨 계산 함수
export function calculateLevelFromExp(totalExp: number): { level: number, expInCurrentLevel: number, expRequiredForNextLevel: number } {
    console.log('calculateLevelFromExp 호출됨, totalExp:', totalExp);

    // 레벨 계산 로직
    // 레벨에 따라 필요 경험치가 점점 증가함
    // 레벨 1->2: 100, 레벨 2->3: 200, 레벨 3->4: 300, ...
    let level = 1;
    let expRemaining = totalExp;
    let expRequired = getExpRequiredForLevel(level);

    // 레벨 계산
    while (expRemaining >= expRequired) {
        expRemaining -= expRequired;
        level++;
        expRequired = getExpRequiredForLevel(level);
    }

    // 현재 레벨에서의 경험치와 다음 레벨까지 필요한 경험치
    const expInCurrentLevel = expRemaining;
    const expRequiredForNextLevel = getExpRequiredForLevel(level);

    // 계산 결과를 객체로 반환
    const result = { level, expInCurrentLevel, expRequiredForNextLevel };
    console.log('calculateLevelFromExp 결과:', result);

    return result;
}

// 이전 타입과의 호환성을 위한 타입 별칭
export type RoadmapStep = ChallengeStep;
export type Roadmap = Challenge; 