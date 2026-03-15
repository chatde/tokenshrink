"use client";

import Tilt from "react-parallax-tilt";

export default function TiltWrapper({ children, className = "" }) {
  return (
    <Tilt
      className={className}
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      scale={1.02}
      glareEnable={true}
      glareMaxOpacity={0.08}
      glareColor="#00d17d"
      perspective={1200}
      transitionSpeed={600}
    >
      {children}
    </Tilt>
  );
}
