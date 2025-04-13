'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface Student {
    id: string
    name: string
    number: number
    honorific: string
    stats: {
        level: number
        exp: number
    }
    iconType: string
    points?: number
}

interface DeleteStudentButtonProps {
    classId: string
    studentId: string
    studentName: string
    onDelete?: () => void
}

export default function DeleteStudentButton({ classId, studentId, studentName, onDelete }: DeleteStudentButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const handleDeleteStudent = () => {
        try {
            // 학생 목록 가져오기
            const savedStudents = localStorage.getItem(`students_${classId}`)
            if (!savedStudents) {
                toast.error('학생 데이터를 찾을 수 없습니다.')
                return
            }

            let students: Student[] = JSON.parse(savedStudents)

            // 해당 학생 제거
            const updatedStudents = students.filter(student => student.id !== studentId)

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

            toast.success(`${studentName} 학생이 삭제되었습니다.`)

            // 확인 모달 닫기
            setIsConfirmOpen(false)

            // 콜백 실행
            if (onDelete) onDelete()
        } catch (error) {
            console.error('학생 삭제 중 오류 발생:', error)
            toast.error('학생 삭제 중 오류가 발생했습니다.')
        }
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setIsConfirmOpen(true)
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                title="학생 삭제"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* 확인 모달 */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[70]" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-red-600 mb-3">⚠️ 학생 삭제</h3>
                        <p className="text-slate-700 mb-6">
                            <strong>{studentName}</strong> 학생을 정말 삭제하시겠습니까?
                            이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsConfirmOpen(false)
                                }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                            >
                                취소
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteStudent()
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                            >
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 