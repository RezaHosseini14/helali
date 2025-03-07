function AudioDetailsLoading() {
  return (
    <div className="flex items-center gap-8 w-full">
      <div className="flex items-end gap-4 flex-1">
        <div className="!size-52">
          <div className="skeleton skeleton-card"></div>
        </div>
        <div className="flex flex-col items-start gap-4 flex-1">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text !w-full"></div>
          <div className="flex items-center gap-2 w-full">
            <div className="skeleton skeleton-text !w-full"></div>
            <div className="skeleton skeleton-text !w-full"></div>
            <div className="skeleton skeleton-text !w-full"></div>
          </div>
        </div>
      </div>
      <div className="!rounded-full overflow-hidden size-16">
        <div className="skeleton skeleton-card aspect-video"></div>
      </div>
    </div>
  );
}

export default AudioDetailsLoading;
