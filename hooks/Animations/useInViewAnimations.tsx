// file: hooks/useInViewAnimations.js
import { useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export const useInViewAnimations = (once = false) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
      slideControls.start("visible");
    }
  }, [isInView, mainControls, slideControls]);

  return { ref, mainControls, slideControls };
};
