'use client';

import { motion } from 'framer-motion';

interface INavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}

const NAV_ITEMS: ReadonlyArray<INavItem> = [
  { id: 'audios', label: 'صوت', icon: 'ki-solid ki-abstract-45' },
  { id: 'videos', label: 'ویدیو', icon: 'ki-solid ki-youtube' },
  { id: 'album', label: 'آلبوم', icon: 'ki-solid ki-picture' },
  { id: 'gallery', label: 'گالری', icon: 'ki-solid ki-slider-horizontal-2' },
];

function ChildrenQuickNav() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      aria-label="ناوبری سریع صفحه کودکان"
      className="container"
    >
      <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {NAV_ITEMS.map((item, index) => (
          <li key={item.id}>
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center gap-2 rounded-2xl border border-childrencolor/40 bg-childrencolor/15 px-4 py-2.5 text-childrencolordarker shadow-md shadow-violet-100 transition hover:bg-childrencolor hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-childrencolordarker"
            >
              <i className={`${item.icon} text-lg`} aria-hidden />
              <span className="font-bold">{item.label}</span>
            </motion.button>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}

export default ChildrenQuickNav;
