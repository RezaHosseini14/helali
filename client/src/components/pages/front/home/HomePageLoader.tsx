"use client";
import { Placeholder } from "rsuite";

function HomePageLoader() {
  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-16 mt-8 h-max">
      <div className="payment-box lg:col-span-4 col-span-12 lg:order-1 order-2 glass-back rounded-xl xl:h-[30rem] lg:h-[25rem] md:h-[20rem] h-[10rem]">
        <Placeholder.Graph active className="rounded-xl !h-full" />
      </div>

      <div className="slider-box lg:col-span-8 col-span-12 lg:order-2 order-1 glass-back rounded-xl xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem]">
        <Placeholder.Graph active className="rounded-xl !h-full" />
      </div>

      <div className="bio-box sm:col-span-6 col-span-12 sm:order-3 order-4">
        <Placeholder.Graph
          active
          className="rounded-xl !h-full min-h-48"
        />
      </div>

      <div className="bioImag-box sm:col-span-6 col-span-12 sm:order-4 order-3">
        <Placeholder.Graph
          active
          className="rounded-xl !h-full min-h-48"
        />
      </div>

      <div className="audios-box col-span-12 order-5">
        <Placeholder.Graph active />
      </div>
    </div>
  );
}

export default HomePageLoader;
