/**
 * 데이터 마이그레이션 유틸리티
 * - 경험치 값 정상화를 위한 함수 제공
 */

/**
 * 모든 학생의 경험치 데이터를 정상화하는 함수
 * 10배로 저장된 경험치 값을 정상 값으로 변환
 * @param classId 클래스 ID
 */
export const normalizeStudentExpData = (classId: string): {
    success: boolean;
    message: string;
    processed: number;
    errors: string[];
} => {
    try {
        console.log(`[경험치 정상화] 시작: 클래스 ID ${classId}`);
        const result = {
            success: false,
            message: "",
            processed: 0,
            errors: [] as string[]
        };

        // 1. students_classId에서 학생 데이터 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`);
        if (!savedStudents) {
            result.message = "학생 데이터를 찾을 수 없습니다.";
            return result;
        }

        // 2. 학생 데이터 파싱
        const students = JSON.parse(savedStudents);
        if (!Array.isArray(students) || students.length === 0) {
            result.message = "학생 데이터가 없거나 형식이 올바르지 않습니다.";
            return result;
        }

        console.log(`[경험치 정상화] ${students.length}명의 학생 데이터 로드됨`);

        // 3. 모든 학생의 경험치 정상화 (10으로 나누기)
        let processed = 0;
        const updatedStudents = students.map(student => {
            try {
                if (student.stats && typeof student.stats.exp === 'number') {
                    // 현재 경험치 기록
                    const originalExp = student.stats.exp;

                    // 경험치가 100 이상이면 10으로 나누기 (100 미만이면 이미 정상화된 것으로 판단)
                    if (originalExp >= 100) {
                        // 기존 경험치를 10으로 나눈 값으로 설정
                        student.stats.exp = Math.round(originalExp / 10);
                        processed++;

                        console.log(`[경험치 정상화] 학생 ${student.name}(ID: ${student.id}) 경험치 수정: ${originalExp} → ${student.stats.exp}`);
                    } else {
                        console.log(`[경험치 정상화] 학생 ${student.name}(ID: ${student.id}) 경험치 유지: ${originalExp} (이미 정상화됨)`);
                    }
                } else {
                    // 경험치 데이터가 없는 경우 초기화
                    if (!student.stats) student.stats = { level: 1, exp: 0 };
                    else if (typeof student.stats.exp !== 'number') student.stats.exp = 0;

                    result.errors.push(`학생 ${student.name || student.id}의 경험치 데이터가 없거나 형식이 올바르지 않습니다.`);
                }
                return student;
            } catch (error) {
                result.errors.push(`학생 ${student.name || student.id} 처리 오류: ${error}`);
                return student;
            }
        });

        // 4. 정상화된 데이터 저장
        localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudents));
        console.log(`[경험치 정상화] 학생 데이터 저장 완료`);

        // 5. classes 스토리지 업데이트
        try {
            const classesString = localStorage.getItem('classes');
            if (classesString) {
                const classes = JSON.parse(classesString);
                const classIndex = classes.findIndex((c: any) => c.id === classId);

                if (classIndex !== -1 && Array.isArray(classes[classIndex].students)) {
                    // 해당 클래스의 학생 데이터 업데이트
                    classes[classIndex].students = classes[classIndex].students.map((classStudent: any) => {
                        // 업데이트된 학생 찾기
                        const updatedStudent = updatedStudents.find(s => s.id === classStudent.id);
                        if (updatedStudent) {
                            // stats와 level 정보만 업데이트
                            return {
                                ...classStudent,
                                stats: updatedStudent.stats
                            };
                        }
                        return classStudent;
                    });

                    localStorage.setItem('classes', JSON.stringify(classes));
                    console.log(`[경험치 정상화] classes 스토리지 업데이트 완료`);
                }
            }
        } catch (error) {
            result.errors.push(`classes 스토리지 업데이트 오류: ${error}`);
        }

        // 6. class_classId 스토리지 업데이트
        try {
            const classDataJson = localStorage.getItem(`class_${classId}`);
            if (classDataJson) {
                const classData = JSON.parse(classDataJson);

                if (classData.students && Array.isArray(classData.students)) {
                    // 해당 클래스의 학생 데이터 업데이트
                    classData.students = classData.students.map((classStudent: any) => {
                        // 업데이트된 학생 찾기
                        const updatedStudent = updatedStudents.find(s => s.id === classStudent.id);
                        if (updatedStudent) {
                            // stats와 level 정보만 업데이트
                            return {
                                ...classStudent,
                                stats: updatedStudent.stats
                            };
                        }
                        return classStudent;
                    });

                    localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                    console.log(`[경험치 정상화] class_${classId} 스토리지 업데이트 완료`);
                }
            }
        } catch (error) {
            result.errors.push(`class_${classId} 스토리지 업데이트 오류: ${error}`);
        }

        // 7. 결과 반환
        result.success = true;
        result.processed = processed;
        result.message = `${processed}명의 학생 경험치 데이터가 정상화되었습니다.`;

        if (result.errors.length > 0) {
            result.message += ` (${result.errors.length}개의 오류 발생)`;
        }

        console.log(`[경험치 정상화] 완료: ${result.message}`);
        return result;
    } catch (error) {
        console.error('[경험치 정상화] 치명적 오류:', error);
        return {
            success: false,
            message: `경험치 데이터 정상화 중 오류가 발생했습니다: ${error}`,
            processed: 0,
            errors: [String(error)]
        };
    }
};

