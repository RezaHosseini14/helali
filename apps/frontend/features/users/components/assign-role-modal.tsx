'use client';

import { useEffect, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { IRole } from '@helali/shared';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRoleLabel } from '@/features/roles/utils/authorization-labels';
import { apiClient, unwrapApiResponse } from '@/services/api-client';
import { getApiErrorMessage } from '@/services/get-api-error-message';

interface IAssignRoleModalProps {
  readonly open: boolean;
  readonly userId: number;
  readonly currentRoleId?: number;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

async function fetchAssignableRoles(): Promise<ReadonlyArray<IRole>> {
  return unwrapApiResponse(apiClient.get('/users/roles'));
}

async function updateUserRole(userId: number, roleId: number): Promise<void> {
  await unwrapApiResponse(
    apiClient.patch(`/users/${userId}`, { roleId }),
  );
}

export function AssignRoleModal({
  open,
  userId,
  currentRoleId,
  onClose,
  onSuccess,
}: IAssignRoleModalProps) {
  const [roleId, setRoleId] = useState<string>('');

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['assignable-roles'],
    queryFn: fetchAssignableRoles,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => updateUserRole(userId, Number(roleId)),
    onSuccess: () => {
      toast.success('نقش کاربر به‌روزرسانی شد');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (open) {
      setRoleId(currentRoleId ? String(currentRoleId) : '');
    }
  }, [open, currentRoleId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تغییر نقش کاربر</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <Label>نقش</Label>
          <Select
            value={roleId}
            onValueChange={(value) => setRoleId(value ?? '')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="انتخاب نقش" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {getRoleLabel(role.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogBody>
        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            isLoading={mutation.isPending}
            disabled={!roleId || Number(roleId) === currentRoleId}
            onClick={() => mutation.mutate()}
          >
            ذخیره
          </Button>
          <Button type="button" variant="subtle" onClick={onClose}>
            انصراف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
