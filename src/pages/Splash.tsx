import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

const Splash: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative"
      >
        <div className="p-6 bg-academic-100 rounded-3xl shadow-xl shadow-academic-500/10">
          <GraduationCap size={80} className="text-academic-600" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-center"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-academic-600 to-blue-400">
          EduPlan
        </h1>
        <p className="text-slate-400 font-medium tracking-widest mt-2 uppercase text-xs">
          Gestión Académica Profesional
        </p>
      </motion.div>
      
      <div className="absolute bottom-12">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-2 h-2 rounded-full bg-academic-600"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Splash;
