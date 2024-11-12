"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

//components
import Audio from "@/components/global/Audio";
import Panel from "@/components/global/Panel";
import HomeSlider from "@/components/pages/front/home/HomeSlider";
import HomePageLoader from "@/components/pages/front/home/HomePageLoader";

function HomePage(): JSX.Element {
  const [loading, setloading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      setloading(false);
    }, 3000);
  }, []);
  return (
    <>
      {loading ? (
        <HomePageLoader />
      ) : (
        <div className="grid grid-cols-12 gap-x-8 gap-y-16 mt-8 h-max">
          <div className="payment-box lg:col-span-4 col-span-12 lg:order-1 order-2 glass-back rounded-xl xl:h-[30rem] lg:h-[25rem] md:h-[20rem] h-[10rem]"></div>

          <div className="slider-box lg:col-span-8 col-span-12 lg:order-2 order-1 glass-back rounded-xl overflow-hidden xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem]">
            <HomeSlider />
          </div>

          <div className="bio-box sm:col-span-6 col-span-12 sm:order-3 order-4">
            <p>asfasfasf</p>
          </div>

          <div className="bioImag-box sm:col-span-6 col-span-12 sm:order-4 order-3">
            <div className="rounded-full shadow-xl overflow-hidden size-96 bg-mainColor/50 backdrop-blur-md grid place-content-center">
              <Image
                src="/images/helali.png"
                alt="helali"
                width={800}
                height={800}
                className="-mb-16"
              />
            </div>
          </div>

          <div className="audios-box col-span-12 order-5">
            <Panel title="صوت ها" fill icon="ki-solid ki-abstract-45">
              <div className="grid grid-cols-12 gap-4">
                <Audio audioUrl="https://mir1.kashoob.com/audio/202311/enc_1698808630062979191577.mp3" />
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

export default HomePage;
