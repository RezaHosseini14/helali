'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

function ChildrenFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="container"
    >
      <div className="flex flex-col items-center justify-between gap-4 rounded-[2.5rem] bg-childrencolor px-6 py-8 text-center text-white shadow-xl shadow-violet-200 sm:flex-row sm:text-right">
        <div>
          <p className="potk text-2xl sm:text-3xl">دوست داشتی؟</p>
          <p className="mt-1 text-white/85">بیشتر آثار را در پایگاه هلالی ببین</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-3 font-bold backdrop-blur-sm transition hover:bg-white hover:text-childrencolordarker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <i className="ki-solid ki-home-2" aria-hidden />
          بازگشت به پایگاه هلالی
        </Link>
      </div>
    </motion.footer>
  );
}

export default ChildrenFooter;
