// 아바타 레이어 타입 정의
export type AvatarLayerType = 'body' | 'head' | 'hat' | 'weapon';

// 아바타 아이템 타입 정의
export interface AvatarItem {
    id: string;
    type: AvatarLayerType;
    name: string;
    imagePath: string;
    inventoryImagePath?: string;
}

// 아바타 구성 타입 정의
export interface Avatar {
    body?: AvatarItem;
    head?: AvatarItem;
    hat?: AvatarItem;
    weapon?: AvatarItem;
}

// 아바타 레이어 순서 (렌더링 순서)
export const AVATAR_LAYER_ORDER: AvatarLayerType[] = ['body', 'head', 'hat', 'weapon'];

// newby 머리 아이템 목록
export const NEWBY_HEAD_ITEMS: AvatarItem[] = [
    {
        id: 'head_boy_newby_1',
        type: 'head',
        name: '초보자 남자 머리 1',
        imagePath: '/images/items/head/head_boy_newby_1.png',
        inventoryImagePath: '/images/items/head/head_boy_newby_1_inven.png'
    },
    {
        id: 'head_boy_newby_2',
        type: 'head',
        name: '초보자 남자 머리 2',
        imagePath: '/images/items/head/head_boy_newby_2.png',
        inventoryImagePath: '/images/items/head/head_boy_newby_2_inven.png'
    },
    {
        id: 'head_girl_newby_1',
        type: 'head',
        name: '초보자 여자 머리 1',
        imagePath: '/images/items/head/head_girl_newby_1.png',
        inventoryImagePath: '/images/items/head/head_girl_newby_1_inven.png'
    },
    {
        id: 'head_girl_newby_2',
        type: 'head',
        name: '초보자 여자 머리 2',
        imagePath: '/images/items/head/head_girl_newby_2.png',
        inventoryImagePath: '/images/items/head/head_girl_newby_2_inven.png'
    }
];

// newby 몸 아이템 목록
export const NEWBY_BODY_ITEMS: AvatarItem[] = [
    {
        id: 'body_1_newby1',
        type: 'body',
        name: '초보자 몸 1',
        imagePath: '/images/items/body/body_1_newby1.png'
    },
    {
        id: 'body_1_newby2',
        type: 'body',
        name: '초보자 몸 2',
        imagePath: '/images/items/body/body_1_newby2.png',
        inventoryImagePath: '/images/items/body/body_1_newby2_inven.png'
    }
];

// 랜덤 초보자 아바타 생성 함수
export function createRandomNewbyAvatar(): Avatar {
    // 랜덤으로 머리 선택
    const randomHeadIndex = Math.floor(Math.random() * NEWBY_HEAD_ITEMS.length);
    const head = NEWBY_HEAD_ITEMS[randomHeadIndex];

    // 랜덤으로 몸 선택
    const randomBodyIndex = Math.floor(Math.random() * NEWBY_BODY_ITEMS.length);
    const body = NEWBY_BODY_ITEMS[randomBodyIndex];

    // 아바타 구성 반환
    return {
        body,
        head
    };
}

// 아바타 문자열을 아바타 객체로 변환
export function parseAvatarString(avatarString?: string): Avatar {
    if (!avatarString) return createRandomNewbyAvatar();

    try {
        return JSON.parse(avatarString) as Avatar;
    } catch (error) {
        console.error('아바타 문자열 파싱 오류:', error);
        return createRandomNewbyAvatar();
    }
}

// 아바타 객체를 문자열로 변환
export function stringifyAvatar(avatar: Avatar): string {
    return JSON.stringify(avatar);
}

// 아바타 아이템 추가/변경 함수
export function updateAvatarItem(avatar: Avatar, item: AvatarItem): Avatar {
    return {
        ...avatar,
        [item.type]: item
    };
}

// 아바타 아이템 제거 함수
export function removeAvatarItem(avatar: Avatar, layerType: AvatarLayerType): Avatar {
    const newAvatar = { ...avatar };
    delete newAvatar[layerType];
    return newAvatar;
}

// 아바타 데이터 인터페이스
export interface AvatarData {
    body?: string;
    head?: string;
    hat?: string;
    weapon?: string;
}

// 학생 아바타 인벤토리 인터페이스
export interface StudentInventory {
    userId: string;
    items: AvatarItem[];
}

// 학생에게 랜덤 초기 아바타 할당
export const getRandomInitialAvatar = (): AvatarData => {
    // head 타입 랜덤 선택 (남/여)
    const genderType = Math.random() > 0.5 ? 'boy' : 'girl';
    const headNumber = Math.random() > 0.5 ? '1' : '2';
    const headId = `head_${genderType}_newby_${headNumber}`;

    // body 타입 랜덤 선택
    const bodyNumber = Math.random() > 0.5 ? '1' : '2';
    const bodyId = `body_1_newby${bodyNumber}`;

    return {
        head: headId,
        body: bodyId
    };
};

// 학생 인벤토리 초기화 (newby head 아이템들로)
export const initializeStudentInventory = (userId: string): StudentInventory => {
    return {
        userId,
        items: NEWBY_HEAD_ITEMS.concat(NEWBY_BODY_ITEMS)
    };
};

// 인벤토리에서 아이템 ID로 아이템 찾기
export const findItemInInventory = (inventory: StudentInventory, itemId: string): AvatarItem | undefined => {
    return inventory.items.find(item => item.id === itemId);
};

// 아이템 ID가 유효한지 확인 (해당 타입의 아이템이 있는지)
export const isValidItemId = (itemId: string, type: AvatarLayerType): boolean => {
    const allItems = NEWBY_HEAD_ITEMS.concat(NEWBY_BODY_ITEMS);
    return allItems.some(item => item.id === itemId && item.type === type);
}; 