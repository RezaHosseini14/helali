"use client";
import { useWavesurfer } from "@wavesurfer/react";
import { useCallback, useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) =>
  [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(":");

const Waveform = ({ audioUrl }: { audioUrl: string }) => {
  const containerRef = useRef(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [duration, setDuration] = useState(0);

  const { wavesurfer, isPlaying, isReady, currentTime } = useWavesurfer({
    container: containerRef,
    height: 50,
    width: 150,
    waveColor: "#ffffff",
    progressColor: "#d60060",
    cursorColor: "#ddd5e9",
    barWidth: 5,
    barGap: 3,
    barRadius: 30,
    barHeight: 1,
    url: audioUrl,
  });

  // const onUrlChange = useCallback(() => {
  //   setUrlIndex((index) => (index + 1) % audioUrls.length);
  // }, []);

  // useEffect(() => {
  //   if (wavesurfer) {
  //     const onFinish = () => {
  //       setUrlIndex((prevIndex) => (prevIndex + 1) % audioUrls.length);
  //     };
  //     wavesurfer.on("finish", onFinish);
  //     return () => {
  //       wavesurfer.un("finish", onFinish);
  //     };
  //   }
  // }, [wavesurfer]);

  useEffect(() => {
    if (wavesurfer) {
      // wavesurfer.load(audioUrls[urlIndex]);
      wavesurfer.load(audioUrl);
      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration()); // دریافت مدت زمان کل
        // wavesurfer.play();
      });
    }
  }, [urlIndex, wavesurfer]);

  const onPlayPause = useCallback(() => {
    if (wavesurfer) {
      if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
      } else {
        wavesurfer.play();
      }
    }
  }, [wavesurfer]);

  return (
    <>
      <div className="flex items-center gap-1">
        <div className="grid place-content-center flex-1">
          <div>{!isReady ? <p>Loading...</p> : null}</div>
          <div ref={containerRef} style={!isReady ? { display: "none" } : { display: "flex" }} />
        </div>

        <button onClick={onPlayPause} className="flex items-center gap-2 justify-center text-5xl text-white size-6">
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

      <p>
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>

      <div style={{ margin: "1em 0", display: "flex", gap: "1em" }}>
        {/* <button onClick={onUrlChange}>Change audio</button> */}
      </div>
    </>
  );
};

export default Waveform;

// "use client";
// import { useEffect, useRef, useState } from "react";
// import WaveSurfer from "wavesurfer.js";

// const formatTime = (seconds: number) => {
//   const minutes = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
// };

// const Waveform = ({ audioUrl }: { audioUrl: string }) => {
//   const waveformRef = useRef<HTMLDivElement | null>(null);
//   const wavesurferRef = useRef<WaveSurfer | null>(null);
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   console.log(isLoading);

//   useEffect(() => {
//     if (waveformRef.current) {
//       wavesurferRef.current = WaveSurfer.create({
//         container: waveformRef.current,
//         waveColor: "#ddd",
//         // progressColor: "#ff5500",
//         barWidth: 2,
//         cursorWidth: 1,
//         height: 60,
//         barGap: 2,
//       });

//       wavesurferRef.current.load(audioUrl);

//       wavesurferRef.current.on("ready", () => {
//         if (wavesurferRef.current) {
//           setDuration(wavesurferRef.current.getDuration());
//           setIsLoading(false);
//           console.log("Audio is ready");
//         }
//       });

//       wavesurferRef.current.on("audioprocess", () => {
//         if (wavesurferRef.current) {
//           setCurrentTime(wavesurferRef.current.getCurrentTime());
//         }
//       });

//       wavesurferRef.current.on("error", (e) =>
//         console.error("Audio load error", e)
//       );

//       return () => {
//         if (wavesurferRef.current) {
//           wavesurferRef.current.destroy();
//           wavesurferRef.current = null;
//         }
//       };
//     }
//   }, [audioUrl]);

//   const handlePlayPause = () => {
//     if (wavesurferRef.current) {
//       wavesurferRef.current.playPause();
//       setIsPlaying((prev) => !prev);
//     }
//   };

//   return (
//     // <>
//     //   {isLoading ? (
//     //     "asfas"
//     //   ) : (
//     <div className="flex-1">
//       <div className="flex items-center gap-4">
//         <div id="waveform" className="flex-1" ref={waveformRef}></div>
//         <button
//           className="flex items-center gap-2 justify-center text-5xl text-white size-6"
//           onClick={handlePlayPause}
//         >
//           {isPlaying ? (
//             <>
//               <i className="ki-solid ki-minus rotate-90 w-2 -mb-8"></i>
//               <i className="ki-solid ki-minus rotate-90 w-2 -mb-8"></i>
//             </>
//           ) : (
//             <i className="ki-solid ki-to-right"></i>
//           )}
//         </button>
//       </div>
//       <div className="text-white">
//         {formatTime(currentTime)} / {formatTime(duration)}
//       </div>
//     </div>
//     //   )}
//     // </>
//   );
// };

// export default Waveform;
