// Types
import { videoTypes } from 'types/video.type';

// Components
import VideoPlayer from '@/components/global/VideoPlayer';
import VideoDetailsLoading from './VideoDetailsLoading';
import ShareButton from '@/components/global/ShareButton';
import { Button } from 'rsuite';

type VideoDetailsPropsType = {
  video: videoTypes;
  isLoading: boolean;
};

function VideoDetails(props: VideoDetailsPropsType) {
  return (
    <>
      {props.isLoading ? (
        <VideoDetailsLoading />
      ) : (
        <div className="pattern-bottom relative xl:pt-[42%] lg:pt-[36%] md:pt-[44%] sm:pt-[42%] xs:pt-[40%] pt-[36%] lg:mt-36 mt-20 flex flex-col gap-4 items-center justify-center bg-white rounded-xl p-4">
          <div className="absolute lg:-top-36 -top-20 rounded-xl overflow-hidden w-[95%]">
            <VideoPlayer src={props?.video?.path} poster={props?.video?.posterPath} />
          </div>

          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl">{props.video?.title}</h2>
              <div className="flex items-center gap-2">
                <ShareButton />

                <Button
                  appearance="primary"
                  color="red"
                  className="!h-8 flex items-center gap-1 !bg-red-100 hover:!bg-red-500 !text-red-700 hover:!text-white"
                >
                  <i className="ki-outline ki-heart"></i>
                  <span>{props.video?.like}</span>
                </Button>

                <Button
                  appearance="primary"
                  color="red"
                  className="!h-8 flex items-center gap-1 !bg-blue-100 hover:!bg-blue-500 !text-blue-700 hover:!text-white"
                >
                  <i className="ki-outline ki-eye"></i>
                  <span>{props.video?.view}</span>
                </Button>
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
