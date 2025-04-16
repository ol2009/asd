'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { normalizeStudentExpData } from '../utils/data-migration'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

interface ExpNormalizationButtonProps {
    classId: string
    onComplete?: (result: { success: boolean; message: string; processed: number }) => void
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * 경험치 정상화 버튼 컴포넌트
 * 
 * 10배로 저장된 경험치 값을 정상화하는 기능을 제공합니다.
 * 관리자가 필요할 때 이 버튼을 통해 마이그레이션을 실행할 수 있습니다.
 */
export function ExpNormalizationButton({
    classId,
    onComplete,
    variant = 'outline',
    size = 'sm'
}: ExpNormalizationButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    const handleNormalization = async () => {
        if (!classId) {
            toast.error('클래스 ID가 없습니다.')
            return
        }

        // 실행 전 확인
        if (!confirm('학생들의 경험치 데이터를 정상화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
            return
        }

        setIsProcessing(true)

        try {
            // 마이그레이션 실행
            const result = normalizeStudentExpData(classId)

            // 결과 처리
            if (result.success) {
                toast.success(result.message)

                // 오류가 있는 경우 경고
                if (result.errors.length > 0) {
                    console.warn('경험치 정상화 중 오류 발생:', result.errors)

                    if (result.errors.length <= 3) {
                        // 오류가 적은 경우 세부 내용 표시
                        result.errors.forEach(error => {
                            toast.warning(error)
                        })
                    } else {
                        // 오류가 많은 경우 요약 표시
                        toast.warning(`${result.errors.length}개의 오류가 발생했습니다. 개발자 콘솔을 확인하세요.`)
                    }
                }
            } else {
                toast.error(result.message)
            }

            // 완료 콜백 호출
            if (onComplete) {
                onComplete({
                    success: result.success,
                    message: result.message,
                    processed: result.processed
                })
            }

            // 성공 시 페이지 새로고침
            if (result.success && result.processed > 0) {
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
        } catch (error) {
            console.error('경험치 정상화 처리 중 오류:', error)
            toast.error(`경험치 정상화 처리 중 오류가 발생했습니다: ${error}`)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleNormalization}
            disabled={isProcessing}
        >
            {isProcessing ? (
                <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    정상화 중...
                </>
            ) : (
                '경험치 데이터 정상화'
            )}
        </Button>
    )
} 