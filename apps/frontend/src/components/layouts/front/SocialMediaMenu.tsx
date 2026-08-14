'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { socialMediaItems } from '@/jsons/socialMediaItems';

function SocialMediaMenu() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -150 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 2 }}
      className="white-space-rounded fixed left-0 top-32 hidden flex-col items-center gap-4 rounded-tr-lg rounded-br-lg pt-12 pb-6 pe-2 ps-3 text-2xl text-white sm:flex"
    >
      {socialMediaItems.map((social, index) => (
        <Tooltip key={index}>
          <TooltipTrigger render={<Link href={social.url} />}>
            <i className={social.icon} />
          </TooltipTrigger>
          <TooltipContent side="left">{social.title}</TooltipContent>
        </Tooltip>
      ))}
    </motion.div>
  );
}

export default SocialMediaMenu;
