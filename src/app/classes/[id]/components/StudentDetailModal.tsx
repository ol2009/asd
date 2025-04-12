'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { X, Edit, Award, Trash2, User, Target, Gift, ShoppingBag, Coins, ShoppingCart, Loader2, ShirtIcon, Cpu, Sword, Calendar, Shirt, Crown } from 'lucide-react'
import AvatarRenderer, { AvatarItemRenderer } from '@/components/Avatar'
import {
    Avatar, AvatarItem, AvatarLayerType, AVATAR_LAYER_ORDER,
    NEWBY_HEAD_ITEMS, NEWBY_BODY_ITEMS, AvatarRarity,
    parseAvatarString, stringifyAvatar, updateAvatarItem, getRandomPremiumAvatarItem,
    PREMIUM_HEAD_ITEMS, PREMIUM_BODY_ITEMS, HAT_ITEMS, WEAPON_ITEMS
} from '@/lib/avatar'

const EXP_PER_LEVEL = 100
const POINTS_PER_LEVEL = 100

// 칭호 목록
const honorifics = [
    '열정 넘치는',
    '성실한',
    '똑똑한',
    '도전하는',
    '창의적인',
    '멋진',
    '친절한',
    '책임감 있는',
    '리더십 있는',
    '긍정적인'
]

// 로드맵 달성 칭호 목록
const roadmapHonorifics = [
    '미래 탐험가',
    '지식 수집가',
    '문제 해결사',
    '탐구 전문가',
    '창조적 사고자'
]

// 사용 가능한 칭호 목록을 반환하는 함수
const getAvailableHonorifics = () => {
    // 여기서는 간단히 로드맵 칭호만 반환합니다.
    // 실제로는 완료한 로드맵에 따라 칭호를 반환해야 합니다.
    return roadmapHonorifics;
}

// 학생 타입 정의
interface Student {
    id: string
    name: string
    number: number
    iconType?: string
    honorific?: string
    points?: number
    stats: {
        level: number
        exp: number
        abilities?: {
            intelligence: number // 지력
            diligence: number    // 성실성
            creativity: number   // 창의력
            personality: number  // 인성
        }
    }
    avatar?: string
    purchasedItems?: any[] // 구매한 아이템 목록 추가
}

interface StudentDetailModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string | null
    classId: string | null
    initialTab?: 'roadmaps' | 'missions' | 'cards' | 'pointshop' | 'avatar'
}

// AvatarData 타입 정의
interface AvatarData {
    head?: AvatarItem;
    body?: AvatarItem;
    hat?: AvatarItem;
    weapon?: AvatarItem;
    [key: string]: AvatarItem | undefined;
}

