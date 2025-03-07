'use client';

import React, { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

//Services
import { verify } from 'services/auth/authServices';

// Store
import { RootState } from '@/redux/store';
import { SET_USER_DATA, SET_USER_DATA_LOADING } from '@/redux/slices/userSlice';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarStatus } = useSelector((state: RootState) => state.style);
  const dispatch = useDispatch();

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading } = useQuery({ queryKey: ['userData'], queryFn: verify });

  // ---------------------- useEffect ----------------------
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
          className={`flex flex-1 flex-col gap-8 transition-all duration-500 ${sidebarStatus ? 'ms-[18rem]' : 'ms-24'}`}
        >
          <Header />
          {children}
        </div>
      </div>
    </>
  );
}

export default DashboardLayout;