/**
 * 학생 한 명의 경험치 데이터를 정상화하는 함수
 * @param classId 클래스 ID
 * @param studentId 학생 ID
 */
export const normalizeStudentExpById = (classId: string, studentId: string): {
    success: boolean;
    message: string;
    originalExp?: number;
    newExp?: number;
} => {
    try {
        console.log(`[경험치 정상화] 학생 ID ${studentId} 처리 시작`);

        // 1. students_classId에서 학생 데이터 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`);
        if (!savedStudents) {
            return { success: false, message: "학생 데이터를 찾을 수 없습니다." };
        }

        // 2. 학생 데이터 파싱
        const students = JSON.parse(savedStudents);
        if (!Array.isArray(students)) {
            return { success: false, message: "학생 데이터 형식이 올바르지 않습니다." };
        }

        // 3. 해당 학생 찾기
        const studentIndex = students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) {
            return { success: false, message: "해당 ID의 학생을 찾을 수 없습니다." };
        }

        const student = students[studentIndex];

        // 4. 경험치 정상화
        if (!student.stats || typeof student.stats.exp !== 'number') {
            if (!student.stats) student.stats = { level: 1, exp: 0 };
            else if (typeof student.stats.exp !== 'number') student.stats.exp = 0;

            students[studentIndex] = student;
            localStorage.setItem(`students_${classId}`, JSON.stringify(students));

            return {
                success: true,
                message: "학생의 경험치 데이터가 없어 초기화했습니다.",
                originalExp: 0,
                newExp: 0
            };
        }

        const originalExp = student.stats.exp;

        // 경험치가 100 이상이면 10으로 나누기 (100 미만이면 이미 정상화된 것으로 판단)
        if (originalExp >= 100) {
            // 기존 경험치를 10으로 나눈 값으로 설정
            student.stats.exp = Math.round(originalExp / 10);

            // 5. 정상화된 데이터 저장
            students[studentIndex] = student;
            localStorage.setItem(`students_${classId}`, JSON.stringify(students));

            console.log(`[경험치 정상화] 학생 ${student.name}(ID: ${studentId}) 경험치 수정: ${originalExp} → ${student.stats.exp}`);

            return {
                success: true,
                message: "학생 경험치가 성공적으로 정상화되었습니다.",
                originalExp,
                newExp: student.stats.exp
            };
        } else {
            console.log(`[경험치 정상화] 학생 ${student.name}(ID: ${studentId}) 경험치 유지: ${originalExp} (이미 정상화됨)`);

            return {
                success: true,
                message: "학생 경험치가 이미 정상화되어 있습니다.",
                originalExp,
                newExp: originalExp
            };
        }
    } catch (error) {
        console.error('[경험치 정상화] 학생 처리 오류:', error);
        return {
            success: false,
            message: `학생 경험치 정상화 중 오류가 발생했습니다: ${error}`
        };
    }
}; 