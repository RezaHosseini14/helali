'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Components
import StarrySky from '@/components/StarrySky';
import ChildrenAlbum from '@/components/pages/children/ChildrenAlbum';
import ChildrenAudios from '@/components/pages/children/ChildrenAudios';
import ChildrenGallery from '@/components/pages/children/ChildrenGallery';
import ChildrenHeader from '@/components/layouts/children/ChildrenHeader';

function ChildrenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-16">
      <ChildrenHeader />

      <div className="container relative">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -right-4 "
        >
          <Image src="/images/children/start.png" width={200} height={200} alt="start" />
        </motion.div>
        <ChildrenAudios />
      </div>

      <ChildrenAlbum />

      <StarrySky className="">
        <div className="absolute right-0 z-[1000]">asfgasf</div>
      </StarrySky>

      <div className="cloud-pattern w-full bg-childrencolor py-8">
        <ChildrenGallery />
      </div>

      {children}
    </div>
  );
}

export default ChildrenLayout;
