'use client';

import { useMemo, useState } from 'react';

import { createColumnHelper } from '@tanstack/react-table';
import toast from 'react-hot-toast';

import type { ICreateRoleInput, IRoleDetail, IUpdateRoleInput } from '@helali/shared';
import { isSuperRole } from '@helali/shared';

import {
  DataTable,
  DataTableActionSlot,
  DataTableActions,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  type DataTableFeatures,
} from '@/components/data-table';
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useAppAbility } from '@/features/auth/context/ability-provider';
import { RoleFormDialog } from '@/features/roles/components/role-form-dialog';
import { usePermissionsCatalog } from '@/features/roles/hooks/use-permissions-catalog';
import {
  useCreateRole,
  useDeleteRole,
  useUpdateRole,
} from '@/features/roles/hooks/use-role-mutations';
import { useRolesList } from '@/features/roles/hooks/use-roles-list';
import { getRoleLabel } from '@/features/roles/utils/authorization-labels';
import { getApiErrorMessage } from '@/services/get-api-error-message';

type RoleFormState =
  | { readonly open: false }
  | { readonly open: true; readonly mode: 'create' }
  | { readonly open: true; readonly mode: 'edit'; readonly role: IRoleDetail };

const columnHelper = createColumnHelper<DataTableFeatures, IRoleDetail>();

export function RolesPage() {
  const ability = useAppAbility();
  const canManageRoles = ability.can('manageRoles', 'User');
  const [formState, setFormState] = useState<RoleFormState>({ open: false });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useRolesList(canManageRoles);
  const { data: permissions = [] } = usePermissionsCatalog(canManageRoles && formState.open);
  const createRole = useCreateRole();
  const updateRole = useUpdateRole(formState.open && formState.mode === 'edit' ? formState.role.id : 0);
  const deleteRole = useDeleteRole();

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('id', {
          ...dataTableIdColumnDefaults,
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('name', {
          header: 'نام نقش',
          cell: ({ row }) => (
            <div className="text-center font-medium">{getRoleLabel(row.original.name)}</div>
          ),
        }),
        columnHelper.accessor('description', {
          header: 'توضیحات',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.display({
          id: 'type',
          header: 'نوع',
          cell: ({ row }) => (
            <div className="flex justify-center">
              <Badge variant="outline">
                {row.original.isSystem ? 'سیستمی' : 'سفارشی'}
              </Badge>
            </div>
          ),
        }),
        columnHelper.accessor('userCount', {
          header: 'کاربران',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('permissions', {
          header: 'تعداد دسترسی',
          cell: ({ getValue }) => (
            <div className="text-center">{getValue().length}</div>
          ),
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => (
            <DataTableActions>
              <DataTableActionSlot>
                <IconButton
                  className="update-btn"
                  icon="ki-solid ki-pencil"
                  onClick={() =>
                    setFormState({ open: true, mode: 'edit', role: row.original })
                  }
                  tooltipText="ویرایش"
                />
              </DataTableActionSlot>
              <DataTableActionSlot>
                {!row.original.isSystem ? (
                  <IconButton
                    className="trash-btn"
                    icon="ki-solid ki-trash"
                    onClick={() => setDeleteId(row.original.id)}
                    tooltipText="حذف نقش"
                    disabled={row.original.userCount > 0}
                  />
                ) : null}
              </DataTableActionSlot>
            </DataTableActions>
          ),
        }),
      ]),
    [],
  );

  async function handleSubmit(input: ICreateRoleInput | IUpdateRoleInput): Promise<void> {
    try {
      if (formState.open && formState.mode === 'create') {
        await createRole.mutateAsync(input as ICreateRoleInput);
        toast.success('نقش ایجاد شد');
      } else if (formState.open && formState.mode === 'edit') {
        await updateRole.mutateAsync(input as IUpdateRoleInput);
        toast.success('نقش به‌روزرسانی شد');
      }

      setFormState({ open: false });
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError));
    }
  }

  async function handleDelete(): Promise<void> {
    if (deleteId === null) {
      return;
    }

    try {
      await deleteRole.mutateAsync(deleteId);
      toast.success('نقش حذف شد');
      setDeleteId(null);
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError));
    }
  }

  if (!canManageRoles) {
    return (
      <EmptyState
        title="دسترسی ندارید"
        description="برای مدیریت نقش‌ها به سطح دسترسی مناسب نیاز دارید."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="خطا در دریافت نقش‌ها"
        description={getApiErrorMessage(error)}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const roles = data ?? [];
  const editingRole = formState.open && formState.mode === 'edit' ? formState.role : undefined;

  return (
    <DashboardPanel
      title="مدیریت نقش‌ها"
      buttons={[
        {
          icon: 'ki-solid ki-plus-square',
          title: 'ایجاد نقش',
          onClick: () => setFormState({ open: true, mode: 'create' }),
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isPending || isFetching}
        page={1}
        pageSize={Math.max(roles.length, 1)}
        pageCount={1}
        totalItems={roles.length}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
      />

      <RoleFormDialog
        open={formState.open}
        mode={formState.open ? formState.mode : 'create'}
        initialRole={editingRole}
        permissions={permissions}
        isPermissionsLocked={Boolean(editingRole && isSuperRole(editingRole.name))}
        isSubmitting={createRole.isPending || updateRole.isPending}
        onSubmit={(input) => {
          void handleSubmit(input);
        }}
        onClose={() => setFormState({ open: false })}
      />

      <ConfirmModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="تأیید حذف"
        message="آیا مطمئن هستید که می‌خواهید این نقش را حذف کنید؟"
        loading={deleteRole.isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}
