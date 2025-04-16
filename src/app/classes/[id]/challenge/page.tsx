'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save, Trash2, Image as ImageIcon, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import AvatarRenderer from '@/components/Avatar'
import { getExpRequiredForLevel, calculateLevelFromExp } from '@/lib/types'
import { useStudentData } from '../components/student-detail/hooks/useStudentData'

interface ClassInfo {
    id: string
    name: string
    grade: string
    subject: string
    description: string
    coverImage: string
    createdAt: string
}

interface Student {
    id: string
    number: number
    name: string
    title: string
    honorific: string
    stats: {
        level: number
        exp?: number
    }
    iconType: string
    points?: number
}

interface ChallengeStep {
    id: string
    goal: string
    students?: string[] // 학생 ID 배열
    abilities?: {
        intelligence?: boolean
        diligence?: boolean
        creativity?: boolean
        personality?: boolean
        health?: boolean      // 체력
        communication?: boolean // 의사소통
    }
}

interface Challenge {
    id: string
    name: string
    steps: ChallengeStep[]
    rewardTitle: string
    icon: string
    createdAt: string
    abilities?: {
        intelligence?: boolean // 지력
        diligence?: boolean    // 성실성
        creativity?: boolean   // 창의력
        personality?: boolean  // 인성
        health?: boolean       // 체력
        communication?: boolean // 의사소통
    }
}

// 상수 값을 추가
// const EXP_PER_LEVEL = 100 // 레벨업에 필요한 경험치 (이제 함수로 계산)
const EXP_FOR_CHALLENGE_STEP = 200 // 챌린지 단계 완료 시 획득 경험치 (레벨 2업)
const POINTS_PER_LEVEL = 100 // 레벨업 시 획득 포인트

