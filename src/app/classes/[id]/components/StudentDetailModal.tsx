'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { X, Edit, Award, Trash2, User, Target, Gift, ShoppingBag, Coins, ShoppingCart, Loader2, ShirtIcon, Cpu, Sword } from 'lucide-react'
import AvatarRenderer, { AvatarItemRenderer } from '@/components/Avatar'
import {
    Avatar, AvatarItem, AvatarLayerType, AVATAR_LAYER_ORDER,
    NEWBY_HEAD_ITEMS, NEWBY_BODY_ITEMS,
    parseAvatarString, stringifyAvatar, updateAvatarItem
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
    }
    avatar?: string
}

interface StudentDetailModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string | null
    classId: string | null
    initialTab?: 'roadmaps' | 'missions' | 'cards' | 'pointshop' | 'avatar'
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, studentId, classId, initialTab = 'roadmaps' }) => {
    const [student, setStudent] = useState<Student | null>(null)
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'missions' | 'cards' | 'pointshop' | 'avatar'>(initialTab)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isHoverCard, setIsHoverCard] = useState<string | null>(null)
    const { id: paramsClassId } = useParams()

    // 학생 완료 항목 데이터
    const [completedRoadmaps, setCompletedRoadmaps] = useState<{
        roadmapId: string
        stepId: string
        roadmapName: string
        stepGoal: string
    }[]>([])

    const [completedMissions, setCompletedMissions] = useState<{
        id: string
        name: string
        condition: string
    }[]>([])

    const [receivedCards, setReceivedCards] = useState<{
        id: string
        cardId: string
        cardName: string
        cardDescription: string
        issuedAt: number
    }[]>([])

    // 포인트샵 관련 상태
    const [purchasedItems, setPurchasedItems] = useState<any[]>([])
    const [pointItems, setPointItems] = useState<any[]>([])
    const [pointshopLoading, setPointshopLoading] = useState(true)
    const [activePointShopTab, setActivePointShopTab] = useState<'items' | 'purchases'>('items')

    // 로딩 상태
    const [roadmapsLoading, setRoadmapsLoading] = useState(true)
    const [missionsLoading, setMissionsLoading] = useState(true)
    const [cardsLoading, setCardsLoading] = useState(true)

    // 아바타 관련 상태
    const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null)
    const [selectedAvatarLayer, setSelectedAvatarLayer] = useState<AvatarLayerType>('head')
    const [availableItems, setAvailableItems] = useState<AvatarItem[]>([])

    // 학생 아이콘 업데이트 함수
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

    useEffect(() => {
        if (!isOpen || !studentId || !classId) return

        loadStudentInfo()
        loadCompletedRoadmaps()
        loadCompletedMissions()
        loadReceivedCards()
        loadPointShopItems()
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

                        console.log('학생 정보 설정 완료', foundStudent);
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
                                stepGoal: step.goal
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
            const completed = missions
                .filter((mission: any) =>
                    mission.achievers && mission.achievers.includes(studentId)
                )
                .map((mission: any) => ({
                    id: mission.id,
                    name: mission.name,
                    condition: mission.condition
                }))

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
                    issuedAt: history.issuedAt || Date.now()
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

    // 포인트 상점 아이템 불러오기
    const loadPointShopItems = () => {
        setPointshopLoading(true);
        try {
            // 로컬 스토리지에서 포인트 상점 아이템 가져오기
            const savedItems = localStorage.getItem(`pointshop_items_${classId}`);
            if (savedItems) {
                setPointItems(JSON.parse(savedItems));
            } else {
                setPointItems([]);
            }

            // 구매 내역 가져오기
            const savedPurchases = localStorage.getItem(`pointshop_purchases_${classId}_${studentId}`);
            if (savedPurchases) {
                setPurchasedItems(JSON.parse(savedPurchases));
            } else {
                setPurchasedItems([]);
            }
        } catch (error) {
            console.error('포인트 상점 데이터 로드 중 오류:', error);
        } finally {
            setPointshopLoading(false);
        }
    }

    // 포인트 상점 탭 변경 함수
    const handlePointShopTabChange = (tab: 'items' | 'purchases') => {
        setActivePointShopTab(tab);
    }

    // 포인트 상품 구매 함수
    const handlePurchaseItem = (item: any) => {
        if (!student) return;

        // 포인트가 충분한지 확인
        if ((student.points || 0) < item.price) {
            toast.error('포인트가 부족합니다.');
            return;
        }

        try {
            // 새 구매 아이템 생성
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

            // 학생 포인트 차감
            const updatedPoints = (student.points || 0) - item.price;
            const updatedStudent = { ...student, points: updatedPoints };
            setStudent(updatedStudent);

            // localStorage에 학생 포인트 업데이트
            updateStudentPoints(updatedPoints);

            toast.success(`${item.name}을(를) 구매했습니다.`);
        } catch (error) {
            console.error('상품 구매 중 오류:', error);
            toast.error('상품 구매 중 오류가 발생했습니다.');
        }
    }

    // 포인트 상품 사용 함수
    const handleUseItem = (purchaseId: string) => {
        const updatedPurchases = purchasedItems.map(item =>
            item.id === purchaseId ? { ...item, used: true } : item
        );

        setPurchasedItems(updatedPurchases);
        localStorage.setItem(`pointshop_purchases_${classId}_${studentId}`, JSON.stringify(updatedPurchases));

        toast.success('상품을 사용했습니다.');
    }

    // 학생 포인트 업데이트 함수
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
            console.error('포인트 업데이트 중 오류:', error);
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

    // 아바타 레이어 선택 핸들러
    const handleAvatarLayerSelect = (layer: AvatarLayerType) => {
        setSelectedAvatarLayer(layer);

        // 선택된 레이어에 따라 사용 가능한 아이템 목록 업데이트
        if (layer === 'head') {
            setAvailableItems(NEWBY_HEAD_ITEMS);
        } else if (layer === 'body') {
            setAvailableItems(NEWBY_BODY_ITEMS);
        } else {
            setAvailableItems([]);
        }
    };

    // 아바타 탭 렌더링
    const renderAvatarTab = () => {
        if (!student) return null;

        return (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-700 mb-2">학생 아바타</h3>
                    <p className="text-sm text-blue-600 mb-4">
                        학생의 아바타를 커스터마이징할 수 있습니다.
                    </p>

                    {/* 아바타 미리보기 */}
                    <div className="flex justify-center mb-6">
                        <div className="w-40 h-40 bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                            {currentAvatar ? (
                                <AvatarRenderer avatar={currentAvatar} size={140} />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <User className="w-16 h-16 mb-2" />
                                    <p className="text-xs">아바타 없음</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 아바타 레이어 선택 탭 */}
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            onClick={() => handleAvatarLayerSelect('body')}
                            className={`px-4 py-2 font-medium ${selectedAvatarLayer === 'body'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center">
                                <ShirtIcon className="w-4 h-4 mr-1" />
                                <span>몸</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleAvatarLayerSelect('head')}
                            className={`px-4 py-2 font-medium ${selectedAvatarLayer === 'head'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                <span>머리</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleAvatarLayerSelect('hat')}
                            className={`px-4 py-2 font-medium ${selectedAvatarLayer === 'hat'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                <span>모자</span>
                            </div>
                        </button>
                        <button
                            onClick={() => handleAvatarLayerSelect('weapon')}
                            className={`px-4 py-2 font-medium ${selectedAvatarLayer === 'weapon'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center">
                                <Sword className="w-4 h-4 mr-1" />
                                <span>무기</span>
                            </div>
                        </button>
                    </div>

                    {/* 아이템 선택 그리드 */}
                    <div className="grid grid-cols-4 gap-3">
                        {availableItems.length > 0 ? (
                            availableItems.map((item) => {
                                // 현재 착용 중인 아이템인지 확인
                                const isSelected = currentAvatar &&
                                    currentAvatar[item.type] &&
                                    currentAvatar[item.type]?.id === item.id;

                                return (
                                    <div key={item.id} className="flex flex-col items-center">
                                        <AvatarItemRenderer
                                            key={item.id}
                                            imagePath={item.inventoryImagePath || item.imagePath}
                                            name={item.name}
                                            size={60}
                                            isSelected={isSelected ? true : false}
                                            onClick={() => handleAvatarItemSelect(item)}
                                        />
                                        <p className="text-xs text-gray-600 mt-1 text-center">{item.name}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-4 py-8 text-center text-gray-500">
                                <p>사용 가능한 아이템이 없습니다.</p>
                            </div>
                        )}
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
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-auto">
                {/* 상단 헤더 및 닫기 버튼 */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-700">학생 상세 정보</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 좌측: 학생 프로필 정보 */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm p-6">
                            {/* 프로필 섹션 */}
                            <div className="flex flex-col items-center">
                                {/* 프로필 아이콘 - 아바타 사용 */}
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        {student.avatar ? (
                                            <AvatarRenderer avatar={student.avatar} size={128} />
                                        ) : (
                                            renderIcon(student.iconType, 32)
                                        )}
                                    </div>
                                </div>

                                {/* 학생 이름 및 기본 정보 */}
                                <h3 className="text-xl font-bold text-blue-800 mb-1">{student.name}</h3>
                                <p className="text-slate-500 mb-2">{student.number}번</p>

                                {/* 칭호 표시 및 수정 버튼 */}
                                <div className="flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full mb-6">
                                    <span className="font-medium">{student.honorific || '칭호 없음'}</span>
                                    <button
                                        onClick={() => setIsEditingHonorific(true)}
                                        className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                        title="칭호 변경"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* 레벨 및 경험치 정보 */}
                                <div className="w-full mb-6">
                                    <div className="flex justify-between items-center mb-2">
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
                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                            style={{ width: `${expPercentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1">
                                        다음 레벨까지 {remainingExp} EXP 필요
                                    </div>
                                </div>

                                {/* 포인트 표시 */}
                                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-yellow-800">보유 포인트</span>
                                        <span className="text-xl font-bold text-yellow-600">{student.points || 0} P</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 탭으로 구분된 로드맵, 미션, 칭찬카드 정보 */}
                    <div className="md:col-span-2">
                        {/* 탭 선택 버튼 */}
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'roadmaps'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('roadmaps')}
                            >
                                성장 로드맵
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'missions'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('missions')}
                            >
                                완료한 미션
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'cards'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('cards')}
                            >
                                받은 칭찬카드
                            </button>
                            <button
                                className={`py-2 px-4 font-medium ${activeTab === 'pointshop'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('pointshop')}
                            >
                                포인트 상점
                            </button>
                            <button
                                onClick={() => setActiveTab('avatar')}
                                className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'avatar'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-1" />
                                    <span>아바타</span>
                                </div>
                            </button>
                        </div>

                        {/* 탭 콘텐츠 영역 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 h-[500px] overflow-y-auto">
                            {/* 로드맵 탭 */}
                            {activeTab === 'roadmaps' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">완료한 성장 로드맵</h3>

                                    {roadmapsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">로드맵 데이터 로딩 중...</p>
                                        </div>
                                    ) : completedRoadmaps.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">완료한 로드맵 단계가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {completedRoadmaps.map((item, index) => (
                                                <div
                                                    key={`${item.roadmapId}-${item.stepId}`}
                                                    className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start"
                                                >
                                                    <div className="bg-green-200 text-green-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-green-800">{item.roadmapName}</h4>
                                                        <p className="text-sm text-green-700 mt-1">{item.stepGoal}</p>
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
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">완료한 미션</h3>

                                    {missionsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">미션 데이터 로딩 중...</p>
                                        </div>
                                    ) : completedMissions.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">완료한 미션이 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {completedMissions.map((mission) => (
                                                <div
                                                    key={mission.id}
                                                    className="bg-blue-50 border border-blue-100 rounded-lg p-4"
                                                >
                                                    <h4 className="font-medium text-blue-800">{mission.name}</h4>
                                                    <p className="text-sm text-blue-600 mt-1">{mission.condition}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 칭찬카드 탭 */}
                            {activeTab === 'cards' && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">받은 칭찬카드</h3>

                                    {cardsLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">칭찬카드 데이터 로딩 중...</p>
                                        </div>
                                    ) : receivedCards.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">받은 칭찬카드가 없습니다.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {receivedCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className="bg-purple-50 border border-purple-100 rounded-lg p-4"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="bg-purple-200 text-purple-700 p-2 rounded-full mr-3">
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-purple-800">{card.cardName}</h4>
                                                            <p className="text-sm text-purple-600 mt-1">{card.cardDescription}</p>
                                                            <p className="text-xs text-gray-500 mt-2">
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

                            {/* 포인트 상점 탭 */}
                            {activeTab === 'pointshop' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">포인트 상점</h3>
                                        <div className="text-yellow-600 font-medium">
                                            보유 포인트: {student.points || 0} P
                                        </div>
                                    </div>

                                    {/* 탭 내 서브탭 (상품 목록/구매 내역) */}
                                    <div className="flex border-b border-gray-200 mb-4">
                                        <button
                                            className={`py-1.5 px-3 text-sm font-medium ${activePointShopTab === 'items'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => handlePointShopTabChange('items')}
                                        >
                                            상품 목록
                                        </button>
                                        <button
                                            className={`py-1.5 px-3 text-sm font-medium relative ${activePointShopTab === 'purchases'
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                            onClick={() => handlePointShopTabChange('purchases')}
                                        >
                                            구매 내역
                                            {purchasedItems.some(item => !item.used) && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                                    {purchasedItems.filter(item => !item.used).length}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {pointshopLoading ? (
                                        <div className="flex justify-center items-center h-32">
                                            <p className="text-gray-500">상품 데이터 로딩 중...</p>
                                        </div>
                                    ) : (
                                        <div>
                                            {/* 구매 내역 섹션 */}
                                            {activePointShopTab === 'purchases' && (
                                                <div>
                                                    <h4 className="font-medium text-blue-700 mb-3">구매 내역</h4>
                                                    {purchasedItems.length === 0 ? (
                                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                            <ShoppingBag className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                                                            <p className="text-gray-500">구매한 상품이 없습니다.</p>
                                                            <button
                                                                className="mt-4 text-blue-500 hover:text-blue-700"
                                                                onClick={() => handlePointShopTabChange('items')}
                                                            >
                                                                상품 목록 보기
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {purchasedItems.map((purchase) => (
                                                                <div
                                                                    key={purchase.id}
                                                                    className={`border rounded-lg p-4 relative ${purchase.used
                                                                        ? 'bg-gray-100 border-gray-200'
                                                                        : 'bg-yellow-50 border-yellow-200'
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h5 className={`font-medium ${purchase.used ? 'text-gray-500' : 'text-yellow-700'}`}>
                                                                                {purchase.itemName}
                                                                            </h5>
                                                                            <p className={`text-sm mt-1 ${purchase.used ? 'text-gray-500' : 'text-yellow-600'}`}>
                                                                                {purchase.price} 포인트
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                구매일: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                                                            </p>
                                                                        </div>

                                                                        {purchase.used ? (
                                                                            <div className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                                                                                사용 완료
                                                                            </div>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => handleUseItem(purchase.id)}
                                                                                className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition"
                                                                            >
                                                                                사용하기
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 상품 목록 섹션 */}
                                            {activePointShopTab === 'items' && (
                                                <div>
                                                    <h4 className="font-medium text-blue-700 mb-3">상품 목록</h4>
                                                    {pointItems.length === 0 ? (
                                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                            <p className="text-gray-500">등록된 상품이 없습니다.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {pointItems.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <h5 className="font-medium text-gray-800">{item.name}</h5>
                                                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                                        </div>
                                                                        <div className="flex flex-col items-end">
                                                                            <span className="font-bold text-yellow-600 mb-2">{item.price} P</span>
                                                                            <button
                                                                                onClick={() => handlePurchaseItem(item)}
                                                                                disabled={(student.points || 0) < item.price}
                                                                                className={`px-3 py-1.5 rounded-md text-sm ${(student.points || 0) >= item.price
                                                                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                                    } transition`}
                                                                            >
                                                                                구매하기
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 아바타 탭 */}
                            {activeTab === 'avatar' && renderAvatarTab()}
                        </div>
                    </div>
                </div>

                {/* 칭호 변경 모달 */}
                {isEditingHonorific && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-blue-700">칭호 변경</h3>
                                <button
                                    onClick={() => setIsEditingHonorific(false)}
                                    className="p-1 rounded-full hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* 기본 칭호 목록 */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-slate-500 mb-2">기본 칭호</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* 칭호 없음 버튼 */}
                                    <button
                                        onClick={() => handleHonorificChange('')}
                                        className={`py-2 px-3 rounded-lg transition-colors ${!student.honorific
                                            ? 'bg-blue-600 text-white font-medium'
                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                            }`}
                                    >
                                        칭호 없음
                                    </button>

                                    {/* 기본 칭호 목록 */}
                                    {honorifics.map((honorific) => (
                                        <button
                                            key={honorific}
                                            onClick={() => handleHonorificChange(honorific)}
                                            className={`py-2 px-3 rounded-lg transition-colors ${student.honorific === honorific
                                                ? 'bg-blue-600 text-white font-medium'
                                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                }`}
                                        >
                                            {honorific}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 로드맵 달성 칭호 목록 */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-2">
                                    <span className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-yellow-500" />
                                        로드맵 달성 칭호
                                    </span>
                                </h4>

                                {getAvailableHonorifics().length === 0 ? (
                                    <div className="text-center py-4 bg-gray-50 rounded-lg text-slate-500 mb-3">
                                        <p>성장 로드맵을 완료하면 새로운 칭호를 획득할 수 있습니다.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 mb-3">
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
                                )}
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