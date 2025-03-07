import React from 'react';
import AudiosPageLoading from '../audiosPage/AudiosPageLoading';

function HomePageLoading() {
  return (
    <div className="grid grid-cols-12 gap-x-8 gap-y-16 mt-8 h-max">
      <div className="slider-box col-span-12 rounded-xl xl:h-[30rem] md:h-[25rem] sm:h-[20rem] h-[15rem] container">
        <div className="skeleton skeleton-card"></div>
      </div>

      <div className="audios-box sm:col-span-12 col-span-12 sm:order-3 order-4 container">
        <AudiosPageLoading count={8} />
      </div>

      <div className="images-box col-span-12 order-5 container">
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton skeleton-card aspect-square"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePageLoading;
