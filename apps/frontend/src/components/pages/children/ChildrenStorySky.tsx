'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

import StarrySky from '@/components/StarrySky';

function ChildrenStorySky() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <StarrySky className="overflow-hidden">
      <div className="relative z-10 flex h-full min-h-[40rem] flex-col items-center justify-center gap-8 px-4 py-12">
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="children-story-moon absolute left-[12%] top-16 hidden size-24 rounded-full bg-yellow-200 shadow-[0_0_40px_rgba(250,204,21,0.55)] sm:block"
          aria-hidden
        />

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}
          className="max-w-xl rounded-[2rem] border border-white/25 bg-white/10 px-6 py-8 text-center text-white shadow-lg backdrop-blur-md sm:px-10"
        >
          <p className="potk text-3xl text-yellow-300 sm:text-4xl">قصه شب</p>
          <p className="mt-4 text-lg leading-8 text-white/95 sm:text-xl">
            وقتی ستاره‌ها چشمک می‌زنند، عزیزم حسین برای بچه‌های خوب دنیا قصه‌ای از محبت و شجاعت
            می‌گوید. چشم‌هاتو ببند و گوش کن…
          </p>
        </motion.div>

        <div className="pointer-events-none absolute bottom-0 flex w-full max-w-3xl items-end justify-between px-4 sm:px-8">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.2 }}
          >
            <Image
              src="/images/children/girl-2.png"
              width={220}
              height={280}
              alt=""
              className="h-auto w-28 drop-shadow-2xl sm:w-44"
            />
          </motion.div>
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, delay: shouldReduceMotion ? 0 : 0.3 }}
          >
            <Image
              src="/images/children/boy-2.png"
              width={220}
              height={280}
              alt=""
              className="h-auto w-28 drop-shadow-2xl sm:w-44"
            />
          </motion.div>
        </div>
      </div>
    </StarrySky>
  );
}

export default ChildrenStorySky;
