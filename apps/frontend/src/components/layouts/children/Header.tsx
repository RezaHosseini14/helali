'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useId, useState, type MouseEvent } from 'react';

function Header() {
  const gradientId = useId().replace(/:/g, '');
  const shadowId = `shadow-${gradientId}`;
  const fillId = `fill-${gradientId}`;
  const shouldReduceMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) {
      return;
    }

    setMousePosition({
      x: event.clientX - window.innerWidth / 2,
      y: event.clientY - window.innerHeight / 2,
    });
  };

  return (
    <div className="container relative mb-8 pt-16 sm:mb-12 sm:pt-24">
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-xl bg-childrencolor/15 px-3 py-2 text-sm font-bold text-childrencolordarker transition hover:bg-childrencolor hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-childrencolordarker sm:left-8 sm:top-8"
      >
        <i className="ki-solid ki-home-2" aria-hidden />
        خانه
      </Link>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: 'easeOut' }}
        onMouseMove={handleMouseMove}
        className="children-hero relative mt-4 pt-[5.75rem] sm:mt-6 sm:pt-[6.75rem]"
      >
        {/* One continuous SVG shape: notch + body share the same gradient */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 1000 520"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={fillId} x1="8%" y1="0%" x2="92%" y2="100%">
                <stop offset="0%" stopColor="#b4acf5" />
                <stop offset="38%" stopColor="#9690e4" />
                <stop offset="100%" stopColor="#7b5cdc" />
              </linearGradient>
              <filter id={shadowId} x="-8%" y="-8%" width="116%" height="120%">
                <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#7b5cdc" floodOpacity="0.38" />
              </filter>
            </defs>
            <path
              filter={`url(#${shadowId})`}
              fill={`url(#${fillId})`}
              d="
                M 44 110
                L 148 110
                A 36 36 0 0 0 184 74
                L 184 48
                A 48 48 0 0 1 232 0
                L 768 0
                A 48 48 0 0 1 816 48
                L 816 74
                A 36 36 0 0 0 852 110
                L 956 110
                A 44 44 0 0 1 1000 154
                L 1000 476
                A 44 44 0 0 1 956 520
                L 44 520
                A 44 44 0 0 1 0 476
                L 0 154
                A 44 44 0 0 1 44 110
                Z
              "
            />
          </svg>
          <div className="children-hero-sparkle absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,black_12%,black_100%)]" />
          <div className="absolute -left-10 top-[28%] size-44 rounded-full bg-yellow-200/20 blur-3xl sm:size-60" />
          <div className="absolute -right-8 bottom-[8%] size-52 rounded-full bg-fuchsia-200/15 blur-3xl sm:size-72" />
        </div>

        {/* Title sits in the notch — no separate colored box */}
        <div className="absolute inset-x-0 top-0 z-20 flex justify-center px-3">
          <div className="flex w-full max-w-[30rem] items-center justify-center gap-2 pt-6 text-center text-4xl text-yellow-400 [text-shadow:0_0_10px_rgba(255,215,0,0.7),0_0_20px_rgba(255,215,0,0.5)] sm:pt-8 sm:text-6xl md:text-7xl">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -120 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 1.6 }}
              className="potk drop-shadow-lg"
            >
              عزیزم
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 1.6, delay: shouldReduceMotion ? 0 : 1.4 }}
              className="love flex items-center drop-shadow-lg"
            >
              <div className="potk">حسین</div>
              <div className="potk text-2xl sm:text-4xl">(ع)</div>
            </motion.div>
          </div>
        </div>

        <div className="relative flex min-h-[18rem] items-end justify-center px-2 pb-0 pt-4 sm:min-h-[24rem] md:min-h-[26rem]">
          <div
            className="pointer-events-none absolute bottom-6 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[100%] bg-childrencolordarker/30 blur-2xl sm:bottom-8 sm:h-24"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-10 left-1/2 h-28 w-56 -translate-x-1/2 rounded-full bg-yellow-100/25 blur-3xl sm:h-40 sm:w-80"
            aria-hidden
          />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.85, delay: shouldReduceMotion ? 0 : 0.3 }}
            className="relative z-10 flex items-end justify-center"
          >
            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: mousePosition.x / 22,
                      y: mousePosition.y / 22,
                      rotate: mousePosition.x / 180,
                    }
              }
              transition={{ ease: 'easeOut', duration: 0.35 }}
              className="relative -ml-2 origin-bottom sm:-ml-4"
            >
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/images/children/girl-1.png"
                  width={400}
                  height={500}
                  alt="دختر"
                  priority
                  className="children-hero-character h-auto w-40 drop-shadow-[0_20px_35px_rgba(60,40,120,0.35)] sm:w-60 md:w-[23rem]"
                />
              </motion.div>
            </motion.div>

            <motion.div
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: mousePosition.x / 32,
                      y: mousePosition.y / 32,
                      rotate: -mousePosition.x / 220,
                    }
              }
              transition={{ ease: 'easeOut', duration: 0.35 }}
              className="relative -mr-2 origin-bottom sm:-mr-4"
            >
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                <Image
                  src="/images/children/boy-1.png"
                  width={400}
                  height={500}
                  alt="پسر"
                  priority
                  className="children-hero-character h-auto w-40 drop-shadow-[0_20px_35px_rgba(60,40,120,0.35)] sm:w-60 md:w-[23rem]"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {!shouldReduceMotion ? (
            <>
              <motion.span
                aria-hidden
                animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.15, 0.9], y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-[14%] top-[28%] size-2 rounded-full bg-yellow-200 shadow-[0_0_12px_rgba(254,240,138,0.9)] sm:size-2.5"
              />
              <motion.span
                aria-hidden
                animate={{ opacity: [0.25, 0.95, 0.25], scale: [1, 1.3, 1] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute right-[16%] top-[34%] size-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)] sm:size-2"
              />
              <motion.span
                aria-hidden
                animate={{ opacity: [0.2, 0.85, 0.2], y: [0, -8, 0] }}
                transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
                className="absolute left-[22%] top-[48%] size-1.5 rounded-full bg-yellow-100/90 sm:left-[18%]"
              />
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

export default Header;
