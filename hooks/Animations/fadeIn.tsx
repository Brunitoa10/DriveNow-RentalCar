export const fadeIn = (position = "right", delay = 0.5) => {
    return {
      visible: {
        y: position === "bottom" ? 0 : 0,
        x: position === "right" ? 0 : 0,
        opacity: 1,
        transition: {
          type: "tween",
          duration: 1.4,
          delay,
          ease: [0.25, 0.25, 0.25, 0.75],
        },
      },
      hidden: {
        y: position === "bottom" ? -80 : 0,
        x: position === "right" ? 80 : 0,
        opacity: 0,
        transition: {
          type: "tween",
          duration: 0.5,
          delay,
          ease: [0.25, 0.25, 0.25, 0.25],
        },
      },
    };
  }