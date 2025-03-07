import { motion } from 'framer-motion';

function VideosPageLoading({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-4 gap-4 h-screen">
      {Array.from({ length: count }).map((_, index: number) => (
        <motion.div
          key={index}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="aspect-video skeleton skeleton-card"></div>
          <div className="flex justify-between items-center gap-16">
            <p className="skeleton skeleton-text"></p>

            <div className="flex items-center gap-2 w-1/2">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default VideosPageLoading;
