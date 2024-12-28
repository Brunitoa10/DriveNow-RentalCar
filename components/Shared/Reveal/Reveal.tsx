// file: components/Reveal.js
"use client";
import { fadeIn } from "@/hooks/Animations/fadeIn";
import { useInViewAnimations } from "@/hooks/Animations/useInViewAnimations";
import { motion } from "framer-motion";
import { RevealProps } from "./Reveal.types";

export const Reveal = ({ children, position = "right", className, delay = 0.5 }: RevealProps) => {
  const { ref, mainControls } = useInViewAnimations(false);

  return (
    <div ref={ref}>
      <motion.div
        className={className}
        variants={fadeIn(position, delay)}
        initial="hidden"
        animate={mainControls}
        exit="hidden"
      >
        {children}
      </motion.div>
    </div>
  );
};
