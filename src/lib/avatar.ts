// 아바타 레이어 타입 정의
export type AvatarLayerType = 'body' | 'head' | 'hat' | 'weapon';

// 아바타 아이템 희귀도 정의
export enum AvatarRarity {
    COMMON = 1,    // 일반 (흰색)
    RARE = 2,      // 희귀 (녹색)
    EPIC = 3,      // 영웅 (보라색)
    LEGENDARY = 4, // 전설 (주황색)
    MYTHIC = 5     // 신화 (무지개)
}

// 희귀도별 이름 매핑
export const RARITY_NAMES = {
    [AvatarRarity.COMMON]: '일반',
    [AvatarRarity.RARE]: '희귀',
    [AvatarRarity.EPIC]: '영웅',
    [AvatarRarity.LEGENDARY]: '전설',
    [AvatarRarity.MYTHIC]: '신화'
};

// 희귀도별 테두리 색상 클래스 매핑
export const RARITY_BORDER_CLASSES = {
    [AvatarRarity.COMMON]: 'ring-2 ring-white',
    [AvatarRarity.RARE]: 'ring-2 ring-green-500',
    [AvatarRarity.EPIC]: 'ring-2 ring-purple-500',
    [AvatarRarity.LEGENDARY]: 'ring-2 ring-orange-500',
    [AvatarRarity.MYTHIC]: 'ring-2 ring-rainbow'  // 커스텀 무지개 클래스 (별도 CSS 필요)
};

