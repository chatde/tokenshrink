"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Split Text Reveal — characters animate in one by one.
 * Triggers on scroll into view. Pure CSS animations.
 */
export default function SplitText({
  text,
  className = "",
  as: Tag = "span",
  stagger = 30,
  delay = 0,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "-40px 0px", threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chars = text.split("");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {chars.map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "inline-block",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: `opacity 0.4s ease ${delay + i * stagger}ms, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay + i * stagger}ms`,
            minWidth: char === " " ? "0.25em" : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
