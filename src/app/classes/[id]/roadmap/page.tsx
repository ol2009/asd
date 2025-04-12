'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, X, Save, Trash2, Image as ImageIcon, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import Image from 'next/image'
import AvatarRenderer from '@/components/Avatar'

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
    abilities?: {
        intelligence?: boolean // 지력
        diligence?: boolean    // 성실성
        creativity?: boolean   // 창의력
        personality?: boolean  // 인성
    }
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
        icon: '/images/icons/roadmap/basicbook.jpg',
        abilities: {
            intelligence: false,
            diligence: false,
            creativity: false,
            personality: false
        }
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
            icon: '/images/icons/roadmap/basicbook.jpg',
            abilities: {
                intelligence: false,
                diligence: false,
                creativity: false,
                personality: false
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
            abilities: formData.abilities,
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

    // 로드맵 능력치 변경 핸들러
    const handleAbilityChange = (ability: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            abilities: {
                ...prev.abilities,
                [ability]: checked
            }
        }));
    };

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
            updateStudentExpAndLevel(studentId, EXP_FOR_ROADMAP_STEP, selectedRoadmap.abilities);
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
        try {
            // 1. 로드맵 데이터 불러오기
            const savedRoadmaps = localStorage.getItem(`roadmaps_${classId}`)
            if (!savedRoadmaps) {
                toast.error('로드맵 데이터를 불러올 수 없습니다.')
                return
            }

            const allRoadmaps = JSON.parse(savedRoadmaps)
            const roadmapIndex = allRoadmaps.findIndex((r: Roadmap) => r.id === roadmapId)

            if (roadmapIndex === -1) {
                toast.error('해당 로드맵을 찾을 수 없습니다.')
                return
            }

            const roadmap = allRoadmaps[roadmapIndex]
            const stepIndex = roadmap.steps.findIndex((s: RoadmapStep) => s.id === stepId)

            if (stepIndex === -1) {
                toast.error('해당 단계를 찾을 수 없습니다.')
                return
            }

            const step = roadmap.steps[stepIndex];

            // 이미 완료한 학생이면 추가하지 않음
            if (step.students && step.students.includes(studentId)) {
                toast.info('이미 완료한 단계입니다.')
                return
            }

            // 2. 단계별 학생 목록에 추가
            if (!step.students) {
                step.students = []
            }
            step.students.push(studentId)

            // 3. 로컬 스토리지 업데이트
            allRoadmaps[roadmapIndex] = roadmap
            localStorage.setItem(`roadmaps_${classId}`, JSON.stringify(allRoadmaps))

            // 4. 단계별 별도 저장소에도 업데이트
            const stepKey = `roadmap_${classId}_step_${stepId}_students`
            const savedStepStudents = localStorage.getItem(stepKey)
            let stepStudents = savedStepStudents ? JSON.parse(savedStepStudents) : []

            if (!Array.isArray(stepStudents)) {
                stepStudents = []
            }

            if (!stepStudents.includes(studentId)) {
                stepStudents.push(studentId)
                localStorage.setItem(stepKey, JSON.stringify(stepStudents))
            }

            // 5. 현재 상태 업데이트
            if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
                const updatedRoadmap = { ...selectedRoadmap }
                updatedRoadmap.steps = [...updatedRoadmap.steps]
                updatedRoadmap.steps[stepIndex] = { ...updatedRoadmap.steps[stepIndex], students: [...step.students] }
                setSelectedRoadmap(updatedRoadmap)

                // 단계별 학생 목록 상태 업데이트
                setStudentsInSteps(prev => {
                    const newState = { ...prev }
                    newState[stepId] = [...step.students]
                    return newState
                })
            }

            // 6. 경험치 및 레벨 업데이트
            updateStudentExpAndLevel(studentId, EXP_FOR_ROADMAP_STEP, selectedRoadmap.abilities)

            // 7. 마지막 단계면 칭호 부여 (보상)
            const isLastStep = stepIndex === roadmap.steps.length - 1
            if (isLastStep && roadmap.rewardTitle) {
                assignHonorificToStudent(studentId, roadmap.rewardTitle)
            }

            toast.success('단계 완료 처리되었습니다.')
            return true
        } catch (error) {
            console.error('로드맵 단계 완료 처리 중 오류:', error)
            toast.error('단계 완료 처리 중 오류가 발생했습니다.')
            return false
        }
    }

    // 학생의 경험치와 레벨을 업데이트하는 함수
    const updateStudentExpAndLevel = (studentId: string, expToAdd: number, stepAbilities?: {
        intelligence?: boolean
        diligence?: boolean
        creativity?: boolean
        personality?: boolean
    }) => {
        try {
            // 클래스 내 학생 목록에서 ID로 학생 찾기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (!savedStudents) {
                console.error('학생 정보를 불러올 수 없습니다.')
                return
            }

            const students = JSON.parse(savedStudents)
            const studentIndex = students.findIndex((s: any) => s.id === studentId)

            if (studentIndex === -1) {
                console.error('해당 학생을 찾을 수 없습니다.')
                return
            }

            // 현재 학생 정보 가져오기
            const student = students[studentIndex]

            // stats 객체가 없으면 기본값 설정
            if (!student.stats) {
                student.stats = {
                    level: 1,
                    exp: 0,
                    abilities: {
                        intelligence: 1,
                        diligence: 1,
                        creativity: 1,
                        personality: 1
                    }
                }
            }

            // abilities 객체가 없으면 기본값 설정
            if (!student.stats.abilities) {
                student.stats.abilities = {
                    intelligence: 1,
                    diligence: 1,
                    creativity: 1,
                    personality: 1
                }
            }

            // 경험치 추가 및 레벨 계산
            const currentExp = student.stats.exp || 0
            const newExp = currentExp + expToAdd

            // 레벨 계산 (100 경험치당 1레벨)
            const newLevel = Math.floor(newExp / EXP_PER_LEVEL)
            const levelChange = newLevel - student.stats.level

            // 능력치 증가
            if (stepAbilities) {
                // 해당 단계에서 선택된 능력치만 증가
                if (stepAbilities.intelligence) {
                    student.stats.abilities.intelligence += 1;
                }
                if (stepAbilities.diligence) {
                    student.stats.abilities.diligence += 1;
                }
                if (stepAbilities.creativity) {
                    student.stats.abilities.creativity += 1;
                }
                if (stepAbilities.personality) {
                    student.stats.abilities.personality += 1;
                }
            }

            // 학생 정보 업데이트
            student.stats.exp = newExp
            student.stats.level = newLevel

            // 레벨업 시 보상 (포인트 지급)
            if (levelChange > 0) {
                const pointsToAdd = levelChange * POINTS_PER_LEVEL;
                student.points = (student.points || 0) + pointsToAdd;

                // 레벨업 토스트 메시지
                toast.success(
                    <div>
                        <p><strong>{student.name}</strong> 학생이 레벨업했습니다!</p>
                        <p>Lv.{newLevel - levelChange} → Lv.{newLevel}</p>
                        <p>보상: {pointsToAdd}G 지급</p>
                    </div>
                );
            }

            // 업데이트된 학생 목록 저장
            students[studentIndex] = student
            localStorage.setItem(`students_${classId}`, JSON.stringify(students))

            // 제공된 경험치에 대한 토스트 메시지
            toast.success(
                <div>
                    <p><strong>{student.name}</strong> 학생이 경험치를 획득했습니다!</p>
                    <p>+{expToAdd} EXP</p>
                    {stepAbilities && (
                        <p>
                            {stepAbilities.intelligence && <span className="inline-block bg-blue-100 text-blue-700 px-1 rounded mr-1">지력 +1</span>}
                            {stepAbilities.diligence && <span className="inline-block bg-green-100 text-green-700 px-1 rounded mr-1">성실성 +1</span>}
                            {stepAbilities.creativity && <span className="inline-block bg-purple-100 text-purple-700 px-1 rounded mr-1">창의력 +1</span>}
                            {stepAbilities.personality && <span className="inline-block bg-red-100 text-red-700 px-1 rounded mr-1">인성 +1</span>}
                        </p>
                    )}
                </div>
            );

            // 학생 데이터 리로드
            loadStudentsInClass()

            return student
        } catch (error) {
            console.error('학생 경험치/레벨 업데이트 중 오류:', error)
            return null
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

    // 학생 목록 불러오기 함수
    const loadStudentsInClass = () => {
        const savedStudents = localStorage.getItem(`students_${classId}`);
        if (savedStudents) {
            setStudentsInClass(JSON.parse(savedStudents));
        }
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
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-lg border border-blue-100">
                                            <input
                                                type="checkbox"
                                                id="intelligence"
                                                checked={formData.abilities.intelligence}
                                                onChange={(e) => handleAbilityChange('intelligence', e.target.checked)}
                                                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="intelligence" className="text-sm text-blue-700 font-medium">
                                                지력
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-lg border border-green-100">
                                            <input
                                                type="checkbox"
                                                id="diligence"
                                                checked={formData.abilities.diligence}
                                                onChange={(e) => handleAbilityChange('diligence', e.target.checked)}
                                                className="rounded border-green-300 text-green-600 focus:ring-green-500"
                                            />
                                            <label htmlFor="diligence" className="text-sm text-green-700 font-medium">
                                                성실성
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-lg border border-purple-100">
                                            <input
                                                type="checkbox"
                                                id="creativity"
                                                checked={formData.abilities.creativity}
                                                onChange={(e) => handleAbilityChange('creativity', e.target.checked)}
                                                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor="creativity" className="text-sm text-purple-700 font-medium">
                                                창의력
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-lg border border-red-100">
                                            <input
                                                type="checkbox"
                                                id="personality"
                                                checked={formData.abilities.personality}
                                                onChange={(e) => handleAbilityChange('personality', e.target.checked)}
                                                className="rounded border-red-300 text-red-600 focus:ring-red-500"
                                            />
                                            <label htmlFor="personality" className="text-sm text-red-700 font-medium">
                                                인성
                                            </label>
                                        </div>
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

                                            {/* 단계 설명 */}
                                            <p className="text-slate-600 mt-1">{stepData.goal}</p>

                                            {/* 획득 능력치 표시 */}
                                            {stepData.abilities && (
                                                Object.keys(stepData.abilities).some(key => stepData.abilities[key]) && (
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        <span className="text-xs text-gray-500">획득 능력치:</span>
                                                        <div className="flex gap-1">
                                                            {stepData.abilities.intelligence && (
                                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">지력</span>
                                                            )}
                                                            {stepData.abilities.diligence && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">성실성</span>
                                                            )}
                                                            {stepData.abilities.creativity && (
                                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">창의력</span>
                                                            )}
                                                            {stepData.abilities.personality && (
                                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">인성</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
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