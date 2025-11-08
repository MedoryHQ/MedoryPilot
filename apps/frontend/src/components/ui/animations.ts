type animation = {
  direction: string;
  delay: number;
  change?: number;
  duration: number;
};

export const fadeVariant = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay,
    },
  }),
};

export const popUpVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  }),
};

export const fadeIn = ({ direction, delay, duration, change }: animation) => ({
  hidden: {
    x:
      direction === "left"
        ? change || 0
        : direction === "right"
        ? change || 0
        : 0,
    y:
      direction === "up" ? change || 0 : direction === "down" ? change || 0 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: "tween",
      delay,
      duration,
      ease: "easeOut",
    },
  },
  exit: {
    x:
      direction === "left"
        ? change || 0
        : direction === "right"
        ? change || 0
        : 0,
    y:
      direction === "up" ? change || 0 : direction === "down" ? change || 0 : 0,
    opacity: 0,
    transition: {
      type: "tween",
      delay,
      duration,
      ease: "easeOut",
    },
  },
});

export const fadeUpVariants = ({ delay }: { delay?: number }) => ({
  hidden: {
    x: 0,
    y: 35,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: "tween" as const,
      delay: delay || 0,
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
  exit: {
    x: 0,
    y: 35,
    opacity: 0,
    transition: {
      type: "tween" as const,
      delay: delay || 0,
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
});
