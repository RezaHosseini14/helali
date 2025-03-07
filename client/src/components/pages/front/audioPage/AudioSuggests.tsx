import Link from 'next/link';
import { useSelector } from 'react-redux';

// Store
import { RootState } from '@/redux/store';

// Types
import { audioTypes } from 'types/audio.type';

// Functions
import { getRandomNumber } from 'utils/functions';

// Componnets
import ImageWithLoader from '@/components/global/ImageWithLoader';
import VideoSuggestsLoading from '../videoPage/VideoSuggestsLoading';

type AudioSuggestsPropsType = { audios: audioTypes[] };

function AudioSuggests({ audios }: AudioSuggestsPropsType) {
  const { audiosLoading } = useSelector((state: RootState) => state.audio);

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      {audiosLoading ? (
        <VideoSuggestsLoading />
      ) : (
        <>
          {audios?.slice(0, 5).map((audio: audioTypes) => (
            <Link
              href={`/audio/${audio.id}`}
              key={audio.id}
              className="flex gap-2 items-center bg-white shadow-mainshadow rounded-xl w-full h-24 p-2"
            >
              <div className="rounded-lg bg-white aspect-square h-full overflow-hidden relative">
                <ImageWithLoader src={audio.posterPath} alt={audio.title} />
              </div>
              <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                  <p className="text-mainColor h2 text-xl text-right truncate w-36">{audio?.title}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                      <span>{audio?.like > 100 ? audio?.like : getRandomNumber()}</span>
                      <i className="ki-outline ki-heart"></i>
                    </div>
                    <div className="h-3 w-[1px] bg-mainColor"></div>
                    <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                      <span>{audio?.view > 1000 ? audio?.view : getRandomNumber(1000, 10000)}</span>
                      <i className="ki-outline ki-eye"></i>
                    </div>
                  </div>
                </div>
              </div>
              <i className="ki-solid ki-to-right text-4xl bg-mainColor/10 group-hover:bg-white/50 backdrop-blur-sm rounded-full"></i>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}

export default AudioSuggests;
