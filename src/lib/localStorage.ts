import {
    ClassInfo,
    Student,
    Mission,
    Roadmap,
    PraiseCard,
    MissionAchievement,
    PointShopItem,
    PurchaseHistory
} from './types';

// 로그인 상태 관리
export const getLoginStatus = (): boolean => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return isLoggedIn === 'true';
};

export const setLoginStatus = (isLoggedIn: boolean): void => {
    localStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
};

// 클래스 관련 함수
export const getClasses = (): ClassInfo[] => {
    try {
        const classes = localStorage.getItem('classes');
        return classes ? JSON.parse(classes) : [];
    } catch (error) {
        console.error('클래스 데이터 파싱 오류:', error);
        return [];
    }
};

export const getClassById = (classId: string): ClassInfo | null => {
    try {
        const classes = getClasses();
        return classes.find(c => c.id === classId) || null;
    } catch (error) {
        console.error('클래스 데이터 파싱 오류:', error);
        return null;
    }
};

export const saveClasses = (classes: ClassInfo[]): void => {
    localStorage.setItem('classes', JSON.stringify(classes));
};

export const updateClass = (updatedClass: ClassInfo): void => {
    const classes = getClasses();
    const updatedClasses = classes.map(c =>
        c.id === updatedClass.id ? updatedClass : c
    );
    saveClasses(updatedClasses);
};

// 학생 관련 함수
export const getStudents = (classId: string): Student[] => {
    try {
        const students = localStorage.getItem(`students_${classId}`);
        return students ? JSON.parse(students) : [];
    } catch (error) {
        console.error('학생 데이터 파싱 오류:', error);
        return [];
    }
};

export const saveStudents = (classId: string, students: Student[]): void => {
    localStorage.setItem(`students_${classId}`, JSON.stringify(students));

    // 클래스 데이터와 학생 데이터 동기화
    syncStudentsWithClass(classId, students);
};

export const getStudentById = (classId: string, studentId: string): Student | null => {
    const students = getStudents(classId);
    return students.find(s => s.id === studentId) || null;
};

export const updateStudent = (classId: string, updatedStudent: Student): void => {
    const students = getStudents(classId);
    const updatedStudents = students.map(s =>
        s.id === updatedStudent.id ? updatedStudent : s
    );
    saveStudents(classId, updatedStudents);
};

export const addStudent = (classId: string, newStudent: Student): void => {
    const students = getStudents(classId);
    saveStudents(classId, [...students, newStudent]);
};

export const removeStudent = (classId: string, studentId: string): void => {
    const students = getStudents(classId);
    const updatedStudents = students.filter(s => s.id !== studentId);
    saveStudents(classId, updatedStudents);
};

// 학생 데이터 중복 제거
export const removeDuplicateStudents = (classId: string): Student[] => {
    const students = getStudents(classId);
    const uniqueIds = new Set();
    const uniqueStudents = students.filter(student => {
        if (uniqueIds.has(student.id)) {
            return false;
        }
        uniqueIds.add(student.id);
        return true;
    });

    if (uniqueStudents.length !== students.length) {
        saveStudents(classId, uniqueStudents);
    }

    return uniqueStudents;
};

// 미션 관련 함수
export const getMissions = (classId: string): Mission[] => {
    try {
        const missions = localStorage.getItem(`missions_${classId}`);
        return missions ? JSON.parse(missions) : [];
    } catch (error) {
        console.error('미션 데이터 파싱 오류:', error);
        return [];
    }
};

export const saveMissions = (classId: string, missions: Mission[]): void => {
    localStorage.setItem(`missions_${classId}`, JSON.stringify(missions));
};

export const getMissionById = (classId: string, missionId: string): Mission | null => {
    const missions = getMissions(classId);
    return missions.find(m => m.id === missionId) || null;
};

export const addMission = (classId: string, newMission: Mission): void => {
    const missions = getMissions(classId);
    saveMissions(classId, [...missions, newMission]);
};

export const updateMission = (classId: string, updatedMission: Mission): void => {
    const missions = getMissions(classId);
    const updatedMissions = missions.map(m =>
        m.id === updatedMission.id ? updatedMission : m
    );
    saveMissions(classId, updatedMissions);
};

export const removeMission = (classId: string, missionId: string): void => {
    const missions = getMissions(classId);
    const updatedMissions = missions.filter(m => m.id !== missionId);
    saveMissions(classId, updatedMissions);
};

// 미션 달성 관련 함수
export const getMissionAchievements = (classId: string): MissionAchievement[] => {
    try {
        const achievements = localStorage.getItem(`mission_achievements_${classId}`);
        return achievements ? JSON.parse(achievements) : [];
    } catch (error) {
        console.error('미션 달성 내역 데이터 파싱 오류:', error);
        return [];
    }
};

export const saveMissionAchievements = (classId: string, achievements: MissionAchievement[]): void => {
    localStorage.setItem(`mission_achievements_${classId}`, JSON.stringify(achievements));
};

export const addMissionAchievement = (classId: string, newAchievement: MissionAchievement): void => {
    const achievements = getMissionAchievements(classId);
    saveMissionAchievements(classId, [...achievements, newAchievement]);
};

