'use client';
import React, { ReactNode, useEffect } from 'react';
import Header from '@/components/layouts/dashboard/Header';
import Sidebar from '@/components/layouts/dashboard/Sidebar';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { verify } from 'services/auth/authServices';
import { SET_USER_DATA, SET_USER_DATA_LOADING } from '@/redux/slices/userSlice';
import { Loader } from 'rsuite';

function DashboardLayout({ children }: { children: ReactNode }) {
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
      {/* {isLoading ? (
        <Loader center size="lg" />
      ) : ( */}
      <div className="flex items-start gap-8 p-4 h-screen">
        <Sidebar />
        <div className="flex flex-col gap-6 flex-1">
          <Header />
          {children}
        </div>
      </div>
      {/* )} */}
    </>
  );
}

export default DashboardLayout;
