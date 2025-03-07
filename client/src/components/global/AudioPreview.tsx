import Link from 'next/link';
import { getRandomNumber } from 'utils/functions';
import ImageWithLoader from './ImageWithLoader';

type AudioPreviewProps = {
  id: number;
  posterPath: string;
  title: string;
  like: number;
  view: number;
};

function AudioPreview(props: AudioPreviewProps) {
  return (
    <Link
      key={props.id}
      href={`/audio/${props.id}`}
      className="pattern group relative !h-[4.5rem] xl:col-span-3 lg:col-span-4 sm:col-span-6 col-span-12 flex items-center justify-between rounded-2xl p-2 !text-mainColor bg-mainColor/10 hover:bg-mainColor/80 hover:!text-white transition duration-300 backdrop-blur-lg"
    >
      <div className="flex flex-1 items-end gap-2 -translate-y-3">
        <div className="rounded-2xl bg-white aspect-square size-20 overflow-hidden relative shadow-lg">
          <ImageWithLoader
            imageClassName="group-hover:scale-110 transition-transform !duration-150"
            src={props.posterPath}
            alt={props.title}
          />
        </div>

        <div className="flex flex-col flex-1 gap-2 h-full justify-end">
          <span className="font-bold w-40 sm:w-28 truncate text-right">{props?.title}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
              <span>{props?.like > 100 ? props?.like : getRandomNumber()}</span>
              <i className="ki-outline ki-heart"></i>
            </div>
            <div className="h-3 w-[1px] bg-mainColor group-hover:bg-white/80 transition"></div>
            <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
              <span>{props?.view > 1000 ? props?.view : getRandomNumber(1000, 10000)}</span>
              <i className="ki-outline ki-eye"></i>
            </div>
          </div>
        </div>
      </div>
      <i className="ki-solid ki-to-right text-4xl bg-mainColor/10 group-hover:bg-white/50 backdrop-blur-sm rounded-full"></i>
    </Link>
  );
}

export default AudioPreview;
