"use client";
import { ReactNode, useEffect } from "react";
import MainMenu from "@/components/layouts/main/MainMenu";
import Header from "./Header";
import { useQuery } from "@tanstack/react-query";
import { allAudio } from "services/audio/audioServices";
import { useDispatch } from "react-redux";
import { SET_AUDIOS, SET_AUDIOS_LOADING } from "@/redux/slices/audioSlice";

function MainLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useQuery({ queryKey: ["allAudio"], queryFn: allAudio });
  useEffect(() => {
    if (data?.data?.audios && data?.data?.audios?.length > 0) {
      dispatch(SET_AUDIOS(data.data.audios));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(SET_AUDIOS_LOADING(isLoading));
  }, [isLoading]);

  return (
    <div className="container pb-32">
      <Header />
      {children}
      <MainMenu />
    </div>
  );
}

export default MainLayout;
