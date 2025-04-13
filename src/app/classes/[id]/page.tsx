'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    Plus, ArrowLeft,
    LogOut, Coins, User
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import AddStudentModal from './components/AddStudentModal'
import StudentDetailModal from './components/StudentDetailModal'
import { supabase } from '@/lib/supabase'
import AvatarRenderer, { LargeAvatarRenderer } from '@/components/Avatar'
import { parseAvatarString } from '@/lib/avatar'

interface ClassInfo {
    id: string
    name: string
    grade: string
    subject: string
    description: string
    coverImage: string
    students: Student[]
    createdAt: string
    schoolName?: string
}

interface Student {
    id: string
    number: number
    name: string
    honorific: string
    stats: {
        level: number
        exp?: number
    }
    iconType: string
    points?: number
    avatar?: string
}

// 이미지 아이콘 경로
const iconTypes = [
    '/images/icons/Gemini_Generated_Image_3zghrv3zghrv3zgh.jpg',
    '/images/icons/Gemini_Generated_Image_49lajh49lajh49la.jpg',
    '/images/icons/Gemini_Generated_Image_6thu0u6thu0u6thu.jpg',
    '/images/icons/Gemini_Generated_Image_el7avsel7avsel7a.jpg',
    '/images/icons/Gemini_Generated_Image_eun2yveun2yveun2.jpg',
    '/images/icons/Gemini_Generated_Image_gf0wfdgf0wfdgf0w.jpg',
    '/images/icons/Gemini_Generated_Image_jzqdr4jzqdr4jzqd.jpg',
    '/images/icons/Gemini_Generated_Image_ogd5ztogd5ztogd5.jpg',
    '/images/icons/Gemini_Generated_Image_t3iddit3iddit3id.jpg',
    '/images/icons/Gemini_Generated_Image_t4umtlt4umtlt4um.jpg',
    '/images/icons/Gemini_Generated_Image_vl29o5vl29o5vl29.jpg',
    '/images/icons/Gemini_Generated_Image_xg0y2rxg0y2rxg0y.jpg'
]

// 칭호 목록 (전역으로 이동)
const honorifics = [
    '독서왕', '수학천재', '과학마니아', '영어고수', '역사박사',
    '체육특기생', '예술가', '코딩마법사', '토론왕', '리더십마스터',
    '창의왕', '성실상', '발표왕', '노력상', '협동왕'
]

