import { supabase } from './supabase';
import * as localDb from './localStorage';
import {
    ClassInfo,
    Student,
    Mission,
    Roadmap,
    RoadmapStep,
    PraiseCard,
    MissionAchievement,
    PointShopItem,
    PurchaseHistory
} from './types';

// 클래스 데이터 마이그레이션
export const migrateClasses = async (userId: string) => {
    try {
        // 로컬 스토리지에서 클래스 데이터 가져오기
        const classes = localDb.getClasses();

        // 각 클래스를 Supabase에 저장
        for (const classItem of classes) {
            const { error } = await supabase.from('classes').insert({
                id: classItem.id,
                name: classItem.name,
                grade: classItem.grade,
                subject: classItem.subject,
                description: classItem.description,
                cover_image: classItem.coverImage,
                school_name: classItem.schoolName || null,
                created_at: classItem.createdAt,
                user_id: userId
            });

            if (error) {
                console.error('클래스 마이그레이션 오류:', error);
            }
        }

        return { success: true, message: `${classes.length}개 클래스 마이그레이션 완료` };
    } catch (error) {
        console.error('클래스 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '클래스 마이그레이션 실패' };
    }
};

// 학생 데이터 마이그레이션
export const migrateStudents = async (classId: string) => {
    try {
        // 로컬 스토리지에서 학생 데이터 가져오기
        const students = localDb.getStudents(classId);

        // 각 학생을 Supabase에 저장
        for (const student of students) {
            const { error } = await supabase.from('students').insert({
                id: student.id,
                name: student.name,
                number: student.number,
                class_id: classId,
                honorific: student.honorific,
                icon_type: student.iconType,
                level: student.stats.level || 1,
                exp: student.stats.exp || 0,
                points: student.points || 0,
                created_at: new Date().toISOString()
            });

            if (error) {
                console.error('학생 마이그레이션 오류:', error);
            }
        }

        return { success: true, message: `${students.length}명 학생 마이그레이션 완료` };
    } catch (error) {
        console.error('학생 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '학생 마이그레이션 실패' };
    }
};

// 미션 데이터 마이그레이션
export const migrateMissions = async (classId: string) => {
    try {
        // 로컬 스토리지에서 미션 데이터 가져오기
        const missions = localDb.getMissions(classId);

        // 각 미션을 Supabase에 저장
        for (const mission of missions) {
            // 1. 미션 저장
            const { data: missionData, error: missionError } = await supabase.from('missions').insert({
                id: mission.id,
                name: mission.name,
                condition: mission.condition,
                class_id: classId,
                created_at: mission.createdAt
            }).select();

            if (missionError) {
                console.error('미션 마이그레이션 오류:', missionError);
                continue;
            }

            // 2. 미션 달성 기록 저장
            if (mission.achievers && mission.achievers.length > 0) {
                const achievements = localDb.getMissionAchievements(classId);

                for (const studentId of mission.achievers) {
                    // 해당 학생의 미션 달성 기록 찾기
                    const achievement = achievements.find(a =>
                        a.studentId === studentId && a.missionId === mission.id
                    );

                    // 달성 기록 저장
                    const { error: achievementError } = await supabase.from('mission_achievements').insert({
                        student_id: studentId,
                        mission_id: mission.id,
                        timestamp: achievement?.timestamp || new Date().toISOString(),
                        class_id: classId
                    });

                    if (achievementError) {
                        console.error('미션 달성 기록 마이그레이션 오류:', achievementError);
                    }
                }
            }
        }

        return { success: true, message: `${missions.length}개 미션 마이그레이션 완료` };
    } catch (error) {
        console.error('미션 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '미션 마이그레이션 실패' };
    }
};

// 로드맵 데이터 마이그레이션
export const migrateRoadmaps = async (classId: string) => {
    try {
        // 로컬 스토리지에서 로드맵 데이터 가져오기
        const roadmaps = localDb.getRoadmaps(classId);

        // 각 로드맵을 Supabase에 저장
        for (const roadmap of roadmaps) {
            // 1. 로드맵 저장
            const { data: roadmapData, error: roadmapError } = await supabase.from('roadmaps').insert({
                id: roadmap.id,
                name: roadmap.name,
                reward_title: roadmap.rewardTitle,
                icon: roadmap.icon,
                class_id: classId,
                created_at: roadmap.createdAt
            }).select();

            if (roadmapError) {
                console.error('로드맵 마이그레이션 오류:', roadmapError);
                continue;
            }

            // 2. 로드맵 단계 저장
            if (roadmap.steps && roadmap.steps.length > 0) {
                for (let i = 0; i < roadmap.steps.length; i++) {
                    const step = roadmap.steps[i];

                    // 로드맵 단계 저장
                    const { data: stepData, error: stepError } = await supabase.from('roadmap_steps').insert({
                        id: step.id,
                        roadmap_id: roadmap.id,
                        goal: step.goal,
                        order_index: i,
                        created_at: roadmap.createdAt
                    }).select();

                    if (stepError) {
                        console.error('로드맵 단계 마이그레이션 오류:', stepError);
                        continue;
                    }

                    // 3. 단계 달성 기록 저장
                    if (step.students && step.students.length > 0) {
                        for (const studentId of step.students) {
                            const { error: achievementError } = await supabase.from('roadmap_step_achievements').insert({
                                student_id: studentId,
                                step_id: step.id,
                                timestamp: new Date().toISOString(),
                                class_id: classId
                            });

                            if (achievementError) {
                                console.error('로드맵 단계 달성 기록 마이그레이션 오류:', achievementError);
                            }
                        }
                    }
                }
            }
        }

        return { success: true, message: `${roadmaps.length}개 로드맵 마이그레이션 완료` };
    } catch (error) {
        console.error('로드맵 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '로드맵 마이그레이션 실패' };
    }
};

// 칭찬 카드 데이터 마이그레이션
export const migratePraiseCards = async (classId: string) => {
    try {
        // 로컬 스토리지에서 칭찬 카드 데이터 가져오기
        const cards = localDb.getPraiseCards(classId);

        // 각 칭찬 카드를 Supabase에 저장
        for (const card of cards) {
            const { error } = await supabase.from('praise_cards').insert({
                id: card.id,
                content: card.content,
                student_id: card.studentId,
                class_id: classId,
                created_at: card.createdAt
            });

            if (error) {
                console.error('칭찬 카드 마이그레이션 오류:', error);
            }
        }

        return { success: true, message: `${cards.length}개 칭찬 카드 마이그레이션 완료` };
    } catch (error) {
        console.error('칭찬 카드 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '칭찬 카드 마이그레이션 실패' };
    }
};

// 포인트 상점 아이템 마이그레이션
export const migratePointShopItems = async (classId: string) => {
    try {
        // 로컬 스토리지에서 포인트 상점 아이템 데이터 가져오기
        const items = localDb.getPointShopItems(classId);

        // 각 아이템을 Supabase에 저장
        for (const item of items) {
            const { error } = await supabase.from('point_shop_items').insert({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image_url: item.imageUrl || null,
                class_id: classId,
                created_at: item.createdAt
            });

            if (error) {
                console.error('포인트 상점 아이템 마이그레이션 오류:', error);
            }
        }

        return { success: true, message: `${items.length}개 포인트 상점 아이템 마이그레이션 완료` };
    } catch (error) {
        console.error('포인트 상점 아이템 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '포인트 상점 아이템 마이그레이션 실패' };
    }
};

// 구매 내역 마이그레이션
export const migratePurchaseHistory = async (classId: string) => {
    try {
        // 로컬 스토리지에서 구매 내역 데이터 가져오기
        const history = localDb.getPurchaseHistory(classId);

        // 각 구매 내역을 Supabase에 저장
        for (const record of history) {
            const { error } = await supabase.from('purchase_history').insert({
                id: record.id,
                student_id: record.studentId,
                item_id: record.itemId,
                purchase_date: record.purchaseDate,
                used: record.used,
                used_date: record.usedDate || null,
                class_id: classId
            });

            if (error) {
                console.error('구매 내역 마이그레이션 오류:', error);
            }
        }

        return { success: true, message: `${history.length}개 구매 내역 마이그레이션 완료` };
    } catch (error) {
        console.error('구매 내역 마이그레이션 중 오류 발생:', error);
        return { success: false, message: '구매 내역 마이그레이션 실패' };
    }
};

// 클래스의 모든 데이터 마이그레이션
export const migrateClassData = async (classId: string, userId: string) => {
    const results = {
        students: await migrateStudents(classId),
        missions: await migrateMissions(classId),
        roadmaps: await migrateRoadmaps(classId),
        praiseCards: await migratePraiseCards(classId),
        pointShopItems: await migratePointShopItems(classId),
        purchaseHistory: await migratePurchaseHistory(classId)
    };

    return {
        success: Object.values(results).every(result => result.success),
        results
    };
}; 