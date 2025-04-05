'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { X, Edit, Award, Trash2 } from 'lucide-react'

const EXP_PER_LEVEL = 100
const POINTS_PER_LEVEL = 100

// 성장 몬스터 이미지 경로
const growMonImages = {
    egg: [
        '/images/icons/growmon/egg/egg1.jpg',
        '/images/icons/growmon/egg/egg2.jpg',
        '/images/icons/growmon/egg/egg3.jpg',
        '/images/icons/growmon/egg/egg4.jpg',
    ],
    sogymon: [
        '/images/icons/growmon/sogymon/sogy1.jpg',
        '/images/icons/growmon/sogymon/sogy2_sorogon.jpg',
    ],
    fistmon: [
        '/images/icons/growmon/fistmon/fist1_firefist.jpg',
        '/images/icons/growmon/fistmon/fist2_orafist.jpg',
    ],
    dakomon: [
        '/images/icons/growmon/dakomon/dako1.jpg?v=2',
        '/images/icons/growmon/dakomon/dako2_magicion.jpg',
    ],
    cloudmon: [
        '/images/icons/growmon/cloudmon/cloud1.jpg',
        '/images/icons/growmon/cloudmon/cloud2.jpg',
    ],
}

// 레벨에 따른 진화 단계 확인
const getEvolutionStage = (level: number): 'egg' | 'stage1' | 'stage2' => {
    if (level < 5) return 'egg';
    if (level < 10) return 'stage1';
    return 'stage2';
}

// 진화 단계에 따른 이미지 경로 배열 반환
const getImagesByEvolutionStage = (
    stage: 'egg' | 'stage1' | 'stage2',
    monsterType: 'sogymon' | 'fistmon' | 'dakomon' | 'cloudmon'
): string[] => {
    if (stage === 'egg') return growMonImages.egg;

    const monsterImages = growMonImages[monsterType];
    return stage === 'stage1' ? [monsterImages[0]] : [monsterImages[1]];
}

// 이미지 경로에서 몬스터 타입 추출
const getMonsterTypeFromImagePath = (imagePath: string): 'sogymon' | 'fistmon' | 'dakomon' | 'cloudmon' | null => {
    if (imagePath.includes('sogymon')) return 'sogymon';
    if (imagePath.includes('fistmon')) return 'fistmon';
    if (imagePath.includes('dakomon')) return 'dakomon';
    if (imagePath.includes('cloudmon')) return 'cloudmon';
    return null;
}

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
}

