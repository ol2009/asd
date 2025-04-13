import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ClassInfo, Student, Mission } from './types';
import { getLocalStorage } from './storage';

// 마이그레이션 함수
export async function migrateDataToSupabase(userId: string) {
    try {
        const supabase = createClientComponentClient();

        // 1. 클래스 마이그레이션
        const classes = getLocalStorage<ClassInfo[]>('classes', []);

        for (const classItem of classes) {
            await supabase.from('classes').insert({
                id: classItem.id,
                name: classItem.name,
                grade: classItem.grade,
                user_id: userId,
                created_at: new Date().toISOString()
            });
        }

        return { success: true };
    } catch (error) {
        console.error('마이그레이션 중 오류 발생:', error);
        return { success: false };
    }
}

// 마이그레이션 상태 확인 함수
export async function checkMigrationStatus(userId: string) {
    try {
        const supabase = createClientComponentClient();

        // 로컬 데이터 확인
        const localClasses = getLocalStorage<ClassInfo[]>('classes', []);

        // Supabase 데이터 확인
        const { data, count, error } = await supabase
            .from('classes')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        if (error) throw error;

        return {
            isComplete: count === localClasses.length && count > 0,
            localCount: localClasses.length,
            supabaseCount: count || 0
        };
    } catch (error) {
        console.error('상태 확인 중 오류 발생:', error);
        return { error: '상태 확인 중 오류가 발생했습니다.' };
    }
} 