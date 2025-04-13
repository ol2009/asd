'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { X, Edit, Award, Trash2, User, Settings, Shirt, Crown, Sword } from 'lucide-react'
import AvatarRenderer from '@/components/Avatar'
import {
    parseAvatarString,
    stringifyAvatar,
    updateAvatarItem,
    NEWBY_HEAD_ITEMS,
    NEWBY_BODY_ITEMS,
    getRandomPremiumAvatarItemByType,
    getUnownedRandomAvatarItemByType,
    AvatarLayerType
} from '@/lib/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// 분리된 컴포넌트 import
import AvatarTab from './student-detail/tabs/AvatarTab'
import ChallengeTab from './student-detail/tabs/ChallengeTab'
import MissionTab from './student-detail/tabs/MissionTab'
import CardTab from './student-detail/tabs/CardTab'
import PointShopTab, { PointShopItemType } from './student-detail/tabs/PointShopTab'
import type { PointShopItem } from './student-detail/tabs/PointShopTab'
import StudentProfile from './student-detail/components/StudentProfile'
import AbilitiesDisplay from './student-detail/components/AbilitiesDisplay'
import TabNavigation from './student-detail/components/TabNavigation'

// 커스텀 훅 사용
import { useStudentData } from './student-detail/hooks/useStudentData'

// 기본 상수
const EXP_PER_LEVEL = 100
const POINTS_PER_LEVEL = 100

