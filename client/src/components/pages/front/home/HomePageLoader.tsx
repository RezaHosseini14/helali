'use client';
import { Placeholder } from 'rsuite';

function HomePageLoader() {
  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-16 mt-8 h-max">
      <div className="slider-box col-span-12 glass-back rounded-xl xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem]">
        <Placeholder.Graph active className="rounded-xl !h-full shadow-lg" />
      </div>

      <div className="bio-box sm:col-span-6 col-span-12 sm:order-3 order-4">
        <Placeholder.Graph active className="rounded-xl !h-full min-h-48 shadow-lg" />
      </div>

      <div className="bioImag-box sm:col-span-6 col-span-12 sm:order-4 order-3">
        <Placeholder.Graph active className="rounded-xl !h-full min-h-48 shadow-lg" />
      </div>

      <div className="audios-box col-span-12 order-5">
        <Placeholder.Graph active className="rounded-xl !h-full min-h-48 shadow-lg" />
      </div>
    </div>
  );
}

export default HomePageLoader;
