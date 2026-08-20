'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface ILandingBoxProps {
  readonly targetRef: RefObject<HTMLDivElement | null>;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function LandingBox({ targetRef }: ILandingBoxProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleSlideDown = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const reveal = (delay = 0) =>
    shouldReduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } }
      : {
          initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 1.15, delay, ease: EASE },
        };

  return (
    <section className="landing-hero relative z-20 isolate w-full">
      <div className="landing-hero__glow absolute inset-0" aria-hidden />
      <div className="landing-hero__mist absolute inset-0" aria-hidden />

      <div className="relative z-10 container flex min-h-svh flex-col overflow-hidden pb-14 lg:grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-end lg:pb-0 2xl:pb-28">
        <div className="flex flex-1 flex-col justify-center pt-24 pb-5 text-white sm:pt-28 sm:pb-6 md:pt-28 lg:flex-none lg:self-center lg:pb-0 lg:pt-8 xl:pb-0">
          <motion.p
            {...reveal(0.08)}
            className="mb-3 text-sm font-medium tracking-[0.22em] text-white/65 sm:mb-4 sm:text-base"
          >
            پایگاه حفظ و نشر آثار
          </motion.p>
          <motion.h1
            {...reveal(0.2)}
            className="potk text-[clamp(1.9rem,8.5vw,2.75rem)] leading-[1.12] whitespace-nowrap sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
          >
            عبدالرضا هلالی
          </motion.h1>
          <motion.p
            {...reveal(0.34)}
            className="gofteh mt-4 max-w-lg text-[clamp(1.35rem,5.5vw,1.75rem)] leading-relaxed text-white/85 sm:mt-5 sm:text-3xl lg:text-4xl"
          >
            عاشق خدا باش تا معشوق خلق شوی
          </motion.p>
          <motion.div {...reveal(0.46)} className="mt-6 max-w-lg sm:mt-8">
            <p className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 text-sm text-white/70 sm:gap-x-5 sm:text-base">
              <span className="inline-flex items-center gap-2 sm:gap-2.5">
                <Icon
                  icon="solar:microphone-3-bold-duotone"
                  className="size-5 text-brand-accent sm:size-6"
                  aria-hidden
                />
                صوت
              </span>
              <span className="h-4 w-px bg-white/20 sm:h-5" aria-hidden />
              <span className="inline-flex items-center gap-2 sm:gap-2.5">
                <Icon
                  icon="solar:videocamera-record-bold-duotone"
                  className="size-5 text-brand-accent sm:size-6"
                  aria-hidden
                />
                ویدیو
              </span>
              <span className="h-4 w-px bg-white/20 sm:h-5" aria-hidden />
              <span className="inline-flex items-center gap-2 sm:gap-2.5">
                <Icon
                  icon="solar:gallery-bold-duotone"
                  className="size-5 text-brand-accent sm:size-6"
                  aria-hidden
                />
                گالری
              </span>
            </p>
            <p className="mt-3 flex items-center gap-3 text-sm leading-relaxed text-white/50 sm:mt-4 sm:text-base">
              <span className="inline-block h-px w-8 shrink-0 bg-brand-accent/70" aria-hidden />
              همه آثار مداحی را اینجا بشنوید و ببینید
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 1.02, filter: 'blur(8px)' }
          }
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.45, delay: shouldReduceMotion ? 0 : 0.28, ease: EASE }}
          className="landing-hero__figure relative flex w-full flex-none items-end justify-center self-end lg:h-full lg:min-h-0 lg:justify-end lg:pt-24"
        >
          <Image
            src="/images/helali-fade.png"
            alt="عبدالرضا هلالی"
            width={892}
            height={779}
            priority
            sizes="(max-width: 768px) 90vw, (max-width: 1024px) 34rem, 58rem"
            className="h-auto w-[min(100%,28rem)] object-contain object-bottom drop-shadow-[0_24px_60px_rgba(23,138,122,0.28)] sm:w-[min(100%,34rem)] md:w-[min(100%,38rem)] lg:h-[calc(100svh-6.5rem)] lg:w-auto lg:max-w-full"
          />
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={handleSlideDown}
        aria-label="مشاهده محتوا"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: shouldReduceMotion ? 0 : 0.9, ease: EASE }}
        className="absolute bottom-3 left-1/2 z-20 flex size-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:bottom-4 sm:size-12 lg:bottom-0 lg:size-14 lg:translate-y-1/2"
      >
        <motion.span
          animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="grid place-content-center text-2xl sm:text-3xl"
        >
          <Icon icon="solar:double-alt-arrow-down-line-duotone" />
        </motion.span>
      </motion.button>
    </section>
  );
}

export default LandingBox;
