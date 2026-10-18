'use client';

import { Icon } from '@iconify/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

import ChangelogModal from '@/components/layouts/dashboard/ChangelogModal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { authKeys, useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { logout } from '@/features/auth/services/auth.service';
import { TOGGLE_DARK_MODE, TOGGLE_SIDEBAR } from '@/redux/slices/styleSlice';
import type { RootState } from '@/redux/store';
import { getApiErrorMessage } from '@/services/get-api-error-message';

function Header() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.style);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [changelogOpen, setChangelogOpen] = useState(false);

  const { mutateAsync: logoutMutate, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
  });

  const handleLogout = async () => {
    try {
      await logoutMutate();
      queryClient.removeQueries({ queryKey: authKeys.all });
      toast.success('با موفقیت خارج شدید');
      router.push('/login');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || 'خروج ناموفق بود');
    }
  };

  const handleToggleSidebar = () => {
    dispatch(TOGGLE_SIDEBAR());
  };

  const handleToggleDarkMode = () => {
    dispatch(TOGGLE_DARK_MODE());
  };

  const displayName = user
    ? `${user.lastName} ${user.firstName}`.trim()
    : '';

  return (
    <header className="flex w-full min-w-0 items-center justify-between gap-2 sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-foreground sm:gap-4">
        <button
          type="button"
          className="grid size-10 shrink-0 cursor-pointer place-content-center rounded-xl hover:bg-muted"
          onClick={handleToggleSidebar}
          aria-label="منو"
        >
          <i className="ki-solid ki-burger-menu-5 text-2xl" />
        </button>
        <h1 className="min-w-0 truncate text-sm font-semibold sm:text-base">
          <span className="sm:hidden">پنل مدیریت</span>
          <span className="hidden sm:inline">پایگاه حفظ و نشر آثار عبدالرضاهلالی</span>
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="dashboard-header-item size-9 text-lg sm:size-10 sm:text-xl"
                onClick={handleToggleDarkMode}
              />
            }
          >
            <Icon icon={darkMode ? 'solar:sun-bold-duotone' : 'solar:moon-bold-duotone'} fontSize={22} />
          </TooltipTrigger>
          <TooltipContent>{darkMode ? 'حالت روشن' : 'حالت تاریک'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="dashboard-header-item size-9 text-lg sm:size-10 sm:text-xl"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={isLoggingOut}
              />
            }
          >
            <Icon icon="solar:logout-2-bold-duotone" fontSize={22} />
          </TooltipTrigger>
          <TooltipContent>خروج</TooltipContent>
        </Tooltip>

        <div className="group relative">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="dashboard-header-item size-9 text-lg sm:size-10 sm:text-xl"
                />
              }
            >
              <Icon icon="solar:user-bold-duotone" fontSize={22} />
            </TooltipTrigger>
            <TooltipContent>حساب کاربری</TooltipContent>
          </Tooltip>

          <div className="invisible absolute end-0 top-12 z-50 h-fit w-56 translate-y-4 rounded-xl border border-border bg-card p-4 text-card-foreground opacity-0 shadow-lg backdrop-blur-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <ul className="flex h-full w-full flex-col items-center gap-4">
              <li className="w-full rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex w-full flex-col items-start text-sm">
                    <div className="flex w-full items-center justify-between truncate text-foreground">
                      {displayName}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-px w-full bg-border" />
              </li>

              <li className="w-full">
                <Button
                  variant="ghost"
                  className="flex h-full w-full items-center justify-between px-3 py-2"
                  onClick={() => {
                    setChangelogOpen(true);
                  }}
                >
                  <span>تغییرات نسخه</span>
                  <Icon icon="solar:document-text-bold-duotone" fontSize={22} />
                </Button>
              </li>

              <li className="w-full">
                <Button
                  variant="destructive"
                  className="flex h-full w-full items-center justify-between px-3 py-2"
                  disabled={isLoggingOut}
                  onClick={() => {
                    void handleLogout();
                  }}
                >
                  <span>خروج</span>
                  <Icon icon="solar:logout-2-bold-duotone" fontSize={22} />
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </header>
  );
}

export default Header;
