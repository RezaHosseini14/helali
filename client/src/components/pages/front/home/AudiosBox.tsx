'use client';
import { Icon } from '@iconify/react';

//Types
import { audioTypes } from 'types/audio.type';

//Commponents
import Panel from '@/components/global/Panel';
import AudioPreview from '@/components/global/AudioPreview';

function AudiosBox({ audios }: { audios: audioTypes[] }) {
  return (
    <Panel
      title="صوت"
      fill
      icon={<Icon icon="solar:music-note-bold-duotone" width="24" height="24" />}
      moreButton={{ url: '/audios' }}
    >
      <div className="grid grid-cols-12 gap-y-10 gap-x-4">
        {audios?.length > 0 ? (
          audios?.map((audio: audioTypes) => <AudioPreview {...audio} />)
        ) : (
          <div className="col-span-12 grid place-content-center">صوتی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default AudiosBox;