// 아바타 아이템 타입 정의
export interface AvatarItem {
    id: string;
    type: AvatarLayerType;
    name: string;
    imagePath: string;
    inventoryImagePath?: string;
    rarity: AvatarRarity;  // 아이템 희귀도 추가
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

// 파일 ID에서 희귀도 추출 함수
export function getRarityFromItemId(itemId: string): AvatarRarity {
    // itemId에서 등급 번호 추출 (예: body_1_newby1 -> 1)
    const matches = itemId.match(/^(body|head|hat|weapon)_(\d)_/);
    if (matches && matches[2]) {
        const rarityNum = parseInt(matches[2]);
        if (rarityNum >= AvatarRarity.COMMON && rarityNum <= AvatarRarity.MYTHIC) {
            return rarityNum as AvatarRarity;
        }
    }
    return AvatarRarity.COMMON; // 기본값은 일반 등급
}

// 아이템 희귀도에 따른 이름 포맷팅
export function formatItemNameWithRarity(item: AvatarItem): string {
    return `[${RARITY_NAMES[item.rarity]}] ${item.name}`;
}

// newby 머리 아이템 목록
export const NEWBY_HEAD_ITEMS: AvatarItem[] = [
    {
        id: 'head_1_newby_0',
        type: 'head',
        name: '초보 모험가 머리 1',
        imagePath: '/images/items/head/head_1_newby_0.png',
        inventoryImagePath: '/images/items/head/head_1_newby_0_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'head_1_newby_1',
        type: 'head',
        name: '초보 모험가 머리 2',
        imagePath: '/images/items/head/head_1_newby_1.png',
        inventoryImagePath: '/images/items/head/head_1_newby_1_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'head_1_newby_2',
        type: 'head',
        name: '초보 모험가 머리 3',
        imagePath: '/images/items/head/head_1_newby_2.png',
        inventoryImagePath: '/images/items/head/head_1_newby_2_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'head_1_newby_3',
        type: 'head',
        name: '초보 모험가 머리 4',
        imagePath: '/images/items/head/head_1_newby_3.png',
        inventoryImagePath: '/images/items/head/head_1_newby_3_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'head_1_newby_4',
        type: 'head',
        name: '초보 모험가 머리 5',
        imagePath: '/images/items/head/head_1_newby_4.png',
        inventoryImagePath: '/images/items/head/head_1_newby_4_inven.png',
        rarity: AvatarRarity.COMMON
    }
];

// newby 몸 아이템 목록
export const NEWBY_BODY_ITEMS: AvatarItem[] = [
    {
        id: 'body_1_newby1',
        type: 'body',
        name: '초보 모험가 옷',
        imagePath: '/images/items/body/body_1_newby1.png',
        inventoryImagePath: '/images/items/body/body_1_newby1_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'body_1_newby2',
        type: 'body',
        name: '견습 마법사 로브',
        imagePath: '/images/items/body/body_1_newby2.png',
        inventoryImagePath: '/images/items/body/body_1_newby2_inven.png',
        rarity: AvatarRarity.COMMON
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
    // 머리 타입 랜덤 선택 (성별 중립적인 파일명 사용)
    const headNumber = Math.floor(Math.random() * 5); // 0~4 사이의 숫자
    const headId = `head_1_newby_${headNumber}`;

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

// Newby가 아닌 머리 아이템 목록
export const PREMIUM_HEAD_ITEMS: AvatarItem[] = [
    {
        id: 'head_2_dariu',
        type: 'head',
        name: '전사 다리우',
        imagePath: '/images/items/head/head_2_dariu.png',
        inventoryImagePath: '/images/items/head/head_2_dariu_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'head_2_isuz',
        type: 'head',
        name: '궁수 이수즈',
        imagePath: '/images/items/head/head_2_isuz.png',
        inventoryImagePath: '/images/items/head/head_2_isuz_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'head_3_aku',
        type: 'head',
        name: '암흑기사 아쿠',
        imagePath: '/images/items/head/head_3_aku.png',
        inventoryImagePath: '/images/items/head/head_3_aku_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_aria',
        type: 'head',
        name: '대마법사 아리아',
        imagePath: '/images/items/head/head_3_aria.png',
        inventoryImagePath: '/images/items/head/head_3_aria_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_bora',
        type: 'head',
        name: '정령술사 보라',
        imagePath: '/images/items/head/head_3_bora.png',
        inventoryImagePath: '/images/items/head/head_3_bora_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_daren',
        type: 'head',
        name: '성기사 다렌',
        imagePath: '/images/items/head/head_3_daren.png',
        inventoryImagePath: '/images/items/head/head_3_daren_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_dariu',
        type: 'head',
        name: '전설의 검사 다리우',
        imagePath: '/images/items/head/head_3_dariu.png',
        inventoryImagePath: '/images/items/head/head_3_dariu_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_goku',
        type: 'head',
        name: '무술 대가 고쿠',
        imagePath: '/images/items/head/head_3_goku.png',
        inventoryImagePath: '/images/items/head/head_3_goku_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_isuz',
        type: 'head',
        name: '신궁 이수즈',
        imagePath: '/images/items/head/head_3_isuz.png',
        inventoryImagePath: '/images/items/head/head_3_isuz_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_ren',
        type: 'head',
        name: '어둠의 암살자 렌',
        imagePath: '/images/items/head/head_3_ren.png',
        inventoryImagePath: '/images/items/head/head_3_ren_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'head_3_reo',
        type: 'head',
        name: '현자 레오',
        imagePath: '/images/items/head/head_3_reo.png',
        inventoryImagePath: '/images/items/head/head_3_reo_inven.png',
        rarity: AvatarRarity.EPIC
    }
];

// Newby가 아닌 몸 아이템 목록
export const PREMIUM_BODY_ITEMS: AvatarItem[] = [
    {
        id: 'body_1_silverdress',
        type: 'body',
        name: '은빛 드레스',
        imagePath: '/images/items/body/body_1_silverdress.png',
        inventoryImagePath: '/images/items/body/body_1_silverdress_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'body_2_dosa1',
        type: 'body',
        name: '도사의 로브',
        imagePath: '/images/items/body/body_2_dosa1.png',
        inventoryImagePath: '/images/items/body/body_2_dosa1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_egypt',
        type: 'body',
        name: '이집트 파라오 의상',
        imagePath: '/images/items/body/body_2_egypt.png',
        inventoryImagePath: '/images/items/body/body_2_egypt_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_elfrobe',
        type: 'body',
        name: '요정족 로브',
        imagePath: '/images/items/body/body_2_elfrobe.png',
        inventoryImagePath: '/images/items/body/body_2_elfrobe_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_firerobe1',
        type: 'body',
        name: '화염 마법사 로브',
        imagePath: '/images/items/body/body_2_firerobe1.png',
        inventoryImagePath: '/images/items/body/body_2_firerobe1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_goldarmor',
        type: 'body',
        name: '황금 전투 갑옷',
        imagePath: '/images/items/body/body_2_goldarmor.png',
        inventoryImagePath: '/images/items/body/body_2_goldarmor_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_hanbok1',
        type: 'body',
        name: '화려한 한복',
        imagePath: '/images/items/body/body_2_hanbok1.png',
        inventoryImagePath: '/images/items/body/body_2_hanbok1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_hanbok2',
        type: 'body',
        name: '고운 한복',
        imagePath: '/images/items/body/body_2_hanbok2.png',
        inventoryImagePath: '/images/items/body/body_2_hanbok2_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_hunter1',
        type: 'body',
        name: '사냥꾼의 갑옷',
        imagePath: '/images/items/body/body_2_hunter1.png',
        inventoryImagePath: '/images/items/body/body_2_hunter1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_munyu',
        type: 'body',
        name: '문유의 도복',
        imagePath: '/images/items/body/body_2_munyu.png',
        inventoryImagePath: '/images/items/body/body_2_munyu_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_powerarmor',
        type: 'body',
        name: '마력 강화 갑옷',
        imagePath: '/images/items/body/body_2_powerarmor.png',
        inventoryImagePath: '/images/items/body/body_2_powerarmor_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_robe1',
        type: 'body',
        name: '고위 마법사 로브',
        imagePath: '/images/items/body/body_2_robe1.png',
        inventoryImagePath: '/images/items/body/body_2_robe1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_silverarmor',
        type: 'body',
        name: '은빛 전투 갑옷',
        imagePath: '/images/items/body/body_2_silverarmor.png',
        inventoryImagePath: '/images/items/body/body_2_silverarmor_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_silverdress',
        type: 'body',
        name: '은빛 예복',
        imagePath: '/images/items/body/body_2_silverdress.png',
        inventoryImagePath: '/images/items/body/body_2_silverdress_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_silverfullplate',
        type: 'body',
        name: '은빛 전신 갑옷',
        imagePath: '/images/items/body/body_2_silverfullplate.png',
        inventoryImagePath: '/images/items/body/body_2_silverfullplate_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_2_soldierarmor',
        type: 'body',
        name: '용사의 갑옷',
        imagePath: '/images/items/body/body_2_soldierarmor.png',
        inventoryImagePath: '/images/items/body/body_2_soldierarmor_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'body_3_dobok',
        type: 'body',
        name: '전설의 무술 도복',
        imagePath: '/images/items/body/body_3_dobok.png',
        inventoryImagePath: '/images/items/body/body_3_dobok_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'body_3_holyknight',
        type: 'body',
        name: '성스러운 기사의 갑옷',
        imagePath: '/images/items/body/body_3_holyknight.png',
        inventoryImagePath: '/images/items/body/body_3_holyknight_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'body_3_kight2',
        type: 'body',
        name: '황금 기사단 정복',
        imagePath: '/images/items/body/body_3_kight2.png',
        inventoryImagePath: '/images/items/body/body_3_kight2_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'body_3_knight',
        type: 'body',
        name: '전설의 기사 갑옷',
        imagePath: '/images/items/body/body_3_knight.png',
        inventoryImagePath: '/images/items/body/body_3_knight_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'body_3_modernsoldier1',
        type: 'body',
        name: '현대 전투복',
        imagePath: '/images/items/body/body_3_modernsoldier1.png',
        inventoryImagePath: '/images/items/body/body_3_modernsoldier1_inven.png',
        rarity: AvatarRarity.EPIC
    }
];

// 모자 아이템 목록
export const HAT_ITEMS: AvatarItem[] = [
    {
        id: 'hat_1_breadhat',
        type: 'hat',
        name: '빵 모자',
        imagePath: '/images/items/hat/hat_1_breadhat.png',
        inventoryImagePath: '/images/items/hat/hat_1_breadhat_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'hat_1_wizardhat',
        type: 'hat',
        name: '마법사 모자',
        imagePath: '/images/items/hat/hat_1_wizardhat.png',
        inventoryImagePath: '/images/items/hat/hat_1_wizardhat_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'hat_2_breadhat',
        type: 'hat',
        name: '고급 빵 모자',
        imagePath: '/images/items/hat/hat_2_breadhat.png',
        inventoryImagePath: '/images/items/hat/hat_2_breadhat_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_foxgamyun',
        type: 'hat',
        name: '신비한 여우 가면',
        imagePath: '/images/items/hat/hat_2_foxgamyun.png',
        inventoryImagePath: '/images/items/hat/hat_2_foxgamyun_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_gaksital',
        type: 'hat',
        name: '전설의 각시탈',
        imagePath: '/images/items/hat/hat_2_gaksital.png',
        inventoryImagePath: '/images/items/hat/hat_2_gaksital_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_glass',
        type: 'hat',
        name: '현자의 안경',
        imagePath: '/images/items/hat/hat_2_glass.png',
        inventoryImagePath: '/images/items/hat/hat_2_glass_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_goldencircle',
        type: 'hat',
        name: '황금 후광',
        imagePath: '/images/items/hat/hat_2_goldencircle.png',
        inventoryImagePath: '/images/items/hat/hat_2_goldencircle_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_starhat',
        type: 'hat',
        name: '별빛 모자',
        imagePath: '/images/items/hat/hat_2_starhat.png',
        inventoryImagePath: '/images/items/hat/hat_2_starhat_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_sunglass',
        type: 'hat',
        name: '미래형 선글라스',
        imagePath: '/images/items/hat/hat_2_sunglass.png',
        inventoryImagePath: '/images/items/hat/hat_2_sunglass_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_2_wariorhelmet',
        type: 'hat',
        name: '전사의 투구',
        imagePath: '/images/items/hat/hat_2_wariorhelmet.png',
        inventoryImagePath: '/images/items/hat/hat_2_wariorhelmet_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'hat_3_winghelmet',
        type: 'hat',
        name: '발키리 날개 투구',
        imagePath: '/images/items/hat/hat_3_winghelmet.png',
        inventoryImagePath: '/images/items/hat/hat_3_winghelmet_inven.png',
        rarity: AvatarRarity.EPIC
    }
];

// 무기 아이템 목록
export const WEAPON_ITEMS: AvatarItem[] = [
    {
        id: 'weapon_1_dagger',
        type: 'weapon',
        name: '기본 단검',
        imagePath: '/images/items/weapon/weapon_1_dagger.png',
        inventoryImagePath: '/images/items/weapon/weapon_1_dagger_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'weapon_1_magic_1',
        type: 'weapon',
        name: '견습 마법 지팡이',
        imagePath: '/images/items/weapon/weapon_1_magic_1.png',
        inventoryImagePath: '/images/items/weapon/weapon_1_magic_1_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'weapon_1_magicbook',
        type: 'weapon',
        name: '초급 마법서',
        imagePath: '/images/items/weapon/weapon_1_magicbook.png',
        inventoryImagePath: '/images/items/weapon/weapon_1_magicbook_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'weapon_1_sword',
        type: 'weapon',
        name: '기본 검',
        imagePath: '/images/items/weapon/weapon_1_sword.png',
        inventoryImagePath: '/images/items/weapon/weapon_1_sword_inven.png',
        rarity: AvatarRarity.COMMON
    },
    {
        id: 'weapon_2_bonesword',
        type: 'weapon',
        name: '죽음의 뼈검',
        imagePath: '/images/items/weapon/weapon_2_bonesword.png',
        inventoryImagePath: '/images/items/weapon/weapon_2_bonesword_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'weapon_2_gun1',
        type: 'weapon',
        name: '마법 건',
        imagePath: '/images/items/weapon/weapon_2_gun1.png',
        inventoryImagePath: '/images/items/weapon/weapon_2_gun1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'weapon_2_icesword',
        type: 'weapon',
        name: '서리한을 머금은 검',
        imagePath: '/images/items/weapon/weapon_2_icesword.png',
        inventoryImagePath: '/images/items/weapon/weapon_2_icesword_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'weapon_2_knight',
        type: 'weapon',
        name: '기사단의 검',
        imagePath: '/images/items/weapon/weapon_2_knight.png',
        inventoryImagePath: '/images/items/weapon/weapon_2_knight_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'weapon_2_magic_1',
        type: 'weapon',
        name: '고급 마법 지팡이',
        imagePath: '/images/items/weapon/weapon_2_magic_1.png',
        inventoryImagePath: '/images/items/weapon/weapon_2_magic_1_inven.png',
        rarity: AvatarRarity.RARE
    },
    {
        id: 'weapon_3_firesword',
        type: 'weapon',
        name: '화염의 심판검',
        imagePath: '/images/items/weapon/weapon_3_firesword.png',
        inventoryImagePath: '/images/items/weapon/weapon_3_firesword_inven.png',
        rarity: AvatarRarity.EPIC
    },
    {
        id: 'weapon_3_lightsword',
        type: 'weapon',
        name: '빛나는 소울 블레이드',
        imagePath: '/images/items/weapon/weapon_3_lightsword.png',
        inventoryImagePath: '/images/items/weapon/weapon_3_lightsword_inven.png',
        rarity: AvatarRarity.EPIC
    }
];

// 모든 프리미엄 아이템 목록 (초보자 아이템 제외)
export const ALL_PREMIUM_ITEMS: AvatarItem[] = [
    ...PREMIUM_HEAD_ITEMS,
    ...PREMIUM_BODY_ITEMS,
    ...HAT_ITEMS,
    ...WEAPON_ITEMS
];

// 랜덤 프리미엄 아바타 아이템 가져오기 (newby 아이템 제외)
export function getRandomPremiumAvatarItem(): AvatarItem {
    // 랜덤으로 아이템 선택
    const randomIndex = Math.floor(Math.random() * ALL_PREMIUM_ITEMS.length);
    return ALL_PREMIUM_ITEMS[randomIndex];
}

// 특정 타입의 랜덤 프리미엄 아바타 아이템 가져오기
export function getRandomPremiumAvatarItemByType(type: AvatarLayerType): AvatarItem | null {
    let itemPool: AvatarItem[] = [];

    switch (type) {
        case 'head':
            itemPool = PREMIUM_HEAD_ITEMS;
            break;
        case 'body':
            itemPool = PREMIUM_BODY_ITEMS;
            break;
        case 'hat':
            itemPool = HAT_ITEMS;
            break;
        case 'weapon':
            itemPool = WEAPON_ITEMS;
            break;
    }

    if (itemPool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * itemPool.length);
    return itemPool[randomIndex];
} 