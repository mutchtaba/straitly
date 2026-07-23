"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TARGET = 25;

export default function PixelDiscount() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * TARGET));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      aria-hidden="true"
      className="select-none"
    >
      <div className="font-pixel leading-none text-terracotta text-[24vw] lg:text-[13rem]">
        -{value}%
      </div>
      <div className="mt-4 font-pixel text-xs tracking-widest text-warm-gray sm:text-sm">
        UNDER PROVIDER LIST PRICE
      </div>
    </motion.div>
  );
}
