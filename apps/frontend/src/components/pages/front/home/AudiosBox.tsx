'use client';

import { Icon } from '@iconify/react';

import Panel from '@/components/global/Panel';
import AudioCard from '@/components/pages/front/audiosPage/AudioCard';
import type { audioTypes } from 'types/audio.type';

function AudiosBox({ audios }: { audios: audioTypes[] }) {
  const latestAudios = audios.slice(0, 8);

  return (
    <Panel
      title="صوت"
      fill
      className="overflow-visible"
      icon={<Icon icon="solar:music-note-bold-duotone" width="22" height="22" />}
      moreButton={{ url: '/audio' }}
    >
      <div className="grid grid-cols-12 gap-x-4 gap-y-10 overflow-visible pt-1">
        {latestAudios.length > 0 ? (
          latestAudios.map((audio, index) => <AudioCard key={audio.id} index={index} {...audio} />)
        ) : (
          <div className="col-span-full grid place-content-center py-10 text-muted-foreground">صوتی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default AudiosBox;
