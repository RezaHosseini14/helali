import Link from 'next/link';
import { Tooltip, Whisper } from 'rsuite';
import { motion } from 'framer-motion';

//Jsons
import { socialMediaItems } from '@/jsons/socialMediaItems';

function SocialMediaMenu() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -150 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 2 }}
      className="white-space-rounded fixed left-0 top-32 sm:flex hidden flex-col items-center gap-4 text-2xl pt-12 pb-6 pe-2 ps-3 rounded-tr-lg rounded-br-lg text-white"
    >
      {socialMediaItems.map((social, index) => (
        <Whisper
          key={index}
          placement="left"
          controlId="control-id-hover"
          trigger="hover"
          speaker={<Tooltip>{social.title}</Tooltip>}
        >
          <Link href={social.url}>
            <i className={social.icon}></i>
          </Link>
        </Whisper>
      ))}
    </motion.div>
  );
}

export default SocialMediaMenu;