const avatarStringToData = (avatarString?: string): AvatarData | null => {
    if (!avatarString) return null;
    try {
        return JSON.parse(avatarString);
    } catch (e) {
        console.error('Avatar parse error:', e);
        return null;
    }
};

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, studentId, classId, initialTab = 'roadmaps' }) => {
    const [student, setStudent] = useState<Student | null>(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'missions' | 'cards' | 'pointshop' | 'avatar'>(initialTab)
    const [expandedRoadmapId, setExpandedRoadmapId] = useState<string | null>(null)
    const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null)
    const [honorifics, setHonorifics] = useState<string[]>(['모험가', '마법사', '기사', '궁수', '현자', '용사'])
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isHoverCard, setIsHoverCard] = useState<string | null>(null)
    const params = useParams()
    const paramsClassId = params?.id as string || null

    // 학생 완료 항목 데이터
    const [completedRoadmaps, setCompletedRoadmaps] = useState<{
        roadmapId: string
        stepId: string
        roadmapName: string
        stepGoal: string
        abilities?: {
            intelligence?: boolean
            diligence?: boolean
            creativity?: boolean
            personality?: boolean
        }
        rewards?: {
            exp: number
            gold: number
        }
    }[]>([])

    const [completedMissions, setCompletedMissions] = useState<{
        id: string
        name: string
        condition: string
        timestamp?: string
        abilities?: {
            intelligence?: boolean
            diligence?: boolean
            creativity?: boolean
            personality?: boolean
        }
        rewards?: {
            exp: number
            gold: number
        }
    }[]>([])

    const [receivedCards, setReceivedCards] = useState<{
        id: string
        cardId: string
        cardName: string
        cardDescription: string
        issuedAt: number
        abilities?: {
            intelligence?: boolean
            diligence?: boolean
            creativity?: boolean
            personality?: boolean
        }
        rewards?: {
            exp: number
            gold: number
        }
    }[]>([])

    // 포인트샵 관련 상태
    const [purchasedItems, setPurchasedItems] = useState<any[]>([])
    const [pointItems, setPointItems] = useState<any[]>([])
    const [pointshopLoading, setPointshopLoading] = useState(true)
    const [activePointShopTab, setActivePointShopTab] = useState<'avatar_items' | 'class_items' | 'purchases'>('avatar_items')
    const [avatarTab, setAvatarTab] = useState<'customize' | 'title'>('customize')
    const [historyFilter, setHistoryFilter] = useState<'all' | 'avatar' | 'class'>('all')

    // 로딩 상태
    const [roadmapsLoading, setRoadmapsLoading] = useState(true)
    const [missionsLoading, setMissionsLoading] = useState(true)
    const [cardsLoading, setCardsLoading] = useState(true)

    // 아바타 관련 상태
    const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null)
    const [selectedAvatarLayer, setSelectedAvatarLayer] = useState<AvatarLayerType>('head')
    const [availableItems, setAvailableItems] = useState<AvatarItem[]>([])

    useEffect(() => {
        if (!isOpen || !studentId || !classId) return

        loadStudentInfo()
        loadCompletedRoadmaps()
        loadCompletedMissions()
        loadReceivedCards()
        loadPointShopItems()
        loadAvatarInventory()
    }, [isOpen, studentId, classId])

    const loadStudentInfo = () => {
        try {
            console.log('학생 정보 로드 시작', { studentId, classId });

            // 1. 먼저 students_classId에서 학생 정보 찾기 시도
            const savedStudents = localStorage.getItem(`students_${classId}`);
            console.log('students_classId에서 학생 정보 확인:', { savedStudents: savedStudents ? '있음' : '없음' });

            if (savedStudents) {
                try {
                    const students = JSON.parse(savedStudents);
                    console.log('파싱된 학생 목록:', { count: students.length });

                    const foundStudent = students.find((s: any) => s.id === studentId);
                    console.log('저장된 학생 목록에서 학생 찾기 결과:', { found: !!foundStudent });

                    if (foundStudent) {
                        // 필수 필드가 없을 경우 기본값 설정
                        if (!foundStudent.stats) foundStudent.stats = { level: 0, exp: 0 };
                        if (foundStudent.stats.exp === undefined) foundStudent.stats.exp = 0;
                        if (foundStudent.points === undefined) foundStudent.points = 0;
                        // 능력치 필드가 없을 경우 기본값 설정
                        if (!foundStudent.stats.abilities) {
                            foundStudent.stats.abilities = {
                                intelligence: 1, // 지력
                                diligence: 1,    // 성실성
                                creativity: 1,   // 창의력
                                personality: 1   // 인성
                            };
                        }

                        console.log('최종 학생 정보 설정:', foundStudent);
                        setStudent(foundStudent);

                        // 아바타 정보 로드
                        if (foundStudent.avatar) {
                            setCurrentAvatar(parseAvatarString(foundStudent.avatar));
                        } else {
                            setCurrentAvatar(null);
                        }

                        // 기본적으로 모든 newby 아이템을 사용 가능하게 설정
                        setAvailableItems([...NEWBY_HEAD_ITEMS]);

                        return;
                    }
                } catch (error) {
                    console.error('저장된 학생 목록 파싱 중 오류:', error);
                }
            }

            // 2. 클래스 정보에서 학생 찾기 시도
            const classesJson = localStorage.getItem('classes');
            console.log('classes에서 학생 정보 확인:', { classesJson: classesJson ? '있음' : '없음' });

            if (!classesJson) {
                toast.error('클래스 정보를 불러올 수 없습니다.');
                return;
            }

            const classes = JSON.parse(classesJson);
            const currentClass = classes.find((cls: any) => cls.id === classId);
            console.log('현재 클래스 찾기:', { found: !!currentClass });

            if (!currentClass) {
                toast.error('현재 클래스를 찾을 수 없습니다.');
                return;
            }

            // students 배열 확인 및 처리
            console.log('클래스 내 학생 배열 검증:', {
                hasStudents: !!currentClass.students,
                isArray: Array.isArray(currentClass.students),
                count: currentClass.students ? currentClass.students.length : 0
            });

            if (!currentClass.students || !Array.isArray(currentClass.students)) {
                console.warn('currentClass.students가 배열이 아닙니다:', currentClass.students);
                toast.error('학생 정보를 찾을 수 없습니다.');
                return;
            }

            const foundStudent = currentClass.students.find((s: any) => s.id === studentId);
            console.log('클래스 내 학생 찾기 결과:', { found: !!foundStudent });

            if (!foundStudent) {
                toast.error('학생 정보를 찾을 수 없습니다.');
                return;
            }

            // 필수 필드가 없을 경우 기본값 설정
            if (!foundStudent.stats) foundStudent.stats = { level: 0, exp: 0 };
            if (foundStudent.stats.exp === undefined) foundStudent.stats.exp = 0;
            if (foundStudent.points === undefined) foundStudent.points = 0;

            console.log('최종 학생 정보 설정:', foundStudent);
            setStudent(foundStudent);

            // 아바타 정보 로드
            if (foundStudent.avatar) {
                setCurrentAvatar(parseAvatarString(foundStudent.avatar));
            } else {
                setCurrentAvatar(null);
            }

            // 기본적으로 모든 newby 아이템을 사용 가능하게 설정
            setAvailableItems([...NEWBY_HEAD_ITEMS]);

        } catch (error) {
            console.error('학생 정보 로드 중 오류 발생:', error);
            toast.error('학생 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    const loadCompletedRoadmaps = async () => {
        setRoadmapsLoading(true)
        try {
            const roadmapsJson = localStorage.getItem(`roadmaps_${classId}`)
            if (!roadmapsJson) {
                setCompletedRoadmaps([])
                return
            }

            const roadmaps = JSON.parse(roadmapsJson)
            const completed: any[] = []

            roadmaps.forEach((roadmap: any) => {
                if (roadmap.steps) {
                    roadmap.steps.forEach((step: any) => {
                        // roadmap 객체 내 students 배열 확인
                        let isCompleted = false;
                        if (step.students && step.students.includes(studentId)) {
                            isCompleted = true;
                        }

                        // localStorage에서 단계별 학생 목록 확인
                        if (!isCompleted) {
                            const stepStudentsJson = localStorage.getItem(`roadmap_${classId}_step_${step.id}_students`);
                            if (stepStudentsJson) {
                                const stepStudents = JSON.parse(stepStudentsJson);
                                if (Array.isArray(stepStudents) && stepStudents.includes(studentId)) {
                                    isCompleted = true;
                                }
                            }
                        }

                        if (isCompleted) {
                            completed.push({
                                roadmapId: roadmap.id,
                                stepId: step.id,
                                roadmapName: roadmap.name,
                                stepGoal: step.goal,
                                abilities: step.abilities || {
                                    // 기본값 설정 (로드맵 단계에 능력치 필드가 없을 경우)
                                    intelligence: false,
                                    diligence: false,
                                    creativity: false,
                                    personality: false
                                },
                                rewards: {
                                    exp: 100, // 기본 경험치 100
                                    gold: 100  // 기본 골드 100
                                }
                            });
                        }
                    })
                }
            })

            console.log('완료한 로드맵:', completed);
            setCompletedRoadmaps(completed)
        } catch (error) {
            console.error('로드맵 정보 로드 중 오류 발생:', error)
            toast.error('로드맵 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setRoadmapsLoading(false)
        }
    }

    const loadCompletedMissions = async () => {
        setMissionsLoading(true)
        try {
            const missionsJson = localStorage.getItem(`missions_${classId}`)
            if (!missionsJson) {
                setCompletedMissions([])
                return
            }

            const missions = JSON.parse(missionsJson)

            // 미션 달성 내역 불러오기
            const achievementsJson = localStorage.getItem(`mission_achievements_${classId}`)
            const achievements = achievementsJson ? JSON.parse(achievementsJson) : []

            // 현재 학생이 달성한 미션 필터링
            const studentAchievements = achievements.filter((achievement: any) =>
                achievement.studentId === studentId
            )

            // 미션 ID와 달성 시간을 매핑
            const missionTimestamps: Record<string, string> = {}
            studentAchievements.forEach((achievement: any) => {
                missionTimestamps[achievement.missionId] = achievement.timestamp
            })

            // 학생이 달성한 미션 목록 생성
            const completed = missions
                .filter((mission: any) =>
                    mission.achievers && mission.achievers.includes(studentId)
                )
                .map((mission: any) => ({
                    id: mission.id,
                    name: mission.name,
                    condition: mission.condition,
                    timestamp: missionTimestamps[mission.id] || mission.createdAt, // 달성 시간이 없으면 미션 생성 시간 사용
                    abilities: mission.abilities || {
                        // 기본값 설정 (미션에 능력치 필드가 없을 경우)
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false
                    },
                    rewards: {
                        exp: 100, // 기본 경험치 100
                        gold: 50  // 기본 골드 50
                    }
                }))
                // 최신순으로 정렬 (timestamp 기준 내림차순)
                .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

            setCompletedMissions(completed)
        } catch (error) {
            console.error('미션 정보 로드 중 오류 발생:', error)
            toast.error('미션 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setMissionsLoading(false)
        }
    }

    const loadReceivedCards = async () => {
        setCardsLoading(true)
        try {
            const cardsJson = localStorage.getItem(`praise_cards_${classId}`)
            const historyJson = localStorage.getItem(`praise_cards_history_${classId}`)

            if (!cardsJson || !historyJson) {
                setReceivedCards([])
                return
            }

            const cards = JSON.parse(cardsJson)
            const histories = JSON.parse(historyJson)

            // 이 학생이 받은 모든 카드 이력 찾기
            const studentHistories = histories.filter((history: any) =>
                history.studentId === studentId
            )

            // 각 이력에 카드 정보를 매핑
            const received = studentHistories.map((history: any) => {
                const card = cards.find((c: any) => c.id === history.cardId)
                return {
                    id: history.id,
                    cardId: history.cardId,
                    cardName: card ? card.name : '알 수 없는 카드',
                    cardDescription: card ? card.description : '',
                    issuedAt: history.issuedAt || Date.now(),
                    abilities: card?.abilities || {
                        // 기본값 설정 (칭찬카드에 능력치 필드가 없을 경우)
                        intelligence: false,
                        diligence: false,
                        creativity: false,
                        personality: false
                    },
                    rewards: {
                        exp: 50,  // 기본 경험치 50
                        gold: 30  // 기본 골드 30
                    }
                }
            })

            setReceivedCards(received)
        } catch (error) {
            console.error('칭찬카드 정보 로드 중 오류 발생:', error)
            toast.error('칭찬카드 정보를 불러오는 중 오류가 발생했습니다.')
        } finally {
            setCardsLoading(false)
        }
    }

    // 골드 상점 아이템 불러오기
    const loadPointShopItems = () => {
        setPointshopLoading(true);
        try {
            // 로컬 스토리지에서 골드 상점 아이템 가져오기
            const savedItems = localStorage.getItem(`pointshop_items_${classId}`);
            if (savedItems) {
                const items = JSON.parse(savedItems);

                // 랜덤 아바타 아이템이 없으면 추가
                const hasRandomAvatarItem = items.some((item: any) => item.id === 'random_avatar');
                if (!hasRandomAvatarItem) {
                    const randomAvatarItem = {
                        id: 'random_avatar',
                        name: '랜덤 아바타',
                        description: '랜덤으로 아바타 아이템 하나가 인벤토리에 추가됩니다. (머리, 몸, 모자, 무기 중 하나)',
                        price: 300,
                        createdAt: new Date().toISOString(),
                        isSystem: true, // 시스템 아이템 표시
                        itemType: 'avatar' // 아바타 타입 아이템으로 분류
                    };
                    items.push(randomAvatarItem);
                }

                // 특정 부위별 아바타 아이템 추가
                const avatarTypeItems = [
                    {
                        id: 'avatar_head',
                        name: '머리 부위 아바타',
                        description: '랜덤으로 머리 부위 아바타 아이템 하나가 인벤토리에 추가됩니다.',
                        price: 300,
                        createdAt: new Date().toISOString(),
                        isSystem: true,
                        itemType: 'avatar',
                        avatarPart: 'head'
                    },
                    {
                        id: 'avatar_body',
                        name: '몸통 부위 아바타',
                        description: '랜덤으로 몸통 부위 아바타 아이템 하나가 인벤토리에 추가됩니다.',
                        price: 300,
                        createdAt: new Date().toISOString(),
                        isSystem: true,
                        itemType: 'avatar',
                        avatarPart: 'body'
                    },
                    {
                        id: 'avatar_hat',
                        name: '모자 부위 아바타',
                        description: '랜덤으로 모자 부위 아바타 아이템 하나가 인벤토리에 추가됩니다.',
                        price: 300,
                        createdAt: new Date().toISOString(),
                        isSystem: true,
                        itemType: 'avatar',
                        avatarPart: 'hat'
                    },
                    {
                        id: 'avatar_weapon',
                        name: '무기 아바타',
                        description: '랜덤으로 무기 아바타 아이템 하나가 인벤토리에 추가됩니다.',
                        price: 300,
                        createdAt: new Date().toISOString(),
                        isSystem: true,
                        itemType: 'avatar',
                        avatarPart: 'weapon'
                    }
                ];

                // 각 타입별 아바타 아이템이 없는 경우 추가
                avatarTypeItems.forEach(newItem => {
                    const hasItem = items.some((item: any) => item.id === newItem.id);
                    if (!hasItem) {
                        items.push(newItem);
                    }
                });

                localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(items));
                setPointItems(items);
            } else {
                // 골드샵 아이템이 없는 경우, 기본 아이템들 추가
                const defaultItems: { id: string, name: string, description: string, price: number, createdAt: string }[] = [];
                localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(defaultItems));
                setPointItems(defaultItems);
            }

            // 구매 내역 가져오기
            const savedPurchases = localStorage.getItem(`pointshop_purchases_${classId}_${studentId}`);
            if (savedPurchases) {
                setPurchasedItems(JSON.parse(savedPurchases));
            } else {
                setPurchasedItems([]);
            }
        } catch (error) {
            console.error('골드 상점 데이터 로드 중 오류:', error);
        } finally {
            setPointshopLoading(false);
        }
    };

    // 아바타 인벤토리 로드
    const loadAvatarInventory = () => {
        if (!studentId) return;

        try {
            // 학생의 아바타 아이템 인벤토리 가져오기
            const inventoryKey = `avatar_inventory_${studentId}`;
            const savedInventory = localStorage.getItem(inventoryKey);

            let allAvailableItems: AvatarItem[] = [...NEWBY_HEAD_ITEMS, ...NEWBY_BODY_ITEMS];

            if (savedInventory) {
                const inventory: AvatarItem[] = JSON.parse(savedInventory);

                // 중복 아이템 제거하며 병합
                inventory.forEach(item => {
                    if (!allAvailableItems.some(existingItem => existingItem.id === item.id)) {
                        allAvailableItems.push(item);
                    }
                });
            }

            // 현재 선택된 레이어에 맞는's 아이템만 필터링
            updateAvailableItemsByLayer(selectedAvatarLayer, allAvailableItems);
        } catch (error) {
            console.error('아바타 인벤토리 로드 중 오류:', error);
        }
    };

    // 아바타 레이어 선택 핸들러 - 사용 가능한 아이템 목록 업데이트
    const handleAvatarLayerSelect = (layer: AvatarLayerType) => {
        setSelectedAvatarLayer(layer);

        // 학생의 아바타 인벤토리 가져오기
        const inventoryKey = `avatar_inventory_${studentId}`;
        let allItems: AvatarItem[] = [...NEWBY_HEAD_ITEMS, ...NEWBY_BODY_ITEMS];

        try {
            const savedInventory = localStorage.getItem(inventoryKey);
            if (savedInventory) {
                const inventory: AvatarItem[] = JSON.parse(savedInventory);

                // 중복 아이템 제거하며 병합
                inventory.forEach(item => {
                    if (!allItems.some(existingItem => existingItem.id === item.id)) {
                        allItems.push(item);
                    }
                });
            }
        } catch (error) {
            console.error('아바타 인벤토리 로드 중 오류:', error);
        }

        // 선택된 레이어에 맞는 아이템으로 필터링
        updateAvailableItemsByLayer(layer, allItems);
    };

    // 레이어와 아이템 목록을 기반으로 사용 가능한 아이템 업데이트
    const updateAvailableItemsByLayer = (layer: AvatarLayerType, allItems: AvatarItem[]) => {
        // 선택된 레이어에 맞는 아이템으로 필터링
        const filteredItems = allItems.filter(item => item.type === layer);
        setAvailableItems(filteredItems);
    };

    // 아바타 아이템 선택 핸들러
    const handleAvatarItemSelect = (item: AvatarItem) => {
        if (!student || !currentAvatar) return;

        // 새 아바타 생성
        const newAvatar = updateAvatarItem(currentAvatar, item);
        setCurrentAvatar(newAvatar);

        // 학생 데이터 업데이트
        const updatedStudent = {
            ...student,
            avatar: stringifyAvatar(newAvatar)
        };

        // 학생 상태 업데이트
        setStudent(updatedStudent);

        try {
            // class_${classId} 데이터 업데이트
            const storedClass = localStorage.getItem(`class_${classId}`);
            if (storedClass) {
                const updatedClass = JSON.parse(storedClass);
                const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === student.id);

                if (studentIndex !== -1) {
                    // 학생 아바타 업데이트
                    updatedClass.students[studentIndex].avatar = stringifyAvatar(newAvatar);
                    localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));
                }
            }

            // students_${classId} 데이터 업데이트
            const savedStudents = localStorage.getItem(`students_${classId}`);
            if (savedStudents) {
                const students = JSON.parse(savedStudents);
                const updatedStudents = students.map((s: Student) =>
                    s.id === student.id ? { ...s, avatar: stringifyAvatar(newAvatar) } : s
                );
                localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents));
            }

            // 변경 메시지 표시
            toast.success("아바타가 변경되었습니다.");
        } catch (error) {
            console.error('아바타 변경 중 오류 발생:', error);
            toast.error('아바타를 변경하는 중 오류가 발생했습니다.');
        }
    };

    // 골드 상점 탭 변경 함수
    const handlePointShopTabChange = (tab: 'avatar_items' | 'class_items' | 'purchases') => {
        setActivePointShopTab(tab);
    }

    // 골드 상품 구매 함수
    const handlePurchaseItem = (item: any) => {
        if (!student) return;

        try {
            // 골드가 부족한 경우
            if ((student.points || 0) < item.price) {
                toast.error('골드가 부족합니다.');
                return;
            }

            // 상품 구매 처리
            const purchase = {
                id: Date.now().toString(),
                itemId: item.id,
                itemName: item.name,
                price: item.price,
                purchaseDate: new Date().toISOString(),
                used: false
            };

            // 구매 내역 업데이트
            const updatedPurchases = [...purchasedItems, purchase];
            setPurchasedItems(updatedPurchases);
            localStorage.setItem(`pointshop_purchases_${classId}_${studentId}`, JSON.stringify(updatedPurchases));

            // 학생 골드 차감
            const updatedPoints = (student.points || 0) - item.price;
            const updatedStudent = { ...student, points: updatedPoints };
            setStudent(updatedStudent);

            // localStorage에 학생 골드 업데이트
            updateStudentPoints(updatedPoints);

            toast.success(`${item.name}을(를) 구매했습니다.`);
        } catch (error) {
            console.error('상품 구매 중 오류:', error);
            toast.error('상품 구매 중 오류가 발생했습니다.');
        }
    };

    // 아바타 아이템 구매 함수
    const handlePurchaseAvatarItem = (avatarPart: 'head' | 'body' | 'hat' | 'weapon') => {
        if (!student) return;

        try {
            // 골드가 부족한 경우
            if ((student.points || 0) < 300) {
                toast.error('골드가 부족합니다.');
                return;
            }

            // 아바타 부위별 랜덤 아이템 선택
            const randomAvatarItem = getRandomAvatarItemByType(avatarPart);

            // 학생의 아바타 아이템 인벤토리 가져오기
            const inventoryKey = `avatar_inventory_${studentId}`;
            let inventory: AvatarItem[] = [];

            const savedInventory = localStorage.getItem(inventoryKey);
            if (savedInventory) {
                inventory = JSON.parse(savedInventory);
            }

            // 새 아이템 인벤토리에 추가
            inventory.push(randomAvatarItem);
            localStorage.setItem(inventoryKey, JSON.stringify(inventory));

            // 구매 내역에 추가 (아이템 정보 포함)
            const purchase = {
                id: Date.now().toString(),
                itemId: `avatar_${avatarPart}`,
                itemName: `${avatarPart === 'head' ? '머리' : avatarPart === 'body' ? '몸통' : avatarPart === 'hat' ? '모자' : '무기'} 부위 아바타 (${randomAvatarItem.name})`,
                avatarItem: randomAvatarItem, // 아바타 아이템 정보 저장
                price: 300,
                purchaseDate: new Date().toISOString(),
                used: true // 바로 사용됨으로 표시
            };

            // 인벤토리 탭에서 사용할 수 있도록 아이템을 사용 가능한 아이템 목록에 추가
            if (randomAvatarItem.type === selectedAvatarLayer) {
                // 현재 선택된 레이어와 같은 타입인 경우 즉시 목록에 추가
                setAvailableItems(prev => [...prev, randomAvatarItem]);
            }

            // 구매 내역 업데이트
            const updatedPurchases = [...purchasedItems, purchase];
            setPurchasedItems(updatedPurchases);
            localStorage.setItem(`pointshop_purchases_${classId}_${studentId}`, JSON.stringify(updatedPurchases));

            // 학생 골드 차감
            const updatedPoints = (student.points || 0) - 300;
            const updatedStudent = { ...student, points: updatedPoints };
            setStudent(updatedStudent);

            // localStorage에 학생 골드 업데이트
            updateStudentPoints(updatedPoints);

            // 구매 성공 메시지 및 아바타 탭으로 이동 옵션
            toast.success(
                <div>
                    <p>{`${avatarPart === 'head' ? '머리' : avatarPart === 'body' ? '몸통' : avatarPart === 'hat' ? '모자' : '무기'} 부위 아바타를 구매했습니다. ${randomAvatarItem.name} 아이템이 추가되었습니다.`}</p>
                    <button
                        onClick={() => {
                            setActiveTab('avatar');
                            handleAvatarLayerSelect(randomAvatarItem.type);
                        }}
                        className="mt-2 text-sm text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                    >
                        아바타 탭으로 이동
                    </button>
                </div>,
                {
                    duration: 5000
                }
            );
        } catch (error) {
            console.error('아바타 상품 구매 중 오류:', error);
            toast.error('상품 구매 중 오류가 발생했습니다.');
        }
    };

    // 특정 타입의 랜덤 아바타 아이템 선택 함수
    const getRandomAvatarItemByType = (type: AvatarLayerType): AvatarItem => {
        let availableItems: AvatarItem[] = [];

        switch (type) {
            case 'head':
                availableItems = PREMIUM_HEAD_ITEMS.filter(item => item.rarity > AvatarRarity.COMMON);
                break;
            case 'body':
                availableItems = PREMIUM_BODY_ITEMS.filter(item => item.rarity > AvatarRarity.COMMON);
                break;
            case 'hat':
                availableItems = HAT_ITEMS.filter(item => item.rarity > AvatarRarity.COMMON);
                break;
            case 'weapon':
                availableItems = WEAPON_ITEMS.filter(item => item.rarity > AvatarRarity.COMMON);
                break;
            default:
                availableItems = PREMIUM_HEAD_ITEMS.filter(item => item.rarity > AvatarRarity.COMMON);
        }

        // 아이템이 없는 경우 예외 처리
        if (availableItems.length === 0) {
            // 기본 아이템 반환
            return NEWBY_HEAD_ITEMS[0];
        }

        const randomIndex = Math.floor(Math.random() * availableItems.length);
        return availableItems[randomIndex];
    };

    // 학생 골드 업데이트 함수
    const updateStudentPoints = (newPoints: number) => {
        try {
            // 1. students_classId 업데이트
            const studentsJson = localStorage.getItem(`students_${classId}`);
            if (studentsJson) {
                const students = JSON.parse(studentsJson);
                const studentIndex = students.findIndex((s: any) => s.id === studentId);

                if (studentIndex !== -1) {
                    students[studentIndex].points = newPoints;
                    localStorage.setItem(`students_${classId}`, JSON.stringify(students));
                }
            }

            // 2. classes 업데이트
            const classesJson = localStorage.getItem('classes');
            if (classesJson) {
                const classes = JSON.parse(classesJson);
                const classIndex = classes.findIndex((c: any) => c.id === classId);

                if (classIndex !== -1) {
                    const studentIndex = classes[classIndex].students.findIndex(
                        (s: any) => s.id === studentId
                    );

                    if (studentIndex !== -1) {
                        classes[classIndex].students[studentIndex].points = newPoints;
                        localStorage.setItem('classes', JSON.stringify(classes));
                    }
                }
            }

            // 3. class_classId 업데이트
            const classDataJson = localStorage.getItem(`class_${classId}`);
            if (classDataJson) {
                const classData = JSON.parse(classDataJson);

                if (classData.students && Array.isArray(classData.students)) {
                    const studentIndex = classData.students.findIndex(
                        (s: any) => s.id === studentId
                    );

                    if (studentIndex !== -1) {
                        classData.students[studentIndex].points = newPoints;
                        localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                    }
                }
            }
        } catch (error) {
            console.error('골드 업데이트 중 오류:', error);
        }
    }

    // 아이콘 변경 함수
    const handleIconChange = (iconType: string) => {
        if (!student) return

        try {
            // 로컬 스토리지에서 클래스 정보 로드
            const classesJson = localStorage.getItem('classes')
            if (!classesJson) return

            const classes = JSON.parse(classesJson)
            const classIndex = classes.findIndex((cls: any) => cls.id === classId)
            if (classIndex === -1) return

            const studentIndex = classes[classIndex].students.findIndex(
                (s: any) => s.id === studentId
            )
            if (studentIndex === -1) return

            // 학생 아이콘 업데이트
            classes[classIndex].students[studentIndex].iconType = iconType

            // 클래스 정보 저장
            localStorage.setItem('classes', JSON.stringify(classes))

            // 로컬 상태 업데이트
            setStudent({
                ...student,
                iconType
            })

            // 아이콘 변경 모달 닫기
            setIsEditingIcon(false)

            toast.success('학생 아이콘이 변경되었습니다.', {
                style: { opacity: 1, backgroundColor: 'white', border: '1px solid #E2E8F0' }
            })
        } catch (error) {
            console.error('아이콘 변경 중 오류 발생:', error)
            toast.error('아이콘을 변경하는 중 오류가 발생했습니다.')
        }
    }

    // 칭호 변경 함수
    const handleHonorificChange = (honorific: string) => {
        if (!student) return

        try {
            console.log('칭호 변경 시작:', { studentId, honorific, classId });

            // 1. classes 스토리지 업데이트
            const classesJson = localStorage.getItem('classes')
            if (classesJson) {
                const classes = JSON.parse(classesJson)
                const classIndex = classes.findIndex((cls: any) => cls.id === classId)
                if (classIndex !== -1) {
                    const studentIndex = classes[classIndex].students.findIndex(
                        (s: any) => s.id === studentId
                    )
                    if (studentIndex !== -1) {
                        // 학생 칭호 업데이트
                        classes[classIndex].students[studentIndex].honorific = honorific
                        console.log('classes 스토리지 학생 칭호 업데이트:', { name: classes[classIndex].students[studentIndex].name, honorific });

                        // 클래스 정보 저장
                        localStorage.setItem('classes', JSON.stringify(classes))
                    } else {
                        console.warn('classes 스토리지에서 학생을 찾을 수 없음:', studentId);
                    }
                } else {
                    console.warn('classes 스토리지에서 클래스를 찾을 수 없음:', classId);
                }
            } else {
                console.warn('classes 스토리지 데이터가 없음');
            }

            // 2. students_classId 스토리지 업데이트
            const studentsJson = localStorage.getItem(`students_${classId}`);
            if (studentsJson) {
                const students = JSON.parse(studentsJson);
                const studentIndex = students.findIndex((s: any) => s.id === studentId);

                if (studentIndex !== -1) {
                    // 학생 이름 가져오기
                    const studentName = students[studentIndex].name;

                    // 칭호 업데이트
                    students[studentIndex].honorific = honorific;
                    console.log('students_classId 스토리지 학생 칭호 업데이트:', { studentName, honorific });

                    // 저장
                    localStorage.setItem(`students_${classId}`, JSON.stringify(students));
                } else {
                    console.warn('students_classId 스토리지에서 학생을 찾을 수 없음:', studentId);
                }
            } else {
                console.warn('students_classId 스토리지 데이터가 없음');
            }

            // 3. class_classId 스토리지 업데이트
            const classDataJson = localStorage.getItem(`class_${classId}`);
            if (classDataJson) {
                const classData = JSON.parse(classDataJson);

                if (classData.students && Array.isArray(classData.students)) {
                    const studentIndex = classData.students.findIndex(
                        (s: any) => s.id === studentId
                    );

                    if (studentIndex !== -1) {
                        // 학생 이름 가져오기
                        const studentName = classData.students[studentIndex].name;

                        // 칭호 업데이트
                        classData.students[studentIndex].honorific = honorific;
                        console.log('class_classId 스토리지 학생 칭호 업데이트:', { studentName, honorific });

                        // 저장
                        localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                    } else {
                        console.warn('class_classId 스토리지에서 학생을 찾을 수 없음:', studentId);
                    }
                } else {
                    console.warn('class_classId 스토리지에 students 배열이 없음');
                }
            } else {
                console.warn('class_classId 스토리지 데이터가 없음');
            }

            // 로컬 상태 업데이트
            setStudent({
                ...student,
                honorific
            })

            // 칭호 변경 모달 닫기
            setIsEditingHonorific(false)

            toast.success('학생 칭호가 변경되었습니다.', {
                style: { opacity: 1, backgroundColor: 'white', border: '1px solid #E2E8F0' }
            })

            console.log('칭호 변경 완료:', { studentId, honorific });
        } catch (error) {
            console.error('칭호 변경 중 오류 발생:', error)
            toast.error('칭호를 변경하는 중 오류가 발생했습니다.')
        }
    }

    // 아바타 탭 렌더링
    const renderAvatarTab = () => {
        if (!student) return null;

        return (
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-800">아바타</h3>
                    <div className="text-gray-600 font-medium">
                        {student.name}의 아바타
                    </div>
                </div>

                {/* 아바타 커스터마이징 영역 */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* 아바타 미리보기 */}
                        <div className="w-full md:w-1/3 flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                            <div className="w-32 h-32 bg-white rounded-full border-4 border-blue-200 overflow-hidden mb-3 flex items-center justify-center">
                                {currentAvatar ? (
                                    <AvatarRenderer avatar={currentAvatar} size={120} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">기본 아바타</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 text-sm mb-2">
                                {student.honorific || '칭호 없음'}
                            </div>
                            <button
                                onClick={() => setIsEditingHonorific(true)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                칭호 변경
                            </button>
                        </div>

                        {/* 아바타 아이템 선택 영역 */}
                        <div className="w-full md:w-2/3">
                            {/* 아바타 부위 선택 버튼 */}
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {AVATAR_LAYER_ORDER.map(layer => (
                                    <button
                                        key={layer}
                                        onClick={() => handleAvatarLayerSelect(layer)}
                                        className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${selectedAvatarLayer === layer
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                            }`}
                                    >
                                        {layer === 'head' && '머리'}
                                        {layer === 'body' && '몸통'}
                                        {layer === 'hat' && '모자'}
                                        {layer === 'weapon' && '무기'}
                                    </button>
                                ))}
                            </div>

                            {/* 아바타 아이템 선택 목록 */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium">
                                        {selectedAvatarLayer === 'head' && '머리 아이템'}
                                        {selectedAvatarLayer === 'body' && '몸통 아이템'}
                                        {selectedAvatarLayer === 'hat' && '모자 아이템'}
                                        {selectedAvatarLayer === 'weapon' && '무기 아이템'}
                                    </h4>
                                    <button
                                        onClick={() => setActiveTab('pointshop')}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center"
                                    >
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        아이템 구매
                                    </button>
                                </div>

                                {availableItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        사용 가능한 아이템이 없습니다.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                        {availableItems.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleAvatarItemSelect(item)}
                                                className={`p-2 rounded-lg border transition-all ${currentAvatar && currentAvatar[item.type]?.id === item.id
                                                    ? 'border-blue-400 bg-blue-50 shadow-sm'
                                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-white rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                                                        <AvatarItemRenderer
                                                            imagePath={item.inventoryImagePath || item.imagePath}
                                                            name={item.name}
                                                            size={36}
                                                            rarity={item.rarity}
                                                            showRarityBadge={true}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-semibold text-gray-700">{item.name}</h5>
                                                        <span className={`text-xs ${item.rarity === AvatarRarity.COMMON ? 'text-gray-500' :
                                                            item.rarity === AvatarRarity.RARE ? 'text-blue-500 font-medium' :
                                                                item.rarity === AvatarRarity.EPIC ? 'text-purple-500 font-medium' :
                                                                    'text-yellow-500 font-medium'
                                                            }`}>
                                                            {item.rarity === AvatarRarity.COMMON && '일반'}
                                                            {item.rarity === AvatarRarity.RARE && '레어'}
                                                            {item.rarity === AvatarRarity.EPIC && '에픽'}
                                                            {item.rarity === AvatarRarity.LEGENDARY && '레전더리'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 아이콘 렌더링 헬퍼 함수
    const renderIcon = (iconType: string | undefined, size: number = 24) => {
        if (!iconType) {
            return <div className="bg-blue-100 w-full h-full" />
        }

        return (
            <div className="relative w-full h-full">
                <Image
                    src={iconType}
                    alt="학생 아이콘"
                    fill
                    className="object-cover"
                />
            </div>
        )
    }

    // 아이콘 업데이트 함수
    const handleIconSelect = (newIconPath: string) => {
        if (!student) return;

        // 로컬 스토리지에서 클래스 정보 가져오기
        const storedClass = localStorage.getItem(`class_${classId}`);
        if (!storedClass) return;

        const updatedClass = JSON.parse(storedClass);
        const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === student.id);

        if (studentIndex !== -1) {
            // 학생 아이콘 업데이트
            updatedClass.students[studentIndex].iconType = newIconPath;
            localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));

            // 상태 업데이트
            setStudent({ ...student, iconType: newIconPath });
            setIsEditingIcon(false);

            // 성공 메시지 표시
            toast.success("학생 아이콘이 변경되었습니다.");
        }
    };

    // 아이콘 선택 모달
    const renderIconSelector = () => {
        if (!isEditingIcon) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">학생 아이콘 선택</h3>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleIconSelect(`/images/icons/student_icon_${index + 1}.png`)}
                                className="border p-2 rounded-md hover:bg-gray-100 flex flex-col items-center"
                            >
                                <div className="w-16 h-16 relative">
                                    <Image
                                        src={`/images/icons/student_icon_${index + 1}.png`}
                                        alt={`학생 아이콘 ${index + 1}`}
                                        width={64}
                                        height={64}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <p className="text-center">학생 {index + 1}</p>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => setIsEditingIcon(false)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 학생 삭제 함수
    const handleDeleteStudent = () => {
        if (!student || !classId) return;

        try {
            // 학생 목록 가져오기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (!savedStudents) {
                toast.error('학생 데이터를 찾을 수 없습니다.')
                return
            }

            let students: Student[] = JSON.parse(savedStudents)

            // 해당 학생 제거
            const updatedStudents = students.filter(s => s.id !== student.id)

            // 로컬 스토리지에 저장
            localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents))

            // 클래스 데이터에도 학생 정보 업데이트
            const classData = localStorage.getItem(`class_${classId}`)
            if (classData) {
                const classObj = JSON.parse(classData)
                classObj.students = updatedStudents
                localStorage.setItem(`class_${classId}`, JSON.stringify(classObj))
            }

            // classes 데이터에도 학생 정보 업데이트
            const classes = localStorage.getItem('classes')
            if (classes) {
                const allClasses = JSON.parse(classes)
                const classIndex = allClasses.findIndex((c: any) => c.id === classId)

                if (classIndex !== -1) {
                    allClasses[classIndex].students = updatedStudents
                    localStorage.setItem('classes', JSON.stringify(allClasses))
                }
            }

            toast.success(`${student.name} 학생이 삭제되었습니다.`)

            // 모달 닫기
            onClose()
        } catch (error) {
            console.error('학생 삭제 중 오류 발생:', error)
            toast.error('학생 삭제 중 오류가 발생했습니다.')
        }
    }

    // 누락된 handleUseItem 함수 추가
    const handleUseItem = (purchaseId: string) => {
        const updatedPurchases = purchasedItems.map(item =>
            item.id === purchaseId ? { ...item, used: true } : item
        );

        setPurchasedItems(updatedPurchases);
        localStorage.setItem(`pointshop_purchases_${classId}_${studentId}`, JSON.stringify(updatedPurchases));

        toast.success('상품을 사용했습니다.');
    }

    // 아바타 아이템 구매 여부 확인 함수
    const isPurchasedItem = (itemId: string): boolean => {
        if (!student || !student.purchasedItems) return false;
        return student.purchasedItems.some(item => item.id === itemId);
    };

    // 아바타 착용 함수
    const handleEquipAvatarItem = (item: AvatarItem) => {
        if (!student) return;

        const updatedStudent = {
            ...student,
            currentAvatar: item
        };

        setStudent(updatedStudent);

        // 로컬 스토리지 업데이트
        const studentsData = JSON.parse(localStorage.getItem('students') || '[]');
        const updatedStudents = studentsData.map((s: Student) =>
            s.id === student.id ? updatedStudent : s
        );
        localStorage.setItem('students', JSON.stringify(updatedStudents));

        toast.success(`${item.name} 아바타를 착용했습니다.`);
    };

    if (!isOpen) return null

    if (!student) {
        return (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto relative">
                    <p className="text-slate-700 text-xl">학생 데이터를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    // 경험치바 계산
    const exp = student.stats.exp || 0; // 경험치가 없으면 0으로 설정
    const expPercentage = ((exp % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100
    const remainingExp = EXP_PER_LEVEL - (exp % EXP_PER_LEVEL)

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-5xl h-[90vh] max-h-[800px] flex flex-col">
                {/* 상단 헤더 및 닫기 버튼 */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold text-blue-700">학생 상세 정보</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition"
                            title="학생 삭제"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow overflow-hidden">
                    {/* 좌측: 학생 프로필 정보 */}
                    <div className="md:col-span-1 overflow-y-auto pr-2">
                        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm p-4">
                            {/* 프로필 섹션 */}
                            <div className="flex flex-col items-center">
                                {/* 프로필 아이콘 - 아바타 사용 */}
                                <div className="relative w-28 h-28 mb-3 mx-auto">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                                        {student.avatar ? (
                                            <AvatarRenderer avatar={student.avatar} size={112} className="mx-auto" />
                                        ) : (
                                            renderIcon(student.iconType, 32)
                                        )}
                                    </div>
                                </div>

                                {/* 학생 이름 및 기본 정보 */}
                                <h3 className="text-xl font-bold text-blue-800 mb-1">{student.name}</h3>
                                <p className="text-slate-500 mb-2">{student.number}번</p>

                                {/* 칭호 표시 및 수정 버튼 - 칭호가 있을 때만 표시 */}
                                {student.honorific && (
                                    <div className="flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full mb-4">
                                        <span className="font-medium">{student.honorific}</span>
                                        <button
                                            onClick={() => setIsEditingHonorific(true)}
                                            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                            title="칭호 변경"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                {/* 칭호가 없을 때는 칭호 변경 버튼만 표시 */}
                                {!student.honorific && (
                                    <div className="flex items-center justify-center mb-4">
                                        <button
                                            onClick={() => setIsEditingHonorific(true)}
                                            className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 hover:text-blue-700 border border-blue-200"
                                            title="칭호 추가"
                                        >
                                            <div className="flex items-center">
                                                <Edit className="w-3.5 h-3.5 mr-1" />
                                                <span className="text-xs">칭호 추가</span>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* 레벨 및 경험치 정보 */}
                                <div className="w-full mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center">
                                            <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md font-bold">
                                                Lv. {student.stats.level}
                                            </div>
                                        </div>
                                        <span className="text-sm text-slate-600">
                                            {exp % EXP_PER_LEVEL} / {EXP_PER_LEVEL} EXP
                                        </span>
                                    </div>

                                    {/* 경험치 진행 바 */}
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                            style={{ width: `${expPercentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1">
                                        다음 레벨까지 {remainingExp} EXP 필요
                                    </div>
                                </div>

                                {/* 골드 표시 */}
                                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-yellow-800">보유 골드</span>
                                        <span className="text-xl font-bold text-yellow-600">{student.points || 0} G</span>
                                    </div>
                                </div>

                                {/* 능력치 표시 */}
                                <div className="w-full bg-white border border-gray-200 rounded-lg p-3">
                                    <h3 className="font-medium text-gray-800 mb-2">능력치</h3>
                                    <div className="space-y-2">
                                        {/* 지력 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Cpu className="w-4 h-4 text-blue-600 mr-1.5" />
                                                <span className="text-sm text-blue-700">지력</span>
                                            </div>
                                            <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.intelligence || 1}</span>
                                        </div>

                                        {/* 성실성 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Target className="w-4 h-4 text-green-600 mr-1.5" />
                                                <span className="text-sm text-green-700">성실성</span>
                                            </div>
                                            <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.diligence || 1}</span>
                                        </div>

                                        {/* 창의력 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9.663 17h4.673M12 3v1M3.412 7l.7.7M20.588 7l-.7.7M12 21v-1M18.36 17A8 8 0 0 0 12 4a8 8 0 0 0-6.36 13" />
                                                </svg>
                                                <span className="text-sm text-purple-700">창의력</span>
                                            </div>
                                            <span className="text-sm font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.creativity || 1}</span>
                                        </div>

                                        {/* 인성 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                </svg>
                                                <span className="text-sm text-red-700">인성</span>
                                            </div>
                                            <span className="text-sm font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{student.stats.abilities?.personality || 1}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 탭으로 구분된 로드맵, 미션, 칭찬카드 정보 */}
                    <div className="md:col-span-2 flex flex-col overflow-hidden">
                        {/* 탭 선택 버튼 */}
                        <div className="flex border-b border-gray-200 mb-2 flex-wrap">
                            <button
                                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'roadmaps'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('roadmaps')}
                            >
                                성장 로드맵
                            </button>
                            <button
                                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'missions'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('missions')}
                            >
                                완료한 미션
                            </button>
                            <button
                                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'cards'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('cards')}
                            >
                                받은 칭찬카드
                            </button>
                            <button
                                className={`py-1.5 px-3 text-sm font-medium ${activeTab === 'pointshop'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('pointshop')}
                            >
                                골드 상점
                            </button>
                            <button
                                onClick={() => setActiveTab('avatar')}
                                className={`py-1.5 px-3 text-sm font-medium border-b-2 ${activeTab === 'avatar'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <User className="w-3.5 h-3.5 mr-1" />
                                    <span>아바타</span>
                                </div>
                            </button>
                        </div>

                        {/* 탭 콘텐츠 영역 */}
                        <div className="flex-grow bg-white rounded-lg border border-gray-200 p-3 overflow-y-auto">
                            {/* 로드맵 탭 */}
                            {activeTab === 'roadmaps' && (
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-3">완료한 성장 로드맵</h3>

                                    {roadmapsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">로드맵 데이터 로딩 중...</p>
                                        </div>
                                    ) : completedRoadmaps.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">완료한 로드맵 단계가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {completedRoadmaps.map((item, index) => (
                                                <div
                                                    key={`${item.roadmapId}-${item.stepId}`}
                                                    className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-start"
                                                >
                                                    <div className="bg-green-200 text-green-800 rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-green-800">{item.roadmapName}</h4>
                                                        <p className="text-sm text-green-700 mt-1">{item.stepGoal}</p>

                                                        {/* 보상 정보 */}
                                                        <div className="flex items-center mt-2 text-xs">
                                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                                                +{item.rewards?.gold || 0} G
                                                            </span>
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                +{item.rewards?.exp || 0} EXP
                                                            </span>
                                                        </div>

                                                        {/* 능력치 정보 */}
                                                        {(item.abilities?.intelligence ||
                                                            item.abilities?.diligence ||
                                                            item.abilities?.creativity ||
                                                            item.abilities?.personality) && (
                                                                <div className="mt-2 pt-2 border-t border-green-100">
                                                                    <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {item.abilities?.intelligence && (
                                                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                                                지력 +1
                                                                            </span>
                                                                        )}
                                                                        {item.abilities?.diligence && (
                                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                                                성실성 +1
                                                                            </span>
                                                                        )}
                                                                        {item.abilities?.creativity && (
                                                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                                                창의력 +1
                                                                            </span>
                                                                        )}
                                                                        {item.abilities?.personality && (
                                                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                                                인성 +1
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 미션 탭 */}
                            {activeTab === 'missions' && (
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-3">완료한 미션</h3>

                                    {missionsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">미션 데이터 로딩 중...</p>
                                        </div>
                                    ) : completedMissions.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">완료한 미션이 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {completedMissions.map((mission) => (
                                                <div
                                                    key={mission.id}
                                                    className="bg-blue-50 border border-blue-100 rounded-lg p-3"
                                                >
                                                    <h4 className="font-medium text-blue-800">{mission.name}</h4>
                                                    <p className="text-sm text-blue-600 mt-1">{mission.condition}</p>

                                                    {/* 보상 정보 */}
                                                    <div className="flex items-center mt-2 text-xs">
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                                            +{mission.rewards?.gold || 0} G
                                                        </span>
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                            +{mission.rewards?.exp || 0} EXP
                                                        </span>
                                                    </div>

                                                    {/* 능력치 정보 */}
                                                    {(mission.abilities?.intelligence ||
                                                        mission.abilities?.diligence ||
                                                        mission.abilities?.creativity ||
                                                        mission.abilities?.personality) && (
                                                            <div className="mt-2 pt-2 border-t border-blue-100">
                                                                <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {mission.abilities?.intelligence && (
                                                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                            <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                                            지력 +1
                                                                        </span>
                                                                    )}
                                                                    {mission.abilities?.diligence && (
                                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                            <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                                            성실성 +1
                                                                        </span>
                                                                    )}
                                                                    {mission.abilities?.creativity && (
                                                                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                            <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                                            창의력 +1
                                                                        </span>
                                                                    )}
                                                                    {mission.abilities?.personality && (
                                                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                            <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                                            인성 +1
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* 획득 시간 */}
                                                    <div className="mt-2 text-right">
                                                        <p className="text-xs text-gray-500">
                                                            {mission.timestamp && new Date(mission.timestamp).toLocaleDateString('ko-KR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 칭찬카드 탭 */}
                            {activeTab === 'cards' && (
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-3">받은 칭찬카드</h3>

                                    {cardsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">칭찬카드 데이터 로딩 중...</p>
                                        </div>
                                    ) : receivedCards.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">받은 칭찬카드가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {receivedCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className="bg-purple-50 border border-purple-100 rounded-lg p-3"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="bg-purple-200 text-purple-700 p-1.5 rounded-full mr-2">
                                                            <Award className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-purple-800">{card.cardName}</h4>
                                                            <p className="text-sm text-purple-600 mt-1">{card.cardDescription}</p>

                                                            {/* 보상 정보 */}
                                                            <div className="flex items-center mt-2 text-xs">
                                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mr-2">
                                                                    +{card.rewards?.gold || 0} G
                                                                </span>
                                                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                                    +{card.rewards?.exp || 0} EXP
                                                                </span>
                                                            </div>

                                                            {/* 능력치 정보 */}
                                                            {(card.abilities?.intelligence ||
                                                                card.abilities?.diligence ||
                                                                card.abilities?.creativity ||
                                                                card.abilities?.personality) && (
                                                                    <div className="mt-2 pt-2 border-t border-purple-100">
                                                                        <p className="text-xs text-gray-500 mb-1">획득한 능력치:</p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {card.abilities?.intelligence && (
                                                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                    <span className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-1"></span>
                                                                                    지력 +1
                                                                                </span>
                                                                            )}
                                                                            {card.abilities?.diligence && (
                                                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                    <span className="w-1.5 h-1.5 bg-green-700 rounded-full mr-1"></span>
                                                                                    성실성 +1
                                                                                </span>
                                                                            )}
                                                                            {card.abilities?.creativity && (
                                                                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                    <span className="w-1.5 h-1.5 bg-purple-700 rounded-full mr-1"></span>
                                                                                    창의력 +1
                                                                                </span>
                                                                            )}
                                                                            {card.abilities?.personality && (
                                                                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                                                    <span className="w-1.5 h-1.5 bg-red-700 rounded-full mr-1"></span>
                                                                                    인성 +1
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            <p className="text-xs text-gray-500 mt-2 text-right">
                                                                {new Date(card.issuedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 골드 상점 탭 */}
                            {activeTab === 'pointshop' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-base font-bold text-gray-800">골드 상점</h3>
                                        <div className="text-yellow-600 font-medium">
                                            보유 골드: {student?.points || 0} G
                                        </div>
                                    </div>

                                    {/* 탭 내 서브탭 (아바타 상품 목록/학급 상품 목록/구매 내역) */}
                                    <div className="flex border-b border-gray-200 mb-4">
                                        <button
                                            className={`py-2 px-4 text-sm font-medium border-b-2 ${activePointShopTab === 'avatar_items'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => setActivePointShopTab('avatar_items')}
                                        >
                                            아바타 상품
                                        </button>
                                        <button
                                            className={`py-2 px-4 text-sm font-medium border-b-2 ${activePointShopTab === 'class_items'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => setActivePointShopTab('class_items')}
                                        >
                                            학급 상품
                                        </button>
                                        <button
                                            className={`py-2 px-4 text-sm font-medium border-b-2 ${activePointShopTab === 'purchases'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => setActivePointShopTab('purchases')}
                                        >
                                            구매 내역
                                        </button>
                                    </div>

                                    {/* 상품 목록 또는 구매 내역 표시 */}
                                    {activePointShopTab === 'avatar_items' && (
                                        <div className="bg-white rounded-lg p-4">
                                            {/* 아바타 상품 목록 */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {pointItems
                                                    .filter((item: any) => item.type === 'avatar' || item.itemType === 'avatar' || item.avatarPart)
                                                    .map((item: any) => (
                                                        <div
                                                            key={item.id}
                                                            className="border border-gray-200 rounded-lg p-3 flex flex-col"
                                                        >
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-12 h-12 bg-blue-50 rounded-lg overflow-hidden border border-blue-100 flex items-center justify-center">
                                                                    {item.avatarPart ? (
                                                                        <div className="flex items-center justify-center">
                                                                            {item.avatarPart === 'head' && <User className="w-6 h-6 text-blue-500" />}
                                                                            {item.avatarPart === 'body' && <Shirt className="w-6 h-6 text-purple-500" />}
                                                                            {item.avatarPart === 'hat' && <Crown className="w-6 h-6 text-yellow-500" />}
                                                                            {item.avatarPart === 'weapon' && <Sword className="w-6 h-6 text-red-500" />}
                                                                        </div>
                                                                    ) : (
                                                                        item.avatarItem && (
                                                                            <AvatarItemRenderer
                                                                                imagePath={item.avatarItem.inventoryImagePath || item.avatarItem.imagePath}
                                                                                name={item.avatarItem.name}
                                                                                size={48}
                                                                                rarity={item.avatarItem.rarity}
                                                                                showRarityBadge={true}
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold">{item.name}</h4>
                                                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                                    <div className="flex items-center mt-2 space-x-2">
                                                                        <div className="text-yellow-600 font-semibold">{item.price} G</div>
                                                                        {isPurchasedItem(item.id) ? (
                                                                            <button
                                                                                onClick={() => handleEquipAvatarItem(item)}
                                                                                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
                                                                            >
                                                                                착용하기
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => item.avatarPart ? handlePurchaseAvatarItem(item.avatarPart) : handlePurchaseItem(item)}
                                                                                disabled={!student || (student?.points || 0) < item.price}
                                                                                className={`text-xs px-2 py-1 rounded ${!student || (student?.points || 0) < item.price
                                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                                                                    }`}
                                                                            >
                                                                                구매하기
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {activePointShopTab === 'class_items' && (
                                        <div className="bg-white rounded-lg p-4">
                                            {/* 학급 상품 목록 */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {pointItems
                                                    .filter((item: any) => item.type === 'class')
                                                    .map((item: any) => (
                                                        <div
                                                            key={item.id}
                                                            className="border border-gray-200 rounded-lg p-3 flex flex-col"
                                                        >
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-12 h-12 bg-green-50 rounded-lg overflow-hidden border border-green-100 flex items-center justify-center">
                                                                    <div className="text-green-500">
                                                                        <Award className="w-6 h-6" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold">{item.name}</h4>
                                                                    <div className="flex items-center">
                                                                        <span className="text-yellow-600 font-medium">{item.price} G</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handlePurchaseItem(item)}
                                                                disabled={!student || (student?.points || 0) < item.price}
                                                                className={`mt-auto w-full py-1.5 rounded-md text-sm font-medium ${!student || (student?.points || 0) < item.price
                                                                    ? 'bg-red-100 text-red-500 cursor-not-allowed'
                                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                                    }`}
                                                            >
                                                                {!student || (student?.points || 0) < item.price ? '골드 부족' : '구매하기'}
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {activePointShopTab === 'purchases' && (
                                        <div className="bg-white rounded-lg p-4">
                                            {/* 구매 내역 */}
                                            <div className="mb-4">
                                                <div className="inline-flex space-x-2 mb-2">
                                                    <button
                                                        className={`px-3 py-1 text-xs rounded-md ${historyFilter === 'all'
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                        onClick={() => setHistoryFilter('all')}
                                                    >
                                                        전체
                                                    </button>
                                                    <button
                                                        className={`px-3 py-1 text-xs rounded-md ${historyFilter === 'avatar'
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                        onClick={() => setHistoryFilter('avatar')}
                                                    >
                                                        아바타
                                                    </button>
                                                    <button
                                                        className={`px-3 py-1 text-xs rounded-md ${historyFilter === 'class'
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                            }`}
                                                        onClick={() => setHistoryFilter('class')}
                                                    >
                                                        학급
                                                    </button>
                                                </div>

                                                {purchasedItems.length === 0 ? (
                                                    <div className="text-center py-10 text-slate-500 text-sm">
                                                        구매한 상품이 없습니다.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                                                        {purchasedItems
                                                            .filter(item => {
                                                                if (historyFilter === 'all') return true;
                                                                if (historyFilter === 'avatar') return item.avatarItem;
                                                                if (historyFilter === 'class') return item.type === 'class';
                                                                return true;
                                                            })
                                                            .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                                                            .map((purchase) => (
                                                                <div
                                                                    key={purchase.id}
                                                                    className="border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-10 h-10 rounded overflow-hidden flex items-center justify-center ${purchase.avatarItem
                                                                            ? 'bg-blue-50 border border-blue-100'
                                                                            : 'bg-green-50 border border-green-100'
                                                                            }`}>
                                                                            {purchase.avatarItem ? (
                                                                                <AvatarItemRenderer
                                                                                    imagePath={purchase.avatarItem.inventoryImagePath || purchase.avatarItem.imagePath}
                                                                                    name={purchase.avatarItem.name}
                                                                                    size={40}
                                                                                    rarity={purchase.avatarItem.rarity}
                                                                                    showRarityBadge={false}
                                                                                />
                                                                            ) : (
                                                                                <Award className="w-5 h-5 text-green-500" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="text-sm font-medium text-gray-700">{purchase.itemName}</h5>
                                                                            <div className="text-xs text-gray-500 flex items-center">
                                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                                {new Date(purchase.purchaseDate).toLocaleDateString()}
                                                                                <span className="mx-1">•</span>
                                                                                <Coins className="w-3 h-3 mr-1" />
                                                                                {purchase.price} G
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {purchase.avatarItem && (
                                                                        <button
                                                                            onClick={() => handleEquipAvatarItem(purchase.avatarItem)}
                                                                            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                                                        >
                                                                            장착하기
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 아바타 탭 */}
                            {activeTab === 'avatar' && renderAvatarTab()}
                        </div>
                    </div>
                </div>

                {/* 아이콘 선택 모달 */}
                {isEditingIcon && renderIconSelector()}

                {/* 칭호 선택 모달 */}
                {isEditingHonorific && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-medium mb-4">학생 칭호 변경</h3>

                            <div className="space-y-2">
                                <div className="font-medium text-sm mb-2">기본 칭호</div>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {honorifics.map((honorific) => (
                                        <button
                                            key={honorific}
                                            onClick={() => handleHonorificChange(honorific)}
                                            className={`py-2 px-3 rounded-lg transition-colors ${student?.honorific === honorific
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                }`}
                                        >
                                            {honorific}
                                        </button>
                                    ))}
                                </div>

                                <div className="font-medium text-sm mb-2">로드맵 달성 칭호</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {getAvailableHonorifics().map((honorific) => (
                                        <button
                                            key={honorific}
                                            onClick={() => handleHonorificChange(honorific)}
                                            className={`py-2 px-3 rounded-lg transition-colors ${student.honorific === honorific
                                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-medium shadow-sm'
                                                : 'bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-700 hover:from-yellow-100 hover:to-amber-100 border border-amber-200'
                                                }`}
                                        >
                                            {honorific}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setIsEditingHonorific(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md mr-2"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 삭제 확인 모달 */}
                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-red-600 mb-3">⚠️ 학생 삭제</h3>
                            <p className="text-slate-700 mb-6">
                                <strong>{student?.name}</strong> 학생을 정말 삭제하시겠습니까?
                                이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleDeleteStudent}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentDetailModal 