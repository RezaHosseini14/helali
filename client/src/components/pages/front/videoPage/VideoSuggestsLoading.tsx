function VideoSuggestsLoading() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index: number) => (
        <div key={index} className="flex flex-col gap-4">
          <div className="h-24 flex justify-between items-end gap-2">
            <div className="aspect-video h-full">
              <div className="skeleton skeleton-card"></div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text !w-full"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default VideoSuggestsLoading;
