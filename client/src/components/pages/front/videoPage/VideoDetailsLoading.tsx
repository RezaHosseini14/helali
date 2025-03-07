function VideoDetailsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton skeleton-card aspect-video"></div>
      <div className="flex justify-between items-center gap-16">
        <div className="w-2/3">
          <p className="skeleton skeleton-text"></p>
        </div>
        <div className="flex items-center gap-2 w-1/4">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="skeleton skeleton-text !w-full"></div>
        <div className="skeleton skeleton-text !w-full"></div>
        <div className="skeleton skeleton-text !w-full"></div>
      </div>
    </div>
  );
}

export default VideoDetailsLoading;
