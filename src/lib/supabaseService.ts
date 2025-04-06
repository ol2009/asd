import { supabase } from './supabase';
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

// 클래스 관련 함수
export const getClasses = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('클래스 조회 오류:', error);
        return [];
    }
};

export const getClassById = async (classId: string) => {
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('클래스 조회 오류:', error);
        return null;
    }
};

export const createClass = async (classData: Omit<ClassInfo, 'id' | 'students' | 'createdAt'> & { user_id: string }) => {
    try {
        const newClass = {
            name: classData.name,
            grade: classData.grade,
            subject: classData.subject,
            description: classData.description,
            cover_image: classData.coverImage,
            school_name: classData.schoolName,
            user_id: classData.user_id,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('classes')
            .insert(newClass)
            .select();

        if (error) throw error;

        return data?.[0] || null;
    } catch (error) {
        console.error('클래스 생성 오류:', error);
        return null;
    }
};

export const updateClass = async (classId: string, updates: Partial<Omit<ClassInfo, 'id' | 'students' | 'createdAt'>>) => {
    try {
        const { data, error } = await supabase
            .from('classes')
            .update({
                name: updates.name,
                grade: updates.grade,
                subject: updates.subject,
                description: updates.description,
                cover_image: updates.coverImage,
                school_name: updates.schoolName,
                updated_at: new Date().toISOString()
            })
            .eq('id', classId)
            .select();

        if (error) throw error;

        return data?.[0] || null;
    } catch (error) {
        console.error('클래스 업데이트 오류:', error);
        return null;
    }
};

export const deleteClass = async (classId: string) => {
    try {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', classId);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('클래스 삭제 오류:', error);
        return false;
    }
};

// 학생 관련 함수
export const getStudents = async (classId: string) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', classId)
            .order('number', { ascending: true });

        if (error) throw error;

        // Supabase 데이터 구조를 애플리케이션 구조로 변환
        return data?.map(student => ({
            id: student.id,
            number: student.number,
            name: student.name,
            honorific: student.honorific,
            iconType: student.icon_type,
            stats: {
                level: student.level,
                exp: student.exp
            },
            points: student.points
        })) || [];
    } catch (error) {
        console.error('학생 조회 오류:', error);
        return [];
    }
};

export const getStudentById = async (studentId: string) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (error) throw error;

        if (!data) return null;

        return {
            id: data.id,
            number: data.number,
            name: data.name,
            honorific: data.honorific,
            iconType: data.icon_type,
            stats: {
                level: data.level,
                exp: data.exp
            },
            points: data.points
        };
    } catch (error) {
        console.error('학생 조회 오류:', error);
        return null;
    }
};

export const createStudent = async (classId: string, studentData: Omit<Student, 'id'>) => {
    try {
        const newStudent = {
            name: studentData.name,
            number: studentData.number,
            class_id: classId,
            honorific: studentData.honorific,
            icon_type: studentData.iconType,
            level: studentData.stats.level || 1,
            exp: studentData.stats.exp || 0,
            points: studentData.points || 0,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('students')
            .insert(newStudent)
            .select();

        if (error) throw error;

        return data?.[0] || null;
    } catch (error) {
        console.error('학생 생성 오류:', error);
        return null;
    }
};

export const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    try {
        const updateData: any = {};

        if (updates.name) updateData.name = updates.name;
        if (updates.number !== undefined) updateData.number = updates.number;
        if (updates.honorific) updateData.honorific = updates.honorific;
        if (updates.iconType) updateData.icon_type = updates.iconType;
        if (updates.stats?.level) updateData.level = updates.stats.level;
        if (updates.stats?.exp !== undefined) updateData.exp = updates.stats.exp;
        if (updates.points !== undefined) updateData.points = updates.points;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('students')
            .update(updateData)
            .eq('id', studentId)
            .select();

        if (error) throw error;

        return data?.[0] || null;
    } catch (error) {
        console.error('학생 업데이트 오류:', error);
        return null;
    }
};

export const deleteStudent = async (studentId: string) => {
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('학생 삭제 오류:', error);
        return false;
    }
};

// 미션 관련 함수
export const getMissions = async (classId: string) => {
    try {
        const { data: missions, error: missionsError } = await supabase
            .from('missions')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (missionsError) throw missionsError;

        // 각 미션에 대한 달성자 목록 가져오기
        const { data: achievements, error: achievementsError } = await supabase
            .from('mission_achievements')
            .select('*')
            .eq('class_id', classId);

        if (achievementsError) throw achievementsError;

        // 미션 데이터 구조 변환
        return missions?.map(mission => {
            // 해당 미션의 달성자 ID 목록
            const achievers = achievements
                ?.filter(a => a.mission_id === mission.id)
                .map(a => a.student_id) || [];

            return {
                id: mission.id,
                name: mission.name,
                condition: mission.condition,
                achievers,
                createdAt: mission.created_at
            };
        }) || [];
    } catch (error) {
        console.error('미션 조회 오류:', error);
        return [];
    }
};

