'use client';
import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { verify } from 'services/auth/authServices';
import { SET_USER_DATA, SET_USER_DATA_LOADING } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MyBreadcrumb from './components/MyBreadcrumb';

function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarStatus } = useSelector((state: RootState) => state.style);

  const dispatch = useDispatch();
  const { data, isLoading } = useQuery({ queryKey: ['userData'], queryFn: verify });
  useEffect(() => {
    if (data?.data?.user) {
      dispatch(SET_USER_DATA(data.data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(SET_USER_DATA_LOADING(isLoading));
  }, [isLoading]);
  return (
    <>
      <div className="flex gap-8 p-8 h-screen relative">
        <Sidebar />
        <div
          className={`flex flex-1 flex-col gap-8 transition-all duration-500 ${sidebarStatus ? 'ms-[22rem]' : 'ms-36'}`}
        >
          <Header />
          <MyBreadcrumb />
          {children}
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;
