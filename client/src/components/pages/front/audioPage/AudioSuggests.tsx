import ImageWithLoader from '@/components/global/ImageWithLoader';
import { RootState } from '@/redux/store';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Placeholder } from 'rsuite';
import { audioTypes } from 'types/audio.type';

type AudioSuggestsPropsType = { audios: audioTypes[]; loadingIds: number[]; handleLike: (id: number) => any };

function AudioSuggests({ audios, loadingIds, handleLike }: AudioSuggestsPropsType) {
  const { audiosLoading } = useSelector((state: RootState) => state.audio);

  return (
    <div className="col-span-3 flex flex-col gap-4 h-screen sticky top-4">
      {audiosLoading ? (
        <div className="flex flex-col gap-4">
          <Placeholder.Graph active className="rounded-xl w-full !h-24" />
          <Placeholder.Graph active className="rounded-xl w-full !h-24" />
          <Placeholder.Graph active className="rounded-xl w-full !h-24" />
        </div>
      ) : (
        <>
          {audios?.map((audio: audioTypes) => (
            <div key={audio.id} className="flex gap-2 items-center bg-white rounded-xl w-full h-24 p-2">
              <div className="rounded-lg bg-white aspect-square h-full overflow-hidden relative">
                {/* <Image src={audio.posterPath} alt={audio.title} layout="fill" objectFit="cover" /> */}
                <ImageWithLoader src={audio.posterPath} alt={audio.title} />
              </div>
              <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                <span className="font-bold">{audio?.title}</span>
                <div className="flex items-center gap-2">
                  <Button
                    loading={loadingIds.includes(audio.id)}
                    className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-red-100 text-red-700"
                    onClick={() => handleLike(audio?.id)}
                  >
                    <i className="ki-outline ki-heart"></i>
                    <span>{audio?.like}</span>
                  </Button>
                  <div className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-blue-100 text-blue-700">
                    <i className="ki-outline ki-eye"></i>
                    <span>{audio?.view}</span>
                  </div>
                </div>
              </div>
              <Link href={`/audio/${audio.id}`}>
                <i className="ki-solid ki-to-right text-4xl text-mainColor"></i>
              </Link>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AudioSuggests;