export const createMission = async (classId: string, missionData: Omit<Mission, 'id' | 'achievers' | 'createdAt'>) => {
    try {
        const newMission = {
            name: missionData.name,
            condition: missionData.condition,
            class_id: classId,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('missions')
            .insert(newMission)
            .select();

        if (error) throw error;

        return {
            id: data?.[0].id,
            name: data?.[0].name,
            condition: data?.[0].condition,
            achievers: [],
            createdAt: data?.[0].created_at
        };
    } catch (error) {
        console.error('미션 생성 오류:', error);
        return null;
    }
};

export const updateMission = async (missionId: string, updates: Partial<Omit<Mission, 'id' | 'achievers' | 'createdAt'>>) => {
    try {
        const updateData: any = {};

        if (updates.name) updateData.name = updates.name;
        if (updates.condition) updateData.condition = updates.condition;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('missions')
            .update(updateData)
            .eq('id', missionId)
            .select();

        if (error) throw error;

        return data?.[0] || null;
    } catch (error) {
        console.error('미션 업데이트 오류:', error);
        return null;
    }
};

export const deleteMission = async (missionId: string) => {
    try {
        // 미션 달성 기록 먼저 삭제
        await supabase
            .from('mission_achievements')
            .delete()
            .eq('mission_id', missionId);

        // 미션 삭제
        const { error } = await supabase
            .from('missions')
            .delete()
            .eq('id', missionId);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('미션 삭제 오류:', error);
        return false;
    }
};

// 미션 달성 관련 함수
export const addMissionAchievement = async (classId: string, missionId: string, studentId: string) => {
    try {
        // 이미 달성했는지 확인
        const { data: existing, error: checkError } = await supabase
            .from('mission_achievements')
            .select('*')
            .eq('mission_id', missionId)
            .eq('student_id', studentId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116: 결과가 없음 (정상)
            throw checkError;
        }

        if (existing) {
            return { success: false, message: '이미 미션을 달성한 학생입니다.' };
        }

        // 미션 달성 기록 추가
        const { data, error } = await supabase
            .from('mission_achievements')
            .insert({
                student_id: studentId,
                mission_id: missionId,
                class_id: classId,
                timestamp: new Date().toISOString()
            })
            .select();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('미션 달성 처리 오류:', error);
        return { success: false, message: '미션 달성 처리 중 오류가 발생했습니다.' };
    }
};

export const removeMissionAchievement = async (missionId: string, studentId: string) => {
    try {
        const { error } = await supabase
            .from('mission_achievements')
            .delete()
            .eq('mission_id', missionId)
            .eq('student_id', studentId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('미션 달성 취소 오류:', error);
        return { success: false, message: '미션 달성 취소 중 오류가 발생했습니다.' };
    }
};

// 로드맵 관련 함수
export const getRoadmaps = async (classId: string) => {
    try {
        // 로드맵 데이터 조회
        const { data: roadmaps, error: roadmapsError } = await supabase
            .from('roadmaps')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (roadmapsError) throw roadmapsError;

        // 로드맵 단계 조회
        const { data: steps, error: stepsError } = await supabase
            .from('roadmap_steps')
            .select('*')
            .in('roadmap_id', roadmaps?.map(r => r.id) || [])
            .order('order_index', { ascending: true });

        if (stepsError) throw stepsError;

        // 로드맵 단계 달성 기록 조회
        const { data: achievements, error: achievementsError } = await supabase
            .from('roadmap_step_achievements')
            .select('*')
            .eq('class_id', classId);

        if (achievementsError) throw achievementsError;

        // 로드맵 데이터 구조 변환
        return roadmaps?.map(roadmap => {
            // 해당 로드맵의 단계 목록
            const roadmapSteps = steps
                ?.filter(s => s.roadmap_id === roadmap.id)
                .map(step => {
                    // 해당 단계 달성자 목록
                    const students = achievements
                        ?.filter(a => a.step_id === step.id)
                        .map(a => a.student_id) || [];

                    return {
                        id: step.id,
                        goal: step.goal,
                        students
                    };
                }) || [];

            return {
                id: roadmap.id,
                name: roadmap.name,
                steps: roadmapSteps,
                rewardTitle: roadmap.reward_title,
                icon: roadmap.icon,
                createdAt: roadmap.created_at
            };
        }) || [];
    } catch (error) {
        console.error('로드맵 조회 오류:', error);
        return [];
    }
};

// 여기서부터 필요에 따라 로드맵, 칭찬 카드, 포인트 상점 아이템 등에 대한 함수들을 추가할 수 있습니다.
// 구현 패턴은 위의 예제들과 유사합니다. 