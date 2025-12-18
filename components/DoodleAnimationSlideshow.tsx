"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

interface DoodleSlide {
  id: string;
  svgPath?: string; // SVG path data, now optional
  svgContent?: React.ReactNode; // Optional: custom SVG content like text
  viewBox: string; // SVG viewBox attribute
  description: string;
}

const doodleSlides: DoodleSlide[] = [
  {
    id: "doodle1",
    svgContent: (
      <>
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="36" // Increased font size
          fontWeight="extrabold" // Made it extra bold
          fontFamily="Arial, sans-serif" // Added a generic sans-serif font
          fill="white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          LifeLink
        </motion.text>
        <motion.path
          d="M10 80 Q50 20 90 80 T170 80" // A subtle doodle underneath
          stroke="white"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
        />
      </>
    ),
    viewBox: "0 0 180 100",
    description: "Welcome to LifeLink!",
  },
  {
    id: "doodle2",
    svgPath:
      "M20 50 L40 50 L40 30 L60 30 L60 50 L80 50 L80 70 L60 70 L60 90 L40 90 L40 70 L20 70 Z M100 50 L120 50 L120 30 L140 30 L140 50 L160 50 L160 70 L140 70 L140 90 L120 90 L120 70 L100 70 Z", // Two connecting people/data points
    viewBox: "0 0 180 100",
    description: "Empowering your health journey with insights.",
  },
  {
    id: "doodle3",
    svgPath:
      "M10 50 C30 20 70 20 90 50 S150 80 170 50", // Wavy line/data flow
    viewBox: "0 0 180 100",
    description: "Seamless and secure health management.",
  },
  {
    id: "doodle4",
    svgPath:
      "M90 10 L70 30 L75 50 L60 50 L55 70 L40 70 L50 90 M100 10 L120 30 L115 50 L130 50 L135 70 L150 70 L140 90", // Abstract representation of growth/upward trend
    viewBox: "0 0 180 100",
    description: "Your well-being, simplified and amplified.",
  },
];

interface DoodleAnimationSlideshowProps {
  autoPlay?: boolean;
  slideDuration?: number; // in seconds
  onSkip?: () => void;
}

const DoodleAnimationSlideshow: React.FC<DoodleAnimationSlideshowProps> = ({
  autoPlay = true,
  slideDuration = 5,
  onSkip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      resetTimeout();
      timeoutRef.current = setTimeout(
        () =>
          setCurrentIndex((prevIndex) =>
            prevIndex === doodleSlides.length - 1 ? 0 : prevIndex + 1
          ),
        slideDuration * 1000
      );
    }
    return () => resetTimeout();
  }, [currentIndex, isPlaying, slideDuration, resetTimeout]);

  const handleSkip = () => {
    resetTimeout();
    setIsPlaying(false);
    onSkip?.(); // Call the passed onSkip function
  };

  const currentDoodle = doodleSlides[currentIndex];

  const svgVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-700 p-8 text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDoodle.id}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-col items-center justify-center text-center"
        >
          <motion.svg
            viewBox={currentDoodle.viewBox}
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full stroke-current text-white"
            strokeWidth="2"
            fill="none"
          >
            {currentDoodle.svgContent ? (
              currentDoodle.svgContent
            ) : (
              <motion.path d={currentDoodle.svgPath} variants={svgVariants} />
            )}
          </motion.svg>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-4 text-xl font-semibold"
          >
            {currentDoodle.description}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
        {doodleSlides.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentIndex === index ? "bg-white" : "bg-white/50"
            }`}
          ></div>
        ))}
      </div>

      <Button
        onClick={handleSkip}
        variant="ghost"
        className="absolute right-8 top-8 text-white hover:bg-white/20"
      >
        Skip
      </Button>
    </div>
  );
};

export default DoodleAnimationSlideshow;