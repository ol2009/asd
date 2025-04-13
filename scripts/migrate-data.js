/**
 * 로컬스토리지 데이터를 Supabase로 마이그레이션하는 스크립트
 * 
 * 사용 방법:
 * 1. .env.local 파일에 Supabase URL과 키를 설정합니다
 * 2. `node scripts/migrate-data.js` 명령으로 실행합니다
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: Supabase URL 또는 키가 설정되지 않았습니다.');
    console.error('환경 변수 파일(.env.local)을 확인하세요.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 브라우저의 localStorage를 에뮬레이트하기 위해 파일 기반 스토리지 사용
class LocalStorageEmulator {
    constructor() {
        this.storageFile = path.join(__dirname, 'localStorage.json');
        this.data = {};
        this.loadFromFile();
    }

    loadFromFile() {
        try {
            if (fs.existsSync(this.storageFile)) {
                const fileContent = fs.readFileSync(this.storageFile, 'utf8');
                this.data = JSON.parse(fileContent);
            }
        } catch (error) {
            console.error('로컬 스토리지 파일 로드 오류:', error);
        }
    }

    getItem(key) {
        return this.data[key] || null;
    }

    setItem(key, value) {
        this.data[key] = value;
        this.saveToFile();
    }

    saveToFile() {
        try {
            fs.writeFileSync(this.storageFile, JSON.stringify(this.data, null, 2), 'utf8');
        } catch (error) {
            console.error('로컬 스토리지 파일 저장 오류:', error);
        }
    }
}

// 로컬스토리지 에뮬레이터 초기화
const localStorage = new LocalStorageEmulator();

// 사용자 ID - 마이그레이션할 때 수동으로 설정
const userId = 'REPLACE_WITH_ACTUAL_USER_ID';

// 마이그레이션 진행 현황 추적
const migrationStatus = {
    classes: { total: 0, migrated: 0 },
    students: { total: 0, migrated: 0 },
    missions: { total: 0, migrated: 0 },
    roadmaps: { total: 0, migrated: 0 },
    praiseCards: { total: 0, migrated: 0 },
    pointShopItems: { total: 0, migrated: 0 },
    purchaseHistory: { total: 0, migrated: 0 }
};

// 진행 상황 보고
function reportProgress(entity, current, total) {
    console.log(`${entity}: ${current}/${total} (${Math.round(current / total * 100)}%) 완료`);
}

// ============== 클래스 마이그레이션 ==============
async function migrateClasses() {
    console.log('=== 클래스 마이그레이션 시작 ===');
    try {
        // 로컬스토리지에서 클래스 데이터 가져오기
        const classesData = localStorage.getItem('classes');
        if (!classesData) {
            console.log('클래스 데이터가 없습니다.');
            return [];
        }

        const classes = JSON.parse(classesData);
        migrationStatus.classes.total = classes.length;

        // 기존 데이터 존재 여부 확인을 위한 쿼리
        for (const classItem of classes) {
            const { data: existingClass } = await supabase
                .from('classes')
                .select('id')
                .eq('id', classItem.id)
                .single();

            if (existingClass) {
                console.log(`클래스 존재 (ID: ${classItem.id}): 업데이트 중...`);
                const { error: updateError } = await supabase
                    .from('classes')
                    .update({
                        name: classItem.name,
                        grade: classItem.grade,
                        subject: classItem.subject,
                        description: classItem.description,
                        cover_image: classItem.coverImage,
                        school_name: classItem.schoolName,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', classItem.id);

                if (updateError) throw updateError;
            } else {
                console.log(`클래스 생성 (ID: ${classItem.id})`);
                const { error: insertError } = await supabase
                    .from('classes')
                    .insert({
                        id: classItem.id,
                        name: classItem.name,
                        grade: classItem.grade,
                        subject: classItem.subject,
                        description: classItem.description,
                        cover_image: classItem.coverImage,
                        school_name: classItem.schoolName,
                        created_at: classItem.createdAt || new Date().toISOString(),
                        user_id: userId
                    });

                if (insertError) throw insertError;
            }

            migrationStatus.classes.migrated++;
            reportProgress('클래스', migrationStatus.classes.migrated, migrationStatus.classes.total);
        }

        console.log(`총 ${migrationStatus.classes.migrated}개 클래스 마이그레이션 완료`);
        return classes;
    } catch (error) {
        console.error('클래스 마이그레이션 오류:', error);
        return [];
    }
}

// ============== 학생 마이그레이션 ==============
async function migrateStudents(classId) {
    console.log(`\n=== 클래스 ${classId}의 학생 마이그레이션 시작 ===`);
    try {
        // 로컬스토리지에서 학생 데이터 가져오기
        const studentsData = localStorage.getItem(`students_${classId}`);
        if (!studentsData) {
            console.log(`클래스 ${classId}의 학생 데이터가 없습니다.`);
            return [];
        }

        const students = JSON.parse(studentsData);
        migrationStatus.students.total += students.length;
        let migratedForClass = 0;

        for (const student of students) {
            // 기존 학생 확인
            const { data: existingStudent } = await supabase
                .from('students')
                .select('id')
                .eq('id', student.id)
                .single();

            if (existingStudent) {
                console.log(`학생 존재 (ID: ${student.id}): 업데이트 중...`);
                const { error: updateError } = await supabase
                    .from('students')
                    .update({
                        name: student.name,
                        number: student.number,
                        honorific: student.honorific,
                        icon_type: student.iconType,
                        level: student.stats.level || 1,
                        exp: student.stats.exp || 0,
                        points: student.points || 0,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', student.id);

                if (updateError) throw updateError;
            } else {
                console.log(`학생 생성 (ID: ${student.id})`);
                const { error: insertError } = await supabase
                    .from('students')
                    .insert({
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

                if (insertError) throw insertError;
            }

            migratedForClass++;
            migrationStatus.students.migrated++;
            reportProgress(`클래스 ${classId}의 학생`, migratedForClass, students.length);
        }

        console.log(`클래스 ${classId}의 학생 ${migratedForClass}명 마이그레이션 완료`);
        return students;
    } catch (error) {
        console.error(`클래스 ${classId}의 학생 마이그레이션 오류:`, error);
        return [];
    }
}

// ============== 미션 및 달성 기록 마이그레이션 ==============
async function migrateMissions(classId) {
    console.log(`\n=== 클래스 ${classId}의 미션 마이그레이션 시작 ===`);
    try {
        // 로컬스토리지에서 미션 데이터 가져오기
        const missionsData = localStorage.getItem(`missions_${classId}`);
        if (!missionsData) {
            console.log(`클래스 ${classId}의 미션 데이터가 없습니다.`);
            return [];
        }

        const missions = JSON.parse(missionsData);
        migrationStatus.missions.total += missions.length;
        let migratedForClass = 0;

        // 미션 달성 기록 가져오기
        const achievementsData = localStorage.getItem(`mission_achievements_${classId}`);
        const achievements = achievementsData ? JSON.parse(achievementsData) : [];

        for (const mission of missions) {
            // 트랜잭션 사용 대신 개별 쿼리로 처리
            // 1. 미션 마이그레이션
            const { data: existingMission } = await supabase
                .from('missions')
                .select('id')
                .eq('id', mission.id)
                .single();

            if (existingMission) {
                console.log(`미션 존재 (ID: ${mission.id}): 업데이트 중...`);
                const { error: updateError } = await supabase
                    .from('missions')
                    .update({
                        name: mission.name,
                        condition: mission.condition,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', mission.id);

                if (updateError) throw updateError;
            } else {
                console.log(`미션 생성 (ID: ${mission.id})`);
                const { error: insertError } = await supabase
                    .from('missions')
                    .insert({
                        id: mission.id,
                        name: mission.name,
                        condition: mission.condition,
                        class_id: classId,
                        created_at: mission.createdAt || new Date().toISOString()
                    });

                if (insertError) throw insertError;
            }

            // 2. 미션 달성 기록 마이그레이션
            if (mission.achievers && mission.achievers.length > 0) {
                for (const studentId of mission.achievers) {
                    // 해당 학생과 미션의 달성 기록 찾기
                    const achievement = achievements.find(a =>
                        a.studentId === studentId && a.missionId === mission.id
                    );

                    // 이미 존재하는지 확인
                    const { data: existingAchievement } = await supabase
                        .from('mission_achievements')
                        .select('id')
                        .eq('mission_id', mission.id)
                        .eq('student_id', studentId)
                        .single();

                    if (!existingAchievement) {
                        // 달성 기록 추가
                        const { error: achievementError } = await supabase
                            .from('mission_achievements')
                            .insert({
                                student_id: studentId,
                                mission_id: mission.id,
                                timestamp: achievement?.timestamp || new Date().toISOString(),
                                class_id: classId
                            });

                        if (achievementError) {
                            console.error(`미션 달성 기록 추가 오류 (미션: ${mission.id}, 학생: ${studentId}):`, achievementError);
                        }
                    }
                }
            }

            migratedForClass++;
            migrationStatus.missions.migrated++;
            reportProgress(`클래스 ${classId}의 미션`, migratedForClass, missions.length);
        }

        console.log(`클래스 ${classId}의 미션 ${migratedForClass}개 마이그레이션 완료`);
        return missions;
    } catch (error) {
        console.error(`클래스 ${classId}의 미션 마이그레이션 오류:`, error);
        return [];
    }
}

// 메인 마이그레이션 함수
async function migrateData() {
    console.log('데이터 마이그레이션을 시작합니다...');

    try {
        // 1. 클래스 마이그레이션
        const classes = await migrateClasses();

        // 2. 각 클래스별 데이터 마이그레이션
        for (const classItem of classes) {
            const classId = classItem.id;

            // 2.1 학생 마이그레이션
            await migrateStudents(classId);

            // 2.2 미션 마이그레이션
            await migrateMissions(classId);

            // 여기에 추가 엔티티(로드맵, 칭찬 카드 등) 마이그레이션 함수를 호출할 수 있습니다.
        }

        console.log('\n=== 마이그레이션 완료 요약 ===');
        console.log(`클래스: ${migrationStatus.classes.migrated}/${migrationStatus.classes.total}`);
        console.log(`학생: ${migrationStatus.students.migrated}/${migrationStatus.students.total}`);
        console.log(`미션: ${migrationStatus.missions.migrated}/${migrationStatus.missions.total}`);

        console.log('\n데이터 마이그레이션이 완료되었습니다!');
    } catch (error) {
        console.error('마이그레이션 처리 중 오류가 발생했습니다:', error);
    }
}

// 스크립트 실행
migrateData(); 