interface StudentDetailModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string | null
    classId: string | null
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, studentId, classId }) => {
    const [student, setStudent] = useState<Student | null>(null)
    const [isEditingIcon, setIsEditingIcon] = useState(false)
    const [isEditingHonorific, setIsEditingHonorific] = useState(false)
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'missions' | 'cards'>('roadmaps')
    const [selectedMonsterType, setSelectedMonsterType] = useState<'sogymon' | 'fistmon' | 'dakomon' | 'cloudmon'>('sogymon')
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

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

    // 로딩 상태
    const [roadmapsLoading, setRoadmapsLoading] = useState(true)
    const [missionsLoading, setMissionsLoading] = useState(true)
    const [cardsLoading, setCardsLoading] = useState(true)

    // 학생이 완료한 로드맵 보상 칭호를 가져오는 함수
    const getAvailableHonorifics = () => {
        console.log('getAvailableHonorifics 실행', { studentId, classId });
        const completedRoadmapTitles: string[] = [];

        try {
            // 1. classes 스토리지에서 학생의 칭호 확인
            const classesJson = localStorage.getItem('classes');
            if (classesJson) {
                const classes = JSON.parse(classesJson);
                const currentClass = classes.find((c: any) => c.id === classId);
                if (currentClass && currentClass.students) {
                    const studentData = currentClass.students.find((s: any) => s.id === studentId);
                    if (studentData && studentData.honorific) {
                        console.log('classes에서 학생 칭호 확인:', studentData.honorific);
                        // 학생이 이미 칭호를 가지고 있는 경우 (로드맵 완료를 통해 획득했을 수 있음)
                        completedRoadmapTitles.push(studentData.honorific);
                    }
                }
            }

            // 2. students_classId 스토리지에서 학생 확인
            const studentsJson = localStorage.getItem(`students_${classId}`);
            if (studentsJson) {
                const students = JSON.parse(studentsJson);
                const studentData = students.find((s: any) => s.id === studentId);
                if (studentData && studentData.honorific) {
                    console.log('students_classId에서 학생 칭호 확인:', studentData.honorific);
                    completedRoadmapTitles.push(studentData.honorific);
                }
            }

            // 3. 모든 로드맵 확인하여 학생이 완료한 로드맵의 보상 칭호 가져오기
            const roadmapsJson = localStorage.getItem(`roadmaps_${classId}`);
            if (roadmapsJson) {
                const allRoadmaps = JSON.parse(roadmapsJson);
                console.log('로드맵 목록 확인:', { count: allRoadmaps.length });

                // 모든 로드맵 확인
                allRoadmaps.forEach((roadmap: any) => {
                    if (roadmap.steps && roadmap.steps.length > 0 && roadmap.rewardTitle) {
                        const lastStep = roadmap.steps[roadmap.steps.length - 1];

                        // 마지막 단계에 학생 배열이 있는지 확인
                        if (lastStep.students && Array.isArray(lastStep.students)) {
                            console.log('로드맵 마지막 단계 학생 확인:', {
                                roadmapName: roadmap.name,
                                rewardTitle: roadmap.rewardTitle,
                                studentsCount: lastStep.students.length,
                                hasCurrentStudent: lastStep.students.includes(studentId)
                            });

                            // 학생이 마지막 단계에 있는지 확인
                            if (lastStep.students.includes(studentId)) {
                                completedRoadmapTitles.push(roadmap.rewardTitle);
                                console.log('로드맵 보상 칭호 추가:', roadmap.rewardTitle);
                            }
                        }
                    }
                });
            }

            // 4. 로드맵_클래스ID_스텝_스텝ID_스튜던츠 스토리지에서 확인
            if (roadmapsJson) {
                const allRoadmaps = JSON.parse(roadmapsJson);

                allRoadmaps.forEach((roadmap: any) => {
                    if (roadmap.steps && roadmap.steps.length > 0 && roadmap.rewardTitle) {
                        const lastStep = roadmap.steps[roadmap.steps.length - 1];

                        // 로컬 스토리지에서 해당 단계의 학생 목록 확인
                        const stepStudentsJson = localStorage.getItem(`roadmap_${classId}_step_${lastStep.id}_students`);
                        if (stepStudentsJson) {
                            const stepStudents = JSON.parse(stepStudentsJson);
                            console.log('단계별 학생 목록 확인:', {
                                roadmapName: roadmap.name,
                                stepId: lastStep.id,
                                studentsCount: stepStudents.length,
                                hasCurrentStudent: stepStudents.includes(studentId)
                            });

                            // 학생이 마지막 단계에 있는지 확인
                            if (stepStudents.includes(studentId)) {
                                completedRoadmapTitles.push(roadmap.rewardTitle);
                                console.log('로드맵 보상 칭호 추가 (단계별 학생 목록):', roadmap.rewardTitle);
                            }
                        }
                    }
                });
            }

            // 5. completedRoadmaps 상태 변수 확인
            console.log('completedRoadmaps 상태 확인:', { count: completedRoadmaps.length });

            if (completedRoadmaps.length > 0) {
                const roadmapsJson = localStorage.getItem(`roadmaps_${classId}`);
                if (roadmapsJson) {
                    const allRoadmaps = JSON.parse(roadmapsJson);

                    // 완료된 로드맵 찾기
                    completedRoadmaps.forEach(completedStep => {
                        const roadmap = allRoadmaps.find((r: any) => r.id === completedStep.roadmapId);

                        if (roadmap && roadmap.steps && roadmap.steps.length > 0 && roadmap.rewardTitle) {
                            const lastStepId = roadmap.steps[roadmap.steps.length - 1].id;

                            console.log('완료된 로드맵 단계 확인:', {
                                roadmapName: roadmap.name,
                                completedStepId: completedStep.stepId,
                                lastStepId: lastStepId,
                                isLastStep: completedStep.stepId === lastStepId
                            });

                            // 완료한 단계가 마지막 단계인 경우 칭호 추가
                            if (completedStep.stepId === lastStepId) {
                                completedRoadmapTitles.push(roadmap.rewardTitle);
                                console.log('로드맵 보상 칭호 추가 (completedRoadmaps):', roadmap.rewardTitle);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error('로드맵 데이터 파싱 오류:', error);
        }

        // 중복 제거
        const uniqueTitles = [...new Set(completedRoadmapTitles)];
        console.log('최종 사용 가능한 칭호 목록:', uniqueTitles);
        return uniqueTitles;
    };

    // 아이콘이 진화할 수 있는지 확인하고 필요시 업데이트하는 함수
    const checkAndUpdateEvolution = (studentObj: Student) => {
        // 이미지 경로에서 몬스터 타입 및 진화 단계 추출
        const currentIconPath = studentObj.iconType || '';
        const currentLevel = studentObj.stats.level;
        const currentEvolutionStage = getEvolutionStage(currentLevel);

        // 아이콘 경로가 없으면 종료
        if (!currentIconPath) return;

        // 알 단계이면 자동으로 다음 단계로 진화 (소기몬으로 기본 진화)
        if (currentIconPath.includes('/egg/')) {
            if (currentEvolutionStage !== 'egg') {
                // 알에서 소기몬 단계 1로 진화
                const newIconPath = growMonImages.sogymon[0];
                updateStudentIcon(studentObj, newIconPath);
                return;
            }
            return; // 아직 진화 조건 미달성
        }

        // 몬스터 타입 확인
        const monsterType = getMonsterTypeFromImagePath(currentIconPath);
        if (!monsterType) return; // 몬스터 타입을 식별할 수 없으면 종료

        // 현재 이미지가 1단계 진화인지 확인 (파일명에 따라 구분)
        const isFirstStage = !currentIconPath.includes('2_');

        // 레벨 10 이상이고 1단계 진화 상태라면 2단계로 진화
        if (currentEvolutionStage === 'stage2' && isFirstStage) {
            const newIconPath = growMonImages[monsterType][1]; // 2단계 진화 이미지
            updateStudentIcon(studentObj, newIconPath);
        }
    }

    // 학생 아이콘 업데이트 및 메시지 표시 함수
    const updateStudentIcon = (studentObj: Student, newIconPath: string) => {
        // 로컬 스토리지에서 클래스 정보 가져오기
        const storedClass = localStorage.getItem(`class_${classId}`);
        if (!storedClass) return;

        const updatedClass = JSON.parse(storedClass);
        const studentIndex = updatedClass.students.findIndex((s: Student) => s.id === studentObj.id);

        if (studentIndex !== -1) {
            // 학생 아이콘 업데이트
            updatedClass.students[studentIndex].iconType = newIconPath;
            localStorage.setItem(`class_${classId}`, JSON.stringify(updatedClass));

            // 상태 업데이트
            setStudent({ ...studentObj, iconType: newIconPath });

            // 진화 메시지 표시
            toast.success(getEvolutionMessage(newIconPath));
        }
    };

    // 진화 메시지 생성 함수
    const getEvolutionMessage = (newIconPath: string) => {
        if (newIconPath.includes('sogy1')) {
            return '축하합니다! 알이 부화하여 소기몬이 되었습니다!';
        } else if (newIconPath.includes('sogy2')) {
            return '축하합니다! 소기몬이 소로곤으로 진화했습니다!';
        } else if (newIconPath.includes('fist1')) {
            return '축하합니다! 알이 부화하여 파이어피스트가 되었습니다!';
        } else if (newIconPath.includes('fist2')) {
            return '축하합니다! 파이어피스트가 오라피스트로 진화했습니다!';
        } else if (newIconPath.includes('dako1')) {
            return '축하합니다! 알이 부화하여 다코몬이 되었습니다!';
        } else if (newIconPath.includes('dako2')) {
            return '축하합니다! 다코몬이 매지션으로 진화했습니다!';
        } else if (newIconPath.includes('cloud1')) {
            return '축하합니다! 알이 부화하여 클라우드몬이 되었습니다!';
        } else if (newIconPath.includes('cloud2')) {
            return '축하합니다! 클라우드몬이 진화했습니다!';
        }
        return '축하합니다! 몬스터가 진화했습니다!';
    };

    useEffect(() => {
        if (isOpen && studentId) {
            loadStudentInfo()
            loadCompletedRoadmaps()
            loadCompletedMissions()
            loadReceivedCards()
        }
    }, [isOpen, studentId, classId])

    // 학생 정보 로드 시 진화 확인
    useEffect(() => {
        if (student) {
            checkAndUpdateEvolution(student);
        }
    }, [student?.stats.level])

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
                        if (step.students && step.students.includes(studentId)) {
                            completed.push({
                                roadmapId: roadmap.id,
                                stepId: step.id,
                                roadmapName: roadmap.name,
                                stepGoal: step.goal
                            })
                        }
                    })
                }
            })

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
    const renderIconSelectionModal = () => {
        if (!isEditingIcon) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-blue-700">성장 몬스터 변경</h3>
                        <button
                            onClick={() => setIsEditingIcon(false)}
                            className="p-1 rounded-full hover:bg-slate-100"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* 몬스터 타입 선택 탭 */}
                    <div className="flex border-b border-gray-200 mb-4">
                        {['sogymon', 'fistmon', 'dakomon', 'cloudmon'].map((type, idx) => (
                            <button
                                key={type}
                                onClick={() => setSelectedMonsterType(type as "sogymon" | "fistmon" | "dakomon" | "cloudmon")}
                                className={`px-4 py-2 font-medium ${selectedMonsterType === type
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {type === 'sogymon' ? '소기몬' :
                                    type === 'fistmon' ? '주먹몬' :
                                        type === 'dakomon' ? '다코몬' : '구름몬'}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {student && student.stats && growMonImages[selectedMonsterType].map((imagePath, index) => {
                            // 학생 레벨에 맞는 진화 단계만 표시
                            const evolutionStage = getEvolutionStage(student.stats.level);
                            const imageEvolutionStage = index === 0 ? "stage1" : "stage2";

                            // 레벨에 맞지 않는 진화 단계면 표시하지 않음
                            if ((evolutionStage === "egg") ||
                                (evolutionStage === "stage1" && imageEvolutionStage === "stage2")) {
                                return null;
                            }

                            return (
                                <button
                                    key={imagePath}
                                    onClick={() => {
                                        if (student) {
                                            updateStudentIcon(student, imagePath);
                                            setIsEditingIcon(false);
                                        }
                                    }}
                                    className={`p-2 border rounded-lg cursor-pointer ${student?.iconType === imagePath ? 'border-2 border-blue-500' : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="relative w-full aspect-square mb-2">
                                        <Image
                                            src={imagePath}
                                            alt={`${selectedMonsterType} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <p className="text-center">
                                        {index === 0
                                            ? (selectedMonsterType === 'sogymon' ? '소기몬' :
                                                selectedMonsterType === 'fistmon' ? '파이어피스트' :
                                                    selectedMonsterType === 'dakomon' ? '다코몬' : '클라우드몬')
                                            : (selectedMonsterType === 'sogymon' ? '소로곤' :
                                                selectedMonsterType === 'fistmon' ? '오라피스트' :
                                                    selectedMonsterType === 'dakomon' ? '매지션' : '구름몬 2단계')}
                                    </p>
                                </button>
                            );
                        })}
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
                                {/* 프로필 아이콘 */}
                                <div className="relative w-32 h-32 mb-4">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        {renderIcon(student.iconType, 32)}
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