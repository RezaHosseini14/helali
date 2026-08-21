'use client';

import { motion } from 'framer-motion';

function ChildrenWelcome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="container text-center"
    >
      <p className="potk mx-auto max-w-2xl text-xl leading-relaxed text-childrencolordarker sm:text-2xl">
        اینجا قصه‌ها و نغمه‌های عزیزم حسین برای بچه‌هاست
      </p>
      <p className="mt-3 text-base text-childrencolordarker/70 sm:text-lg">
        گوش کن، ببین و با هم به دنیای قشنگ محبت سفر کنیم
      </p>
    </motion.div>
  );
}

export default ChildrenWelcome;
