import React from "react";
import Waveform from "./Waveform";
type AudioPropsTypes = {
  audioUrl: string;
};
function Audio({ audioUrl }: AudioPropsTypes) {
  return (
    <div className="lg:col-span-3 md:col-span-6 col-span-12 h-32 bg-mainColor/50 backdrop-blur-md rounded-xl p-2 flex gap-2">
      <div className="rounded-lg bg-white aspect-square h-full"></div>
      <div className="flex flex-col flex-1 gap-2 text-white">
        <span className="font-bold">ترک 1</span>
        <Waveform audioUrl={audioUrl} />
      </div>
    </div>
  );
}

export default Audio;
