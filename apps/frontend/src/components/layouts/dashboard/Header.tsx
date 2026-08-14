'use client';

import { Icon } from '@iconify/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';

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
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-4 text-foreground">
        <button type="button" className="cursor-pointer" onClick={handleToggleSidebar} aria-label="منو">
          <i className="ki-solid ki-burger-menu-5 text-2xl" />
        </button>
        <h1 className="font-semibold">پایگاه حفظ و نشر آثار عبدالرضاهلالی</h1>
      </div>
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <button type="button" className="dashboard-header-item" onClick={handleToggleDarkMode} />
            }
          >
            <Icon icon={darkMode ? 'solar:sun-bold-duotone' : 'solar:moon-bold-duotone'} fontSize={25} />
          </TooltipTrigger>
          <TooltipContent>{darkMode ? 'حالت روشن' : 'حالت تاریک'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="dashboard-header-item"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={isLoggingOut}
              />
            }
          >
            <Icon icon="solar:logout-2-bold-duotone" fontSize={25} />
          </TooltipTrigger>
          <TooltipContent>خروج</TooltipContent>
        </Tooltip>

        <div className="group relative">
          <Tooltip>
            <TooltipTrigger render={<button type="button" className="dashboard-header-item" />}>
              <Icon icon="solar:user-bold-duotone" fontSize={25} />
            </TooltipTrigger>
            <TooltipContent>حساب کاربری</TooltipContent>
          </Tooltip>

          <div className="invisible absolute left-0 top-12 z-50 h-fit w-56 translate-y-4 rounded-xl border border-border bg-card p-4 text-card-foreground opacity-0 shadow-lg backdrop-blur-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <ul className="flex h-full w-full flex-col items-center gap-4">
              <li className="w-full rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex w-full flex-col items-start text-sm">
                    <div className="flex w-full items-center justify-between text-foreground">
                      {displayName}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-px w-full bg-border" />
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
                  <Icon icon="solar:logout-2-bold-duotone" fontSize={25} />
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
