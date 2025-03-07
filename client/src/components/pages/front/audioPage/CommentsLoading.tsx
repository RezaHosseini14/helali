function CommentsLoading() {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="skeleton skeleton-avatar !size-20"></div>
          <div className="flex-1">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text !w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommentsLoading;
