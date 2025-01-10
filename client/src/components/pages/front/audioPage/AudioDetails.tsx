import { Placeholder } from 'rsuite';

//Types
import { audioTypes } from 'types/audio.type';

//Components
import ImageWithLoader from '@/components/global/ImageWithLoader';

type AudioDetailsPropsType = {
  audio: audioTypes;
  handlePlay: () => void;
  currentAudioStatus: boolean;
  isLoading: boolean;
};

function AudioDetails(props: AudioDetailsPropsType) {
  return (
    <>
      {props.isLoading ? (
        <Placeholder.Graph active className="rounded-xl w-full !h-[30rem]" />
      ) : (
        <div id="audio-details" className="flex flex-col items-center justify-center bg-white rounded-xl p-4">
          <div className="relative mb-8">
            <div className="!size-48 rounded-3xl shadow-lg !overflow-hidden relative">
              <ImageWithLoader src={props.audio?.posterPath} alt={props.audio?.title} />
            </div>

            <div
              className="rounded-full size-16 text-4xl text-white bg-mainColor shadow-lg cursor-pointer p-2 grid place-content-center absolute right-1/2 translate-x-1/2 -bottom-6 outline outline-white"
              onClick={props.handlePlay}
            >
              {props.currentAudioStatus ? (
                <i className="ki-solid ki-row-vertical text-2xl"></i>
              ) : (
                <i className="ki-solid ki-to-right"></i>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl">{props.audio?.title}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-red-100 text-red-700">
                <i className="ki-outline ki-heart"></i>
                <span>{props.audio?.like}</span>
              </div>

              <div className="flex items-center gap-1 rounded-md overflow-hidden px-2 h-7 bg-blue-100 text-blue-700">
                <i className="ki-outline ki-eye"></i>
                <span>{props.audio?.view}</span>
              </div>
            </div>
            {props.audio?.text && (
              <div className="text-lg text-center mt-8">
                <p>متن شعر :</p>
                <p>{props.audio?.text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AudioDetails;
