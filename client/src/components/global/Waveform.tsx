"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

const Waveform = ({ audioUrl }: { audioUrl: string }) => {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  console.log(isLoading);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ddd",
        // progressColor: "#ff5500",
        barWidth: 2,
        cursorWidth: 1,
        height: 60,
        barGap: 2,
      });

      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on("ready", () => {
        if (wavesurferRef.current) {
          setDuration(wavesurferRef.current.getDuration());
          setIsLoading(false);
          console.log("Audio is ready");
        }
      });

      wavesurferRef.current.on("audioprocess", () => {
        if (wavesurferRef.current) {
          setCurrentTime(wavesurferRef.current.getCurrentTime());
        }
      });

      wavesurferRef.current.on("error", (e) =>
        console.error("Audio load error", e)
      );

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    // <>
    //   {isLoading ? (
    //     "asfas"
    //   ) : (
    <div className="flex-1">
      <div className="flex items-center gap-4">
        <div id="waveform" className="flex-1" ref={waveformRef}></div>
        <button
          className="flex items-center gap-2 justify-center text-5xl text-white size-6"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <>
              <i className="ki-solid ki-minus rotate-90 w-2 -mb-8"></i>
              <i className="ki-solid ki-minus rotate-90 w-2 -mb-8"></i>
            </>
          ) : (
            <i className="ki-solid ki-to-right"></i>
          )}
        </button>
      </div>
      <div className="text-white">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
    //   )}
    // </>
  );
};

export default Waveform;
