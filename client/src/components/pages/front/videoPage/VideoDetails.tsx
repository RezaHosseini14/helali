import { Placeholder } from 'rsuite';

//Types
import { videoTypes } from 'types/video.type';

//Components
import VideoPlayer from '@/components/global/VideoPlayer';

type VideoDetailsPropsType = {
  video: videoTypes;
  isLoading: boolean;
};

function VideoDetails(props: VideoDetailsPropsType) {
  return (
    <>
      {props.isLoading ? (
        <Placeholder.Graph active className="rounded-xl w-full !h-[30rem]" />
      ) : (
        <div id="video-details" className="flex flex-col gap-4 items-center justify-center bg-white rounded-xl p-4">
          <div className="rounded-xl overflow-hidden">
            <VideoPlayer src={props?.video?.path} poster={props?.video?.posterPath} />
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            <div className='flex items-center justify-between w-full'>
              <h2 className="text-2xl">{props.video?.title}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-red-100 text-red-700">
                  <i className="ki-outline ki-heart"></i>
                  <span>{props.video?.like}</span>
                </div>

                <div className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-blue-100 text-blue-700">
                  <i className="ki-outline ki-eye"></i>
                  <span>{props.video?.view}</span>
                </div>
              </div>
            </div>
            
            {props.video?.text && (
              <div className="text-lg text-center mt-8">
                <p>متن شعر :</p>
                <p>{props.video?.text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default VideoDetails;
