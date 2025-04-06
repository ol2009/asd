'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save, Trash2, Image as ImageIcon, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'

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

interface RoadmapStep {
    id: string
    goal: string
    students?: string[] // 학생 ID 배열
}

interface Roadmap {
    id: string
    name: string
    steps: RoadmapStep[]
    rewardTitle: string
    icon: string
    createdAt: string
}

// 상수 값을 추가
const EXP_PER_LEVEL = 100 // 레벨업에 필요한 경험치
const EXP_FOR_ROADMAP_STEP = 100 // 로드맵 단계 완료 시 획득 경험치
const POINTS_PER_LEVEL = 100 // 레벨업 시 획득 포인트

export default function RoadmapPage() {
    const router = useRouter()
    const params = useParams()
    const classId = params.id as string
    const [isLoading, setIsLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        steps: [
            { id: '1', goal: '' },
            { id: '2', goal: '' }
        ],
        rewardTitle: '',
        icon: '/images/icons/roadmap/basicbook.jpg'
    })
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
    const [isRoadmapDetailModalOpen, setIsRoadmapDetailModalOpen] = useState(false)
    const [selectedRoadmapStepIndex, setSelectedRoadmapStepIndex] = useState<number | null>(null)
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
    const [studentsInClass, setStudentsInClass] = useState<any[]>([])
    const [studentsInSteps, setStudentsInSteps] = useState<{ [stepId: string]: string[] }>({})
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isIconSelectOpen, setIsIconSelectOpen] = useState(false)
    const [roadmapIcons, setRoadmapIcons] = useState([
        '/images/icons/roadmap/basicbook.jpg',
        '/images/icons/roadmap/goldbook.jpg',
        '/images/icons/roadmap/legendbook.jpg',
        '/images/icons/roadmap/bagicpencil.jpg',
        '/images/icons/roadmap/silverpencil.jpg',
        '/images/icons/roadmap/goldpencil.jpg',
        '/images/icons/roadmap/hat.jpg',
        '/images/icons/roadmap/experthat.jpg',
        '/images/icons/roadmap/goldhat.jpg'
    ])

    useEffect(() => {
        // 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn) {
            router.push('/login')
            return
        }

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

        // 로드맵 목록 정보 가져오기
        const savedRoadmaps = localStorage.getItem(`roadmaps_${classId}`)
        if (savedRoadmaps) {
            try {
                setRoadmaps(JSON.parse(savedRoadmaps))
            } catch (error) {
                console.error('로드맵 목록 데이터 파싱 오류:', error)
                setRoadmaps([])
            }
        } else {
            // 초기 로드맵 데이터가 없는 경우 빈 배열로 초기화
            setRoadmaps([])
            localStorage.setItem(`roadmaps_${classId}`, JSON.stringify([]))
        }

        setIsLoading(false)
    }, [classId, router])

    // 로드맵 단계 추가 폼 초기화
    const initAddForm = () => {
        setFormData({
            name: '',
            steps: [
                { id: '1', goal: '' },
                { id: '2', goal: '' }
            ],
            rewardTitle: '',
            icon: '/images/icons/roadmap/basicbook.jpg'
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

    // 로드맵 추가 처리
    const handleAddRoadmap = (e: React.FormEvent) => {
        e.preventDefault()

        const newRoadmap: Roadmap = {
            id: Date.now().toString(),
            name: formData.name,
            steps: formData.steps.map(step => ({
                id: step.id,
                goal: step.goal
            })),
            rewardTitle: formData.rewardTitle,
            icon: formData.icon,
            createdAt: new Date().toISOString()
        }

        // 새 로드맵 추가
        const updatedRoadmaps = [...roadmaps, newRoadmap]
        setRoadmaps(updatedRoadmaps)

        // 로컬 스토리지 업데이트
        localStorage.setItem(`roadmaps_${classId}`, JSON.stringify(updatedRoadmaps))

        // 모달 닫기
        setIsAddModalOpen(false)
        toast.success('새 로드맵이 추가되었습니다')
    }

    // 로드맵 이름 변경 핸들러
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

    // 단계 삭제 핸들러
    const handleRemoveStep = (index: number) => {
        if (formData.steps.length <= 2) {
            toast.error('로드맵은 최소 2단계 이상 있어야 합니다.')
            return
        }

        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }))
    }

    // 로드맵 클릭 핸들러
    const handleRoadmapClick = (roadmapId: string) => {
        // 선택된 로드맵 찾기
        const foundRoadmap = roadmaps.find(roadmap => roadmap.id === roadmapId)

        if (foundRoadmap) {
            setSelectedRoadmap(foundRoadmap)

            // 로드맵 각 단계별 학생 목록 불러오기
            const stepsStudents: { [stepId: string]: string[] } = {}

            foundRoadmap.steps.forEach(step => {
                // 로컬 스토리지에서 학생 목록 불러오기
                const savedStepStudents = localStorage.getItem(`roadmap_${classId}_step_${step.id}_students`)

                if (savedStepStudents) {
                    try {
                        // 로컬 스토리지의 학생 목록과 로드맵 객체의 학생 목록 동기화
                        const stepStudents = JSON.parse(savedStepStudents)
                        stepsStudents[step.id] = stepStudents

                        // 로드맵 객체의 학생 목록 업데이트 (동기화)
                        const roadmapIndex = roadmaps.findIndex(r => r.id === roadmapId)
                        if (roadmapIndex !== -1) {
                            const stepIndex = roadmaps[roadmapIndex].steps.findIndex(s => s.id === step.id)
                            if (stepIndex !== -1) {
                                roadmaps[roadmapIndex].steps[stepIndex].students = stepStudents
                            }
                        }
                    } catch (error) {
                        console.error('단계별 학생 데이터 파싱 오류:', error)
                        stepsStudents[step.id] = []
                    }
                } else {
                    stepsStudents[step.id] = []
                }
            })

            setStudentsInSteps(stepsStudents)

            // 클래스의 모든 학생 목록 불러오기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (savedStudents) {
                try {
                    setStudentsInClass(JSON.parse(savedStudents))
                } catch (error) {
                    console.error('학생 데이터 파싱 오류:', error)
                    setStudentsInClass([])
                }
            } else {
                setStudentsInClass([])
            }

            setIsRoadmapDetailModalOpen(true)
        }
    }

    // 로드맵 단계에 학생 추가를 위한 모달 열기
    const handleAddStudentToStep = (stepIndex: number) => {
        setSelectedRoadmapStepIndex(stepIndex)
        setIsAddStudentModalOpen(true)
    }

    // 로드맵의 특정 단계에 학생 추가
    const handleAddStudentsToStep = (studentIds: string[]) => {
        if (!selectedRoadmap || selectedRoadmapStepIndex === null) return

        const step = selectedRoadmap.steps[selectedRoadmapStepIndex]

        // 이미 해당 단계 또는 그 이상 단계에 속한 학생은 제외
        const existingStudentIds: string[] = []

        // 현재 선택된 단계와 그 이상 단계에 있는 학생들 수집
        for (let i = selectedRoadmapStepIndex; i < selectedRoadmap.steps.length; i++) {
            const currentStepId = selectedRoadmap.steps[i].id
            if (studentsInSteps[currentStepId]) {
                existingStudentIds.push(...studentsInSteps[currentStepId])
            }
        }

        // 필터링된 학생 ID만 추가
        const filteredStudentIds = studentIds.filter(id => !existingStudentIds.includes(id))

        if (filteredStudentIds.length === 0) {
            toast.info('추가할 학생이 없습니다');
            setIsAddStudentModalOpen(false);
            return;
        }

        // 새 학생 추가
        const updatedStudentsInStep = [...(studentsInSteps[step.id] || []), ...filteredStudentIds]

        // 로컬 스토리지 업데이트
        localStorage.setItem(`roadmap_${classId}_step_${step.id}_students`, JSON.stringify(updatedStudentsInStep))

        // 1. 이전 단계에서 학생 제거 (선택된 학생을 이전 단계에서 제거)
        if (selectedRoadmapStepIndex > 0) {
            for (let i = 0; i < selectedRoadmapStepIndex; i++) {
                const prevStepId = selectedRoadmap.steps[i].id;
                const prevStepStudents = studentsInSteps[prevStepId] || [];

                // 이전 단계에서 선택된 학생 제거
                const updatedPrevStepStudents = prevStepStudents.filter(
                    studentId => !filteredStudentIds.includes(studentId)
                );

                // 로컬 스토리지 업데이트
                localStorage.setItem(
                    `roadmap_${classId}_step_${prevStepId}_students`,
                    JSON.stringify(updatedPrevStepStudents)
                );

                // 상태 업데이트
                studentsInSteps[prevStepId] = updatedPrevStepStudents;
            }
        }

        // 2. 경험치와 레벨 업데이트
        filteredStudentIds.forEach(studentId => {
            updateStudentExpAndLevel(studentId, EXP_FOR_ROADMAP_STEP);
        });

        // 3. 마지막 단계 완료 시 칭호 부여
        const isLastStep = selectedRoadmapStepIndex === selectedRoadmap.steps.length - 1;
        if (isLastStep && selectedRoadmap.rewardTitle) {
            // 마지막 단계이고 보상 칭호가 설정되어 있으면 칭호 부여
            filteredStudentIds.forEach(studentId => {
                assignHonorificToStudent(studentId, selectedRoadmap.rewardTitle);
            });
        }

        // 상태 업데이트
        setStudentsInSteps({
            ...studentsInSteps,
            [step.id]: updatedStudentsInStep
        })

        setIsAddStudentModalOpen(false)
        toast.success(`${filteredStudentIds.length}명의 학생이 로드맵 단계에 추가되었습니다`)
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

            // 2. classes 스토리지에서도 학생 정보 업데이트
            const classesJson = localStorage.getItem('classes');
            if (classesJson) {
                const classes = JSON.parse(classesJson);
                const classIndex = classes.findIndex((c: ClassInfo) => c.id === classId);

                if (classIndex !== -1) {
                    const studentIndex = classes[classIndex].students.findIndex(
                        (s: Student) => s.id === studentId
                    );

                    if (studentIndex !== -1) {
                        // 학생 이름 가져오기
                        const studentName = classes[classIndex].students[studentIndex].name;

                        // 칭호 업데이트
                        classes[classIndex].students[studentIndex].honorific = honorific;
                        console.log('classes 스토리지 학생 칭호 업데이트:', { studentName, honorific });

                        // 저장
                        localStorage.setItem('classes', JSON.stringify(classes));
                    } else {
                        console.warn('classes 스토리지에서 학생을 찾을 수 없음:', studentId);
                    }
                } else {
                    console.warn('classes 스토리지에서 클래스를 찾을 수 없음:', classId);
                }
            } else {
                console.warn('classes 스토리지 데이터가 없음');
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

            // 4. 학생 이름 찾기 (메시지 표시용)
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

    // 학생을 로드맵 단계에 추가하는 함수
    const addStudentToRoadmapStep = (roadmapId: string, stepId: string, studentId: string) => {
        // 현재 로드맵 목록 가져오기
        const currentRoadmaps = [...roadmaps]

        // 해당 로드맵과 단계 찾기
        const roadmapIndex = currentRoadmaps.findIndex(r => r.id === roadmapId)
        if (roadmapIndex === -1) return

        const roadmap = currentRoadmaps[roadmapIndex];
        const stepIndex = roadmap.steps.findIndex(s => s.id === stepId)
        if (stepIndex === -1) return

        // 학생이 이미 이 단계에 있는지 확인
        const stepStudents = roadmap.steps[stepIndex].students || []
        const isStudentAlreadyInStep = stepStudents.includes(studentId)
        if (isStudentAlreadyInStep) {
            toast.info('학생이 이미 이 단계에 있습니다.')
            return
        }

        // 1. 이전 단계에서 학생 제거
        if (stepIndex > 0) {
            for (let i = 0; i < stepIndex; i++) {
                const prevStep = roadmap.steps[i];

                if (prevStep.students && prevStep.students.includes(studentId)) {
                    // 이전 단계에서 학생 제거
                    prevStep.students = prevStep.students.filter(id => id !== studentId);

                    // 로컬 스토리지 업데이트 (단계별 학생 목록)
                    localStorage.setItem(
                        `roadmap_${classId}_step_${prevStep.id}_students`,
                        JSON.stringify(prevStep.students)
                    );

                    // 상태 업데이트 (studentsInSteps)
                    if (studentsInSteps[prevStep.id]) {
                        studentsInSteps[prevStep.id] = studentsInSteps[prevStep.id].filter(
                            id => id !== studentId
                        );
                    }
                }
            }
        }

        // 2. 학생을 단계에 추가
        if (!roadmap.steps[stepIndex].students) {
            roadmap.steps[stepIndex].students = []
        }
        roadmap.steps[stepIndex].students!.push(studentId)

        // 3. 로드맵 목록 업데이트
        setRoadmaps(currentRoadmaps)

        // 4. 로컬스토리지에 저장
        localStorage.setItem(`roadmaps_${classId}`, JSON.stringify(currentRoadmaps))

        // 5. 단계별 학생 목록 업데이트
        const updatedStepStudents = [...(studentsInSteps[stepId] || []), studentId];
        localStorage.setItem(`roadmap_${classId}_step_${stepId}_students`, JSON.stringify(updatedStepStudents));

        // 6. 상태 업데이트
        setStudentsInSteps({
            ...studentsInSteps,
            [stepId]: updatedStepStudents
        });

        // 7. 학생 경험치 및 레벨 업데이트
        updateStudentExpAndLevel(studentId, EXP_FOR_ROADMAP_STEP)

        // 8. 마지막 단계 완료 시 칭호 부여
        const isLastStep = stepIndex === roadmap.steps.length - 1;
        if (isLastStep && roadmap.rewardTitle) {
            // 마지막 단계이고 보상 칭호가 설정되어 있으면 칭호 부여
            assignHonorificToStudent(studentId, roadmap.rewardTitle);
        }

        toast.success('학생이 성장 단계에 추가되었습니다.')
        setIsAddStudentModalOpen(false)
    }

    // 학생의 경험치와 레벨을 업데이트하는 함수
    const updateStudentExpAndLevel = (studentId: string, expToAdd: number) => {
        // 학생 목록 가져오기
        const savedStudents = localStorage.getItem(`students_${classId}`)
        if (!savedStudents) return

        try {
            const students = JSON.parse(savedStudents)
            const studentIndex = students.findIndex((s: Student) => s.id === studentId)

            if (studentIndex === -1) return

            // 학생 데이터 업데이트
            const student = students[studentIndex]

            // 경험치가 없으면 초기화
            if (!student.stats.exp) {
                student.stats.exp = 0
            }

            // 포인트가 없으면 초기화
            if (!student.points) {
                student.points = 0
            }

            // 현재 레벨
            const currentLevel = student.stats.level || 1

            // 요구사항에 맞게 직접 레벨 1 증가
            const newLevel = currentLevel + 1

            // 경험치 추가 (로직 유지를 위해)
            student.stats.exp += expToAdd

            // 레벨 설정
            student.stats.level = newLevel

            // 레벨업 시 포인트 지급 (레벨 1당 100포인트)
            student.points += POINTS_PER_LEVEL

            // 학생 데이터 저장
            students[studentIndex] = student
            localStorage.setItem(`students_${classId}`, JSON.stringify(students))

            // 현재 컴포넌트 상태에 반영된 학생 목록도 업데이트
            setStudentsInClass(students)

            // 경험치 획득 메시지
            const baseToastId = `student-${student.id}-${Date.now()}`;
            toast.success(`${student.name} 학생이 ${expToAdd} 경험치를 획득했습니다!`, {
                id: `${baseToastId}-exp`,
                duration: 3000,
                style: {
                    opacity: 1,
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                }
            });

            // 레벨업 메시지 (1초 후 표시)
            setTimeout(() => {
                toast.success(`${student.name} 학생이 Lv.${currentLevel}에서 Lv.${newLevel}로 레벨업했습니다!`, {
                    id: `${baseToastId}-level`,
                    duration: 3000,
                    style: {
                        opacity: 1,
                        backgroundColor: '#fff',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }
                });
            }, 1000);

            // 포인트 지급 메시지 (2초 후 표시)
            setTimeout(() => {
                toast.success(`${student.name} 학생에게 ${POINTS_PER_LEVEL} 포인트가 지급되었습니다!`, {
                    id: `${baseToastId}-points`,
                    duration: 3000,
                    style: {
                        opacity: 1,
                        backgroundColor: '#fff',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }
                });
            }, 2000);

            // classes 스토리지 업데이트 추가
            const classesJson = localStorage.getItem('classes');
            if (classesJson) {
                const classes = JSON.parse(classesJson);
                const classIndex = classes.findIndex((c: ClassInfo) => c.id === classId);

                if (classIndex !== -1) {
                    const studentIndex = classes[classIndex].students.findIndex(
                        (s: Student) => s.id === studentId
                    );

                    if (studentIndex !== -1) {
                        // 업데이트된 정보 적용
                        classes[classIndex].students[studentIndex].stats.exp = student.stats.exp;
                        classes[classIndex].students[studentIndex].stats.level = student.stats.level;
                        classes[classIndex].students[studentIndex].points = student.points;

                        // 저장
                        localStorage.setItem('classes', JSON.stringify(classes));
                    }
                }
            }

            // class_classId 스토리지 업데이트 추가
            const classDataJson = localStorage.getItem(`class_${classId}`);
            if (classDataJson) {
                const classData = JSON.parse(classDataJson);

                if (classData.students && Array.isArray(classData.students)) {
                    const studentIndex = classData.students.findIndex(
                        (s: Student) => s.id === studentId
                    );

                    if (studentIndex !== -1) {
                        // 업데이트된 정보 적용
                        classData.students[studentIndex].stats.exp = student.stats.exp;
                        classData.students[studentIndex].stats.level = student.stats.level;
                        classData.students[studentIndex].points = student.points;

                        // 저장
                        localStorage.setItem(`class_${classId}`, JSON.stringify(classData));
                    }
                }
            }
        } catch (error) {
            console.error('학생 데이터 업데이트 오류:', error)
            toast.error('학생 데이터를 업데이트하는 중 오류가 발생했습니다.')
        }
    }

    // 로드맵 삭제 처리 함수
    const handleDeleteRoadmap = () => {
        if (!selectedRoadmap) return;

        try {
            // 로드맵 목록에서 선택된 로드맵 제거
            const updatedRoadmaps = roadmaps.filter(roadmap => roadmap.id !== selectedRoadmap.id);
            setRoadmaps(updatedRoadmaps);

            // 로컬 스토리지에서 로드맵 정보 업데이트
            localStorage.setItem(`roadmaps_${classId}`, JSON.stringify(updatedRoadmaps));

            // 해당 로드맵의 각 단계별 학생 정보도 삭제
            selectedRoadmap.steps.forEach(step => {
                localStorage.removeItem(`roadmap_${classId}_step_${step.id}_students`);
            });

            // 모달 닫기
            setIsRoadmapDetailModalOpen(false);
            setIsDeleteConfirmOpen(false);

            // 성공 메시지 표시
            toast.success('로드맵이 삭제되었습니다.');
        } catch (error) {
            console.error('로드맵 삭제 오류:', error);
            toast.error('로드맵을 삭제하는 중 오류가 발생했습니다.');
        }
    };

    // 아이콘 선택 핸들러
    const handleIconSelect = (iconPath: string) => {
        setFormData(prev => ({
            ...prev,
            icon: iconPath
        }));
        setIsIconSelectOpen(false);
    };

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
                        <h1 className="text-2xl font-bold text-blue-800">성장 로드맵</h1>
                        <p className="text-slate-700">학생들의 장기적인 목표를 설정하고 학생들이 목표를 달성하게 도와주세요.</p>
                    </div>

                    {/* 로드맵 목록 */}
                    <div className="mb-8 bg-white/30 backdrop-blur-sm p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-blue-800">로드맵 목록</h2>
                            <button
                                onClick={initAddForm}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                새 로드맵
                            </button>
                        </div>

                        {/* 로드맵 목록 (그리드) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {roadmaps.length === 0 ? (
                                <div className="col-span-3 text-center py-12 bg-blue-50/50 rounded-lg">
                                    <p className="text-slate-600">새 로드맵을 추가해보세요</p>
                                </div>
                            ) : (
                                roadmaps.map((roadmap) => (
                                    <div
                                        key={roadmap.id}
                                        className="bg-white/60 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100/50 cursor-pointer"
                                        onClick={() => handleRoadmapClick(roadmap.id)}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center">
                                                <Image
                                                    src={roadmap.icon || '/images/icons/roadmap/basicbook.jpg'}
                                                    alt={roadmap.name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-blue-700 truncate">{roadmap.name}</h3>
                                                <p className="text-xs text-slate-500">
                                                    {roadmap.steps.length}단계 · 보상: {roadmap.rewardTitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 로드맵 추가 모달 */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-white to-blue-50/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100/50">
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
                                <h2 className="text-2xl font-bold text-blue-700">새 로드맵 추가</h2>
                            </div>

                            <form onSubmit={handleAddRoadmap} className="space-y-6">
                                {/* 로드맵 이름 */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-blue-800 font-medium">
                                        로드맵 이름
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            className="w-full px-4 py-3 bg-white/80 border border-blue-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                            placeholder="예: 독서왕 도전, 수학 마스터 등"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 로드맵 아이콘 선택 */}
                                <div className="bg-white/60 rounded-xl p-4 shadow-sm border border-blue-100/50">
                                    <label className="block text-blue-800 font-medium mb-3">로드맵 아이콘</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-blue-200 flex items-center justify-center shadow-sm">
                                            <Image
                                                src={formData.icon}
                                                alt="로드맵 아이콘"
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
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                                                            {index + 1}
                                                        </span>
                                                        <label htmlFor={`step-${index}`} className="font-medium text-blue-700">
                                                            단계 목표
                                                        </label>
                                                    </div>
                                                    {index > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveStep(index)}
                                                            className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    id={`step-${index}`}
                                                    value={step.goal}
                                                    onChange={(e) => handleStepChange(index, 'goal', e.target.value)}
                                                    className="w-full px-3 py-2.5 bg-blue-50/60 border border-blue-200/50 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder={`${index + 1}단계에서 달성해야 할 목표`}
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

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-8 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                                >
                                    <Save className="w-5 h-5" />
                                    로드맵 저장하기
                                </button>
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
                                <h3 className="text-2xl font-bold text-blue-700">로드맵 아이콘 선택</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {roadmapIcons.map((icon, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleIconSelect(icon)}
                                        className={`p-3 rounded-xl border-2 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center ${formData.icon === icon
                                            ? 'border-blue-500 bg-blue-50/80 shadow-md scale-105'
                                            : 'border-transparent hover:border-blue-200 shadow-sm'
                                            }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center">
                                            <Image
                                                src={icon}
                                                alt={`아이콘 ${index + 1}`}
                                                width={64}
                                                height={64}
                                                className="object-cover"
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

                {/* 로드맵 상세 모달 */}
                {isRoadmapDetailModalOpen && selectedRoadmap && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto relative">
                            {/* 닫기 버튼 */}
                            <div className="flex justify-end absolute top-4 right-4">
                                <button
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    className="p-2 mr-2 rounded-full hover:bg-red-50 text-red-500 transition"
                                    title="로드맵 삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsRoadmapDetailModalOpen(false)}
                                    className="p-2 rounded-full hover:bg-slate-100 transition"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>

                            {/* 로드맵 제목 및 보상 정보 */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                    <Image
                                        src={selectedRoadmap.icon || '/images/icons/roadmap/basicbook.jpg'}
                                        alt={selectedRoadmap.name}
                                        width={64}
                                        height={64}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-600">{selectedRoadmap.name}</h2>
                                    <p className="text-slate-600">최종 보상 칭호: <span className="font-semibold text-blue-700">{selectedRoadmap.rewardTitle}</span></p>
                                </div>
                            </div>

                            {/* 단계별 정보 */}
                            <div className="space-y-6">
                                {selectedRoadmap.steps.map((step, index) => {
                                    // 역순으로 표시 (높은 단계부터)
                                    const reverseIndex = selectedRoadmap.steps.length - 1 - index
                                    const stepData = selectedRoadmap.steps[reverseIndex]
                                    const stepStudentIds = studentsInSteps[stepData.id] || []

                                    return (
                                        <div key={stepData.id} className="border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                                        {reverseIndex + 1}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800">{stepData.goal}</h3>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-semibold text-slate-700">
                                                        달성 학생
                                                    </h4>
                                                    <button
                                                        onClick={() => handleAddStudentToStep(reverseIndex)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
                                                    >
                                                        <Plus className="w-3 h-3 inline mr-1" />
                                                        추가하기
                                                    </button>
                                                </div>

                                                {stepStudentIds.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {stepStudentIds.map(studentId => {
                                                            const student = studentsInClass.find(s => s.id === studentId)
                                                            return student ? (
                                                                <div
                                                                    key={studentId}
                                                                    className="bg-white border border-blue-100 rounded-lg p-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden relative bg-blue-50">
                                                                        <Image
                                                                            src={student.iconType.startsWith('/') ? student.iconType : '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg'}
                                                                            alt={student.name}
                                                                            width={32}
                                                                            height={32}
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs text-blue-600 font-medium">{student.honorific || '초보자'}</span>
                                                                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                                                    </div>
                                                                </div>
                                                            ) : null
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-sm italic">
                                                        아직 달성한 학생이 없습니다.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 로드맵 단계에 학생 추가 모달 */}
                {isAddStudentModalOpen && selectedRoadmap && selectedRoadmapStepIndex !== null && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-auto relative">
                            <button
                                onClick={() => setIsAddStudentModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>

                            <h2 className="text-xl font-bold text-blue-600 mb-4">
                                {selectedRoadmap.steps[selectedRoadmapStepIndex].goal} 달성 학생 추가
                            </h2>

                            <AddStudentsToStepForm
                                students={studentsInClass}
                                existingStudentIds={getExistingStudentIds(selectedRoadmap, selectedRoadmapStepIndex, studentsInSteps)}
                                onSubmit={handleAddStudentsToStep}
                                onCancel={() => setIsAddStudentModalOpen(false)}
                            />
                        </div>
                    </div>
                )}

                {/* 로드맵 삭제 확인 모달 */}
                {isDeleteConfirmOpen && selectedRoadmap && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">로드맵 삭제</h3>
                            <p className="text-slate-600 mb-6">
                                "{selectedRoadmap.name}" 로드맵을 정말 삭제하시겠습니까?<br />
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
                                    onClick={handleDeleteRoadmap}
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
function getExistingStudentIds(roadmap: Roadmap, stepIndex: number, studentsInSteps: { [stepId: string]: string[] }) {
    const existingStudentIds: string[] = []

    // 현재 선택된 단계와 그 이상 단계에 있는 학생들 수집
    for (let i = stepIndex; i < roadmap.steps.length; i++) {
        const currentStepId = roadmap.steps[i].id
        if (studentsInSteps[currentStepId]) {
            existingStudentIds.push(...studentsInSteps[currentStepId])
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