'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface ILandingBoxProps {
  readonly targetRef: RefObject<HTMLDivElement | null>;
}

function LandingBox({ targetRef }: ILandingBoxProps) {
  const handleSlideDown = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="landing-hero relative z-20 isolate w-full">
      <div className="landing-hero__glow absolute inset-0" aria-hidden />
      <div className="landing-hero__mist absolute inset-0" aria-hidden />

      <div className="relative z-10 container grid min-h-svh grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end 2xl:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-end pt-32 pb-6 text-white lg:justify-center lg:py-28"
        >
          <p className="mb-4 text-sm font-medium tracking-[0.22em] text-white/65 sm:text-base">
            پایگاه حفظ و نشر آثار
          </p>
          <h1 className="potk text-5xl leading-[1.12] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            عبدالرضا هلالی
          </h1>
          <p className="potk mt-5 max-w-md text-lg leading-relaxed text-white/80 sm:text-2xl">
            عاشق خدا باش تا معشوق خلق شوی
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
            صوت، ویدیو و تصاویر رسمی — تازه‌ترین آثار در یک آرشیو
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/audio"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-mainstructure transition hover:bg-white/90 sm:text-base"
            >
              شنیدن صوت
            </Link>
            <Link
              href="/video"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:text-base"
            >
              تماشای ویدیو
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero__figure relative mx-auto h-[48vh] w-full max-w-lg lg:h-[92vh] lg:max-w-none"
        >
          <Image
            src="/images/helali-fade.png"
            alt="عبدالرضا هلالی"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 48vw"
            className="object-contain object-bottom drop-shadow-[0_24px_60px_rgba(23,138,122,0.28)]"
          />
        </motion.div>
      </div>

      <button
        type="button"
        onClick={handleSlideDown}
        aria-label="مشاهده محتوا"
        className="absolute bottom-0 left-1/2 z-20 flex size-12 -translate-x-1/2 translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:size-14"
      >
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="grid place-content-center text-2xl sm:text-3xl"
        >
          <Icon icon="solar:double-alt-arrow-down-line-duotone" />
        </motion.span>
      </button>
    </section>
  );
}

export default LandingBox;
