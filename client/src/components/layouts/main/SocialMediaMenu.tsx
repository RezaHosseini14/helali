import Link from 'next/link';
import { Tooltip, Whisper } from 'rsuite';

//Jsons
import { socialMediaItems } from '@/jsons/socialMediaItems';

function SocialMediaMenu() {
  return (
    <div className="fixed left-0 top-32 flex flex-col items-center gap-4 text-2xl bg-mainColor/90 py-4 pe-2 ps-3 rounded-tr-lg rounded-br-lg text-white">
      {socialMediaItems.map((social) => (
        <Whisper
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
    </div>
  );
}

export default SocialMediaMenu;
