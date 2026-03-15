"use client";

import { useRef, useState, useCallback } from "react";

/**
 * 3D Tilt Card — Apple Store style.
 * Responds to mouse position with perspective rotation and dynamic shadow.
 * Pure React, zero dependencies.
 */
export default function TiltCard({ children, className = "", intensity = 8 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (0.5 - y) * intensity;
      const rotateY = (x - 0.5) * intensity;

      // Dynamic shadow based on tilt angle
      const shadowX = (x - 0.5) * 20;
      const shadowY = (y - 0.5) * 20;

      setStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        boxShadow: `${-shadowX}px ${-shadowY + 10}px 30px rgba(0, 0, 0, 0.12)`,
        transition: "box-shadow 0.1s ease",
      });
    },
    [intensity],
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
      transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
