'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

function Header() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    setMousePosition({
      x: clientX - window.innerWidth / 2,
      y: clientY - window.innerHeight / 2,
    });
  };
  return (
    <div className="container mb-12 pt-24">
      <motion.div
        initial={{ opacity: 0, y: -150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative mt-8 bg-childrencolor w-full h-[26rem] rounded-[2.5rem] shadow-xl shadow-violet-200 grid place-content-center"
      >
        <div className="children-header-noutch absolute -top-[6.5rem] right-1/2 translate-x-1/2 w-full flex items-center justify-center">
          {/* <div className="bg-childrenbackgroundcolor h-full flex-1 rounded-bl-[3.5rem]"></div> */}
          <div className="bg-childrenbackgroundcolor h-full w-[30rem] relative">
            <div className="bg-childrencolor h-full rounded-t-[3rem]">
              <div className="pt-8 flex items-center justify-center gap-2 text-7xl text-center text-yellow-400 text-shadow-xl [text-shadow:0_0_10px_rgba(255,215,0,0.7),0_0_20px_rgba(255,215,0,0.5)]">
                <motion.div
                  initial={{ opacity: 0, y: -150 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 2 }}
                  className="potk drop-shadow-lg"
                >
                  عزیزم
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 2, delay: 2 }}
                  className="flex items-center drop-shadow-lg love"
                >
                  <div className="potk">حسین</div>
                  <div className="potk text-4xl">(ع)</div>
                </motion.div>
              </div>
            </div>
          </div>
          {/* <div className="bg-childrenbackgroundcolor h-full flex-1 rounded-br-[3.5rem]"></div> */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 150 }}
          animate={{ opacity: 1, y: 30 }}
          transition={{ duration: 1, delay: 0.7 }}
          onMouseMove={handleMouseMove}
          className="relative flex justify-center items-center"
        >
          <div className="flex items-center z-10">
            <motion.div
              animate={{
                x: mousePosition.x / 20,
                y: mousePosition.y / 20,
              }}
              transition={{
                ease: 'easeOut',
                duration: 0.3,
              }}
            >
              <Image
                src="/images/children/girl-1.png"
                width={400}
                height={500}
                alt="girl-1"
                className="drop-shadow-2xl"
              />
            </motion.div>

            <motion.div
              animate={{
                x: mousePosition.x / 30,
                y: mousePosition.y / 30,
              }}
              transition={{
                ease: 'easeOut',
                duration: 0.3,
              }}
            >
              <Image
                src="/images/children/boy-1.png"
                width={400}
                height={500}
                alt="boy-1"
                className="drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Header;
