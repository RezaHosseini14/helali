function PlayIcon() {
  return (
    <div
      className="absolute top-1/2 right-1/2 z-10 grid size-12 translate-x-1/2 -translate-y-1/2 place-content-center rounded-full bg-mainstructure/75 text-2xl text-white shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 sm:size-16 sm:text-4xl"
      aria-hidden
    >
      <i className="ki-solid ki-to-right" />
    </div>
  );
}

export default PlayIcon;
