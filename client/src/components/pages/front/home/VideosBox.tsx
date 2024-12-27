import VideoPlayer from '@/components/global/VideoPlayer';
import dynamic from 'next/dynamic';

//Types
import { audioTypes } from 'types/audio.type';

//Components
const Panel = dynamic(() => import('@/components/global/Panel'), {
  ssr: false,
});

function VideosBox({ videos }: { videos: audioTypes[] }) {
  return (
    <Panel title="ویدیو" fill icon="ki-solid ki-abstract-31" className="py-8" container dark>
      <div className="grid grid-cols-12 grid-rows-12 gap-4 container">
        {videos?.length > 0 ? (
          videos?.map((video) => (
            <div className="rounded-xl !overflow-hidden lg:first-of-type:!col-span-9 first-of-type:!row-span-12 first-of-type:!col-span-12 lg:col-span-3 md:col-span-4 row-span-4 col-span-12 sm:col-span-6">
              <VideoPlayer src={video.path} poster={video.posterPath} />
            </div>
          ))
        ) : (
          <div className="col-span-12 grid place-content-center">ویدیویی یافت نشد</div>
        )}
      </div>
    </Panel>
  );
}

export default VideosBox;

// import VideoPlayer from '@/components/global/VideoPlayer';
// import dynamic from 'next/dynamic';
// import { audioTypes } from 'types/audio.type';
// const Panel = dynamic(() => import('@/components/global/Panel'), {
//   ssr: false,
// });
// function VideosBox({ videos }: { videos: audioTypes[] }) {
//   return (
//     <Panel title="ویدیو ها" fill icon="ki-solid ki-abstract-45">
//       <div className="grid grid-cols-2 gap-4">
//         {videos?.length > 0 ? (
//           videos?.map((video) => (
//             <div className='rounded-xl overflow-hidden'>
//               <VideoPlayer src={video.path} poster={video.posterPath} />
//             </div>
//           ))
//         ) : (
//           <div className="col-span-12 grid place-content-center">ویدیویی یافت نشد</div>
//         )}
//       </div>
//     </Panel>
//   );
// }

// export default VideosBox;
