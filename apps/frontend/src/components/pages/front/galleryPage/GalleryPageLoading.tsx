import { motion } from 'framer-motion';

function GalleryPageLoading({ count }: { count: number }) {
  return (
    <div className="grid xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 h-screen">
      {Array.from({ length: count }).map((_, index: number) => (
        <motion.div
          key={index}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="aspect-square skeleton skeleton-card"></div>
        </motion.div>
      ))}
    </div>
  );
}

export default GalleryPageLoading;
