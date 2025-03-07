import { motion } from 'framer-motion';

function AudiosPageLoading({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="!h-[4.5rem] xl:col-span-3 lg:col-span-4 sm:col-span-6 col-span-12 flex items-center justify-between rounded-2xl p-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex flex-1 items-end gap-2 -translate-y-3">
            <div className=" size-20">
              <div className="skeleton skeleton-card"></div>
            </div>
            <div className="flex flex-col flex-1 gap-2 h-full justify-end">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default AudiosPageLoading;
