import React, { useState } from "react";
import { motion, PanInfo } from "motion/react";
import { ChevronRight } from "lucide-react";

export default function IntroPage({ onEnter }: { onEnter: () => void }) {
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleDrag = (_: any, info: PanInfo) => {
    const progress = Math.max(0, Math.min(1, info.offset.x / 200));
    setSwipeProgress(progress);
    if (progress >= 1) {
      onEnter();
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden z-50 text-white">
      {/* Background Ambience & Subtle Illusions */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-black to-black" />
      
      {/* Professional Dot-Matrix Illusion */}
      <div className="absolute inset-0 z-0 opacity-20 flex items-center justify-center">
        <div className="grid grid-cols-12 gap-8">
          {[...Array(144)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                delay: (i % 12) * 0.1 + Math.floor(i / 12) * 0.1,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full bg-indigo-500"
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
          <h1 className="text-7xl md:text-9xl font-extralight tracking-tighter">iPulse</h1>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-sm md:text-base font-light tracking-widest text-indigo-200 uppercase"
        >
            Infrastructure Monitoring
        </motion.div>
      </div>

      {/* Minimalist Swipe Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-20 w-64 h-12 bg-white/5 border border-white/10 rounded-full relative flex items-center p-1"
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 200 }}
          dragElastic={0.1}
          onDrag={handleDrag}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="text-black w-6 h-6" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/30 font-light text-xs tracking-widest">
            SWIPE TO ENTER
          </span>
        </div>
      </motion.div>
    </div>
  );
}
