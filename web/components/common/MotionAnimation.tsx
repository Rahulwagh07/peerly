import React from 'react';
import { motion } from 'framer-motion';

interface MotionAnimationProps {
  delay?: number;
  children: React.ReactNode;
}

const MotionAnimation: React.FC<MotionAnimationProps> = ({ delay = 0, children }) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

export default MotionAnimation;