// 칭호 목록
const defaultHonorifics = [
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

// 챌린지 달성 칭호 목록
const challengeHonorifics = [
    '미래 탐험가',
    '지식 수집가',
    '문제 해결사',
    '탐구 전문가',
    '창조적 사고자'
]

// 사용 가능한 칭호 목록을 반환하는 함수
const getAvailableHonorifics = () => {
    // 여기서는 간단히 챌린지 칭호만 반환합니다.
    return challengeHonorifics;
}

interface StudentDetailModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string | null
    classId: string | null
    initialTab?: 'challenges' | 'missions' | 'cards' | 'pointshop' | 'avatar'
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    isOpen,
    onClose,
    studentId,
    classId,
    initialTab = 'challenges'
}) => {
    // 탭 관련 상태
    const [activeTab, setActiveTab] = useState<'challenges' | 'missions' | 'cards' | 'pointshop' | 'avatar'>(initialTab)

    // UI 관련 상태
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [honorifics, setHonorifics] = useState<string[]>(defaultHonorifics)

    // 커스텀 훅을 사용해 학생 데이터 가져오기
    const {
        student,
        completedChallenges,
        completedMissions,
        receivedCards,
        purchasedItems,
        challengesLoading,
        missionsLoading,
        cardsLoading,
        pointshopLoading,
        updateStudentName,
        updateStudentHonorific,
        updateStudentPoints,
        deleteStudent,
        updateStudentAvatar
    } = useStudentData({ studentId, classId })

    // 아바타 관련 상태
    const [currentAvatar, setCurrentAvatar] = useState<any>(null)
    const [availableAvatarItems, setAvailableAvatarItems] = useState<any[]>([])

    // 포인트샵 관련 상태
    const [pointItems, setPointItems] = useState<any[]>([])
    const [classPointItems, setClassPointItems] = useState<any[]>([])  // 교사가 생성한 쿠폰 아이템

    useEffect(() => {
        if (!isOpen || !studentId || !classId) return

        if (student) {
            // 학생 이름 초기화
            setEditedName(student.name)

            // 아바타 초기화
            if (student.avatar) {
                if (typeof student.avatar === 'string') {
                    setCurrentAvatar(parseAvatarString(student.avatar))
                } else {
                    setCurrentAvatar(student.avatar)
                }
            }
        }

        // 아바타 탭이 활성화될 때만 아바타 아이템 로드
        if (activeTab === 'avatar') {
            loadAvatarItems()
        }

        // 포인트샵 탭이 활성화될 때 학급 쿠폰 아이템과 포인트샵 아이템 로드
        if (activeTab === 'pointshop') {
            console.log('포인트샵 탭 활성화 - 쿠폰 데이터 로드');
            loadPointShopItems()
            loadClassPointItems()
        }
    }, [isOpen, student, studentId, classId, activeTab])

    // 학생 이름 변경 핸들러
    const handleNameChange = () => {
        if (editedName.trim() && student) {
            updateStudentName(editedName.trim())
            setIsEditingName(false)
        }
    }

    // 학생 삭제 핸들러
    const handleDeleteStudent = async () => {
        if (await deleteStudent()) {
            onClose()
        }
    }

    // 학생 칭호 변경 핸들러
    const handleHonorificChange = (honorific: string) => {
        if (student) {
            updateStudentHonorific(honorific)
            setIsEditingHonorific(false)
        }
    }

    // 아바타 아이템 로드
    const loadAvatarItems = () => {
        try {
            if (!studentId || !classId) return;

            // 올바른 키 사용: student_avatar_items_${classId}_${student.id}
            const avatarItemsKey = `student_avatar_items_${classId}_${studentId}`;
            console.log('아바타 아이템 로드 키:', avatarItemsKey);

            // 로컬 스토리지에서 아이템 로드 시도
            const storedItems = localStorage.getItem(avatarItemsKey);
            let items = [];

            if (storedItems) {
                items = JSON.parse(storedItems);
                console.log(`아바타 아이템 ${items.length}개 로드됨`);
            } else {
                console.log('저장된 아바타 아이템이 없음, 초기 아이템 생성');
            }

            // 기존 아이템과 초보자 아이템 합치기 (중복 제거)
            const newbyItems = [...NEWBY_HEAD_ITEMS, ...NEWBY_BODY_ITEMS];
            const allItems = items.concat(
                newbyItems.filter(newbyItem =>
                    !items.some((item: any) => item.id === newbyItem.id)
                )
            );

            setAvailableAvatarItems(allItems);
            console.log(`총 ${allItems.length}개의 아바타 아이템 로드됨`);

            // 로컬 스토리지에 저장
            localStorage.setItem(avatarItemsKey, JSON.stringify(allItems));
        } catch (error) {
            console.error('아바타 아이템 로드 오류:', error);
            // 오류 발생 시 기본 초보자 아이템만 표시
            setAvailableAvatarItems([...NEWBY_HEAD_ITEMS, ...NEWBY_BODY_ITEMS]);
        }
    }

    // 학급 쿠폰 아이템 로드 함수
    const loadClassPointItems = () => {
        try {
            // 로그 추가
            console.log('학급 쿠폰 아이템 로드 시작 - 클래스 ID:', classId);

            // 교사가 생성한 학급 쿠폰 아이템 로드
            const savedItems = localStorage.getItem(`pointshop_items_${classId}`)
            if (savedItems) {
                const allItems = JSON.parse(savedItems)
                console.log('로드된 아이템 개수:', allItems.length);
                console.log('로드된 아이템:', allItems);

                // class 타입 아이템만 필터링 (itemType이 class이거나 비어있는 경우)
                const classItems = allItems.filter((item: any) =>
                    item.itemType === 'class' || (!item.itemType && !item.avatarItem)
                )
                console.log('필터링된 학급 쿠폰 개수:', classItems.length);
                setClassPointItems(classItems)
            } else {
                console.log('저장된 학급 쿠폰 아이템이 없습니다.');
                setClassPointItems([])
            }
        } catch (error) {
            console.error('학급 쿠폰 아이템 로드 오류:', error)
            setClassPointItems([])
        }
    }

    // 포인트샵 아이템 로드
    const loadPointShopItems = () => {
        // 포인트샵 아이템 로드 로직
        // ...

        // 임시 데이터로 설정
        setPointItems([])
    }

    // 아바타 변경 핸들러
    const handleAvatarChange = (newAvatar: any) => {
        // 1. 먼저 현재 아바타 상태 업데이트 (UI에 즉시 반영)
        setCurrentAvatar(newAvatar);

        // 2. 학생 데이터 업데이트
        if (student && studentId) {
            try {
                // 아바타 문자열로 변환
                const avatarString = stringifyAvatar(newAvatar);

                // 커스텀 훅의 함수를 사용하여 업데이트 (모든 저장소에 동시에 업데이트)
                const success = updateStudentAvatar(avatarString);

                if (success) {
                    // 성공 메시지
                    toast.success('아바타가 변경되었습니다.');
                } else {
                    toast.error('학생 정보를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('아바타 저장 오류:', error);
                toast.error('아바타를 저장하는 중 오류가 발생했습니다.');
            }
        }
    }

    // 아바타 초기화 핸들러
    const handleAvatarReset = () => {
        setCurrentAvatar(null)

        // 학생 데이터 업데이트
        if (student && studentId) {
            try {
                // updateStudentAvatar 함수를 이용하여 null 또는 빈 객체로 아바타 초기화
                const success = updateStudentAvatar("");

                if (success) {
                    toast.success('아바타가 초기화되었습니다.');

                    // 백업 저장소 업데이트
                    try {
                        const studentsJson = localStorage.getItem(`class-${classId}-students`);
                        if (studentsJson) {
                            const students = JSON.parse(studentsJson);

                            // 해당 학생 찾아 아바타 초기화
                            const updatedStudents = students.map((s: any) => {
                                if (s.id === studentId) {
                                    const updatedStudent = { ...s };
                                    delete updatedStudent.avatar;
                                    return updatedStudent;
                                }
                                return s;
                            });

                            // 업데이트된 학생 정보 저장
                            localStorage.setItem(`class-${classId}-students`, JSON.stringify(updatedStudents));
                        }
                    } catch (err) {
                        console.error('백업 저장소 업데이트 중 오류:', err);
                    }
                } else {
                    toast.error('학생 정보를 찾을 수 없습니다.');
                }
            } catch (error) {
                console.error('아바타 초기화 오류:', error);
                toast.error('아바타를 초기화하는 중 오류가 발생했습니다.');
            }
        }
    }

    // 아이콘 선택기 렌더링
    const renderIconSelector = () => {
        // 아이콘 선택 UI 렌더링
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium mb-4">학생 아이콘 변경</h3>
                    {/* 아이콘 선택 UI */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => setIsEditingIcon(false)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // 구매 내역 추가 함수
    const addItemToStudentPurchaseHistory = (classId: string, studentId: string, itemData: any) => {
        // 로컬 스토리지에서 구매 내역 가져오기
        const purchaseHistoryKey = `purchase_history_${classId}`;
        const studentPurchaseHistoryKey = `pointshop_purchases_${classId}_${studentId}`;

        try {
            // 전체 구매 내역
            const savedHistory = localStorage.getItem(purchaseHistoryKey) || '[]';
            const history = JSON.parse(savedHistory);

            // 구매 ID 생성
            const purchaseId = Date.now().toString();

            // 새 구매 내역 추가
            const newPurchase = {
                id: purchaseId,
                studentId,
                itemId: itemData.id || purchaseId,
                classId,
                timestamp: itemData.purchasedAt || new Date().toISOString(),
                used: false,
                usedDate: null,
                quantity: 1,
            };

            history.push(newPurchase);
            localStorage.setItem(purchaseHistoryKey, JSON.stringify(history));

            // 학생별 구매 내역
            const studentSavedHistory = localStorage.getItem(studentPurchaseHistoryKey) || '[]';
            const studentHistory = JSON.parse(studentSavedHistory);

            studentHistory.push({
                id: purchaseId,
                item: itemData,
                date: itemData.purchasedAt || new Date().toISOString(),
                used: false,
                usedDate: null,
            });

            localStorage.setItem(studentPurchaseHistoryKey, JSON.stringify(studentHistory));
            console.log('구매 내역 저장 완료:', purchaseId);

            return purchaseId;
        } catch (error) {
            console.error('구매 내역 저장 오류:', error);
            throw error;
        }
    };

    // 기존 handlePurchaseItem 함수에 디버깅 로그 추가
    const handlePurchaseItem = (item: PointShopItem) => {
        try {
            console.log("===== 아이템 구매 처리 시작 =====");
            console.log("구매 아이템:", item);

            // 포인트 확인
            if (!student) {
                console.error("구매 실패: 학생 정보가 없습니다.");
                toast.error('학생 정보를 찾을 수 없습니다.');
                return;
            }

            // 포인트가 충분한지 확인
            if (student.points < item.price) {
                console.error(`구매 실패: 포인트 부족 (보유: ${student.points}, 필요: ${item.price})`);
                toast.error('골드가 부족합니다.');
                return;
            }

            // 새로운 포인트 계산
            const newPoints = student.points - item.price;
            console.log(`포인트 차감: ${student.points} -> ${newPoints} (차감액: ${item.price})`);

            // 포인트 업데이트 (로컬 스토리지에 저장)
            updateStudentPoints(newPoints);

            // 아바타 아이템 처리
            if (item.type === PointShopItemType.AVATAR) {
                console.log("===== 아바타 아이템 구매 처리 시작 =====");
                try {
                    console.log("아바타 아이템 상세:", item.avatarItem ? JSON.stringify(item.avatarItem, null, 2) : '타입 정보 없음');

                    // 여러 타입 중에서 랜덤하게 하나 선택 또는 아이템에서 지정된 타입 사용
                    const itemType = item.avatarItem?.type as AvatarLayerType || 'head';
                    console.log('사용할 아바타 레이어 타입:', itemType);

                    // 학생의 인벤토리 가져오기
                    const avatarItemsKey = `student_avatar_items_${classId}_${student.id}`;
                    console.log('학생 아바타 아이템 로컬 스토리지 키:', avatarItemsKey);

                    const savedItems = localStorage.getItem(avatarItemsKey) || '[]';
                    console.log('로컬 스토리지에서 가져온 데이터:', savedItems);

                    const studentAvatarItems = JSON.parse(savedItems);
                    console.log('현재 학생 아바타 아이템 수:', studentAvatarItems.length);

                    // 학생이 소유하지 않은 아이템 중에서 랜덤 선택
                    const randomAvatarItem = getUnownedRandomAvatarItemByType(itemType, studentAvatarItems);
                    console.log("소유하지 않은 아이템 중 랜덤 생성 결과:", randomAvatarItem ? JSON.stringify(randomAvatarItem, null, 2) : '해당 타입의 모든 아이템 소유중');

                    if (randomAvatarItem) {
                        // 새 아이템 추가
                        const newItemId = `${randomAvatarItem.id}_${Date.now()}`;
                        console.log('새 아이템에 할당된 ID:', newItemId);

                        const newItem = {
                            ...randomAvatarItem,
                            id: newItemId,
                            acquiredAt: new Date().toISOString(),
                        };

                        studentAvatarItems.push(newItem);
                        console.log('새 아이템이 추가된 후 아바타 아이템 수:', studentAvatarItems.length);

                        // 로컬 스토리지 업데이트
                        console.log('로컬 스토리지 업데이트 시작...');
                        const itemsToSave = JSON.stringify(studentAvatarItems);
                        localStorage.setItem(avatarItemsKey, itemsToSave);
                        console.log('로컬 스토리지 업데이트 완료. 저장된 데이터 크기:', itemsToSave.length);

                        // 구매 내역 추가
                        console.log('구매 내역 추가 시작...');
                        const purchaseItem = {
                            ...item,
                            purchasedAt: new Date().toISOString(),
                            avatarItemDetail: randomAvatarItem,
                        };

                        if (classId && student.id) {
                            console.log('구매 내역 저장을 위한 classId, studentId 확인됨');
                            const purchaseId = addItemToStudentPurchaseHistory(classId, student.id, purchaseItem);
                            console.log('구매 내역 저장 완료. 구매 ID:', purchaseId);
                        } else {
                            console.error('구매 내역 저장 불가: classId 또는 studentId 없음');
                        }

                        // 성공 메시지 표시
                        console.log('아바타 아이템 구매 처리 완료');
                        toast.success(`'${randomAvatarItem.name}' 아이템을 획득했습니다!`);

                        // 이후에 아바타 아이템 리스트를 새로고침하여 아바타 탭을 열었을 때 바로 보이도록 함
                        loadAvatarItems();
                    } else {
                        console.error("랜덤 아바타 아이템 생성 실패");
                        // 모든 아이템을 이미 소유하고 있는 경우 (getUnownedRandomAvatarItemByType에서 null 반환)
                        toast.error(`이미 해당 종류(${itemType})의 모든 아바타 아이템을 소유하고 있습니다.`);

                        // 포인트 환불
                        updateStudentPoints(student.points);
                    }
                } catch (error) {
                    console.error("아바타 아이템 처리 중 오류:", error);
                    toast.error('아바타 아이템 구매 처리 중 오류가 발생했습니다.');
                }
                console.log("===== 아바타 아이템 구매 처리 완료 =====");
            } else {
                console.log('===== 학급 아이템 구매 처리 시작 =====');
                // 구매 내역 추가
                if (classId && student.id) {
                    console.log('학급 아이템 구매 내역 추가 시작');
                    const purchaseData = {
                        ...item,
                        purchasedAt: new Date().toISOString(),
                    };
                    const purchaseId = addItemToStudentPurchaseHistory(classId, student.id, purchaseData);
                    console.log('학급 아이템 구매 내역 추가 완료. 구매 ID:', purchaseId);
                } else {
                    console.error('구매 내역 저장 불가: classId 또는 studentId 없음');
                }

                // 성공 메시지 표시
                console.log('학급 아이템 구매 처리 완료');
                toast.success(`'${item.name}' 아이템을 구매했습니다!`);
                console.log('===== 학급 아이템 구매 처리 완료 =====');
            }

            // 구매한 아이템 정보 업데이트
            console.log('구매 후 아이템 목록 새로고침 시작');
            loadPurchasedItems();
            console.log('구매 후 아이템 목록 새로고침 완료');
            console.log("===== 아이템 구매 완료 =====");
        } catch (error) {
            console.error("구매 처리 중 오류 발생:", error);
            toast.error('아이템을 구매하는 중 오류가 발생했습니다.');
        }
    };

    // 구매한 아이템 목록 로드
    const loadPurchasedItems = () => {
        if (!studentId || !classId) return;

        try {
            // 학생별 구매 내역 로드
            const key = `pointshop_purchases_${classId}_${studentId}`;
            const savedItems = localStorage.getItem(key) || '[]';
            const items = JSON.parse(savedItems);

            console.log('구매 내역 로드 완료:', items.length);
            // 여기서 구매 내역을 상태에 설정하는 코드가 필요하다면 추가
        } catch (error) {
            console.error('구매 내역 로드 오류:', error);
        }
    };

    // 모달 렌더링
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 모달 배경 */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* 모달 컨텐츠 */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* 모달 헤더 및 닫기 버튼 */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold">학생 상세 정보</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 모달 바디 */}
                <div className="p-5 overflow-y-auto max-h-[calc(90vh-6rem)]">
                    {/* 학생 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow overflow-hidden">
                        {/* 좌측: 학생 프로필 정보 */}
                        <div className="md:col-span-1 overflow-y-auto pr-2">
                            {student && (
                                <>
                                    <StudentProfile
                                        student={student}
                                        onEditName={() => setIsEditingName(true)}
                                        onEditIcon={() => setIsEditingIcon(true)}
                                        onEditHonorific={() => setIsEditingHonorific(true)}
                                        onDeleteClick={() => setIsDeleteConfirmOpen(true)}
                                    />

                                    <AbilitiesDisplay student={student} />
                                </>
                            )}
                        </div>

                        {/* 우측: 탭으로 구분된 콘텐츠 */}
                        <div className="md:col-span-2 flex flex-col overflow-hidden">
                            {/* 탭 선택 버튼 */}
                            <TabNavigation
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />

                            {/* 탭 콘텐츠 영역 */}
                            <div className="flex-grow bg-white rounded-lg border border-gray-200 p-3 overflow-y-auto">
                                {/* 챌린지 탭 */}
                                {activeTab === 'challenges' && (
                                    <ChallengeTab
                                        completedChallenges={completedChallenges}
                                        isLoading={challengesLoading}
                                    />
                                )}

                                {/* 미션 탭 */}
                                {activeTab === 'missions' && (
                                    <MissionTab
                                        completedMissions={completedMissions}
                                        isLoading={missionsLoading}
                                    />
                                )}

                                {/* 칭찬카드 탭 */}
                                {activeTab === 'cards' && (
                                    <CardTab
                                        receivedCards={receivedCards}
                                        isLoading={cardsLoading}
                                    />
                                )}

                                {/* 골드 상점 탭 */}
                                {activeTab === 'pointshop' && student && (
                                    <PointShopTab
                                        key={`pointshop-${student.id}-${Date.now()}`}
                                        studentId={student.id}
                                        classId={classId || ''}
                                        studentPoints={student.points}
                                        onItemPurchase={handlePurchaseItem}
                                    />
                                )}

                                {/* 아바타 탭 */}
                                {activeTab === 'avatar' && student && (
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            {/* 아바타 아이템 영역 - 전체 너비로 확장 */}
                                            <div className="w-full">
                                                <AvatarTab
                                                    student={student}
                                                    currentAvatar={currentAvatar}
                                                    ownedAvatarItems={availableAvatarItems}
                                                    onAvatarChange={handleAvatarChange}
                                                    onAvatarReset={handleAvatarReset}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 아이콘 선택 모달 */}
                {isEditingIcon && renderIconSelector()}

                {/* 칭호 선택 모달 */}
                {isEditingHonorific && student && (
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

                                <div className="font-medium text-sm mb-2">챌린지 달성 칭호</div>
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
                {isDeleteConfirmOpen && student && (
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