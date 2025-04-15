'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarItem } from '@/lib/avatar';
import Image from 'next/image';

interface EditAvatarNameModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: AvatarItem | null;
    currentName: string;
    onSave: (item: AvatarItem, newName: string) => void;
}

export function EditAvatarNameModal({
    isOpen,
    onClose,
    item,
    currentName,
    onSave,
}: EditAvatarNameModalProps) {
    const [newName, setNewName] = useState(currentName);

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>아바타 아이템 이름 변경</DialogTitle>
                    <DialogDescription>
                        이 아이템의 새 이름을 입력하세요. 이름 변경은 모든 학생에게 적용됩니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-4 p-4">
                    <div className="w-16 h-16 flex-shrink-0">
                        <Image
                            src={item.inventoryImagePath || item.imagePath}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">기존 이름: {item.name}</p>
                        <div className="mt-2">
                            <Label htmlFor="newName">새 이름</Label>
                            <Input
                                id="newName"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="새 이름을 입력하세요"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={() => onSave(item, newName)}
                        disabled={!newName.trim() || newName === item.name}
                    >
                        저장
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 