'use client';

import { useEffect, useMemo, useState } from 'react';

import type {
  ICreateRoleInput,
  IPermission,
  IRoleDetail,
  IUpdateRoleInput,
} from '@helali/shared';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getPermissionGroupLabel,
  getPermissionLabel,
  getPermissionSearchText,
  getRoleLabel,
  groupPermissions,
} from '@/features/roles/utils/authorization-labels';
import { cn } from '@/lib/utils';

interface IRoleFormDialogProps {
  readonly open: boolean;
  readonly mode: 'create' | 'edit';
  readonly initialRole?: IRoleDetail;
  readonly permissions: ReadonlyArray<IPermission>;
  readonly isPermissionsLocked?: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: (input: ICreateRoleInput | IUpdateRoleInput) => void;
  readonly onClose: () => void;
}

export function RoleFormDialog({
  open,
  mode,
  initialRole,
  permissions,
  isPermissionsLocked = false,
  isSubmitting,
  onSubmit,
  onClose,
}: IRoleFormDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionIds, setPermissionIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === 'edit' && initialRole) {
      setName(initialRole.name);
      setDescription(initialRole.description);
      setPermissionIds(initialRole.permissions.map((item) => item.id));
    } else {
      setName('');
      setDescription('');
      setPermissionIds([]);
    }

    setSearch('');
  }, [open, mode, initialRole]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return permissions;
    }

    return permissions.filter((permission) =>
      getPermissionSearchText(permission).includes(query),
    );
  }, [permissions, search]);

  const grouped = useMemo(
    () => groupPermissions(filteredPermissions),
    [filteredPermissions],
  );

  function togglePermission(id: number): void {
    if (isPermissionsLocked) {
      return;
    }

    setPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleSubmit(): void {
    if (mode === 'create') {
      onSubmit({
        name,
        description,
        permissionIds,
      });
      return;
    }

    onSubmit({
      description,
      permissionIds: isPermissionsLocked ? undefined : permissionIds,
    });
  }

  const canSubmit =
    description.trim().length > 0 &&
    (mode === 'edit' || name.trim().length >= 2) &&
    (isPermissionsLocked || permissionIds.length > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'ایجاد نقش جدید' : `ویرایش نقش ${getRoleLabel(name)}`}
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) {
              handleSubmit();
            }
          }}
        >
          <DialogBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">نام نقش</Label>
                <Input
                  id="role-name"
                  value={name}
                  disabled={mode === 'edit'}
                  placeholder="ADMIN_AUDIO"
                  onChange={(event) => setName(event.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground">
                  به صورت UPPER_SNAKE_CASE (مثلاً ADMIN_AUDIO)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">توضیحات</Label>
                <Textarea
                  id="role-description"
                  value={description}
                  rows={2}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>دسترسی‌ها</Label>
                <Input
                  value={search}
                  placeholder="جستجوی دسترسی..."
                  className="max-w-xs"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              {isPermissionsLocked ? (
                <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  دسترسی‌های نقش SUPER قابل تغییر نیست.
                </p>
              ) : null}

              <div className="max-h-80 space-y-4 overflow-y-auto rounded-xl border border-border p-3">
                {grouped.map(([groupKey, items]) => (
                  <div key={groupKey} className="space-y-2">
                    <p className="text-sm font-bold text-foreground">
                      {getPermissionGroupLabel(groupKey)}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {items.map((permission) => {
                        const checked = permissionIds.includes(permission.id);

                        return (
                          <label
                            key={permission.id}
                            className={cn(
                              'flex cursor-pointer items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:bg-muted/50',
                              checked && 'border-primary/30 bg-primary/5',
                              isPermissionsLocked && 'cursor-not-allowed opacity-70',
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={isPermissionsLocked}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-medium">
                                {getPermissionLabel(permission.name)}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {permission.name}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
              {mode === 'create' ? 'ایجاد نقش' : 'ذخیره تغییرات'}
            </Button>
            <Button type="button" variant="subtle" onClick={onClose}>
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