export default function ChallengePage() {
    const router = useRouter()
    const params = useParams()
    const classId = params?.id as string || ''

    // classId가 없으면 리다이렉트
    useEffect(() => {
        if (!classId) {
            router.push('/classes')
        }
    }, [classId, router])

    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        steps: [
            {
                id: '1',
                goal: ''
            },
            {
                id: '2',
                goal: ''
            }
        ],
        rewardTitle: '',
        icon: '/images/icons/challenge/basicbook.jpg',
        abilities: {
            intelligence: false,
            diligence: false,
            creativity: false,
            personality: false,
            health: false,      // 체력
            communication: false  // 의사소통
        }
    })
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
    const [isChallengeDetailModalOpen, setIsChallengeDetailModalOpen] = useState(false)
    const [selectedChallengeStepIndex, setSelectedChallengeStepIndex] = useState<number | null>(null)
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
    const [studentsInClass, setStudentsInClass] = useState<any[]>([])
    const [studentsInSteps, setStudentsInSteps] = useState<{ [stepId: string]: string[] }>({})
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isIconSelectOpen, setIsIconSelectOpen] = useState(false)
    const [challengeIcons, setChallengeIcons] = useState([
        '/images/icons/challenge/basicbook.jpg',
        '/images/icons/challenge/goldbook.jpg',
        '/images/icons/challenge/legendbook.jpg',
        '/images/icons/challenge/bagicpencil.jpg',
        '/images/icons/challenge/silverpencil.jpg',
        '/images/icons/challenge/goldpencil.jpg',
        '/images/icons/challenge/hat.jpg',
        '/images/icons/challenge/experthat.jpg',
        '/images/icons/challenge/goldhat.jpg'
    ])

    // useStudentData 훅을 가져와서 updateStudentExpAndLevel 함수만 사용
    const { updateStudentExpAndLevel } = useStudentData({ studentId: null, classId });

    useEffect(() => {
        // 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

        if (!classId) return; // classId가 없으면 실행하지 않음

        // 클래스 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses)
                const foundClass = classes.find((c: ClassInfo) => c.id === classId)
                if (foundClass) {
                    setClassInfo(foundClass)
                }
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error)
            }
        }

        // 챌린지 목록 정보 가져오기
        const savedChallenges = localStorage.getItem(`challenges_${classId}`)
        if (savedChallenges) {
            try {
                setChallenges(JSON.parse(savedChallenges))
            } catch (error) {
                console.error('챌린지 목록 데이터 파싱 오류:', error)
                setChallenges([])
            }
        } else {
            // 초기 챌린지 데이터가 없는 경우 빈 배열로 초기화
            setChallenges([])
            localStorage.setItem(`challenges_${classId}`, JSON.stringify([]))
        }

        setIsLoading(false)
    }, [classId, router])

    // 챌린지 단계 추가 폼 초기화
    const initAddForm = () => {
        setFormData({
            name: '',
            steps: [
                {
                    id: '1',
                    goal: ''
                },
                {
                    id: '2',
                    goal: ''
                }
            ],
            rewardTitle: '',
            icon: '/images/icons/challenge/basicbook.jpg',
            abilities: {
                intelligence: false,
                diligence: false,
                creativity: false,
                personality: false,
                health: false,      // 체력
                communication: false  // 의사소통
            }
        })
        setIsAddModalOpen(true)
    }

    // 폼 입력값 변경 핸들러
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // 단계 추가 핸들러 (폼에 새 단계 필드 추가)
    const handleAddStep = () => {
        const newStep = {
            id: Date.now().toString(),
            goal: ''
        };

        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));
    }

    // 챌린지 추가 처리
    const handleAddChallenge = (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // 폼 유효성 검사
            if (!formData.name || !formData.rewardTitle || formData.steps.some(step => !step.goal)) {
                toast.error('모든 필드를 입력해주세요.')
                return
            }

            // 고유 ID 생성
            const newChallenge: Challenge = {
                ...formData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            }

            // 챌린지 목록에 추가
            const updatedChallenges = [...challenges, newChallenge]
            setChallenges(updatedChallenges)

            // 로컬 스토리지에 저장
            localStorage.setItem(`challenges_${classId}`, JSON.stringify(updatedChallenges))

            // 각 단계별로 별도 저장 (반복 복구를 위해)
            newChallenge.steps.forEach(step => {
                // 각 단계별 빈 학생 배열 초기화만 하고 실제 학생은 추가하지 않음
                const emptyStudentsArray: string[] = [];
                localStorage.setItem(`challenge_${classId}_step_${step.id}_students`, JSON.stringify(emptyStudentsArray));
            });

            // 저장 성공 메시지
            toast.success('새 챌린지가 추가되었습니다.')

            // 폼 초기화
            initAddForm()
            setIsAddModalOpen(false)
        } catch (error) {
            console.error('챌린지 추가 오류:', error)
            toast.error('챌린지를 추가하는 중 오류가 발생했습니다.')
        }
    }

    // 챌린지 이름 변경 핸들러
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setFormData(prev => ({
            ...prev,
            name: value
        }))
    }

    // 단계별 목표 변경 핸들러
    const handleStepChange = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => {
                if (i === index) {
                    return {
                        ...step,
                        [field]: value
                    }
                }
                return step
            })
        }));
    }

    // 챌린지 능력치 토글 핸들러
    const handleAbilityToggle = (ability: string) => {
        setFormData(prev => ({
            ...prev,
            abilities: {
                ...prev.abilities,
                [ability]: !prev.abilities[ability as keyof typeof prev.abilities]
            }
        }))
    }

    // 아이콘 선택 핸들러
    const handleIconSelect = (iconPath: string) => {
        setFormData(prev => ({
            ...prev,
            icon: iconPath
        }));
        setIsIconSelectOpen(false);
    };

    // 단계 삭제 핸들러
    const handleRemoveStep = (index: number) => {
        if (formData.steps.length <= 2) {
            toast.error('챌린지는 최소 2단계 이상 있어야 합니다.')
            return
        }

        const updatedSteps = formData.steps.filter((_, i) => i !== index);
        setFormData({ ...formData, steps: updatedSteps });
    }

    // 챌린지 클릭 핸들러
    const handleChallengeClick = (challengeId: string) => {
        // 선택된 챌린지 찾기
        const challenge = challenges.find(r => r.id === challengeId)
        if (!challenge) return

        setSelectedChallenge(challenge)

        // 챌린지 각 단계별 학생 목록 불러오기
        loadStudentsInClass()
        const stepStudents: { [stepId: string]: string[] } = {}

        challenge.steps.forEach(step => {
            // 모든 가능한 키 형식을 확인
            console.log(`단계 ${step.id}의 학생 목록을 불러오는 중...`);

            // 1. 표준 형식 - challenge_${classId}_${challengeId}_step_${step.id}_students
            const primaryKey = `challenge_${classId}_${challengeId}_step_${step.id}_students`;

            // 2. 이전 형식 - challenge_${classId}_step_${step.id}_students
            const oldStepKey = `challenge_${classId}_step_${step.id}_students`;

            // 3. 다른 형식 - challenge_step_${classId}_${challengeId}_${step.id}
            const alternateKey = `challenge_step_${classId}_${challengeId}_${step.id}`;

            // 4. 레거시 형식 - roadmap_step_${classId}_${challengeId}_${step.id}
            const legacyKey = `roadmap_step_${classId}_${challengeId}_${step.id}`;

            // 모든 키를 확인하고 데이터 로드
            let studentsInStep = localStorage.getItem(primaryKey);
            let sourceKey = primaryKey;

            if (!studentsInStep) {
                studentsInStep = localStorage.getItem(oldStepKey);
                if (studentsInStep) sourceKey = oldStepKey;
            }

            if (!studentsInStep) {
                studentsInStep = localStorage.getItem(alternateKey);
                if (studentsInStep) sourceKey = alternateKey;
            }

            if (!studentsInStep) {
                studentsInStep = localStorage.getItem(legacyKey);
                if (studentsInStep) sourceKey = legacyKey;
            }

            // 어느 곳에서든 데이터를 찾았다면 모든 형식에 저장
            if (studentsInStep) {
                console.log(`단계 데이터 발견: ${sourceKey}`);

                // 모든 형식에 일관되게 저장 (마이그레이션)
                localStorage.setItem(primaryKey, studentsInStep);
                localStorage.setItem(oldStepKey, studentsInStep);
                localStorage.setItem(alternateKey, studentsInStep);

                console.log(`단계 데이터 마이그레이션: ${sourceKey} → 모든 형식`);
            } else {
                console.log(`단계 ${step.id}에 대한 학생 데이터를 찾을 수 없음`);
            }

            stepStudents[step.id] = studentsInStep ? JSON.parse(studentsInStep) : []
            console.log(`단계 ${step.id} 학생 목록 (${stepStudents[step.id].length}명):`, stepStudents[step.id]);
        })

        // 로컬 스토리지의 학생 목록과 챌린지 객체의 학생 목록 동기화
        const updatedChallenge = { ...challenge }
        updatedChallenge.steps = challenge.steps.map(step => {
            return {
                ...step,
                students: stepStudents[step.id] || []
            }
        })

        // 챌린지 객체의 학생 목록 업데이트 (동기화)
        setSelectedChallenge(updatedChallenge)
        setStudentsInSteps(stepStudents)
        setIsChallengeDetailModalOpen(true)
    }

    // 조회 모드 단계 클릭 핸들러
    const handleStepClick = (stepIndex: number) => {
        if (!studentsInClass.length) {
            loadStudentsInClass()
        }
        setSelectedChallengeStepIndex(stepIndex)
    }

    // 챌린지 단계에 학생 추가를 위한 모달 열기
    const handleAddStudentToStep = (stepIndex: number) => {
        // 학생 목록이 없으면 로드
        if (!studentsInClass.length) {
            loadStudentsInClass()
        }

        setSelectedChallengeStepIndex(stepIndex)
        setIsAddStudentModalOpen(true)
    }

    // 학생들을 단계에 추가하는 함수 (모달에서 호출)
    const handleAddStudentsToStep = (studentIds: string[]) => {
        if (!selectedChallenge || selectedChallengeStepIndex === null) {
            toast.error('챌린지 정보가 없습니다.');
            return;
        }

        const step = selectedChallenge.steps[selectedChallengeStepIndex];
        if (!step) {
            toast.error('단계 정보가 없습니다.');
            return;
        }

        // 이미 해당 단계나 이후 단계에 있는 학생들 필터링
        const filteredStudentIds = studentIds.filter(studentId => {
            // 현재 단계 이후의 모든 단계 확인
            for (let i = selectedChallengeStepIndex; i < selectedChallenge.steps.length; i++) {
                const stepId = selectedChallenge.steps[i].id;
                const studentsInStep = studentsInSteps[stepId] || [];

                // 이미 이 단계나 이후 단계에 있으면 필터링
                if (studentsInStep.includes(studentId)) {
                    return false;
                }
            }
            return true;
        });

        if (filteredStudentIds.length === 0) {
            toast.info('추가할 학생이 없습니다. 이미 모든 선택된 학생이 이 단계나 이후 단계에 있습니다.');
            setIsAddStudentModalOpen(false);
            return;
        }

        // 새 학생 추가
        const updatedStudentsInStep = [...(studentsInSteps[step.id] || []), ...filteredStudentIds]

        // 챌린지 ID를 포함한 일관된 형식의 키로 저장
        const stepKey = `challenge_${classId}_${selectedChallenge.id}_step_${step.id}_students`
        console.log(`새로운 형식의 키로 데이터 저장: ${stepKey}`)

        // 로컬 스토리지 업데이트 - 일관된 키 형식 사용
        localStorage.setItem(stepKey, JSON.stringify(updatedStudentsInStep))

        // 이전 호환성을 위해 모든 키 형식에 저장 (일시적)
        localStorage.setItem(`challenge_${classId}_step_${step.id}_students`, JSON.stringify(updatedStudentsInStep))
        localStorage.setItem(`challenge_step_${classId}_${selectedChallenge.id}_${step.id}`, JSON.stringify(updatedStudentsInStep))

        console.log(`학생 정보 저장 완료: ${filteredStudentIds.length}명, 키: ${stepKey}`)

        // 1. 이전 단계에서 학생 제거 (선택된 학생을 이전 단계에서 제거)
        if (selectedChallengeStepIndex > 0) {
            for (let i = 0; i < selectedChallengeStepIndex; i++) {
                const prevStepId = selectedChallenge.steps[i].id;
                const prevStepStudents = studentsInSteps[prevStepId] || [];

                // 이전 단계에서 선택된 학생 제거
                const updatedPrevStepStudents = prevStepStudents.filter(
                    studentId => !filteredStudentIds.includes(studentId)
                );

                // 일관된 키 형식 사용 - 챌린지 ID를 포함
                const prevStepKey = `challenge_${classId}_${selectedChallenge.id}_step_${prevStepId}_students`;
                console.log(`이전 단계 업데이트 - 새 키 형식: ${prevStepKey}`);

                // 모든 형식의 키에 대해 일관되게 업데이트
                localStorage.setItem(prevStepKey, JSON.stringify(updatedPrevStepStudents));

                // 이전 호환성을 위해 다른 키 형식에도 저장 (일시적)
                localStorage.setItem(
                    `challenge_${classId}_step_${prevStepId}_students`,
                    JSON.stringify(updatedPrevStepStudents)
                );
                localStorage.setItem(
                    `challenge_step_${classId}_${selectedChallenge.id}_${prevStepId}`,
                    JSON.stringify(updatedPrevStepStudents)
                );

                // 상태 업데이트
                studentsInSteps[prevStepId] = updatedPrevStepStudents;
            }
        }

        // 2. 경험치와 레벨 업데이트
        filteredStudentIds.forEach(studentId => {
            // 기존 내부 함수 호출을 useStudentData에서 제공하는 함수로 교체
            // 챌린지는 골드를 추가로 지급하지 않음, 경험치만 200 지급
            updateStudentExpAndLevel(studentId, EXP_FOR_CHALLENGE_STEP, selectedChallenge.abilities, 0);
        });

        // 3. 마지막 단계 완료 시 칭호 부여
        const isLastStep = selectedChallengeStepIndex === selectedChallenge.steps.length - 1;
        if (isLastStep && selectedChallenge.rewardTitle) {
            // 마지막 단계이고 보상 칭호가 설정되어 있으면 칭호 부여
            filteredStudentIds.forEach(studentId => {
                assignHonorificToStudent(studentId, selectedChallenge.rewardTitle);

                // 칭호 획득 메시지를 별도로 표시
                const student = studentsInClass.find(s => s.id === studentId);
                if (student) {
                    setTimeout(() => {
                        toast.success(
                            <div>
                                <p><strong>{student.name}</strong> 학생이 <br />챌린지 완료 칭호를 획득했습니다!</p>
                                <p><span className="font-bold text-purple-700">&quot;{selectedChallenge.rewardTitle}&quot;</span></p>
                            </div>,
                            { duration: 4000 }
                        );
                    }, 1000);
                }
            });
        }

        // 상태 업데이트
        setStudentsInSteps({
            ...studentsInSteps,
            [step.id]: updatedStudentsInStep
        });

        setIsAddStudentModalOpen(false);

        // 성공 메시지 표시
        toast.success(
            <div>
                <p>{filteredStudentIds.length}명의 학생이 챌린지 단계를 달성했습니다!</p>
                <p className="text-sm font-medium">{selectedChallenge.name} - {step.goal}</p>
            </div>
        );
    }

    // 학생에게 칭호 부여하는 함수
    const assignHonorificToStudent = (studentId: string, honorific: string) => {
        console.log('칭호 부여 시작:', { studentId, honorific, classId });

        try {
            // 1. students_classId에서 학생 업데이트
            const savedStudents = localStorage.getItem(`students_${classId}`);
            if (savedStudents) {
                const students = JSON.parse(savedStudents);
                const studentIndex = students.findIndex((s: Student) => s.id === studentId);

                if (studentIndex !== -1) {
                    // 학생 데이터
                    const student = students[studentIndex];
                    const studentName = student.name;

                    // 칭호 업데이트
                    students[studentIndex].honorific = honorific;
                    console.log('students_classId 학생 칭호 업데이트:', { studentName, honorific });

                    // 로컬 스토리지에 저장
                    localStorage.setItem(`students_${classId}`, JSON.stringify(students));

                    // 상태 업데이트
                    setStudentsInClass(students);
                } else {
                    console.warn('students_classId에서 학생을 찾을 수 없음:', studentId);
                }
            } else {
                console.warn('students_classId 데이터가 없음');
            }

            // 2. classes 스토리지에도 학생 정보 업데이트
            try {
                const classesString = localStorage.getItem('classes');
                if (classesString) {
                    const classes = JSON.parse(classesString);
                    const classIndex = classes.findIndex((c: any) => c.id === classId);

                    if (classIndex !== -1) {
                        // 학생 배열이 없거나 배열이 아닌 경우 빈 배열로 초기화
                        const classStudents = classes[classIndex].students || [];

                        // classStudents가 배열인지 확인
                        if (!Array.isArray(classStudents)) {
                            console.warn('classes 스토리지의 students가 배열이 아닙니다. 빈 배열로 초기화합니다.');
                            classes[classIndex].students = [];
                            localStorage.setItem('classes', JSON.stringify(classes));
                            console.log('classes 스토리지 students 필드 초기화 완료');
                            return; // 더 이상 진행하지 않음
                        }

                        const classStudentIndex = classStudents.findIndex((s: any) => s.id === studentId);

                        if (classStudentIndex !== -1) {
                            // 최신 정보로 업데이트 - student 변수는 이 함수에서 접근할 수 없으므로
                            // 직접 값을 할당합니다
                            classes[classIndex].students[classStudentIndex].honorific = honorific;

                            localStorage.setItem('classes', JSON.stringify(classes));
                            console.log('classes 스토리지 학생 칭호 업데이트 완료');
                        } else {
                            console.warn(`classes 스토리지에서 학생 ID ${studentId}를 찾을 수 없습니다.`);
                        }
                    } else {
                        console.warn(`classes 스토리지에서 클래스 ID ${classId}를 찾을 수 없습니다.`);
                    }
                } else {
                    console.warn('classes 스토리지 데이터가 없습니다.');
                }
            } catch (error) {
                console.error('classes 스토리지 업데이트 오류:', error);
            }

            // 3. class_classId 스토리지에서도 학생 정보 업데이트
            const classDataJson = localStorage.getItem(`class_${classId}`);
            if (classDataJson) {
                const classData = JSON.parse(classDataJson);

                if (classData.students && Array.isArray(classData.students)) {
                    const studentIndex = classData.students.findIndex(
                        (s: Student) => s.id === studentId
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

            // 4. class-${classId}-students 형식의 저장소도 업데이트 (하이픈 형식)
            const hyphenClassStudentsJson = localStorage.getItem(`class-${classId}-students`);
            if (hyphenClassStudentsJson) {
                try {
                    const hyphenClassStudents = JSON.parse(hyphenClassStudentsJson);

                    if (Array.isArray(hyphenClassStudents)) {
                        const studentIndex = hyphenClassStudents.findIndex(
                            (s: Student) => s.id === studentId
                        );

                        if (studentIndex !== -1) {
                            // 칭호 업데이트
                            hyphenClassStudents[studentIndex].honorific = honorific;
                            console.log(`class-${classId}-students 스토리지 학생 칭호 업데이트 완료`);

                            // 저장
                            localStorage.setItem(`class-${classId}-students`, JSON.stringify(hyphenClassStudents));
                        } else {
                            console.warn(`class-${classId}-students 스토리지에서 학생을 찾을 수 없음:`, studentId);
                        }
                    } else {
                        console.warn(`class-${classId}-students 스토리지의 데이터가 배열이 아님`);
                    }
                } catch (error) {
                    console.error(`class-${classId}-students 스토리지 업데이트 오류:`, error);
                }
            } else {
                console.warn(`class-${classId}-students 스토리지 데이터가 없음`);
            }

            // 5. 학생 이름 찾기 (메시지 표시용)
            let studentName = '알 수 없음';
            const savedStudentsForName = localStorage.getItem(`students_${classId}`);
            if (savedStudentsForName) {
                const studentsArray = JSON.parse(savedStudentsForName);
                const student = studentsArray.find((s: Student) => s.id === studentId);
                if (student) {
                    studentName = student.name;
                }
            } else {
                const classesForName = localStorage.getItem('classes');
                if (classesForName) {
                    const allClasses = JSON.parse(classesForName);
                    const currentClass = allClasses.find((c: ClassInfo) => c.id === classId);
                    if (currentClass && currentClass.students) {
                        const student = currentClass.students.find((s: Student) => s.id === studentId);
                        if (student) {
                            studentName = student.name;
                        }
                    }
                }
            }

            // 칭호 획득 메시지 표시
            toast.success(`${studentName} 학생이 '${honorific}' 칭호를 획득했습니다!`, {
                duration: 3000,
                style: {
                    opacity: 1,
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                }
            });

            console.log('칭호 부여 완료:', { studentName, honorific });
        } catch (error) {
            console.error('칭호 부여 중 오류 발생:', error);
            toast.error('칭호를 부여하는 중 오류가 발생했습니다.');
        }
    };

    // 학생을 챌린지 단계에 추가하는 함수
    const addStudentToChallengStep = (challengeId: string, stepId: string, studentId: string) => {
        try {
            // 1. 챌린지 데이터 불러오기
            const challengsData = localStorage.getItem(`challenges_${classId}`)
            if (!challengsData) {
                toast.error('챌린지 데이터를 불러올 수 없습니다.')
                return false
            }

            const challenges: Challenge[] = JSON.parse(challengsData)

            // 2. 해당 챌린지 찾기
            const challengeIndex = challenges.findIndex(r => r.id === challengeId)
            if (challengeIndex === -1) {
                toast.error('해당 챌린지를 찾을 수 없습니다.')
                return false
            }

            const challenge = challenges[challengeIndex]
            const stepIndex = challenge.steps.findIndex((s: ChallengeStep) => s.id === stepId)

            if (stepIndex === -1) {
                toast.error('해당 단계를 찾을 수 없습니다.')
                return false
            }

            const step = challenge.steps[stepIndex];

            // 이미 완료한 학생이면 추가하지 않음
            if (step.students && step.students.includes(studentId)) {
                toast.info('이미 완료한 단계입니다.')
                return true
            }

            // 2. 단계별 학생 목록에 추가
            if (!step.students) {
                step.students = []
            }
            step.students.push(studentId)

            // 3. 로컬 스토리지 업데이트
            challenges[challengeIndex] = challenge
            localStorage.setItem(`challenges_${classId}`, JSON.stringify(challenges))

            // 4. 단계별 별도 저장소에도 업데이트 - 챌린지 ID를 포함한 고유한 키 사용
            const stepKey = `challenge_${classId}_${challengeId}_step_${stepId}_students`
            console.log(`새로운 형식의 키로 데이터 저장: ${stepKey}`)

            // 로컬 스토리지 업데이트 - 일관된 키 형식 사용
            localStorage.setItem(stepKey, JSON.stringify(step.students))

            // 이전 호환성을 위해 모든 키 형식에 저장 (일시적)
            localStorage.setItem(`challenge_${classId}_step_${stepId}_students`, JSON.stringify(step.students))
            localStorage.setItem(`challenge_step_${classId}_${challengeId}_${stepId}`, JSON.stringify(step.students))

            console.log(`학생 정보 저장 완료: ${step.students.length}명, 키: ${stepKey}`)

            // 5. 현재 상태 업데이트
            if (selectedChallenge && selectedChallenge.id === challengeId) {
                const updatedChallenge = { ...selectedChallenge }
                updatedChallenge.steps = [...updatedChallenge.steps]
                updatedChallenge.steps[stepIndex] = { ...updatedChallenge.steps[stepIndex], students: [...step.students] }
                setSelectedChallenge(updatedChallenge)

                // 단계별 학생 목록 상태 업데이트
                setStudentsInSteps(prev => {
                    const newState = { ...prev }
                    newState[stepId] = [...(step.students || [])]
                    return newState
                })
            }

            // 6. 경험치 및 레벨 업데이트
            if (selectedChallenge) {
                try {
                    // 단계 번호를 정확히 추출 (stepId에서 숫자 추출 또는 인덱스 + 1)
                    const stepNumber = step.id.replace(/\D/g, '');
                    let actualStepNumber: number;

                    // 스텝 번호가 추출되면 사용, 아니면 인덱스 기반으로 계산
                    if (stepNumber && parseInt(stepNumber) > 0 && parseInt(stepNumber) < 100) {
                        actualStepNumber = parseInt(stepNumber);
                    } else {
                        const stepIndex = challenge.steps.findIndex((s: any) => s.id === step.id);
                        actualStepNumber = stepIndex + 1; // 인덱스는 0부터 시작하므로 +1
                    }

                    // 단계 번호가 1~10 범위를 벗어나지 않도록 제한
                    actualStepNumber = Math.min(Math.max(1, actualStepNumber), 10);

                    // 단계 번호에 따른 경험치 계산 (각 단계마다 EXP_FOR_CHALLENGE_STEP 경험치)
                    // 안전하게 수의 범위 제한
                    const expToAdd = Math.min(actualStepNumber * EXP_FOR_CHALLENGE_STEP, 2000);

                    console.log(`단계 ${actualStepNumber}에 따라 경험치 ${expToAdd} 추가 (최대 2000)`);

                    // 수정된 경험치로 업데이트 - 기존 abilities 객체 그대로 사용
                    // 안전하게 값의 범위를 제한하여 업데이트
                    const result = updateStudentExpAndLevel(studentId, expToAdd, selectedChallenge.abilities, 0);

                    if (result) {
                        console.log("경험치 업데이트 성공:", expToAdd);
                    } else {
                        console.error("경험치 업데이트 실패");
                    }
                } catch (error) {
                    console.error("경험치 업데이트 중 오류 발생:", error);
                    toast.error("경험치 업데이트 중 오류가 발생했습니다");
                }
            }

            // 7. 마지막 단계면 칭호 부여 (보상)
            const isLastStep = stepIndex === challenge.steps.length - 1
            if (isLastStep && challenge.rewardTitle) {
                assignHonorificToStudent(studentId, challenge.rewardTitle)
            }

            toast.success('단계 완료 처리되었습니다.')
            return true
        } catch (error) {
            console.error('챌린지 단계 완료 처리 중 오류:', error)
            toast.error('단계 완료 처리 중 오류가 발생했습니다.')
            return false
        }
    }

    // 챌린지 삭제 처리 함수
    const handleDeleteChallenge = () => {
        if (!selectedChallenge) return

        try {
            console.log('챌린지 삭제 시작:', selectedChallenge.id);

            // 챌린지 목록에서 선택된 챌린지 제거
            const updatedChallenges = challenges.filter(r => r.id !== selectedChallenge.id)
            setChallenges(updatedChallenges)

            // 로컬 스토리지에서 챌린지 정보 업데이트
            localStorage.setItem(`challenges_${classId}`, JSON.stringify(updatedChallenges))

            // 해당 챌린지의 각 단계별 학생 정보도 삭제 (수정된 키 형식 사용)
            selectedChallenge.steps.forEach(step => {
                const stepKey = `challenge_${classId}_step_${step.id}_students`
                localStorage.removeItem(stepKey)
                console.log(`삭제된 단계 데이터: ${stepKey}`);
            })

            setIsDeleteConfirmOpen(false)
            setIsChallengeDetailModalOpen(false)
            setSelectedChallenge(null)

            toast.success('챌린지가 삭제되었습니다.');
            console.log('챌린지 삭제 완료');
        } catch (error) {
            console.error('챌린지 삭제 오류:', error);
            toast.error('챌린지를 삭제하는 중 오류가 발생했습니다.');
        }
    }

    // 학생 목록 불러오기 함수
    const loadStudentsInClass = () => {
        const savedStudents = localStorage.getItem(`students_${classId}`);
        if (savedStudents) {
            try {
                // 학생 데이터 파싱
                const parsedStudents = JSON.parse(savedStudents);

                // ID 기준으로 중복 제거
                const uniqueStudents = removeDuplicateStudents(parsedStudents);

                // 중복이 제거된 경우 localStorage 업데이트
                if (uniqueStudents.length !== parsedStudents.length) {
                    console.log(`중복 학생 ${parsedStudents.length - uniqueStudents.length}명 제거됨`);
                    localStorage.setItem(`students_${classId}`, JSON.stringify(uniqueStudents));

                    // 다른 저장소와 동기화
                    syncStudentsWithOtherStorage(uniqueStudents);
                    toast.success(`중복된 학생 데이터가 정리되었습니다. (${parsedStudents.length - uniqueStudents.length}명 제거됨)`);
                }

                setStudentsInClass(uniqueStudents);
            } catch (error) {
                console.error('학생 데이터 파싱 오류:', error);
                setStudentsInClass([]);
            }
        }
    };

    // ID 기준으로 중복 학생 제거 함수
    const removeDuplicateStudents = (students: any[]): any[] => {
        const uniqueIds = new Set();
        return students.filter(student => {
            if (uniqueIds.has(student.id)) {
                return false; // 이미 처리된 ID는 제외
            }
            uniqueIds.add(student.id);
            return true; // 새로운 ID는 포함
        });
    };

    // 학생 데이터를 다른 저장소와 동기화하는 함수
    const syncStudentsWithOtherStorage = (studentsData: any[]) => {
        // 1. classes 데이터와 동기화
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses);
                const updatedClasses = classes.map((c: any) => {
                    if (c.id === classId) {
                        return {
                            ...c,
                            students: studentsData
                        };
                    }
                    return c;
                });

                localStorage.setItem('classes', JSON.stringify(updatedClasses));
                console.log('classes 스토리지 학생 정보 동기화 완료');
            } catch (error) {
                console.error('classes 데이터 동기화 오류:', error);
            }
        }

        // 2. class_classId 저장소와도 동기화
        const classDataJson = localStorage.getItem(`class_${classId}`);
        if (classDataJson) {
            try {
                const classData = JSON.parse(classDataJson);
                classData.students = studentsData;
                localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                console.log('class_classId 스토리지 학생 정보 동기화 완료');
            } catch (error) {
                console.error('class_classId 데이터 동기화 오류:', error);
            }
        }
    };

    // 학생 아바타 렌더링 함수
    const renderStudentAvatar = (student: any) => {
        if (student.avatar) {
            return <AvatarRenderer avatar={student.avatar} size={40} />
        } else if (student.iconType) {
            return (
                <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image
                        src={student.iconType.startsWith('/') ? student.iconType : '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg'}
                        alt={student.name}
                        width={40}
                        height={40}
                        className="object-cover"
                    />
                </div>
            )
        } else {
            return (
                <div className="relative w-full h-full overflow-hidden rounded-full bg-blue-100">
                    <span className="absolute inset-0 flex items-center justify-center text-blue-500 font-bold">
                        {student.name?.charAt(0) || "?"}
                    </span>
                </div>
            )
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">학급 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (!classInfo) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">학급 정보를 찾을 수 없습니다.</p>
                    <Link href="/classes" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
                        학급 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative">
            {/* 배경 이미지 */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/images/backgrounds/sky-bg.jpg")' }}></div>

            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-300/30 to-white/20"></div>

            {/* 콘텐츠 영역 */}
            <div className="relative z-10 min-h-screen">
                {/* 헤더 */}
                <div className="bg-blue-500 shadow-md py-4 px-6 flex justify-between items-center text-white">
                    <div className="flex items-center">
                        <Link href={`/classes/${classId}`} className="mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">학생 목록으로</h1>
                    </div>
                    <Link href="/login" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                        <span>로그아웃</span>
                    </Link>
                </div>

                <div className="container mx-auto py-8 px-4">
                    {/* 페이지 제목과 설명 */}
                    <div className="mb-8 bg-white/40 backdrop-blur-sm p-6 rounded-xl shadow-md">
                        <h1 className="text-2xl font-bold text-blue-800">챌린지</h1>
                        <p className="text-slate-700">학생들의 장기적인 목표를 설정하고 학생들이 목표를 달성하게 도와주세요.</p>
                        <p className="text-slate-700 mt-1 text-sm bg-blue-50 p-2 rounded-md inline-block">챌린지에서 학생이 각 단계를 달성하면 레벨 2씩 오릅니다.</p>
                    </div>

                    {/* 챌린지 목록 */}
                    <div className="mb-8 bg-white/30 backdrop-blur-sm p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-blue-800">챌린지 목록</h2>
                            <button
                                onClick={initAddForm}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                새 챌린지
                            </button>
                        </div>

                        {/* 챌린지 목록 (그리드) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {challenges.length === 0 ? (
                                <div className="col-span-3 text-center py-12 bg-blue-50/50 rounded-lg">
                                    <p className="text-slate-600">새 챌린지를 추가해보세요</p>
                                </div>
                            ) : (
                                challenges.map((challenge) => (
                                    <div
                                        key={challenge.id}
                                        className="bg-white/60 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100/50 cursor-pointer"
                                        onClick={() => handleChallengeClick(challenge.id)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center">
                                                <Image
                                                    src={challenge.icon || '/images/icons/challenge/basicbook.jpg'}
                                                    alt={challenge.name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-blue-700 truncate">{challenge.name}</h3>
                                                <p className="text-xs text-slate-500">
                                                    {challenge.steps.length}단계 · 보상: {challenge.rewardTitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 챌린지 추가 모달 */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-white to-blue-50/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative border border-blue-100/50">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all duration-200 group"
                                aria-label="닫기"
                            >
                                <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                            </button>

                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 rounded-full p-3 mr-4">
                                    <Plus className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-700">새 챌린지 추가</h2>
                            </div>

                            <form onSubmit={handleAddChallenge} className="space-y-6">
                                {/* 챌린지 이름 */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-blue-800 font-medium">
                                        챌린지 이름
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            className="w-full px-4 py-3 bg-white/80 border border-blue-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                            placeholder="예: 수학의 신 되기, 역사 탐험가 등"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 챌린지 아이콘 선택 */}
                                <div className="bg-white/60 rounded-xl p-4 shadow-sm border border-blue-100/50">
                                    <label className="block text-blue-800 font-medium mb-3">챌린지 아이콘</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-blue-200 flex items-center justify-center shadow-sm">
                                            <Image
                                                src={formData.icon}
                                                alt="챌린지 아이콘"
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsIconSelectOpen(true)}
                                            className="flex-1 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm border border-blue-200/50"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                            아이콘 선택하기
                                        </button>
                                    </div>
                                </div>

                                {/* 단계별 목표 */}
                                <div className="space-y-3">
                                    <h3 className="text-blue-800 font-medium flex items-center gap-2">
                                        <span>단계별 목표</span>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {formData.steps.length}단계
                                        </span>
                                    </h3>

                                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.steps.map((step, index) => (
                                            <div key={step.id} className="bg-white/70 rounded-xl p-4 shadow-sm border border-blue-100/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-semibold text-slate-700">
                                                        {index + 1}단계 목표
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleRemoveStep(index)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={step.goal}
                                                    onChange={(e) => handleStepChange(index, 'goal', e.target.value)}
                                                    placeholder={`${index + 1}단계 목표를 입력하세요`}
                                                    className="w-full p-2 border rounded-md mb-4"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* 단계 추가 버튼 */}
                                    <button
                                        type="button"
                                        onClick={handleAddStep}
                                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-dashed border-blue-400 rounded-xl text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center gap-2 mt-3"
                                    >
                                        <Plus className="w-4 h-4" />
                                        단계 추가하기
                                    </button>
                                </div>

                                {/* 보상 칭호 */}
                                <div className="space-y-2">
                                    <label htmlFor="rewardTitle" className="block text-blue-800 font-medium">
                                        최종 보상 칭호
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="rewardTitle"
                                            name="rewardTitle"
                                            value={formData.rewardTitle}
                                            onChange={(e) => setFormData({ ...formData, rewardTitle: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/80 border border-blue-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                            placeholder="예: 독서왕, 수학천재 등"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 관련 능력치 선택 */}
                                <div className="space-y-2">
                                    <label className="block text-blue-800 font-medium">
                                        관련 능력치 선택
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">학생이 단계를 달성할 때마다 선택한 능력치가 1씩 증가합니다.</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleAbilityToggle('intelligence')}
                                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${formData.abilities.intelligence
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white/70 text-blue-700 border border-blue-200'
                                                } transition-all`}
                                        >
                                            {formData.abilities.intelligence && (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            <span className="font-medium">지력</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAbilityToggle('diligence')}
                                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${formData.abilities.diligence
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-white/70 text-green-700 border border-green-200'
                                                } transition-all`}
                                        >
                                            {formData.abilities.diligence && (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            <span className="font-medium">성실성</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAbilityToggle('creativity')}
                                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${formData.abilities.creativity
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-white/70 text-purple-700 border border-purple-200'
                                                } transition-all`}
                                        >
                                            {formData.abilities.creativity && (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            <span className="font-medium">창의력</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAbilityToggle('personality')}
                                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${formData.abilities.personality
                                                ? 'bg-red-600 text-white shadow-md'
                                                : 'bg-white/70 text-red-700 border border-red-200'
                                                } transition-all`}
                                        >
                                            {formData.abilities.personality && (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            <span className="font-medium">인성</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAbilityToggle('health')}
                                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${formData.abilities.health
                                                ? 'bg-yellow-600 text-white shadow-md'
                                                : 'bg-white/70 text-yellow-700 border border-yellow-200'
                                                } transition-all`}
                                        >
                                            {formData.abilities.health && (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            <span className="font-medium">체력</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAbilityToggle('communication')}
                                            className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${formData.abilities.communication
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white/70 text-indigo-700 border border-indigo-200'
                                                } transition-all`}
                                        >
                                            {formData.abilities.communication && (
                                                <Check className="w-4 h-4 mr-1" />
                                            )}
                                            <span className="font-medium">의사소통</span>
                                        </button>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                        <h4 className="text-xs font-medium text-gray-500 mb-1">선택한 능력치 설명:</h4>
                                        <div className="space-y-2 text-xs text-gray-600">
                                            {formData.abilities.intelligence && (
                                                <p><span className="font-semibold text-blue-600">지력:</span> 지식정보처리 역량. 정보를 수용, 분석하고 새로운 지식으로 재구성하는 힘.</p>
                                            )}
                                            {formData.abilities.diligence && (
                                                <p><span className="font-semibold text-green-600">성실성:</span> 자기관리 역량과 관련. 자기 주도적으로 목표를 향해 꾸준히 나아갈 줄 아는, 맡은 바를 이행하는 성실한 태도.</p>
                                            )}
                                            {formData.abilities.creativity && (
                                                <p><span className="font-semibold text-purple-600">창의력:</span> 창의적 사고 역량과 심미적 감성 역량이 관련. 문제를 새롭게 바라보고 아름답게 표현하는 능력.</p>
                                            )}
                                            {formData.abilities.personality && (
                                                <p><span className="font-semibold text-red-600">인성:</span> 공동체 역량과 관련된 능력. 책임감을 가지고, 타인을 배려하며, 정의롭고 윤리적인 판단을 할 수 있는 능력.</p>
                                            )}
                                            {formData.abilities.health && (
                                                <p><span className="font-semibold text-yellow-600">체력:</span> 자기관리 역량과 관련. 건강하고 안전한 삶을 위해 자기 몸을 가꿀 수 있는 능력.</p>
                                            )}
                                            {formData.abilities.communication && (
                                                <p><span className="font-semibold text-indigo-600">의사소통:</span> 의사소통 역량과 관련. 남의 의견을 경청하고 자신의 의견을 표현할 줄 알며 협력적으로 소통하는 능력.</p>
                                            )}
                                            {!Object.values(formData.abilities).some(v => v) && (
                                                <p className="italic">능력치를 선택하면 설명이 표시됩니다.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="mr-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                                        disabled={formData.steps.some(step => !step.goal) || !formData.name}
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        챌린지 저장하기
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 아이콘 선택 모달 */}
                {isIconSelectOpen && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                        <div className="bg-gradient-to-br from-white to-blue-50/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100/50">
                            <button
                                onClick={() => setIsIconSelectOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all duration-200 group"
                                aria-label="닫기"
                            >
                                <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                            </button>

                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 rounded-full p-3 mr-4">
                                    <ImageIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-blue-700">챌린지 아이콘 선택</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {challengeIcons.map((icon, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleIconSelect(icon)}
                                        className={`p-3 rounded-xl border-2 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center ${formData.icon === icon
                                            ? 'border-blue-500 bg-blue-50/80 shadow-md scale-105'
                                            : 'border-transparent hover:border-blue-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                                            <Image
                                                src={icon}
                                                alt={`아이콘 ${index + 1}`}
                                                width={64}
                                                height={64}
                                                className="object-cover"
                                                priority
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsIconSelectOpen(false)}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-8 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                            >
                                <Check className="w-5 h-5" />
                                아이콘 선택 완료
                            </button>
                        </div>
                    </div>
                )}

                {/* 챌린지 상세 모달 */}
                {isChallengeDetailModalOpen && selectedChallenge && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto relative">
                            {/* 닫기 버튼 */}
                            <div className="flex justify-end absolute top-4 right-4">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    className="p-2 mr-2 rounded-full hover:bg-red-50 text-red-500 transition"
                                    title="챌린지 삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsChallengeDetailModalOpen(false)}
                                    className="p-2 rounded-full hover:bg-slate-100 transition"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>

                            {/* 챌린지 제목 및 보상 정보 */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                    <Image
                                        src={selectedChallenge.icon || '/images/icons/challenge/basicbook.jpg'}
                                        alt={selectedChallenge.name}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-600">{selectedChallenge.name}</h2>
                                    <p className="text-slate-600">최종 보상 칭호: <span className="font-semibold text-blue-700">{selectedChallenge.rewardTitle}</span></p>
                                </div>
                            </div>

                            {/* 단계별 정보 */}
                            <div className="space-y-6">
                                {selectedChallenge.steps.map((step, index) => {
                                    // 역순으로 표시 (높은 단계부터)
                                    const reverseIndex = selectedChallenge.steps.length - 1 - index
                                    const stepData = selectedChallenge.steps[reverseIndex]
                                    const stepStudentIds = studentsInSteps[stepData.id] || []

                                    // 마지막 단계인지 확인 (첫 번째로 보여지는 단계)
                                    const isLastStep = reverseIndex === selectedChallenge.steps.length - 1
                                    // 첫 번째 단계인지 확인 (마지막으로 보여지는 단계)
                                    const isFirstStep = reverseIndex === 0

                                    return (
                                        <div key={stepData.id} className={`border ${isLastStep ? 'border-blue-400 bg-blue-50/40' : 'border-blue-200'} rounded-lg p-4`}>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 ${isLastStep ? 'bg-blue-700' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold`}>
                                                        {reverseIndex + 1}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">{stepData.goal}</h3>
                                                    {isLastStep && (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                            최종 단계
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleAddStudentToStep(reverseIndex)}
                                                    className="px-3 py-1 bg-blue-100/70 text-blue-700 rounded hover:bg-blue-200/70 transition-colors text-sm flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    달성자 추가
                                                </button>
                                            </div>

                                            {/* 단계 설명 */}
                                            <p className="text-slate-600 mt-1">{stepData.goal}</p>

                                            {/* 획득 능력치 표시 */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                                    </svg>
                                                    +200 EXP
                                                </span>

                                                {isLastStep && selectedChallenge.rewardTitle && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                                                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                                        </svg>
                                                        칭호: {selectedChallenge.rewardTitle}
                                                    </span>
                                                )}

                                                {selectedChallenge.abilities && (
                                                    Object.keys(selectedChallenge.abilities).some(key => selectedChallenge.abilities?.[key as keyof typeof selectedChallenge.abilities]) && (
                                                        <>
                                                            {selectedChallenge.abilities.intelligence && (
                                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">지력 +1</span>
                                                            )}
                                                            {selectedChallenge.abilities.diligence && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">성실성 +1</span>
                                                            )}
                                                            {selectedChallenge.abilities.creativity && (
                                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">창의력 +1</span>
                                                            )}
                                                            {selectedChallenge.abilities.personality && (
                                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">인성 +1</span>
                                                            )}
                                                            {selectedChallenge.abilities.health && (
                                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">체력 +1</span>
                                                            )}
                                                            {selectedChallenge.abilities.communication && (
                                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">의사소통 +1</span>
                                                            )}
                                                        </>
                                                    )
                                                )}
                                            </div>

                                            {/* 현재 달성한 학생 목록 */}
                                            {stepStudentIds.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-slate-700 mb-2">달성 학생 ({stepStudentIds.length}명)</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {stepStudentIds.map(studentId => {
                                                            const student = studentsInClass.find(s => s.id === studentId);
                                                            if (!student) return null;

                                                            return (
                                                                <div key={studentId} className="bg-white/60 border border-blue-100/50 rounded-lg p-2 flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden relative bg-blue-50/60">
                                                                        {renderStudentAvatar(student)}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs text-blue-600 font-medium">{student.honorific || "학생"}</span>
                                                                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                                                    </div>

                                                                    {isLastStep && (
                                                                        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                                                            {selectedChallenge.rewardTitle}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 챌린지 단계에 학생 추가 모달 */}
                {isAddStudentModalOpen && selectedChallenge && selectedChallengeStepIndex !== null && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                            <button
                                onClick={() => setIsAddStudentModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>

                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                {selectedChallenge.steps[selectedChallengeStepIndex].goal} 달성 학생 추가
                            </h2>

                            <AddStudentsToStepForm
                                students={studentsInClass}
                                existingStudentIds={getExistingStudentIds(selectedChallenge, selectedChallengeStepIndex, studentsInSteps)}
                                onSubmit={handleAddStudentsToStep}
                                onCancel={() => setIsAddStudentModalOpen(false)}
                            />
                        </div>
                    </div>
                )}

                {/* 챌린지 삭제 확인 모달 */}
                {isDeleteConfirmOpen && selectedChallenge && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">챌린지 삭제</h3>
                            <p className="text-slate-600 mb-6">
                                &quot;{selectedChallenge.name}&quot; 챌린지를 정말 삭제하시겠습니까?<br />
                                이 작업은 되돌릴 수 없으며, 모든 단계와 학생 진행 정보가 삭제됩니다.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleDeleteChallenge}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 이미 속한 학생 ID 가져오기 함수
function getExistingStudentIds(challenge: Challenge, stepIndex: number, studentsInSteps: { [stepId: string]: string[] }) {
    const existingStudentIds: string[] = []

    // 수정: 모든 단계에서 학생들을 확인하여, 상위 단계의 학생은 하위 단계에 추가할 수 없도록 함
    // 현재 단계와 그 이상 단계에 있는 학생들 수집 (고수준 단계에 있는 학생은 저수준 단계에 추가 불가)
    for (let i = 0; i < challenge.steps.length; i++) {
        // 현재 단계나 상위 단계의 학생들만 필터링
        if (i >= stepIndex) {
            const currentStepId = challenge.steps[i].id
            if (studentsInSteps[currentStepId]) {
                existingStudentIds.push(...studentsInSteps[currentStepId])
            }
        }
    }

    // 중복 제거
    return [...new Set(existingStudentIds)];
}

// 학생 추가 폼 컴포넌트
interface AddStudentsToStepFormProps {
    students: any[]
    existingStudentIds: string[]
    onSubmit: (studentIds: string[]) => void
    onCancel: () => void
}

function AddStudentsToStepForm({ students, existingStudentIds, onSubmit, onCancel }: AddStudentsToStepFormProps) {
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

    // 이미 단계에 속한 학생들 제외한 목록
    const eligibleStudents = students.filter(student => !existingStudentIds.includes(student.id))

    const handleStudentToggle = (studentId: string) => {
        if (selectedStudentIds.includes(studentId)) {
            setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId))
        } else {
            setSelectedStudentIds([...selectedStudentIds, studentId])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(selectedStudentIds)
    }

    return (
        <form onSubmit={handleSubmit}>
            {eligibleStudents.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate-600">추가할 수 있는 학생이 없습니다.</p>
                    <p className="text-sm text-slate-500 mt-1">모든 학생이 이미 이 단계 또는 더 높은 단계에 속해 있습니다.</p>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <p className="mb-2 text-sm text-slate-600">추가할 학생을 선택하세요</p>
                        <div className="max-h-64 overflow-y-auto p-2 border rounded-md">
                            {eligibleStudents.map(student => (
                                <div key={student.id} className="mb-2 last:mb-0">
                                    <label className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={() => handleStudentToggle(student.id)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                        />
                                        <span className="text-slate-800">{student.name}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{student.number}번</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={selectedStudentIds.length === 0}
                            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {selectedStudentIds.length}명 추가하기
                        </button>
                    </div>
                </>
            )}
        </form>
    );
} 