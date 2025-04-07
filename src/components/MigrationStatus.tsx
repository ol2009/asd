'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';

export function MigrationStatus() {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<{
        isComplete: boolean;
        localCount: number;
        supabaseCount: number;
    } | null>(null);

    useEffect(() => {
        // 여기서 마이그레이션 상태를 체크할 수 있습니다
        if (user?.id) {
            setStatus({
                isComplete: false,
                localCount: 0,
                supabaseCount: 0
            });
        }
    }, [user?.id]);

    const handleMigration = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            // 실제 마이그레이션 로직은 여기서 구현합니다
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus({
                isComplete: true,
                localCount: 0,
                supabaseCount: 0
            });
        } catch (err) {
            setError('마이그레이션 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>데이터 마이그레이션</CardTitle>
                <CardDescription>
                    로컬 데이터를 Supabase로 이전합니다.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>오류</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {status && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded">
                                <div className="text-sm text-muted-foreground">로컬 데이터</div>
                                <div className="text-2xl font-bold">{status.localCount} 클래스</div>
                            </div>
                            <div className="p-4 border rounded">
                                <div className="text-sm text-muted-foreground">Supabase 데이터</div>
                                <div className="text-2xl font-bold">{status.supabaseCount} 클래스</div>
                            </div>
                        </div>

                        {status.isComplete ? (
                            <Alert>
                                <AlertTitle>완료</AlertTitle>
                                <AlertDescription>
                                    모든 데이터가 성공적으로 마이그레이션되었습니다.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Button
                                onClick={handleMigration}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                마이그레이션 시작
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 