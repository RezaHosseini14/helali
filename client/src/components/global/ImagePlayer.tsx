'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImagePlayerPropsType {
  imageSrc: string;
  title: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}
function ImagePlayer(props: ImagePlayerPropsType) {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);
  console.log(props);

  return (
    <AnimatePresence mode="wait">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-full">
        <div className="bg-black/90 backdrop-blur-md fixed inset-0 z-[100] flex flex-col gap-8 text-white overflow-y-auto">
          <div className="imageplayer-header flex items-center justify-between p-4 text-xl">
            <div></div>
            <div></div>
            <button onClick={props.onClose}>
              <i className="ki-solid ki-cross"></i>
            </button>
          </div>

          <div className="imageplayer-body flex items-center justify-center h-2/3">
            <button className="p-4 text-4xl" onClick={props.onPrev}>
              <i className="ki-outline ki-right"></i>
            </button>
            <div className=" h-full flex justify-center items-center">
              <div className="rounded-3xl bg-white overflow-hidden relative max-w-full max-h-full">
                <img src={props.imageSrc} alt={props.title} className="object-contain w-full h-full" />
              </div>
            </div>
            <button className="p-4 text-4xl" onClick={props.onNext}>
              <i className="ki-outline ki-left"></i>
            </button>
          </div>

          <div className="imageplayer-footer text-center text-2xl p-4">
            <p>{props.title}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImagePlayer;