// 로드맵 관련 함수
export const getRoadmaps = (classId: string): Roadmap[] => {
    try {
        const roadmaps = localStorage.getItem(`roadmaps_${classId}`);
        return roadmaps ? JSON.parse(roadmaps) : [];
    } catch (error) {
        console.error('로드맵 데이터 파싱 오류:', error);
        return [];
    }
};

export const saveRoadmaps = (classId: string, roadmaps: Roadmap[]): void => {
    localStorage.setItem(`roadmaps_${classId}`, JSON.stringify(roadmaps));
};

export const getRoadmapById = (classId: string, roadmapId: string): Roadmap | null => {
    const roadmaps = getRoadmaps(classId);
    return roadmaps.find(r => r.id === roadmapId) || null;
};

export const addRoadmap = (classId: string, newRoadmap: Roadmap): void => {
    const roadmaps = getRoadmaps(classId);
    saveRoadmaps(classId, [...roadmaps, newRoadmap]);
};

export const updateRoadmap = (classId: string, updatedRoadmap: Roadmap): void => {
    const roadmaps = getRoadmaps(classId);
    const updatedRoadmaps = roadmaps.map(r =>
        r.id === updatedRoadmap.id ? updatedRoadmap : r
    );
    saveRoadmaps(classId, updatedRoadmaps);
};

export const removeRoadmap = (classId: string, roadmapId: string): void => {
    const roadmaps = getRoadmaps(classId);
    const updatedRoadmaps = roadmaps.filter(r => r.id !== roadmapId);
    saveRoadmaps(classId, updatedRoadmaps);
};

// 칭찬 카드 관련 함수
export const getPraiseCards = (classId: string): PraiseCard[] => {
    try {
        const cards = localStorage.getItem(`praise_cards_${classId}`);
        return cards ? JSON.parse(cards) : [];
    } catch (error) {
        console.error('칭찬 카드 데이터 파싱 오류:', error);
        return [];
    }
};

export const savePraiseCards = (classId: string, cards: PraiseCard[]): void => {
    localStorage.setItem(`praise_cards_${classId}`, JSON.stringify(cards));
};

export const addPraiseCard = (classId: string, newCard: PraiseCard): void => {
    const cards = getPraiseCards(classId);
    savePraiseCards(classId, [...cards, newCard]);
};

// 포인트 상점 아이템 관련 함수
export const getPointShopItems = (classId: string): PointShopItem[] => {
    try {
        const items = localStorage.getItem(`pointshop_items_${classId}`);
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error('포인트 상점 아이템 데이터 파싱 오류:', error);
        return [];
    }
};

export const savePointShopItems = (classId: string, items: PointShopItem[]): void => {
    localStorage.setItem(`pointshop_items_${classId}`, JSON.stringify(items));
};

export const addPointShopItem = (classId: string, newItem: PointShopItem): void => {
    const items = getPointShopItems(classId);
    savePointShopItems(classId, [...items, newItem]);
};

export const updatePointShopItem = (classId: string, updatedItem: PointShopItem): void => {
    const items = getPointShopItems(classId);
    const updatedItems = items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
    );
    savePointShopItems(classId, updatedItems);
};

export const removePointShopItem = (classId: string, itemId: string): void => {
    const items = getPointShopItems(classId);
    const updatedItems = items.filter(item => item.id !== itemId);
    savePointShopItems(classId, updatedItems);
};

// 구매 내역 관련 함수
export const getPurchaseHistory = (classId: string): PurchaseHistory[] => {
    try {
        const history = localStorage.getItem(`purchase_history_${classId}`);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('구매 내역 데이터 파싱 오류:', error);
        return [];
    }
};

export const savePurchaseHistory = (classId: string, history: PurchaseHistory[]): void => {
    localStorage.setItem(`purchase_history_${classId}`, JSON.stringify(history));
};

export const addPurchaseRecord = (classId: string, newRecord: PurchaseHistory): void => {
    const history = getPurchaseHistory(classId);
    savePurchaseHistory(classId, [...history, newRecord]);
};

export const updatePurchaseRecord = (classId: string, updatedRecord: PurchaseHistory): void => {
    const history = getPurchaseHistory(classId);
    const updatedHistory = history.map(record =>
        record.id === updatedRecord.id ? updatedRecord : record
    );
    savePurchaseHistory(classId, updatedHistory);
};

// 내부 헬퍼 함수 - 학생 데이터를 클래스 데이터와 동기화
const syncStudentsWithClass = (classId: string, studentsData: Student[]): void => {
    // 클래스 전체 목록 업데이트
    const classes = getClasses();
    const updatedClasses = classes.map((c) => {
        if (c.id === classId) {
            return {
                ...c,
                students: studentsData
            };
        }
        return c;
    });
    saveClasses(updatedClasses);

    // 개별 클래스 데이터 업데이트
    const classDataKey = `class_${classId}`;
    try {
        const classDataJson = localStorage.getItem(classDataKey);
        if (classDataJson) {
            const classData = JSON.parse(classDataJson);
            classData.students = studentsData;
            localStorage.setItem(classDataKey, JSON.stringify(classData));
        }
    } catch (error) {
        console.error('클래스 개별 데이터 동기화 오류:', error);
    }
}; 