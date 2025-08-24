import React, { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FloatingBlob: React.FC<{
  className?: string;
  delay?: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ className = "", delay = 0, size = 56, style }) => {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: `${size / 2}px`,
    ...style
  };

  if (prefersReducedMotion) {
    return (
      <div
        className={`floating-blob ${className}`}
        style={baseStyle}
        aria-hidden
      />
    );
  }

  return (
    <motion.div
      className={`floating-blob ${className}`}
      aria-hidden
      style={baseStyle}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse"
      }}
    />
  );
};

const AnimatedLeftPanel: React.FC<{ children?: React.ReactNode }> = ({
  children
}) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 120 };
  const sx = useSpring(mx, springConfig);
  const sy = useSpring(my, springConfig);
  const px = useTransform(sx, (v) => `${v / 30}px`);
  const py = useTransform(sy, (v) => `${v / 30}px`);

  const onMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mx.set(e.clientX - cx);
    my.set(e.clientY - cy);
  };

  const onLeave = () => {
    if (prefersReducedMotion) return;
    mx.set(0);
    my.set(0);
  };

  const blobSettings = useMemo(
    () => [
      { top: 12, left: -22, size: 220, delay: 0.2 },
      { top: 110, right: -18, size: 80, delay: 0.8 },
      { top: 36, right: 24, size: 48, delay: 1.6 }
    ],
    []
  );

  return (
    <section
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="animated-left hidden lg:block"
      aria-hidden={false}
    >
      <motion.div
        className="animated-gradient"
        aria-hidden
        initial={false}
        animate={
          prefersReducedMotion
            ? {}
            : { backgroundPosition: ["0% 50%", "100% 50%"] }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        style={{ x: px, y: py }}
        className="parallax-blob"
        aria-hidden
      />

      {blobSettings.map((b, i) => (
        <FloatingBlob
          key={i}
          delay={b.delay}
          size={b.size}
          style={{
            top: b.top,
            left: (b as any).left,
            right: (b as any).right,
            position: "absolute",
            zIndex: 8,
            opacity: 0.95
          }}
        />
      ))}

      {/* rotating ring */}
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        className="rotating-ring"
        aria-hidden
        animate={prefersReducedMotion ? {} : { rotate: [0, 360] }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="60"
          cy="60"
          r="44"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2"
          fill="none"
        />
      </motion.svg>

      <div className="panel-content">
        <h2 className="panel-title">Praxis Sync</h2>

        <div className="panel-desc">
          {children ??
            "a dual-language SaaS platform that empowers doctors to digitize bookings, payments, documents, and patient engagement while giving clients seamless access to schedules, records, and services."}
        </div>
      </div>
    </section>
  );
};

export default AnimatedLeftPanel;