export default function ClassDetail() {
    const params = useParams()
    const router = useRouter()
    const classId = params?.id as string
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
    const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSessionChecked, setIsSessionChecked] = useState(false)
    const [user, setUser] = useState<any>(null)

    // 로그인 상태 확인은 한 번만 실행되도록 분리
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // 1. 로컬스토리지에서 먼저 확인 (빠른 응답을 위해)
                const isLoggedIn = localStorage.getItem('isLoggedIn')

                // 2. Supabase 세션도 확인 (더 안전한 확인)
                const { data, error } = await supabase.auth.getSession()

                // 둘 중 하나라도 있으면 로그인된 것으로 간주
                if (!isLoggedIn && !data.session) {
                    // 로그인 페이지로 리디렉션
                    console.log('로그인 세션이 없습니다. 로그인 페이지로 이동합니다.')
                    router.push('/login')
                    return false
                }

                return true
            } catch (error) {
                console.error('세션 확인 오류:', error)

                // 오류 발생시에도 로컬스토리지만 확인
                const isLoggedIn = localStorage.getItem('isLoggedIn')
                if (!isLoggedIn) {
                    router.push('/login')
                    return false
                }
                return true
            } finally {
                setIsSessionChecked(true)
            }
        }

        checkLoginStatus().then(isLoggedIn => {
            if (isLoggedIn) {
                // 로그인되어 있으면 학생 데이터 로드
                loadStudents()
            }
        })
    }, [router])

    // 학생 데이터는 로그인 확인 후에만 로드
    useEffect(() => {
        if (isSessionChecked) {
            loadStudents()
        }
    }, [classId, isSessionChecked])

    // 학생 목록 로드 함수 (중복 제거 로직 추가)
    const loadStudents = () => {
        // 클래스 정보 가져오기
        const savedClasses = localStorage.getItem('classes')
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses)
                const foundClass = classes.find((c: ClassInfo) => c.id === classId)

                if (foundClass) {
                    setClassInfo(foundClass)
                    // 학생 정보 가져오기
                    const savedStudents = localStorage.getItem(`students_${classId}`)
                    if (savedStudents) {
                        const parsedStudents = JSON.parse(savedStudents);

                        // ID 기준으로 중복 제거
                        const uniqueStudents = removeDuplicateStudents(parsedStudents);

                        // 중복이 제거된 경우 localStorage 업데이트
                        if (uniqueStudents.length !== parsedStudents.length) {
                            console.log(`중복 학생 ${parsedStudents.length - uniqueStudents.length}명 제거됨`);
                            localStorage.setItem(`students_${classId}`, JSON.stringify(uniqueStudents));

                            // classes 데이터와 class_classId 데이터도 동기화
                            syncStudentsWithClasses(uniqueStudents);
                        }

                        setStudents(uniqueStudents);
                    } else {
                        // 데모 학생 데이터 (처음 방문 시)
                        const demoStudents = [
                            {
                                id: '1',
                                number: 1,
                                name: '김학생',
                                honorific: '수학천재',
                                stats: {
                                    level: 7
                                },
                                iconType: 'sparkles'
                            },
                            {
                                id: '2',
                                number: 2,
                                name: '이영재',
                                honorific: '독서왕',
                                stats: {
                                    level: 5
                                },
                                iconType: 'book'
                            },
                            {
                                id: '3',
                                number: 3,
                                name: '박미래',
                                honorific: '영어고수',
                                stats: {
                                    level: 6
                                },
                                iconType: 'globe'
                            }
                        ]
                        setStudents(demoStudents)
                        localStorage.setItem(`students_${classId}`, JSON.stringify(demoStudents))
                    }
                }
            } catch (error) {
                console.error('클래스 데이터 파싱 오류:', error)
            }
        }
        setIsLoading(false)
    }

    // 학생 데이터를 classes와 class_classId 저장소에 동기화하는 함수
    const syncStudentsWithClasses = (studentsData: Student[]) => {
        // 1. classes 데이터와 동기화
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) {
            try {
                const classes = JSON.parse(savedClasses);
                const updatedClasses = classes.map((c: ClassInfo) => {
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
    }

    // ID 기준으로 중복 학생 제거 함수
    const removeDuplicateStudents = (students: Student[]): Student[] => {
        const uniqueIds = new Set();
        return students.filter(student => {
            if (uniqueIds.has(student.id)) {
                return false; // 이미 처리된 ID는 제외
            }
            uniqueIds.add(student.id);
            return true; // 새로운 ID는 포함
        });
    }

    // 아바타 렌더링 함수 (기존 renderIcon 대체)
    const renderAvatar = (avatar?: string, size = 100) => {
        if (!avatar) {
            // 아바타 정보가 없으면 기본 아이콘 표시
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                    <User className="w-1/2 h-1/2 text-gray-400" />
                </div>
            );
        }

        // 아바타 정보가 있으면 아바타 렌더러 사용
        return <AvatarRenderer avatar={avatar} size={size} />;
    };

    // 아이콘 렌더링 함수 (유지, 기존 코드와 호환성 위해)
    const renderIcon = (iconType: string) => {
        // iconType이 기존 Lucide 아이콘 이름인 경우 (이전 데이터 호환성 유지)
        if (iconType.startsWith('user') || iconType.startsWith('book') || iconType.startsWith('sparkles') ||
            iconType.startsWith('award') || iconType.startsWith('brain') || iconType.startsWith('star') ||
            iconType.startsWith('pen') || iconType.startsWith('code') || iconType.startsWith('coffee') ||
            iconType.startsWith('zap') || iconType.startsWith('heart') || iconType.startsWith('globe') ||
            iconType.startsWith('compass')) {
            // 기존 아이콘 대신 기본 이미지 사용
            return (
                <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image
                        src={iconTypes[0]} // 기본 이미지
                        alt="Student avatar"
                        fill
                        className="object-cover"
                    />
                </div>
            )
        } else {
            // 이미지 경로인 경우
            return (
                <div className="relative w-full h-full overflow-hidden rounded-full">
                    <Image
                        src={iconType}
                        alt="Student avatar"
                        fill
                        className="object-cover"
                    />
                </div>
            )
        }
    }

    // 각 학생 카드 렌더링 컴포넌트를 내부로 이동
    function StudentCard({ student, onClick }: { student: Student; onClick: () => void }) {
        return (
            <div
                className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group w-full"
                onClick={onClick}
            >
                <div className="flex items-center">
                    {/* 학생 아바타 (왼쪽) - 배경 제거하고 크기 증가 */}
                    <div className="w-28 h-28 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        {student.avatar
                            ? renderAvatar(student.avatar, 112)
                            : renderIcon(student.iconType)}
                    </div>

                    {/* 오른쪽 정보 컨테이너 - 너비 확장 */}
                    <div className="flex flex-col flex-grow min-w-0">
                        {/* 학생 레벨 - 크기 증가 */}
                        <div className="flex items-center space-x-2">
                            <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-base font-bold rounded-full w-fit mb-1.5 shadow-sm">
                                Lv.{student.stats.level}
                            </div>
                        </div>

                        {/* 학생 칭호 - 있을 때만 표시 */}
                        {student.honorific && (
                            <p className="text-sm text-blue-600 font-medium mb-1 whitespace-normal break-words">
                                {student.honorific}
                            </p>
                        )}

                        {/* 학생 이름 - 크기 증가 */}
                        <p className="text-lg font-extrabold text-blue-800">
                            {student.name}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // 랭킹 순서로 정렬된 학생 목록 반환
    const getSortedStudents = () => {
        return students.sort((a, b) => b.stats.level - a.stats.level)
    }

    // 학생 클릭 핸들러 - 모달을 열도록 수정
    const handleStudentClick = (studentId: string) => {
        setSelectedStudentId(studentId)
        setIsStudentDetailModalOpen(true)
    }

    // 학생 추가 모달 닫기 핸들러
    const handleAddStudentModalClose = () => {
        setIsAddModalOpen(false)
    }

    // 학생 상세 모달 닫기 핸들러
    const handleStudentDetailModalClose = () => {
        setIsStudentDetailModalOpen(false)
        setSelectedStudentId(null)

        console.log('학생 상세 모달 닫기 - 학생 정보 다시 로드');

        // 로컬 스토리지에서 최신 학생 정보를 다시 로드
        loadStudents();

        // 약간의 지연 후 UI를 강제로 다시 렌더링하여 아바타 변경사항이 반영되도록 함
        setTimeout(() => {
            const savedStudents = localStorage.getItem(`students_${classId}`);
            if (savedStudents) {
                try {
                    const students = JSON.parse(savedStudents);
                    setStudents([...students]); // 새 배열로 강제 렌더링
                } catch (error) {
                    console.error('학생 데이터 파싱 오류:', error);
                }
            }
        }, 100); // 100ms 지연
    }

    // 학생 정보 업데이트 핸들러
    const handleStudentUpdated = (updatedStudent: Student) => {
        console.log('학생 정보 업데이트 시작:', updatedStudent);
        try {
            // 학생 목록 상태 업데이트
            setStudents(prevStudents => {
                const updatedStudents = prevStudents.map(s =>
                    s.id === updatedStudent.id ? updatedStudent : s
                );
                console.log('로컬 상태 학생 목록 업데이트 완료');
                return updatedStudents;
            });

            // 클래스 정보에도 학생 정보 업데이트
            if (classInfo) {
                let updatedStudents = [];

                // students가 배열인지 확인
                if (classInfo.students && Array.isArray(classInfo.students)) {
                    updatedStudents = classInfo.students.map(s =>
                        s.id === updatedStudent.id ? updatedStudent : s
                    );
                } else {
                    // students가 배열이 아니거나 존재하지 않는 경우
                    console.warn('classInfo.students가 배열이 아님:', classInfo.students);
                    // 현재 students 상태를 사용
                    updatedStudents = [...students];
                }

                const updatedClassInfo = {
                    ...classInfo,
                    students: updatedStudents
                };
                setClassInfo(updatedClassInfo);
                console.log('클래스 정보 학생 목록 업데이트 완료');

                // 로컬 스토리지의 classes 업데이트
                const savedClasses = localStorage.getItem('classes');
                if (savedClasses) {
                    try {
                        const classes = JSON.parse(savedClasses);
                        const updatedClasses = classes.map((c: ClassInfo) =>
                            c.id === classInfo.id ? updatedClassInfo : c
                        );
                        localStorage.setItem('classes', JSON.stringify(updatedClasses));
                        console.log('로컬 스토리지 classes 업데이트 완료');
                    } catch (error) {
                        console.error('classes 데이터 업데이트 오류:', error);
                    }
                }

                // students_classId에도 업데이트 (이 부분이 누락되었었음)
                const savedStudents = localStorage.getItem(`students_${classId}`);
                if (savedStudents) {
                    try {
                        const studentsArr = JSON.parse(savedStudents);
                        const updatedStudentsArr = studentsArr.map((s: Student) =>
                            s.id === updatedStudent.id ? updatedStudent : s
                        );
                        localStorage.setItem(`students_${classId}`, JSON.stringify(updatedStudentsArr));
                        console.log('로컬 스토리지 students_classId 업데이트 완료');
                    } catch (error) {
                        console.error('students_classId 데이터 업데이트 오류:', error);
                    }
                }
            }
        } catch (error) {
            console.error('학생 정보 업데이트 중 전체 오류:', error);
        }
    }

    // 학생 추가 모달에서 제출 핸들러
    const handleStudentAdded = (newStudent: Student) => {
        console.log('학생 추가됨:', newStudent.name);
        // 학생 목록 상태 업데이트
        setStudents(prevStudents => {
            const updatedStudents = [...prevStudents, newStudent];
            console.log('학생 목록 상태 업데이트:', updatedStudents.length);
            return updatedStudents;
        });

        // 클래스 정보에도 학생 추가
        if (classInfo) {
            let updatedStudents = [];

            // students가 배열인지 확인
            if (classInfo.students && Array.isArray(classInfo.students)) {
                updatedStudents = [...classInfo.students, newStudent];
            } else {
                // students가 배열이 아니거나 존재하지 않는 경우
                console.warn('classInfo.students가 배열이 아님:', classInfo.students);
                // 현재 students 상태를 사용
                updatedStudents = [...students, newStudent];
            }

            const updatedClassInfo = {
                ...classInfo,
                students: updatedStudents
            };
            setClassInfo(updatedClassInfo);
            console.log('클래스 정보 학생 목록 업데이트 완료');

            // 로컬 스토리지의 classes 업데이트
            const savedClasses = localStorage.getItem('classes');
            if (savedClasses) {
                try {
                    const classes = JSON.parse(savedClasses);
                    const updatedClasses = classes.map((c: ClassInfo) =>
                        c.id === classInfo.id ? updatedClassInfo : c
                    );
                    localStorage.setItem('classes', JSON.stringify(updatedClasses));
                    console.log('로컬 스토리지 classes 업데이트 완료');
                } catch (error) {
                    console.error('클래스 데이터 업데이트 오류:', error);
                }
            }

            // students_classId에도 업데이트
            const savedStudents = localStorage.getItem(`students_${classId}`);
            let studentsArr = [];
            if (savedStudents) {
                try {
                    studentsArr = JSON.parse(savedStudents);
                } catch (e) {
                    console.error('학생 데이터 파싱 오류:', e);
                    studentsArr = [];
                }
            }

            localStorage.setItem(`students_${classId}`, JSON.stringify([...studentsArr, newStudent]));
            console.log('students_classId 업데이트 완료');
        }
    };

    // 로그아웃 핸들러 추가
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen text-slate-700 p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xl">학급 정보를 불러오는 중...</p>
                </div>
            </div>
        )
    }

    if (!classInfo) {
        return (
            <div className="min-h-screen text-slate-700 p-8">
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
                        <Link href="/classes" className="mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold">학급 목록으로</h1>
                    </div>
                    <Link href="/login" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="h-[70vh] flex items-center justify-center">
                        <div className="text-2xl text-gray-500">로딩 중...</div>
                    </div>
                ) : classInfo ? (
                    <div className="p-6">
                        {/* 클래스 정보 - 이미지와 동일한 디자인으로 수정 */}
                        <div className="bg-blue-100/90 rounded-xl shadow-sm p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-medium text-blue-800 mb-1">{classInfo.schoolName || '학교 정보 없음'}</h2>
                                    <h1 className="text-3xl font-bold text-blue-900">{classInfo.name}</h1>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-700 text-xs">학급운영일: 2025. 3. 26.</p>
                                </div>
                            </div>
                        </div>

                        {/* 학생 목록 */}
                        <div className="bg-white/30 backdrop-blur-sm rounded-xl shadow-md p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-blue-800">학생 목록</h2>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    학생 추가하기
                                </button>
                            </div>

                            {students.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50/40 backdrop-blur-sm rounded-lg">
                                    <p className="text-gray-500 mb-4">등록된 학생이 없습니다</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {getSortedStudents().map((student) => (
                                        <StudentCard
                                            key={student.id}
                                            student={student}
                                            onClick={() => handleStudentClick(student.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-[70vh] flex items-center justify-center">
                        <div className="text-2xl text-gray-500">클래스 정보를 찾을 수 없습니다</div>
                    </div>
                )}

                {/* 학생 추가 모달 */}
                {isAddModalOpen && (
                    <AddStudentModal
                        classId={classId}
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onStudentAdded={handleStudentAdded}
                    />
                )}

                {/* 학생 상세 정보 모달 */}
                <StudentDetailModal
                    isOpen={isStudentDetailModalOpen}
                    onClose={handleStudentDetailModalClose}
                    studentId={selectedStudentId}
                    classId={classId}
                />
            </div>
        </div>
    )
} 